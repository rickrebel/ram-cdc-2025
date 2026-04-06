import { prisma } from "~/server/database.server";
import { ClinicalDataType } from "~/utilities/types";
import { InDRESelected, InDRECreated } from "~/utilities/InDRETypes";
import { Visitation } from "@prisma/client";

export async function addVisitation(
  clinicalData: ClinicalDataType,
  existingConditions: string[],
  alergies: string[]
): Promise<Visitation> {
  // You're extracting just those properties (from 'clinicalData') that are needed
  // to create a new 'Visitation' object. The exception is 'eventId', which is to be appended to the
  // string array 'eventIDs' in the 'Visitation' object and thus done seperately in a moment.
  const newVisitation = await prisma.visitation.create({
    data: {
      curp: clinicalData.curp,
      genero: clinicalData.genero,
      peso: parseFloat(clinicalData.peso),
      talla: parseFloat(clinicalData.talla),
      existingConditions: existingConditions,
      hospitalized: clinicalData.hospitalized == "No" ? false : true,
      takenMedication: clinicalData.takenMedication == "No" ? false : true,
      disability: clinicalData.disability == "No" ? false : true,
      migrant: clinicalData.migrant == "No" ? false : true,
      countriesMigration: JSON.parse(clinicalData.countriesMigration),
      alergies: alergies,
      location: clinicalData.location,
      clinicos: {
        connect: { id: clinicalData.clinicosID },
      },
    },
  });

  return newVisitation;
}

export async function addInDRE(
  indreData: InDRESelected
): Promise<InDRECreated> {
  if (!indreData.hospital) {
    throw new Error("Por favor, seleccione un hospital.");
  }

  // Helper function to safely parse JSON
  const safeParseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      throw new Error(`Invalid JSON input: ${jsonString}`);
    }
  };

  // Extract known keys
  const {
    bacteriaSelector,
    resistanceSelector,
    geneSelector,
    geneVariant,
    hospital,
    profileId,
    ...dynamicKeys
  } = indreData;

  // Process known keys
  const resistanceMechanism: string[] = safeParseJSON(resistanceSelector);
  const genes: string[] = safeParseJSON(geneSelector);

  // Process dynamic keys
  const dynamicData: Record<string, string> = {};
  for (const key in dynamicKeys) {
    if (
      Object.prototype.hasOwnProperty.call(dynamicKeys, key) &&
      dynamicKeys[key] !== null
    ) {
      dynamicData[key] = dynamicKeys[key] as string;
    }
  }

  // Remove 'bacteriaSearch' from 'dynamicData'.
  delete dynamicData.bacteriaSearch;
  delete dynamicData.action;
  delete dynamicData.cluesSearch;
  delete dynamicData.newResistanceCreator;
  delete dynamicData.newAntibioticCreator;
  delete dynamicData.newGeneCreator;
  delete dynamicData.newHospitalCreator;

  // In Prisma, you can use the `$transaction` method to group multiple database operations into
  // a single transaction. This will mean that they either all succeed or all fail as a single
  // unit of work. If one operation in the transaction fails, the entire transaction is rolled back,
  // which ensures the consistency and integrity of your data. It also reduces round trips to the
  // database, which can improve performance.
  const result = await prisma.$transaction(async (prisma) => {
    const newInDRE = await prisma.indreobj.create({
      data: {
        resistanceMechanism: resistanceMechanism,
        gene: genes,
        bacteria: bacteriaSelector,
        geneVariant: geneVariant,
        hospitalName: hospital!.hospitalName,
        hospitalClues: hospital!.clues,
        hospitalId: hospital!.id,
        dynamicData: dynamicData,
      },
    });

    return { newInDRE };
  });

  return result.newInDRE;
}

export async function addResistanceMechanism(data: string[]) {
  // Loop over the items in the 'data' array and create a new 'Resistance' object for each item.
  for (const item of data) {
    // Check if the 'item' already exists in the database.
    const resistanceMechanism = await prisma.resistance.findFirst({
      where: {
        resistanceMechanism: item,
      },
    });
    if (resistanceMechanism) continue;

    await prisma.resistance.create({
      data: {
        resistanceMechanism: item,
      },
    });
  }
}

export async function addAntibiotic(data: string[]) {
  // Loop over the items in the 'data' array and create a new 'Antibiotic' object for each item.
  for (const item of data) {
    // Check if the 'item' already exists in the database.
    const antibiotic = await prisma.antibiotic.findFirst({
      where: {
        antibioticName: item,
      },
    });
    if (antibiotic) continue;

    await prisma.antibiotic.create({
      data: {
        antibioticName: item,
      },
    });
  }
}

export async function addGene(data: string[]) {
  // Loop over the items in the 'data' array and create a new 'Antibiotic' object for each item.
  for (const item of data) {
    // Check if the 'item' already exists in the database.
    const gene = await prisma.gene.findFirst({
      where: {
        geneName: item,
      },
    });
    if (gene) continue;

    await prisma.gene.create({
      data: {
        geneName: item,
      },
    });
  }
}

// addHospital comentada — los hospitales se gestionan exclusivamente mediante
// el catálogo oficial (seed). No se permite crear hospitales desde la UI.
// export async function addHospital(
//   data: string[],
//   hospitalNames: string[],
//   clues: string[]
// ) {
//   data.forEach(async (item, index) => {
//     const hospital = await prisma.hospital.findFirst({
//       where: { hospitalName: hospitalNames[index] },
//     });
//     if (hospital) return;
//     await prisma.hospital.create({
//       data: {
//         hospitalName: hospitalNames[index],
//         clues: clues[index],
//       },
//     });
//   });
// }
