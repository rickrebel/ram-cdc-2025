import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// 'dotenv' here is used to load environment variables from a .env file so that they
// can be accessed using 'process.env'. In this context they are used by Prisma to
// connect to the database.
dotenv.config();
const prisma = new PrismaClient();

const list_of_bacterias = [
  // Tabla 3 (15 bacterias)
  { bacteria: "Enterobacterales", nombreNormalizado: "Enterobacterales", table: 3 },
  { bacteria: "Salmonella spp y Shigella spp", nombreNormalizado: "SalmonellaShigella", table: 3 },
  { bacteria: "Pseudomonas aeruginosa", nombreNormalizado: "PseudomonasAeruginosa", table: 3 },
  { bacteria: "Acinetobacter spp", nombreNormalizado: "Acinetobacter", table: 3 },
  { bacteria: "Burkholderia cepacia complex", nombreNormalizado: "BurkholderiaCepacia", table: 3 },
  { bacteria: "Stenotrophomonas maltophilia", nombreNormalizado: "StenotrophomonasMaltophilia", table: 3 },
  { bacteria: "Otros no Enterobacterales", nombreNormalizado: "OtrosNoEnterobacterales", table: 3 },
  { bacteria: "Haemophilus influenzae y Haemophilus parainfluenzae", nombreNormalizado: "HaemophilusInfluenzae", table: 3 },
  { bacteria: "Neisseria gonorrhoeae", nombreNormalizado: "NeisseriaGonorrhoeae", table: 3 },
  { bacteria: "Naisseria meningitidis", nombreNormalizado: "NaisseriaMeningitidis", table: 3 },
  { bacteria: "Staphylococcus spp", nombreNormalizado: "Staphylococcus", table: 3 },
  { bacteria: "Enterococcus spp", nombreNormalizado: "Enterococcus", table: 3 },
  { bacteria: "Streptococcus pneumoniae", nombreNormalizado: "StreptococcusPneumoniae", table: 3 },
  { bacteria: "Streptococcus spp (Grupo Hemolitico)", nombreNormalizado: "StreptococcusHemolitico", table: 3 },
  { bacteria: "Streptococcus spp (Grupo Viridans)", nombreNormalizado: "StreptococcusViridans", table: 3 },

  // Tabla 4 (15 bacterias)
  { bacteria: "Anaerobios", nombreNormalizado: "Anaerobios", table: 4 },
  { bacteria: "Nocardia spp", nombreNormalizado: "Nocardia", table: 4 },
  { bacteria: "Abiotrophia spp y Granulicatella spp", nombreNormalizado: "Abiotrophia", table: 4 },
  { bacteria: "Aerococcus spp", nombreNormalizado: "Aerococcus", table: 4 },
  { bacteria: "Aeromonas spp", nombreNormalizado: "Aeromonas", table: 4 },
  { bacteria: "Bacillus spp y g\u00e9neros relacionados (No incluye Bacillus anthracis)", nombreNormalizado: "Bacillus", table: 4 },
  { bacteria: "Campylobacter jejuni/coli", nombreNormalizado: "Campylobacter", table: 4 },
  { bacteria: "Corynebacterium spp y otros G\u00e9neros de Coryneformes relacionados", nombreNormalizado: "Corynebacterium", table: 4 },
  { bacteria: "Erysipelothrix rhusiopathiae", nombreNormalizado: "Erysipelothrix", table: 4 },
  { bacteria: "Gemella spp", nombreNormalizado: "Gemella", table: 4 },
  { bacteria: "Aggregatibacter spp, Cardiobacterium spp, Eikenella corrodens y Kingella spp", nombreNormalizado: "Aggregatibacter", table: 4 },
  { bacteria: "Vibrio spp", nombreNormalizado: "Vibrio", table: 4 },
  { bacteria: "Lactobacillus spp", nombreNormalizado: "Lactobacillus", table: 4 },
  { bacteria: "Lactococcus spp", nombreNormalizado: "Lactococcus", table: 4 },
  { bacteria: "Leuconostoc spp", nombreNormalizado: "Leuconostoc", table: 4 },

  // Tabla 5 (7 bacterias)
  { bacteria: "Listeria monocytogenes", nombreNormalizado: "Listeria", table: 5 },
  { bacteria: "Micrococcus spp", nombreNormalizado: "Micrococcus", table: 5 },
  { bacteria: "Moraxella catarrhalis", nombreNormalizado: "Moraxella", table: 5 },
  { bacteria: "Pasteurella spp", nombreNormalizado: "Pasteurella", table: 5 },
  { bacteria: "Pediococcus spp", nombreNormalizado: "Pediococcus", table: 5 },
  { bacteria: "Rothia mucilaginosa", nombreNormalizado: "Rothia", table: 5 },
  { bacteria: "Helycobacter pylori", nombreNormalizado: "Helycobacter", table: 5 },

  // Tabla 6 (19 bacterias)
  { bacteria: "Candida albicans", nombreNormalizado: "CandidaAlbicans", table: 6 },
  { bacteria: "Candida glabrata", nombreNormalizado: "CandidaGlabrata", table: 6 },
  { bacteria: "Candida guilliermondii", nombreNormalizado: "CandidaGuilliermondii", table: 6 },
  { bacteria: "Candida krusei", nombreNormalizado: "CandidaKrusei", table: 6 },
  { bacteria: "Candida parapsilosis complexo", nombreNormalizado: "CandidaParapsilosis", table: 6 },
  { bacteria: "Candida tropicalis", nombreNormalizado: "CandidaTropicalis", table: 6 },
  { bacteria: "Candida auris", nombreNormalizado: "CandidaAuris", table: 6 },
  { bacteria: "Candida dubliniensis", nombreNormalizado: "CandidaDubliniensis", table: 6 },
  { bacteria: "Candida kefyr", nombreNormalizado: "CandidaKefyr", table: 6 },
  { bacteria: "Candida lusitaniae", nombreNormalizado: "CandidaLusitaniae", table: 6 },
  { bacteria: "Candida peliculosa", nombreNormalizado: "CandidaPeliculosa", table: 6 },
  { bacteria: "Candida duobushaemulonii", nombreNormalizado: "CandidaDuobushaemulonii", table: 6 },
  { bacteria: "Candida haemulonii", nombreNormalizado: "CandidaHaemulonii", table: 6 },
  { bacteria: "Candida pararugosa", nombreNormalizado: "CandidaPararugosa", table: 6 },
  { bacteria: "Candida rugosa", nombreNormalizado: "CandidaRugosa", table: 6 },
  { bacteria: "Cryptococcus deuterogatti", nombreNormalizado: "CryptococcusDeuterogatti", table: 6 },
  { bacteria: "Cryptococcus gatti", nombreNormalizado: "CryptococcusGatti", table: 6 },
  { bacteria: "Cryptococcus neoformans", nombreNormalizado: "CryptococcusNeoformans", table: 6 },
  { bacteria: "Aspergillus fumigatus", nombreNormalizado: "AspergillusFumigatus", table: 6 },
];

async function populateBacteria() {
  for (const bacteria of list_of_bacterias) {
    try {
      // Create the object in the database.
      await prisma.bacteria.upsert({
        where: { bacteria: bacteria.bacteria },
        update: { nombreNormalizado: bacteria.nombreNormalizado },
        create: {
          bacteria: bacteria.bacteria,
          nombreNormalizado: bacteria.nombreNormalizado,
          table: bacteria.table,
        },
      });
    } catch (error) {
      console.error(
        `Error upserting 'Bacteria' with 'bacteria' ${bacteria.bacteria}:`,
        error
      );
    }
  }
  console.log("Database 'Bacteria' seeded successfully!");
}

async function runAllPopulations() {
  try {
    await populateBacteria();
    console.log("All tables seeded successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllPopulations();
