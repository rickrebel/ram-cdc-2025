import { prisma } from "~/server/database.server";
import { State } from "~/utilities/types";
import {
  AntimicrobianoTabla3,
  AntimicrobianoTabla4,
  AntimicrobianoTabla5,
  AntimicrobianoTabla6,
  Clinicos,
  Contacto,
  Otros,
  Ocupacion,
  Profile,
  Hospital,
  Gene,
  Bacteria,
  Resistance,
  StateGeoJson,
  Visitation,
} from "@prisma/client";

// -------------------------------------------------------------------------------------
// CLINICOS GETTERS
export async function getClinicos(id: string | null): Promise<Clinicos | null> {
  if (id) {
    // If an id is provided, return the patient's clinical data.
    return await prisma.clinicos.findFirst({
      where: { id },
    });
  } else {
    // Raise and throw an error.
    const error = new Error("No id provided.");
    throw error;
  }
}

export async function getAllClinicos(): Promise<
  (Omit<Clinicos, "location"> & { location?: string })[] | null
> {
  const clinicos = await prisma.clinicos.findMany();
  return clinicos.map(({ location, ...rest }) => ({
    ...rest,
    location: location ?? undefined, // Convert null to undefined
  }));
}
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// VISITATION GETTERS
export async function getVisitation(id: string): Promise<Visitation | null> {
  return await prisma.visitation.findFirst({
    where: { id },
  });
}

export async function getAllVisitation(): Promise<Visitation[] | null> {
  return await prisma.visitation.findMany();
}

export async function getAllVisitationIdsForClinicos(
  clinicosId: string
): Promise<{ visitationIds: string[] }> {
  const visitations = await prisma.visitation.findMany({
    where: { clinicosId },
    select: { id: true },
  });
  return { visitationIds: visitations.map((v) => v.id) };
}

export async function getCurrentVisitationIdForClinicos(
  clinicosId: string
): Promise<string> {
  const visitationObj: Visitation | null = await prisma.visitation.findFirst({
    where: { clinicosId },
    orderBy: {
      date: "desc",
    },
  });

  if (!visitationObj) {
    throw new Error("No se encontró ninguna visita para el paciente.");
  }

  return visitationObj.id;
}
// -------------------------------------------------------------------------------------

export async function getProfile(id: string): Promise<Profile | null> {
  if (id) {
    return await prisma.profile.findFirst({
      where: { id },
    });
  } else {
    const error = new Error("No id provided.");
    throw error;
  }
}

export async function getContacto(id: string): Promise<Contacto | null> {
  if (id === "null") {
    return null;
  }

  return await prisma.contacto.findFirst({
    where: { id },
  });
}

export async function getOcupacion(id: string): Promise<Ocupacion | null> {
  if (id === "null") {
    return null;
  }

  return await prisma.ocupacion.findFirst({
    where: { id },
  });
}

export async function getContactoByClinicos(
  clinicosId: string
): Promise<Contacto | null> {
  return await prisma.contacto.findFirst({ where: { clinicosId } });
}

export async function getOtrosByClinicos(
  clinicosId: string
): Promise<Otros | null> {
  return await prisma.otros.findFirst({ where: { clinicosId } });
}

export async function getOcupacionByClinicos(
  clinicosId: string
): Promise<Ocupacion | null> {
  return await prisma.ocupacion.findFirst({ where: { clinicosId } });
}

export async function getOtros(id: string): Promise<Otros | null> {
  if (id === "null") {
    return null;
  }

  return await prisma.otros.findFirst({
    where: { id },
  });
}

export async function getPatientsByCurp(curp: string): Promise<Clinicos[]> {
  return await prisma.clinicos.findMany({
    where: { curp: { contains: curp, mode: "insensitive" } },
  });
}

export async function getPatientByCurp(curp: string): Promise<Clinicos | null> {
  return await prisma.clinicos.findFirst({
    where: { curp },
  });
}

export async function getPrimaryCondition(
  visitationId: string
): Promise<string[]> {
  // From the visitation object with id 'visitationId', select the 'primaryConditions' field.
  const primaryConditions: {
    primaryConditions: string[];
  } | null = await prisma.visitation.findFirst({
    where: { id: visitationId },
    select: { primaryConditions: true },
  });

  // If no primary conditions were found, return an empty array.
  if (!primaryConditions) {
    return [];
  }
  return primaryConditions.primaryConditions;
}

export async function getSecondaryConditions(
  id: string
): Promise<{ secondaryConditions: string[] } | null> {
  const secondaryConditions = await prisma.visitation.findFirst({
    where: { id },
    select: { secondaryConditions: true },
  });
  return secondaryConditions;
}

export async function getAllAntimicrobianosT3(): Promise<
  AntimicrobianoTabla3[]
> {
  // Fetch all records from the database.
  const allAntiMicrobianosT3: AntimicrobianoTabla3[] =
    await prisma.antimicrobianoTabla3.findMany();

  if (!allAntiMicrobianosT3.length) {
    throw new Error("No se encontró ninguna lista de antibióticos (T3).");
  }

  return allAntiMicrobianosT3;
}

export async function getAllAntimicrobianosT4(): Promise<
  AntimicrobianoTabla4[]
> {
  // Fetch all records from the database.
  const allAntiMicrobianosT4: AntimicrobianoTabla4[] =
    await prisma.antimicrobianoTabla4.findMany();

  if (!allAntiMicrobianosT4.length) {
    throw new Error("No se encontró ninguna lista de antibióticos (T4).");
  }

  return allAntiMicrobianosT4;
}

export async function getAllAntimicrobianosT5(): Promise<
  AntimicrobianoTabla5[]
> {
  // Fetch all records from the database.
  const allAntiMicrobianosT5: AntimicrobianoTabla5[] =
    await prisma.antimicrobianoTabla5.findMany();

  if (!allAntiMicrobianosT5) {
    throw new Error("No se encontró ninguna lista de antibióticos (T5).");
  }

  return allAntiMicrobianosT5;
}

export async function getAllAntimicrobianosT6(): Promise<
  AntimicrobianoTabla6[]
> {
  // Fetch all records from the database (table 'AntimicrobianoTabla6').
  const allAntiMicrobianosT6: AntimicrobianoTabla6[] =
    await prisma.antimicrobianoTabla6.findMany();

  if (!allAntiMicrobianosT6) {
    throw new Error("No se encontró ninguna lista de antibióticos (T6).");
  }

  return allAntiMicrobianosT6;
}

export async function getAllResistanceMechanisms(): Promise<Resistance[]> {
  // Get all resistance mechanisms.
  const allResistance: Resistance[] = await prisma.resistance.findMany({
    orderBy: {
      resistanceMechanism: "asc",
    },
  });

  if (!allResistance) {
    throw new Error("No se encontró ningún mecanismo de resistencia.");
  }

  return allResistance;
}

export async function getAllGenes(): Promise<Gene[]> {
  // Get all gene families.
  const allGenes: Gene[] = await prisma.gene.findMany({
    orderBy: {
      geneName: "asc",
    },
  });

  if (!allGenes) {
    throw new Error(
      "No se encontró ninguna lista de Genes asociados a mecanismos de resistencia."
    );
  }

  return allGenes;
}

// Get a single hospital from the database.
// Allow the user to provide either the 'id', 'clues', or 'hospitalName' of the hospital.
export async function getHospital(
  input: string,
  type: string
): Promise<Hospital[]> {
  if (type === "clues") {
    return await prisma.hospital.findMany({
      where: {
        clues: {
          contains: input,
          mode: "insensitive",
        },
      },
    });
  } else if (type === "hospitalName") {
    return await prisma.hospital.findMany({
      where: {
        hospitalName: {
          contains: input,
          mode: "insensitive",
        },
      },
    });
  } else {
    throw new Error("No se proporcionó un clues, o hospitalName.");
  }
}

export async function getAllBacteria(): Promise<Bacteria[]> {
  // Get all bacterias or bacteria families.
  const allBacterias: Bacteria[] = await prisma.bacteria.findMany({
    orderBy: {
      bacteria: "asc",
    },
  });

  if (!allBacterias) {
    throw new Error("No se encontraron bacterias ni familias de bacterias.");
  }

  return allBacterias;
}

export async function getAllStates(): Promise<State[]> {
  const allStates: State[] = await prisma.state.findMany();

  if (!allStates) {
    throw new Error("No se encontraron nombres de estados.");
  }

  return allStates;
}

export async function getBacteriaByName(
  bacteria: string
): Promise<Bacteria | null> {
  return await prisma.bacteria.findFirst({
    where: { bacteria },
  });
}

export async function getGeoJsonByState(
  stateName: string
): Promise<StateGeoJson> {
  // Lowercase the state name and remove all internal whitespaces.
  stateName = stateName.toLowerCase().replace(/\s/g, "");

  // Replace Spanish characters with their English counterparts.
  stateName = stateName
    .replace("á", "a")
    .replace("é", "e")
    .replace("í", "i")
    .replace("ó", "o")
    .replace("ú", "u");

  const geoData = await prisma.stateGeoJson.findUnique({
    where: { stateName },
  });

  if (!geoData) {
    throw new Error(`No GeoJSON data found for state: ${stateName}`);
  }

  return geoData;
}
