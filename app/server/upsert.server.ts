import { prisma } from "~/server/database.server";
import {
  shouldInvolveContacto,
  shouldInvolveOtros,
  shouldInvolveOcupacion,
} from "~/server/utilities.server";
import { ClinicalDataType } from "~/utilities/types";
import { Clinicos, Contacto, Otros, Ocupacion } from "@prisma/client";

export async function upsertClinicos(
  clinicalData: ClinicalDataType
): Promise<Clinicos> {
  const clinicosID = clinicalData.clinicosID;

  const clinicosData = {
    dob: new Date(clinicalData.dob),
    sexonacer: clinicalData.sexonacer,
    curp: clinicalData.curp,
    indigenous: clinicalData.indigenous === "Sí",
    afrodescendant: clinicalData.afrodescendant === "Sí",
  };

  if (!clinicosID) {
    return await prisma.clinicos.create({ data: clinicosData });
  }

  return await prisma.clinicos.upsert({
    where: { id: clinicosID },
    create: clinicosData,
    update: clinicosData,
  });
}

export async function upsertContacto(
  clinicalData: ClinicalDataType
): Promise<Contacto | null> {
  // Skip creating or updating a 'Contacto' object if the necessary properties are missing.
  if (!shouldInvolveContacto(clinicalData)) return null;

  const contactoId =
    clinicalData.contactoID && clinicalData.contactoID !== "null"
      ? clinicalData.contactoID
      : null;

  if (!contactoId) {
    // No existing ID provided; create a new record directly
    return await prisma.contacto.create({
      data: {
        homeEmail: clinicalData.homeEmail,
        homeCel: clinicalData.homeCel,
        homeDireccion: clinicalData.homeDireccion,
        homeExtNum: clinicalData.homeExtNum,
        homeIntNum: clinicalData.homeIntNum,
        homeCity: clinicalData.homeCity,
        homeState: clinicalData.homeState,
        homePostalCode: clinicalData.homePostalCode,
        homeCountry: clinicalData.homeCountry,
        lugarOrigenEstado: clinicalData.lugarOrigenEstado,
        lugarOrigenCiudad: clinicalData.lugarOrigenCiudad,
        clinicos: {
          connect: { id: clinicalData.clinicosID },
        },
      },
    });
  }

  // Use upsert if an ID is provided
  return await prisma.contacto.upsert({
    where: {
      id: contactoId,
    },
    create: {
      homeEmail: clinicalData.homeEmail,
      homeCel: clinicalData.homeCel,
      homeDireccion: clinicalData.homeDireccion,
      homeExtNum: clinicalData.homeExtNum,
      homeIntNum: clinicalData.homeIntNum,
      homeCity: clinicalData.homeCity,
      homeState: clinicalData.homeState,
      homePostalCode: clinicalData.homePostalCode,
      homeCountry: clinicalData.homeCountry,
      lugarOrigenEstado: clinicalData.lugarOrigenEstado,
      lugarOrigenCiudad: clinicalData.lugarOrigenCiudad,

      clinicos: {
        connect: { id: clinicalData.clinicosID },
      },
    },
    update: {
      homeEmail: clinicalData.homeEmail,
      homeCel: clinicalData.homeCel,
      homeDireccion: clinicalData.homeDireccion,
      homeExtNum: clinicalData.homeExtNum,
      homeIntNum: clinicalData.homeIntNum,
      homeCity: clinicalData.homeCity,
      homeState: clinicalData.homeState,
      homePostalCode: clinicalData.homePostalCode,
      homeCountry: clinicalData.homeCountry,
      lugarOrigenEstado: clinicalData.lugarOrigenEstado,
      lugarOrigenCiudad: clinicalData.lugarOrigenCiudad,
    },
  });
}

export async function upsertOtros(
  clinicalData: ClinicalDataType
): Promise<Otros | null> {
  // Skip creating or updating an 'Otros' object if the necessary properties are missing.
  if (!shouldInvolveOtros(clinicalData)) return null;

  const otrosId =
    clinicalData.otrosID && clinicalData.otrosID !== "null"
      ? clinicalData.otrosID
      : null;

  if (!otrosId) {
    // No existing ID provided; create a new record directly
    return await prisma.otros.create({
      data: {
        nombreOtros: clinicalData.nombreOtros,
        apellidoPaterno: clinicalData.apellidoPaterno,
        apellidoMaterno: clinicalData.apellidoMaterno,
        estadoCivil: clinicalData.estadoCivil,
        nivelEstudios: clinicalData.nivelEstudios,
        clinicos: {
          connect: { id: clinicalData.clinicosID },
        },
      },
    });
  }

  // Use upsert if an ID is provided
  return await prisma.otros.upsert({
    where: {
      id: otrosId,
    },
    create: {
      nombreOtros: clinicalData.nombreOtros,
      apellidoPaterno: clinicalData.apellidoPaterno,
      apellidoMaterno: clinicalData.apellidoMaterno,
      estadoCivil: clinicalData.estadoCivil,
      nivelEstudios: clinicalData.nivelEstudios,

      clinicos: {
        connect: { id: clinicalData.clinicosID },
      },
    },
    update: {
      nombreOtros: clinicalData.nombreOtros,
      apellidoPaterno: clinicalData.apellidoPaterno,
      apellidoMaterno: clinicalData.apellidoMaterno,
      estadoCivil: clinicalData.estadoCivil,
      nivelEstudios: clinicalData.nivelEstudios,
    },
  });
}

export async function upsertOcupacion(
  clinicalData: ClinicalDataType
): Promise<Ocupacion | null> {
  // Skip creating or updating an 'Ocupacion' object if the necessary properties are missing.
  if (!shouldInvolveOcupacion(clinicalData)) return null;

  const ocupacionId =
    clinicalData.ocupacionID && clinicalData.ocupacionID !== "null"
      ? clinicalData.ocupacionID
      : null;

  if (!ocupacionId) {
    // No existing ID provided; create a new record directly
    return await prisma.ocupacion.create({
      data: {
        ocupacion: clinicalData.ocupacion,
        paisTrabajo: clinicalData.paisTrabajo,
        direccionTrabajo: clinicalData.direccionTrabajo,
        ciudadTrabajo: clinicalData.ciudadTrabajo,
        estadoTrabajo: clinicalData.estadoTrabajo,
        clinicos: {
          connect: { id: clinicalData.clinicosID },
        },
      },
    });
  }

  // Use upsert if an ID is provided
  return await prisma.ocupacion.upsert({
    where: {
      id: ocupacionId || "non-existing-id",
    },
    create: {
      ocupacion: clinicalData.ocupacion,
      paisTrabajo: clinicalData.paisTrabajo,
      direccionTrabajo: clinicalData.direccionTrabajo,
      ciudadTrabajo: clinicalData.ciudadTrabajo,
      estadoTrabajo: clinicalData.estadoTrabajo,

      clinicos: {
        connect: { id: clinicalData.clinicosID },
      },
    },
    update: {
      ocupacion: clinicalData.ocupacion,
      paisTrabajo: clinicalData.paisTrabajo,
      direccionTrabajo: clinicalData.direccionTrabajo,
      ciudadTrabajo: clinicalData.ciudadTrabajo,
      estadoTrabajo: clinicalData.estadoTrabajo,
    },
  });
}
