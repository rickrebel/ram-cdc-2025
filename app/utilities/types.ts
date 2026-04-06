import { ActionMeta } from "react-select";
import { enumSexonacer, enumGenero } from "~/algorithms/utilitiesTypes";

// Available as 'clinicalData' at the start of the 'action' function of 'app/routes/_app.add._new.characteristics.create.tsx'
// from the serialized data submitted by the client form in app/components/patients/CreatePatients.tsx.
export type ClinicalDataType = {
  // ---------------------------------------------------------
  // Datos Clínicos.
  // Entered by the user on the form; are mandatory therefore they will never be null or empty strings.
  dob: string;
  sexonacer: string;
  curp: string;
  genero: string;
  // Stringified when passed back and forth to the action function.
  // Entered by the user on the form; are mandatory therefore they will never be null or empty strings.
  peso: string;
  talla: string;

  location: string;

  visitationIds?: string[];

  // Entirely absent if the patient doesn't have the condition - otherwise, it will be the string "on".
  diabetes?: string;
  inmunosupresion?: string;
  cardiovasculares?: string;
  hasRenalIssues?: string;
  hepaticos?: string;
  embarazo?: string;

  // Entirely absent if the patient isn't allergic to the item - otherwise, it will be the string "on".
  penicilinas?: string;
  quinolonas?: string;
  macrolidos?: string;
  cefalosporinas?: string;
  tetraciclinas?: string;
  sulfonamidas?: string;
  aminoglucosidos?: string;

  // Either "Sí" or "No". It is mandatory to provide one or the other.
  hospitalized: string;
  takenMedication: string;
  disability: string;
  migrant: string;

  // A stringified array of countries. Will be the string '[]' if 'migrant' is "No".
  countriesMigration: string;

  // Either "Sí" or "No". It is mandatory to provide one or the other.
  indigenous: string;
  afrodescendant: string;
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // Otros datos del paciente (opcional).
  // If the patient doesn't enter any of these details they will all be entirely absent.
  // If the patient enters one, some, or all of these details then all these fields will be present,
  // but those not entered by the patient will be empty strings.
  nombreOtros?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  estadoCivil?: string;
  nivelEstudios?: string;
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // Información del contacto (opcional).
  // If the patient doesn't enter any of these details they will all be entirely absent.
  // If the patient enters one, some, or all of these details then all these fields will be present,
  // but those not entered by the patient will be empty strings.
  homeEmail?: string;
  homeCel?: string;
  homeDireccion?: string;
  homeExtNum?: string;
  homeIntNum?: string;
  homeCity?: string;
  homeState?: string;
  homePostalCode?: string;
  homeCountry?: string;
  lugarOrigenEstado?: string;
  lugarOrigenCiudad?: string;
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // Ocupación y Lugar de Trabajo (opcional).
  // If the patient doesn't enter any of these details they will all be entirely absent.
  // If the patient enters one, some, or all of these details then all these fields will be present,
  // but those not entered by the patient will be empty strings.
  ocupacion?: string;
  paisTrabajo?: string;
  direccionTrabajo?: string;
  ciudadTrabajo?: string;
  estadoTrabajo?: string;
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // Added in the 'action' function of app/routes/_app.add._new.characteristics.create.tsx
  // Should never be null.
  currentProfileId: string;
  profileIds: string[];
  // ---------------------------------------------------------

  // ---------------------------------------------------------
  // Added to the serialized data in app/components/patients/CreatePatient.tsx and therefore
  // available in the 'action' function of app/routes/_app.add._new.characteristics.create.tsx.
  // Will be an empty string if this is a new patient (POST) - indeed the ids are created right at
  // the end of the 'action' function.
  clinicosID: string;
  contactoID: string;
  otrosID: string;
  ocupacionID: string;
  latestVisitationID: string;
  // ---------------------------------------------------------
};

export interface AppProps {
  flushState: () => void;
  flushed: boolean;

  setFlushed: (flushed: boolean) => void;

  handleITSClick: (
    primaryId: number,
    trueSecondaryIds: ReadonlyArray<{
      id: number;
      value: string;
      label: string;
    }>,
    lastAactionType: ActionMeta<{
      id: number;
      value: string;
      label: string;
    }>
  ) => void;

  getStateParsed: () => ClinicalDataType | null;
  setStateParsed: (clinicalData: ClinicalDataType | null) => void;
}

export interface typeClinicosStringified {
  // JSON stringified version of the 'Clinicos' object; null, string, boolean, and number types only.

  id: string;

  curp: string; // 4 capital letters followed by 6 numbers, then 6 capital letters, and finally 2 numbers.
  dob: string; // For example "2025-01-01T00:00:00.000Z".
  sexonacer: enumSexonacer;
  indigenous: boolean;
  afrodescendant: boolean;
  dateAdded: string; // For example "2025-01-29T19:34:05.604Z".
  location: string;
}

export interface ContactoObjectStringify {
  // JSON stringified version of the 'Contacto' object; null, string, boolean, and number types only.

  id: string;

  // These can all be empty strings - so a null is not necessary.
  homeEmail: string;
  homeCel: string;
  homeDireccion: string;
  homeExtNum: string;
  homeIntNum: string;
  homeCity: string;
  homeState: string;
  homePostalCode: string;
  homeCountry: string;
  lugarOrigenEstado: string;
  lugarOrigenCiudad: string;
}

export interface OtrosObjectStringify {
  // JSON stringified version of the 'Otros' object; null, string, boolean, and number types only.

  id: string;

  // These can all be empty strings - so a null is not necessary.
  nombreOtros: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  estadoCivil: string;
  nivelEstudios: string;
}

export interface OcupacionObjectStringify {
  // JSON stringified version of the 'Ocupacion' object; null, string, boolean, and number types only.

  id: string;

  // These can all be empty strings - so a null is not necessary.
  ocupacion: string;
  paisTrabajo: string;
  direccionTrabajo: string;
  ciudadTrabajo: string;
  estadoTrabajo: string;
}

export interface typeVisitationStringified {
  // JSON stringified version of the 'Visitation' object; null, string, boolean, and number types only.
  id: string;
  curp: string;
  date: string;
  clinicosId: string;

  genero: enumGenero;
  peso: number;
  talla: number;

  // The "name" parameter from form elements in "NewClinicos.tsx".
  // See CSS id "factoresDeRiesgo".
  existingConditions: string[];
  hospitalized: boolean;
  takenMedication: boolean;
  disability: boolean;
  migrant: boolean;
  countriesMigration: string[];

  // The "name" parameter from form elements in "NewClinicos.tsx".
  // See CSS id "alergias".
  alergies: string[];

  primaryConditions: string[];
  secondaryConditions: string[];

  evacuationCount: number;
  vomitCount: number;

  location: string;
  diagnosis: string;
  notes: string;
}

export type SSDropDown = {
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
} | null;

export type AlgorithmData = {
  visitation: typeVisitationStringified;
  clinicos: typeClinicosStringified;
};

export interface ChartDataEntry {
  name: string;
  cuenta: number;
  porcentaje: number;
}

export type typeSimpleRadialChart = {
  [key: string]: {
    name: string;
    fill: string;
    count: number;
    percent: number;
  }[];
};

export type typeSimpleRadarChart = {
  name: string;
  count: number;
  percent: number;
}[];

export type ChartDataObject = {
  Nacional: ChartDataEntry[];
  [location: string]: ChartDataEntry[];
};

export type ChartMainTitlesObject = {
  Nacional: string;
  [location: string]: string;
};

export type ChartSubTitlesObject = {
  Nacional: string;
  [location: string]: string;
};

export interface ChartsData {
  barChart: {
    chartData: ChartDataObject;
    chartMainTitles: ChartMainTitlesObject;
    chartSubTitles: ChartSubTitlesObject;
  } | null;
  radarChart: {
    chartData: ChartDataObject;
    chartMainTitles: ChartMainTitlesObject;
    chartSubTitles: ChartSubTitlesObject;
  } | null;
  barChartSexoNacer: {
    chartData: ChartDataObject;
    chartMainTitles: ChartMainTitlesObject;
    chartSubTitles: ChartSubTitlesObject;
  } | null;
  radialBarChart: {
    chartData: typeSimpleRadialChart;
    chartMainTitles: ChartMainTitlesObject;
    chartSubTitles: ChartSubTitlesObject;
  } | null;
  radarIndigAfroChart: {
    chartData: typeSimpleRadarChart;
    chartMainTitles: ChartMainTitlesObject;
    chartSubTitles: ChartSubTitlesObject;
  } | null;
  stateList: State[];
}

export type ChartServerObject = {
  chartData: ChartDataObject;
  chartMainTitles: ChartMainTitlesObject;
  chartSubTitles: ChartSubTitlesObject;
} | null;

export type typeRadialBarServerObject = {
  chartData: typeSimpleRadialChart;
  chartMainTitles: ChartMainTitlesObject;
  chartSubTitles: ChartSubTitlesObject;
} | null;

export type typeSimpleRadarServerObject = {
  chartData: typeSimpleRadarChart;
  chartMainTitles: ChartMainTitlesObject;
  chartSubTitles: ChartSubTitlesObject;
} | null;

export type LoginCredentials = {
  email: string;
  password: string;
  whichEstado: string;
};

export type SignupCredentials = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  license: string;
  institution: string;
  whichEstado: string;
  email: string;
  password: string;
};

export type AuthMode = "login" | "signup" | "forgot-password";

// Mirrors the Prisma schema for the 'State' model.
export type State = {
  id: string;
  stateName: string;
};
