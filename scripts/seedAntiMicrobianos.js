import { PrismaClient } from "@prisma/client";
import list_tabla3_of_antimicrobianos from "../data/Tabla3.json" with { type: "json" };
import list_tabla4_of_antimicrobianos from "../data/Tabla4.json" with { type: "json" };
import list_tabla5_of_antimicrobianos from "../data/Tabla5.json" with { type: "json" };
import list_tabla6_of_antimicrobianos from "../data/Tabla6.json" with { type: "json" };
import { replacer } from "../app/utilities/bacteriaReplacer.js";
import dotenv from "dotenv";

// 'dotenv' here is used to load environment variables from a .env file so that they
// can be accessed using 'process.env'. In this context they are used by Prisma to
// connect to the database.
dotenv.config();
const prisma = new PrismaClient();

async function populateTable(tableName, data, model) {
  for (const [antimicrobial, bacteriaData] of Object.entries(data)) {
    const transformedData = {
      antimicrobiano: antimicrobial,
      ...Object.fromEntries(
        Object.entries(bacteriaData).map(([key, value]) => [
          replacer[key] || key,
          { present: value[0], colour: value[1] },
        ])
      ),
    };

    await model.upsert({
      where: { antimicrobiano: transformedData.antimicrobiano },
      update: {},
      create: transformedData,
    });
  }
  console.log(`Database '${tableName}' seeded successfully!`);
}

async function runAllPopulations() {
  try {
    await populateTable(
      "antimicrobianoTabla3",
      list_tabla3_of_antimicrobianos,
      prisma.antimicrobianoTabla3
    );
    await populateTable(
      "antimicrobianoTabla4",
      list_tabla4_of_antimicrobianos,
      prisma.antimicrobianoTabla4
    );
    await populateTable(
      "antimicrobianoTabla5",
      list_tabla5_of_antimicrobianos,
      prisma.antimicrobianoTabla5
    );
    await populateTable(
      "antimicrobianoTabla6",
      list_tabla6_of_antimicrobianos,
      prisma.antimicrobianoTabla6
    );
    console.log("All antimicrobianos tables seeded successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllPopulations();
