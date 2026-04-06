import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function populateGeoJson() {
  // Path to the folder containing GeoJSON files
  const folderPath = path.join(process.cwd(), "data/geojson");

  // Read all files in the folder
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    if (file.endsWith(".json")) {
      // Extract the state name from the file name
      let stateName = path.basename(file, ".json");

      // Lowercase the state name and remove all internal whitespaces.
      stateName = stateName.toLowerCase().replace(/\s/g, "");

      // Replace Spanish characters with their English counterparts.
      stateName = stateName
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u");

      let geoJson;
      // Read the GeoJSON file content
      try {
        const fileContent = fs.readFileSync(
          path.join(folderPath, file),
          "utf-8"
        );
        geoJson = JSON.parse(fileContent);
      } catch (error) {
        console.error(`Error reading 'GeoJSON' file ${file}:`, error);
      }

      try {
        // Insert or update the record in the database
        await prisma.stateGeoJson.upsert({
          where: { stateName },
          update: { geoJson },
          create: { stateName, geoJson },
        });
      } catch (error) {
        console.error(
          `Error upserting 'StateGeoJson' with 'stateName' ${stateName}:`,
          error
        );
      }

      console.log(`Processed: ${stateName}`);
    }
  }

  console.log("GeoJSON data has been successfully populated!");
}

async function runAllPopulations() {
  try {
    await populateGeoJson();
    console.log("All tables seeded successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllPopulations();
