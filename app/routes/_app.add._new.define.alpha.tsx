import { useState } from "react";
import {
  useLoaderData,
  Form,
  useSubmit,
  useRouteError,
} from "@remix-run/react";
import {
  redirect,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { Visitation } from "@prisma/client";
import { ErrorBody } from "~/utilities/ErrorBody";
import { requireUserSession } from "~/server/auth.server";
import { appPath } from "~/server/basepath.server";
import Define from "~/components/inputgroups/DefineCondition";
import PrevioSiguiente from "~/components/inputgroups/PrevioSiguiente";
import { getVisitation } from "~/server/getters.server";
import {
  updateSecondaryCondition,
  updateEvacuation,
  updateVomitos,
} from "~/server/updates.server";
import convertCheckboxValuesToArray
  from "~/utilities/ConvertCheckBoxToArray";
import {
  buildSymptomCatalog,
  type SecondarySymptom,
} from "~/utilities/buildSymptomCatalog";
import {
  ALL_IVU_SYMPTOMS,
  ALL_IVU_LABELS,
} from "~/algorithms/IVU/utilitiesSymptoms";
import {
  ALL_EDAS_SYMPTOMS,
  ALL_EDAS_LABELS,
} from "~/algorithms/EDAS/utilitiesSymptoms";

// Mapeo de detail strings (como se guardan en BD desde primary.tsx)
// a nombres cortos usados en los catálogos de síntomas.
const DETAIL_TO_NAME: Record<string, string> = {
  "Infección del tracto urinario": "IVU",
  "Enfermedades diarreicas agudas": "EDAS",
};

type NewSecondaryCondition = {
  clinicosId: string;
  visitationId: string;
  evacuaciones?: string;
  vomitos?: string;
  [key: string]: string | undefined;
};

interface LoadData {
  clinicosId: string;
  visitationId: string;
  primaryConditionName: string;
}

export default function DefineRecord() {
  const loaderData = useLoaderData<LoadData>();

  // Catálogo de síntomas según la condición primaria (IVU o EDAS).
  // buildSymptomCatalog retorna un SecondarySymptom con los síntomas
  // aplanados, labels, y un array checked[] todo en false.
  // Se envuelve en array porque handleSecondarySymptomsClick opera
  // sobre un array indexado por primaryId (siempre 0 aquí).
  const isEDAS = loaderData.primaryConditionName === "EDAS";
  const [symptomData, setSymptomData] =
    useState<SecondarySymptom[]>(() => [
      buildSymptomCatalog(
        isEDAS ? "04" : "01",
        loaderData.primaryConditionName,
        isEDAS ? ALL_EDAS_SYMPTOMS : ALL_IVU_SYMPTOMS,
        isEDAS ? ALL_EDAS_LABELS : ALL_IVU_LABELS
      ),
    ]);

  const selectedSymptoms = symptomData[0];
  const checkedSecondarySymptoms: boolean[] = selectedSymptoms.checked;

  // Replica la lógica de useSecondarySymptomStore.handleSecondarySymptomsClick
  // (store.ts líneas 221-242) con copias inmutables para que React
  // detecte el cambio de estado (compara por referencia).
  //
  // primaryId: índice en el array symptomData (siempre 0 aquí)
  // secondaryId: índice del síntoma clickeado en el array checked[]
  //
  // Lógica especial: si el síntoma es "Ninguno(a)" (último elemento),
  // se desmarcan todos los demás y se marca solo "Ninguno(a)".
  // Si se marca cualquier otro síntoma, se desmarca "Ninguno(a)".
  const handleSecondarySymptomsClick = (
    primaryId: number,
    secondaryId: number
  ) => {
    setSymptomData((prev) =>
      prev.map((secSympt, index) => {
        if (index === primaryId) {
          const newChecked = [...secSympt.checked];
          newChecked[secondaryId] = !newChecked[secondaryId];

          if (secSympt.additional[secondaryId] === "Ninguno(a)") {
            newChecked.fill(false);
            newChecked[secondaryId] = true;
          } else {
            newChecked[newChecked.length - 1] = false;
          }

          return { ...secSympt, checked: newChecked };
        }
        return secSympt;
      })
    );
  };

  // submitForm construye los datos desde React state (no desde el DOM)
  // siguiendo el patrón de define.its.tsx y define.iras.tsx.
  // Excepción: evacuaciones y vomitos se leen del form HTML porque
  // son inputs numéricos renderizados por DefineCondition.
  const submit = useSubmit();
  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const serializedData = new FormData();
    const secondaryConditions: { [key: string]: string } = {};

    checkedSecondarySymptoms.forEach(
      (checked: boolean, idx: number) => {
        if (checked) {
          secondaryConditions[idx.toString()] =
            selectedSymptoms.additional[idx] +
            " - " +
            selectedSymptoms.additional_details[idx];
        }
      }
    );

    Object.keys(secondaryConditions).forEach((key) => {
      serializedData.append(key, secondaryConditions[key]);
    });

    // Leer evacuaciones/vomitos del form HTML (inputs numéricos
    // renderizados condicionalmente por DefineCondition para EDAS)
    const evacInput =
      form.querySelector<HTMLInputElement>('[name="evacuaciones"]');
    const vomInput =
      form.querySelector<HTMLInputElement>('[name="vomitos"]');
    if (evacInput?.value) {
      serializedData.append("evacuaciones", evacInput.value);
    }
    if (vomInput?.value) {
      serializedData.append("vomitos", vomInput.value);
    }

    serializedData.append("clinicosId", loaderData.clinicosId);
    serializedData.append(
      "visitationId",
      loaderData.visitationId
    );

    submit(serializedData, {
      method: "POST",
      action: `/add/define/alpha`,
    });
  }

  return (
    <main className="max-w-7xl mx-auto mt-12 py-4">
      <Form onSubmit={submitForm}>
        <Define
          selectedPrimaryCondition={0}
          selectedSymptoms={selectedSymptoms}
          primaryConditionName={loaderData.primaryConditionName}
          handleSecondarySymptomsClick={
            handleSecondarySymptomsClick
          }
        />
        <PrevioSiguiente />
      </Form>
    </main>
  );
}

// Action: procesa el form submit en el servidor.
// Recibe las secondary conditions como pares key-value y las guarda
// en BD. También procesa evacuaciones/vomitos para EDAS.
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);

  const newSecondaryConditions = Object.fromEntries(
    formData
  ) as unknown as NewSecondaryCondition;

  const {
    clinicosId,
    visitationId,
    evacuaciones,
    vomitos,
    ...secondaryConditionsArr
  } = newSecondaryConditions;

  if (evacuaciones) {
    await updateEvacuation(
      visitationId,
      parseFloat(evacuaciones)
    );
  }

  if (vomitos) {
    await updateVomitos(visitationId, parseFloat(vomitos));
  }

  // Extraer valores únicos de las secondary conditions
  const arraySecondaryConditions: string[] =
    convertCheckboxValuesToArray(
      secondaryConditionsArr as { [key: string]: string }
    );

  await updateSecondaryCondition(
    visitationId,
    arraySecondaryConditions
  );

  return redirect(
    appPath(`/add/revise?vID=${visitationId}&cID=${clinicosId}`)
  );
}

// Loader: lee cID/vID de URL params, consulta la Visitation en BD
// para determinar la condición primaria (IVU o EDAS).
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);

  const url = new URL(request.url);
  const clinicosId: string | null = url.searchParams.get("cID");
  const visitationId: string | null = url.searchParams.get("vID");

  if (!clinicosId) {
    throw new Error(
      "Alpha: No se proporcionó identificación del paciente"
      + " (clinicosId)."
    );
  }
  if (!visitationId) {
    throw new Error(
      "Alpha: No se proporcionó identificación de la visita"
      + " (visitationId)."
    );
  }

  const visitation: Visitation | null =
    await getVisitation(visitationId);

  if (!visitation) {
    throw new Error(
      "Alpha: Ninguna visita encontrada (visitation)."
    );
  }

  // visitation.primaryConditions es String[] con los detail strings
  // guardados por primary.tsx (ej: "Infección del tracto urinario").
  // Buscamos cuál de los dos (IVU o EDAS) está presente.
  const detail = visitation.primaryConditions.find(
    (d) => d in DETAIL_TO_NAME
  );

  if (!detail) {
    throw new Error(
      "Alpha: No se encontró condición primaria válida"
      + " (IVU o EDAS) en la visita."
    );
  }

  const primaryConditionName = DETAIL_TO_NAME[detail];

  return Response.json({
    clinicosId,
    visitationId,
    primaryConditionName,
  });
}

export function headers() {
  return {
    "Cache-Control": "max-age=3",
  };
}

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <ErrorBody
      error={error}
      routetext="_app.add._new.define.alpha.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
