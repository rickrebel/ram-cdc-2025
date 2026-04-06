// Some bacteria in the original listing ('ListOfBacterias.ts') have spaces in their names.
// This 'replacer' object is used to convert the bacteria names to some other naming convention
// (i.e. without spaces) to match the naming convention in the Prisma schemas.
// Keys will match with those bacteria names in 'ListOfBacterias.ts' (those with spaces in their names).
// Values will match with the naming convention in the Prisma schemas (those without spaces in their names).

// 15 keys for bacterias in Tabla3.json.
// 15 keys for bacterias in Tabla4.json.
// 7 keys for bacterias in Tabla5.json.
// 19 keys for bacterias in Tabla6.json.
const replacer = {
  "Abiotrophia spp y Granulicatella spp": "Abiotrophia", // Prisma schema: AntimicrobianoTabla4.
  "Acinetobacter spp": "Acinetobacter", // Prisma schema: AntimicrobianoTabla3.
  "Aerococcus spp": "Aerococcus", // Prisma schema: AntimicrobianoTabla4.
  "Aeromonas spp": "Aeromonas", // Prisma schema: AntimicrobianoTabla4.
  "Aggregatibacter spp, Cardiobacterium spp, Eikenella corrodens y Kingella spp":
    "Aggregatibacter", // Prisma schema: AntimicrobianoTabla4.
  "Aspergillus fumigatus": "AspergillusFumigatus", // Prisma schema: AntimicrobianoTabla6.
  "Bacillus spp y géneros relacionados (No incluye Bacillus anthracis)":
    "Bacillus", // Prisma schema: AntimicrobianoTabla4.
  "Burkholderia cepacia complex": "BurkholderiaCepacia", // Prisma schema: AntimicrobianoTabla3.
  "Campylobacter jejuni/coli": "Campylobacter", // Prisma schema: AntimicrobianoTabla4.
  "Candida albicans": "CandidaAlbicans", // Prisma schema: AntimicrobianoTabla6.
  "Candida auris": "CandidaAuris", // Prisma schema: AntimicrobianoTabla6.
  "Candida dubliniensis": "CandidaDubliniensis", // Prisma schema: AntimicrobianoTabla6.
  "Candida duobushaemulonii": "CandidaDuobushaemulonii", // Prisma schema: AntimicrobianoTabla6.
  "Candida glabrata": "CandidaGlabrata", // Prisma schema: AntimicrobianoTabla6.
  "Candida guilliermondii": "CandidaGuilliermondii", // Prisma schema: AntimicrobianoTabla6.
  "Candida haemulonii": "CandidaHaemulonii", // Prisma schema: AntimicrobianoTabla6.
  "Candida kefyr": "CandidaKefyr", // Prisma schema: AntimicrobianoTabla6.
  "Candida krusei": "CandidaKrusei", // Prisma schema: AntimicrobianoTabla6.
  "Candida lusitaniae": "CandidaLusitaniae", // Prisma schema: AntimicrobianoTabla6.
  "Candida parapsilosis complexo": "CandidaParapsilosis", // Prisma schema: AntimicrobianoTabla6.
  "Candida pararugosa": "CandidaPararugosa", // Prisma schema: AntimicrobianoTabla6.
  "Candida peliculosa": "CandidaPeliculosa", // Prisma schema: AntimicrobianoTabla6.
  "Candida rugosa": "CandidaRugosa", // Prisma schema: AntimicrobianoTabla6.
  "Candida tropicalis": "CandidaTropicalis", // Prisma schema: AntimicrobianoTabla6.
  "Corynebacterium spp y otros Géneros de Coryneformes relacionados":
    "Corynebacterium", // Prisma schema: AntimicrobianoTabla4.
  "Cryptococcus deuterogatti": "CryptococcusDeuterogatti",
  "Cryptococcus gatti": "CryptococcusGatti", // Prisma schema: AntimicrobianoTabla6.
  "Cryptococcus neoformans": "CryptococcusNeoformans", // Prisma schema: AntimicrobianoTabla6.
  // Quotes are optional for the key "Enterobacterales" because it doesn't have any special characters.
  Enterobacterales: "Enterobacterales", // Prisma schema: AntimicrobianoTabla3.
  "Enterococcus spp": "Enterococcus", // Prisma schema: AntimicrobianoTabla3.
  "Erysipelothrix rhusiopathiae": "Erysipelothrix", // Prisma schema: AntimicrobianoTabla4.
  "Gemella spp": "Gemella", // Prisma schema: AntimicrobianoTabla4.
  "Haemophilus influenzae y Haemophilus parainfluenzae":
    "HaemophilusInfluenzae", // Prisma schema: AntimicrobianoTabla3.
  "Helycobacter pylori": "Helycobacter", // Prisma schema: AntimicrobianoTabla5.
  "Lactobacillus spp": "Lactobacillus", // Prisma schema: AntimicrobianoTabla4.
  "Lactococcus spp": "Lactococcus", // Prisma schema: AntimicrobianoTabla4.
  "Leuconostoc spp": "Leuconostoc", // Prisma schema: AntimicrobianoTabla4.
  "Listeria monocytogenes": "Listeria", // Prisma schema: AntimicrobianoTabla5.
  "Micrococcus spp": "Micrococcus", // Prisma schema: AntimicrobianoTabla5.
  "Moraxella catarrhalis": "Moraxella", // Prisma schema: AntimicrobianoTabla5.
  "Naisseria meningitidis": "NaisseriaMeningitidis", // Prisma schema: AntimicrobianoTabla3.
  "Neisseria gonorrhoeae": "NeisseriaGonorrhoeae", // Prisma schema: AntimicrobianoTabla3.
  "Nocardia spp": "Nocardia", // Prisma schema: AntimicrobianoTabla4.
  "Otros no Enterobacterales": "OtrosNoEnterobacterales", // Prisma schema: AntimicrobianoTabla3.
  "Pasteurella spp": "Pasteurella", // Prisma schema: AntimicrobianoTabla5.
  "Pediococcus spp": "Pediococcus", // Prisma schema: AntimicrobianoTabla5.
  "Pseudomonas aeruginosa": "PseudomonasAeruginosa", // Prisma schema: AntimicrobianoTabla3.
  "Rothia mucilaginosa": "Rothia", // Prisma schema: AntimicrobianoTabla5.
  "Salmonella spp y Shigella spp": "SalmonellaShigella", // Prisma schema: AntimicrobianoTabla3.
  "Staphylococcus spp": "Staphylococcus", // Prisma schema: AntimicrobianoTabla3.
  "Stenotrophomonas maltophilia": "StenotrophomonasMaltophilia", // Prisma schema: AntimicrobianoTabla3.
  "Streptococcus pneumoniae": "StreptococcusPneumoniae", // Prisma schema: AntimicrobianoTabla3.
  "Streptococcus spp (Grupo Viridans)": "StreptococcusViridans", // Prisma schema: AntimicrobianoTabla3.
  "Streptococcus spp (Grupo Hemolitico)": "StreptococcusHemolitico", // Prisma schema: AntimicrobianoTabla3.
  "Vibrio spp": "Vibrio", // Prisma schema: AntimicrobianoTabla4.
};

function getReplacement(key) {
  return replacer[key] || null;
}

export { replacer, getReplacement };
