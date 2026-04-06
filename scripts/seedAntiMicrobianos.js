import { PrismaClient } from "@prisma/client";
import list_tabla3 from "../data/Tabla3.json" with { type: "json" };
import list_tabla4 from "../data/Tabla4.json" with { type: "json" };
import list_tabla5 from "../data/Tabla5.json" with { type: "json" };
import list_tabla6 from "../data/Tabla6.json" with { type: "json" };
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// Mapeo color hex -> nombre de susceptibilidad (debe coincidir con
// los registros creados por seedSusceptibilidades.js).
const COLOR_TO_SUSCEPTIBILIDAD = {
  "#000000": "PRESENTE",
  "#ff0000": "RESISTENTE",
  "#3cb371": "SENSIBLE",
  "#ffa500": "INTERMEDIO",
};

// Mapeo nombre largo de bacteria (como aparece en los JSON) al nombre
// normalizado (como aparece en Bacteria.nombreNormalizado). Este mapeo
// replica lo que antes estaba en bacteriaReplacer.js.
const BACTERIA_NOMBRE_LARGO_A_NORMALIZADO = {
  "Abiotrophia spp y Granulicatella spp": "Abiotrophia",
  "Acinetobacter spp": "Acinetobacter",
  "Aerococcus spp": "Aerococcus",
  "Aeromonas spp": "Aeromonas",
  "Aggregatibacter spp, Cardiobacterium spp, Eikenella corrodens y Kingella spp": "Aggregatibacter",
  "Aspergillus fumigatus": "AspergillusFumigatus",
  "Bacillus spp y g\u00e9neros relacionados (No incluye Bacillus anthracis)": "Bacillus",
  "Burkholderia cepacia complex": "BurkholderiaCepacia",
  "Campylobacter jejuni/coli": "Campylobacter",
  "Candida albicans": "CandidaAlbicans",
  "Candida auris": "CandidaAuris",
  "Candida dubliniensis": "CandidaDubliniensis",
  "Candida duobushaemulonii": "CandidaDuobushaemulonii",
  "Candida glabrata": "CandidaGlabrata",
  "Candida guilliermondii": "CandidaGuilliermondii",
  "Candida haemulonii": "CandidaHaemulonii",
  "Candida kefyr": "CandidaKefyr",
  "Candida krusei": "CandidaKrusei",
  "Candida lusitaniae": "CandidaLusitaniae",
  "Candida parapsilosis complexo": "CandidaParapsilosis",
  "Candida pararugosa": "CandidaPararugosa",
  "Candida peliculosa": "CandidaPeliculosa",
  "Candida rugosa": "CandidaRugosa",
  "Candida tropicalis": "CandidaTropicalis",
  "Corynebacterium spp y otros G\u00e9neros de Coryneformes relacionados": "Corynebacterium",
  "Cryptococcus deuterogatti": "CryptococcusDeuterogatti",
  "Cryptococcus gatti": "CryptococcusGatti",
  "Cryptococcus neoformans": "CryptococcusNeoformans",
  "Enterobacterales": "Enterobacterales",
  "Enterococcus spp": "Enterococcus",
  "Erysipelothrix rhusiopathiae": "Erysipelothrix",
  "Gemella spp": "Gemella",
  "Haemophilus influenzae y Haemophilus parainfluenzae": "HaemophilusInfluenzae",
  "Helycobacter pylori": "Helycobacter",
  "Lactobacillus spp": "Lactobacillus",
  "Lactococcus spp": "Lactococcus",
  "Leuconostoc spp": "Leuconostoc",
  "Listeria monocytogenes": "Listeria",
  "Micrococcus spp": "Micrococcus",
  "Moraxella catarrhalis": "Moraxella",
  "Naisseria meningitidis": "NaisseriaMeningitidis",
  "Neisseria gonorrhoeae": "NeisseriaGonorrhoeae",
  "Nocardia spp": "Nocardia",
  "Otros no Enterobacterales": "OtrosNoEnterobacterales",
  "Pasteurella spp": "Pasteurella",
  "Pediococcus spp": "Pediococcus",
  "Pseudomonas aeruginosa": "PseudomonasAeruginosa",
  "Rothia mucilaginosa": "Rothia",
  "Salmonella spp y Shigella spp": "SalmonellaShigella",
  "Staphylococcus spp": "Staphylococcus",
  "Stenotrophomonas maltophilia": "StenotrophomonasMaltophilia",
  "Streptococcus pneumoniae": "StreptococcusPneumoniae",
  "Streptococcus spp (Grupo Hemolitico)": "StreptococcusHemolitico",
  "Streptococcus spp (Grupo Viridans)": "StreptococcusViridans",
  "Vibrio spp": "Vibrio",
  "Anaerobios": "Anaerobios",
};

// ---------------------------------------------------------------
// Paso 1: Crear o actualizar el catalogo Antimicrobiano (73 unicos)
// ---------------------------------------------------------------
async function seedAntimicrobianos() {
  const tablas = [
    { data: list_tabla3, num: 3 },
    { data: list_tabla4, num: 4 },
    { data: list_tabla5, num: 5 },
    { data: list_tabla6, num: 6 },
  ];

  // Agrupar: nombre -> Set de tablas donde aparece
  const antimicrobianoTables = {};
  for (const { data, num } of tablas) {
    for (const nombre of Object.keys(data)) {
      if (!antimicrobianoTables[nombre]) {
        antimicrobianoTables[nombre] = new Set();
      }
      antimicrobianoTables[nombre].add(num);
    }
  }

  for (const [nombre, tablesSet] of Object.entries(antimicrobianoTables)) {
    const tables = [...tablesSet].sort();
    await prisma.antimicrobiano.upsert({
      where: { nombre },
      update: { tables },
      create: { nombre, tables },
    });
  }
  console.log(
    `Catalogo 'Antimicrobiano' seeded: ${Object.keys(antimicrobianoTables).length} registros.`
  );
}

// ---------------------------------------------------------------
// Paso 2: Crear las filas de AntimicrobianoSusceptibilidad
// ---------------------------------------------------------------
async function seedSusceptibilidades() {
  // Precargar lookups para evitar queries repetidos
  const bacterias = await prisma.bacteria.findMany();
  const bacteriaByNorm = {};
  for (const b of bacterias) {
    bacteriaByNorm[b.nombreNormalizado] = b.id;
  }

  const antimicrobianos = await prisma.antimicrobiano.findMany();
  const antimicrobianoByNombre = {};
  for (const a of antimicrobianos) {
    antimicrobianoByNombre[a.nombre] = a.id;
  }

  const susceptibilidades = await prisma.susceptibilidad.findMany();
  const susceptibilidadByNombre = {};
  for (const s of susceptibilidades) {
    susceptibilidadByNombre[s.nombre] = s.id;
  }

  const tablas = [
    { data: list_tabla3, num: 3 },
    { data: list_tabla4, num: 4 },
    { data: list_tabla5, num: 5 },
    { data: list_tabla6, num: 6 },
  ];

  let count = 0;

  for (const { data } of tablas) {
    for (const [antimicrobianoNombre, bacteriaData] of Object.entries(data)) {
      const antimicrobianoId = antimicrobianoByNombre[antimicrobianoNombre];
      if (!antimicrobianoId) {
        console.warn(`Antimicrobiano no encontrado: ${antimicrobianoNombre}`);
        continue;
      }

      for (const [bacteriaNombreLargo, valores] of Object.entries(bacteriaData)) {
        const present = valores[0];
        if (!present) continue; // Solo insertar donde present = true

        const color = valores[1];
        const susceptibilidadNombre = COLOR_TO_SUSCEPTIBILIDAD[color];
        if (!susceptibilidadNombre) {
          console.warn(`Color desconocido: ${color} en ${antimicrobianoNombre}/${bacteriaNombreLargo}`);
          continue;
        }

        const bacteriaNorm = BACTERIA_NOMBRE_LARGO_A_NORMALIZADO[bacteriaNombreLargo];
        if (!bacteriaNorm) {
          console.warn(`Bacteria sin mapeo: ${bacteriaNombreLargo}`);
          continue;
        }

        const bacteriaId = bacteriaByNorm[bacteriaNorm];
        if (!bacteriaId) {
          console.warn(`Bacteria no encontrada en BD: ${bacteriaNorm}`);
          continue;
        }

        const susceptibilidadId = susceptibilidadByNombre[susceptibilidadNombre];

        await prisma.antimicrobianoSusceptibilidad.upsert({
          where: {
            antimicrobianoId_bacteriaId: {
              antimicrobianoId,
              bacteriaId,
            },
          },
          update: { susceptibilidadId },
          create: { antimicrobianoId, bacteriaId, susceptibilidadId },
        });
        count++;
      }
    }
  }
  console.log(
    `Tabla 'AntimicrobianoSusceptibilidad' seeded: ${count} registros.`
  );
}

async function main() {
  try {
    await seedAntimicrobianos();
    await seedSusceptibilidades();
    console.log("All antimicrobianos tables seeded successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
