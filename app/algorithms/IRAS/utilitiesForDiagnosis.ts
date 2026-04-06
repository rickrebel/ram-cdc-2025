import { utilityDiagnoseBronquitis } from "~/algorithms/IRAS/utilityDiagnoseBronquitis";
import { utilityDiagnoseExacerbacionEpoc } from "~/algorithms/IRAS/utilityDiagnoseExacerbacionEpoc";
import { utilityDiagnoseNeumonia } from "~/algorithms/IRAS/utilityDiagnoseNeumonia";
import { utilityDiagnoseFaringitis } from "~/algorithms/IRAS/utilityDiagnoseFaringitis";
import { utilityDiagnoseOtitisMediaAguda } from "~/algorithms/IRAS/utilityDiagnoseOtitisMediaAguda";
import { utilityDiagnoseSinusitis } from "~/algorithms/IRAS/utilityDiagnoseSinusitis";
import secondarySymptomsDropdown from "~/components/inputgroups/SecondarySymptomsDropdown";

import {
  typeAge,
  typeReportCard,
  typeIrasDiagnostic,
} from "~/algorithms/utilitiesTypes";
import { typeVisitationStringified } from "~/utilities/types";
import { SecondarySymptom } from "~/utilities/buildSymptomCatalog";

const IRASBajas = (
  visitation: typeVisitationStringified,
  diagnosis: typeIrasDiagnostic
) => {
  // BAJAS BRONQUITIS.
  if (!diagnosis) {
    diagnosis = utilityDiagnoseBronquitis(visitation, diagnosis);
  }

  // BAJAS CENTRO.
  // EXACERBACIÓN DE EPOC.
  if (!diagnosis) {
    diagnosis = utilityDiagnoseExacerbacionEpoc(visitation, diagnosis);
  }

  // BAJAS NEUMONIA.
  if (!diagnosis) {
    diagnosis = utilityDiagnoseNeumonia(visitation, diagnosis);
  }

  return diagnosis;
};

const IRASAltas = (
  visitation: typeVisitationStringified,
  diagnosis: typeIrasDiagnostic
) => {
  // ALTAS OTITIS MEDIA AGUDA.
  if (!diagnosis) {
    diagnosis = utilityDiagnoseOtitisMediaAguda(visitation, diagnosis);
  }

  // ALTAS FARINGITIS.
  if (!diagnosis) {
    diagnosis = utilityDiagnoseFaringitis(visitation, diagnosis);
  }

  // ALTAS SINUSITIS SINTOMATICO.
  // ALTAS SINUSITIS ANTIBIOTICO.
  if (!diagnosis) {
    diagnosis = utilityDiagnoseSinusitis(visitation, diagnosis);
  }

  return diagnosis;
};

export function generateIrasNotes(props: {
  diagnosis: string;
  allergies: string[];
}) {
  let notes =
    "Requiere tratamiento sintomático para los siguientes factores:\n";

  if (props.diagnosis === "Bronquitis antibiotico") {
    notes += "- Diagnóstico de bronquitis aguda no complicada.\n";
  } else if (props.diagnosis === "Exacerbación de EPOC") {
    notes += "- Diagnóstico de exacerbación de EPOC.\n";
  } else if (props.diagnosis === "Neumonía adquirida en la comunidad") {
    notes += "- Diagnóstico de neumonía adquirida en la comunidad.\n";
  } else if (props.diagnosis === "OMA antibiotico") {
    notes += "- Diagnóstico de otitis media aguda.\n";
  } else if (props.diagnosis === "Faringitis antibiotico") {
    notes += "- Diagnóstico de faringitis aguda.\n";
  } else if (props.diagnosis === "Sinusitis antibiotico") {
    notes += "- Diagnóstico de sinusitis aguda.\n";
  }

  notes += "\nRecomendaciones adicionales:\n";
  notes +=
    "- Provea información a la persona y/o cuidador para identificar datos de alarma.\n";
  notes +=
    "- Asegúrese de dar recomendaciones para hidratación (vida suero oral).\n";
  notes += "- Recomendar paracetamol para controlar en caso de fiebre.\n";

  notes += "\nDatos de alarma que requieren una gestión de segundo nivel:\n";
  if (props.allergies.includes("Penicilinas")) {
    notes +=
      "- Alergia a la familia de antibióticos de las Penicilinas (Amoxicilina, Ampicilina).\n";
  }
  notes += "- No tolera la vía oral.\n";
  notes += "- Deshidratación grave.\n";
  notes += "- Datos de abdomen agudo.\n";
  notes += "- Septicemia.\n";
  notes += "- La diarrea y/o la fiebre continúan a pesar del tratamiento.\n";

  return notes;
}

export function getIrasBajasOrAltas(
  visitation: typeVisitationStringified,
  reportCard: typeReportCard
): typeReportCard {
  let diagnosis: typeIrasDiagnostic = null;
  diagnosis = IRASBajas(visitation, diagnosis);
  diagnosis = IRASAltas(visitation, diagnosis);

  reportCard.diagnosis = diagnosis;

  return reportCard;
}

const idx_baja_bronquitis = [0, 1, 2, 3, 4];
const idx_baja_ante_epoc = [5, 6];
const idx_baja_exac_epoc = [7, 8, 9, 10];
const idx_baja_enviar_sec_nivel = [11, 12, 13, 14, 15, 16, 17];
const idx_baja_neumonia = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

const idx_alta_oma = [31, 32, 33, 34];
const idx_alta_faringitis = [35, 36, 37, 38, 39, 40];
const idx_alta_sinusitis_sintomatic = [41, 42, 43, 44];
const idx_alta_sinusitis_antibiotic = [45, 46, 47, 48];
const idx_alta_sinusitis_hospital = [49, 50, 51];

type typeNestedSymptomData = {
  availableSecondarySymptoms: {
    id: number;
    value: string;
    label: string;
  }[];
  initialOptions: {
    id: number;
    value: string;
    label: string;
  }[];
};

export function getSymptomsDropdowns(
  selectedSymptoms: SecondarySymptom,
  checkedSecondarySymptoms: SecondarySymptom["checked"]
): {
  baja_bronquitis: typeNestedSymptomData;
  baja_ante_epoc: typeNestedSymptomData;
  baja_exac_epoc: typeNestedSymptomData;
  baja_enviar_sec_nivel: typeNestedSymptomData;
  baja_neumonia: typeNestedSymptomData;
  alta_oma: typeNestedSymptomData;
  alta_faringitis: typeNestedSymptomData;
  alta_sinusitis_sintomatic: typeNestedSymptomData;
  alta_sinusitis_antibiotic: typeNestedSymptomData;
  alta_sinusitis_hospital: typeNestedSymptomData;
} {
  // The id arrays passed in here correspond to secondary symptoms of Bronquitis Aguda (no complicada).
  const baja_bronquitis = secondarySymptomsDropdown(
    idx_baja_bronquitis,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of Antecedente de EPOC.
  const baja_ante_epoc = secondarySymptomsDropdown(
    idx_baja_ante_epoc,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of Exacerbacion de EPOC.
  const baja_exac_epoc = secondarySymptomsDropdown(
    idx_baja_exac_epoc,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to IRAS baja secondary symptoms requiring elevation to second level.
  const baja_enviar_sec_nivel = secondarySymptomsDropdown(
    idx_baja_enviar_sec_nivel,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of neumonia.
  const baja_neumonia = secondarySymptomsDropdown(
    idx_baja_neumonia,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of otitis media aguga.
  const alta_oma = secondarySymptomsDropdown(
    idx_alta_oma,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of faringitis.
  const alta_faringitis = secondarySymptomsDropdown(
    idx_alta_faringitis,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of sinusitis sintomatico.
  const alta_sinusitis_sintomatic = secondarySymptomsDropdown(
    idx_alta_sinusitis_sintomatic,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of sinusitis asintomatico.
  const alta_sinusitis_antibiotic = secondarySymptomsDropdown(
    idx_alta_sinusitis_antibiotic,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of enviar hospital.
  const alta_sinusitis_hospital = secondarySymptomsDropdown(
    idx_alta_sinusitis_hospital,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  return {
    baja_bronquitis,
    baja_ante_epoc,
    baja_exac_epoc,
    baja_enviar_sec_nivel,
    baja_neumonia,
    alta_oma,
    alta_faringitis,
    alta_sinusitis_sintomatic,
    alta_sinusitis_antibiotic,
    alta_sinusitis_hospital,
  };
}
