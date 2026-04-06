import { PrismaClient } from "@prisma/client";
import list_of_hospitals from "../data/ESTABLECIMIENTO_SALUD_202501.json" with { type: "json" };
import dotenv from "dotenv";

// 'dotenv' here is used to load environment variables from a .env file so that they
// can be accessed using 'process.env'. In this context they are used by Prisma to
// connect to the database.
dotenv.config();
const prisma = new PrismaClient();

const number_of_records = list_of_hospitals.length;
let counter = 0;

async function populateHospitals() {
  for (const hospital of list_of_hospitals) {
    const clues = hospital["CLUES"];
    const hospitalName = hospital["NOMBRE DE LA INSTITUCION"];
    const entidad = hospital["ENTIDAD"];
    const municipio = hospital["MUNICIPIO"];
    const tipo = hospital["NOMBRE TIPO ESTABLECIMIENTO"];
    const subtipo = hospital["NOMBRE DE SUBTIPOLOGIA"];
    const codigo = hospital["CODIGO POSTAL"];
    const status = hospital["ESTATUS DE OPERACION"];
    const clave = hospital["CLAVE DE LA INS ADM"];
    const nivel = hospital["NIVEL ATENCION"];
    const latitude =
      hospital["LATITUD"] && hospital["LATITUD"].trim() !== ""
        ? parseFloat(hospital["LATITUD"])
        : null;
    const longitude =
      hospital["LONGITUD"] && hospital["LONGITUD"].trim() !== ""
        ? parseFloat(hospital["LONGITUD"])
        : null;

    try {
      // Create the object in the database.
      await prisma.hospital.upsert({
        where: { clues }, // Match on the clues unique identifier.
        update: {}, // No need to update anything.
        create: {
          clues,
          hospitalName,
          entidad,
          municipio,
          tipo,
          subtipo,
          codigo,
          status,
          clave,
          nivel,
          latitude,
          longitude,
        }, // Create a new object if it doesn't exist.
      });
      counter++;
      if (counter % 1000 === 0 || counter === number_of_records) {
        console.log(
          `Record ${counter} of ${number_of_records} seeded successfully!`
        );
      }
    } catch (error) {
      console.error(`Error upserting 'Hospital' with clues ${clues}:`, error);
    }
  }
  console.log("Database 'Hospital' seeded successfully!");
}

async function runAllPopulations() {
  try {
    await populateHospitals();
    console.log("All tables seeded successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllPopulations();
