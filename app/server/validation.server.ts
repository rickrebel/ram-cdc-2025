import {
  ClinicalDataType,
  LoginCredentials,
  SignupCredentials,
} from "~/utilities/types";
import { InDRESelected } from "~/utilities/InDRETypes";
import { getHospital } from "~/server/getters.server";
import { Hospital } from "@prisma/client";
import { prisma } from "~/server/database.server";
import { Profile } from "@prisma/client";

export function isValidCorreo(value: string): boolean {
  return Boolean(
    value &&
      value.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  );
}

export async function isUniqueCorreo(value: string): Promise<boolean> {
  const existingCorreo: Profile | null = await prisma.profile.findFirst({
    where: { correoElectronico: value },
  });

  return existingCorreo ? false : true;
}

export function isValidCURP(value: string): boolean | string {
  if (value.trim().length !== 18)
    return "Respecto a la CURP: la CURP debe tener exactamente 18 caracteres.";

  const dob: string = value.substring(4, 10);
  if (
    isNaN(+dob) && // use type coercion to parse the entirety of the string (since 'parseFloat' alone does not do this).
    isNaN(parseFloat(dob)) // ensure strings of whitespace fail.
  )
    return "Respecto a la CURP: después de los primeros 4 caracteres, los siguientes 6 caracteres deben ser numéricos para representar una fecha de nacimiento.";

  const finalTwoChars: string = value.substring(16, 18);
  if (
    isNaN(+finalTwoChars) && // use type coercion to parse the entirety of the string (since 'parseFloat' alone does not do this).
    isNaN(parseFloat(finalTwoChars)) // ensure strings of whitespace fail.
  )
    return "Respecto a la CURP: los últimos 2 caracteres deben ser numéricos.";

  const firstFourChars: string = value.substring(0, 4);
  if (typeof firstFourChars !== "string")
    return "Respecto a la CURP: los primeros 4 caracteres deben ser alfabéticos.";
  if (
    !isNaN(+firstFourChars) // use type coercion to parse the entirety of the string (since 'parseFloat' alone does not do this).
  )
    return "Respecto a la CURP: los primeros 4 caracteres deben ser alfabéticos.";

  return true;
}

export async function isUniqueCURP(curp: string): Promise<boolean> {
  const existingClinicos = await prisma.clinicos.findFirst({
    where: { curp },
  });

  return !existingClinicos;
}

export function isValidNombre(value: string, min: number = 0): boolean {
  return Boolean(value && value.trim().length > min);
}

export function isValidPassword(value: string): boolean {
  return Boolean(value && value.length >= 7);
}

export function isValidCedulaProf(value: string): boolean {
  return Boolean(value && value.trim().length > 4 && value.trim().length <= 7);
}

export async function isUniqueCedulaProf(value: string): Promise<boolean> {
  const existingCedulaProf = await prisma.profile.findFirst({
    where: { cedulaProfesional: value },
  });

  return !existingCedulaProf;
}

export function isValidDropDownOption(value: string): boolean {
  return Boolean(value && value !== "Seleccione una opción");
}

export function isValidNumericalValue(value: string, min: number = 0): boolean {
  if (value) {
    // Convert the string `value` to a number and check if it's greater than 0.
    const valueAsNumber = Number(value);
    return Boolean(valueAsNumber >= min);
  }
  return false;
}

export function isValidCountrySelection(
  countries: string | undefined
): boolean {
  if (!countries) {
    return true;
  }
  return Boolean(countries && countries.length > 0);
}

export function validateLoginInput(input: LoginCredentials): void {
  type ValidationErrors = {
    email?: string;
    password?: string;
    whichEstado?: string;
  };

  const validationErrors: ValidationErrors = {};

  if (!isValidCorreo(input.email)) {
    validationErrors.email =
      "Por favor, introduce una dirección de correo electrónico válida.";
  }

  if (!isValidPassword(input.password)) {
    validationErrors.password =
      "La contraseña debe tener al menos 7 caracteres.";
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}

export function validateSignUpInput(input: SignupCredentials): void {
  type ValidationErrors = {
    nombre?: string;
    apellidoPaterno?: string;
    license?: string;
    whichEstado?: string;
    email?: string;
    password?: string;
  };

  const validationErrors: ValidationErrors = {};

  if (!isValidNombre(input.nombre)) {
    validationErrors.nombre = "Por favor proporciona tu primer nombre.";
  }

  if (!isValidNombre(input.apellidoPaterno)) {
    validationErrors.apellidoPaterno =
      "Por favor proporciona tu apellido paterno.";
  }

  if (!isValidCedulaProf(input.license)) {
    validationErrors.license =
      "Por favor ingrese una Cédula profesional válida.";
  }

  if (!isUniqueCedulaProf(input.license)) {
    validationErrors.license =
      "Ya existe una cuenta con esta Cédula profesional.";
  }

  if (!isValidCorreo(input.email)) {
    validationErrors.email =
      "Por favor, introduce una dirección de correo electrónico válida.";
  }

  if (!isUniqueCorreo(input.email)) {
    validationErrors.email =
      "Ya existe una cuenta con este correo electrónico.";
  }

  if (!isValidPassword(input.password)) {
    validationErrors.password =
      "La contraseña debe tener al menos 7 caracteres.";
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}

export async function validateDatosClinicos(
  input: ClinicalDataType
): Promise<void> {
  type ValidationErrors = {
    sexo_al_nacer?: string;
    curp?: string;
    ident_genero?: string;
    hospitalizados?: string;
    antibioticas?: string;
    discapacidad?: string;
    migrante?: string;
    countriesmigrate?: string;
    identifica_indigena?: string;
    peso?: string;
    talla?: string;
  };

  const validationErrors: ValidationErrors = {};

  const curp: boolean | string = isValidCURP(input.curp);
  if ((typeof curp === "boolean" && !curp) || typeof curp === "string") {
    validationErrors.curp = `${curp}`;
  }

  const root_response: string =
    "Elija una de las opciones disponibles para la pregunta:";

  if (!isValidDropDownOption(input.sexonacer)) {
    validationErrors.sexo_al_nacer = `${root_response} 'Sexo al nacer'.`;
  }

  if (!isValidDropDownOption(input.genero)) {
    validationErrors.ident_genero = `${root_response} 'Identificacion de genero'.`;
  }

  if (!isValidDropDownOption(input.hospitalized)) {
    validationErrors.hospitalizados = `${root_response} '¿Hospitalizados en los últimos 3 meses?'.`;
  }

  if (!isValidDropDownOption(input.takenMedication)) {
    validationErrors.antibioticas = `${root_response} '¿Ha tomado antibióticos en los últimos 3 meses?'.`;
  }

  if (!isValidDropDownOption(input.disability)) {
    validationErrors.discapacidad = `${root_response} '¿Tiene alguna discapacidad?'.`;
  }

  if (!isValidDropDownOption(input.migrant)) {
    validationErrors.migrante = `${root_response} '¿Es migrante?'.`;
  }

  if (!isValidCountrySelection(input.countriesMigration)) {
    validationErrors.countriesmigrate = `${root_response} '¿A través de qué países han transmitido?'.`;
  }

  if (!isValidDropDownOption(input.indigenous)) {
    validationErrors.identifica_indigena = `${root_response} '¿Identifica como indigena?'.`;
  }

  if (!isValidDropDownOption(input.afrodescendant)) {
    validationErrors.identifica_indigena = `${root_response} '¿Identifica como afro-descendiente?'.`;
  }

  if (!isValidNumericalValue(input.peso, 0.4)) {
    validationErrors.peso =
      "Por favor, elija un peso (kg) apropiado (mayor o igual a 0.4 kg).";
  }

  if (!isValidNumericalValue(input.talla, 15.0)) {
    validationErrors.talla =
      "Por favor, elija una altura (cm) adecuada (mayor o igual a 15 cm).";
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}

export function validateInDREInput(input: InDRESelected): void {
  type ValidationErrors = {
    otherErrors?: string;
    hospitalErrors?: string;
  };

  const validationErrors: ValidationErrors = {};

  if (!input.hospital) {
    validationErrors.hospitalErrors = "Por favor, seleccione un hospital.";
  }

  if (input.resistanceSelector === "[]" || input.geneSelector === "[]") {
    validationErrors.otherErrors = `Por favor, seleccione al menos:
    - un mecanismo de resistencia.
    - o un Gene asociado a mecanismos de resistencia.`;
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}

export async function validateInDREHospitalSelection(
  indreData: InDRESelected
): Promise<InDRESelected> {
  type ValidationErrors = {
    hospitalErrors?: string;
  };

  const validationErrors: ValidationErrors = {};

  if (indreData.cluesSearch) {
    const hospital: Hospital[] = await getHospital(
      indreData.cluesSearch,
      "clues"
    );
    if (hospital.length !== 1) {
      validationErrors.hospitalErrors =
        "No se encontró ninguna entrada para el hospital.";
      throw validationErrors;
    }
    indreData.hospital = hospital[0];
    return indreData;
  }

  if (indreData.hospitalNameSearch) {
    const hospital: Hospital[] = await getHospital(
      indreData.hospitalNameSearch,
      "hospitalName"
    );
    if (hospital.length !== 1) {
      validationErrors.hospitalErrors =
        "No se encontró ninguna entrada para el hospital.";
      throw validationErrors;
    }
    indreData.hospital = hospital[0];
    return indreData;
  }

  validationErrors.hospitalErrors =
    "No se encontró ninguna entrada para el hospital.";
  throw validationErrors;
}
