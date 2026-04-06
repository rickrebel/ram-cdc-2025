-- CreateTable
CREATE TABLE "Clinicos" (
    "id" TEXT NOT NULL,
    "location" TEXT,
    "curp" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "sexonacer" TEXT NOT NULL,
    "indigenous" BOOLEAN NOT NULL,
    "afrodescendant" BOOLEAN NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clinicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitation" (
    "id" TEXT NOT NULL,
    "curp" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clinicosId" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "talla" DOUBLE PRECISION NOT NULL,
    "existingConditions" TEXT[],
    "hospitalized" BOOLEAN NOT NULL,
    "takenMedication" BOOLEAN NOT NULL,
    "disability" BOOLEAN NOT NULL,
    "migrant" BOOLEAN NOT NULL,
    "countriesMigration" TEXT[],
    "alergies" TEXT[],
    "primaryConditions" TEXT[],
    "secondaryConditions" TEXT[],
    "evacuationCount" INTEGER NOT NULL DEFAULT 0,
    "vomitCount" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "diagnosis" TEXT,
    "notes" TEXT,

    CONSTRAINT "Visitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacto" (
    "id" TEXT NOT NULL,
    "clinicosId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "homeEmail" TEXT,
    "homeCel" TEXT,
    "homeDireccion" TEXT,
    "homeExtNum" TEXT,
    "homeIntNum" TEXT,
    "homeCity" TEXT,
    "homeState" TEXT,
    "homePostalCode" TEXT,
    "homeCountry" TEXT,
    "lugarOrigenEstado" TEXT,
    "lugarOrigenCiudad" TEXT,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otros" (
    "id" TEXT NOT NULL,
    "clinicosId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombreOtros" TEXT,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "estadoCivil" TEXT,
    "nivelEstudios" TEXT,

    CONSTRAINT "Otros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ocupacion" (
    "id" TEXT NOT NULL,
    "clinicosId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ocupacion" TEXT,
    "paisTrabajo" TEXT,
    "direccionTrabajo" TEXT,
    "ciudadTrabajo" TEXT,
    "estadoTrabajo" TEXT,

    CONSTRAINT "Ocupacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "cedulaProfesional" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "correoElectronico" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locations" TEXT[],

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bacteria" (
    "id" TEXT NOT NULL,
    "bacteria" TEXT NOT NULL,
    "table" INTEGER NOT NULL,

    CONSTRAINT "Bacteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resistance" (
    "id" TEXT NOT NULL,
    "resistanceMechanism" TEXT NOT NULL,

    CONSTRAINT "Resistance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gene" (
    "id" TEXT NOT NULL,
    "geneName" TEXT NOT NULL,

    CONSTRAINT "Gene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Antibiotic" (
    "id" TEXT NOT NULL,
    "antibioticName" TEXT NOT NULL,

    CONSTRAINT "Antibiotic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "clues" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "subtipo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntimicrobianoTabla3" (
    "id" TEXT NOT NULL,
    "antimicrobiano" TEXT NOT NULL,
    "Enterobacterales" JSONB NOT NULL,
    "SalmonellaShigella" JSONB NOT NULL,
    "PseudomonasAeruginosa" JSONB NOT NULL,
    "Acinetobacter" JSONB NOT NULL,
    "BurkholderiaCepacia" JSONB NOT NULL,
    "StenotrophomonasMaltophilia" JSONB NOT NULL,
    "OtrosNoEnterobacterales" JSONB NOT NULL,
    "HaemophilusInfluenzae" JSONB NOT NULL,
    "NeisseriaGonorrhoeae" JSONB NOT NULL,
    "NaisseriaMeningitidis" JSONB NOT NULL,
    "Staphylococcus" JSONB NOT NULL,
    "Enterococcus" JSONB NOT NULL,
    "StreptococcusPneumoniae" JSONB NOT NULL,
    "StreptococcusHemolitico" JSONB NOT NULL,
    "StreptococcusViridans" JSONB NOT NULL,

    CONSTRAINT "AntimicrobianoTabla3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntimicrobianoTabla4" (
    "id" TEXT NOT NULL,
    "antimicrobiano" TEXT NOT NULL,
    "Anaerobios" JSONB NOT NULL,
    "Nocardia" JSONB NOT NULL,
    "Abiotrophia" JSONB NOT NULL,
    "Aerococcus" JSONB NOT NULL,
    "Aeromonas" JSONB NOT NULL,
    "Bacillus" JSONB NOT NULL,
    "Campylobacter" JSONB NOT NULL,
    "Corynebacterium" JSONB NOT NULL,
    "Erysipelothrix" JSONB NOT NULL,
    "Gemella" JSONB NOT NULL,
    "Aggregatibacter" JSONB NOT NULL,
    "Vibrio" JSONB NOT NULL,
    "Lactobacillus" JSONB NOT NULL,
    "Lactococcus" JSONB NOT NULL,
    "Leuconostoc" JSONB NOT NULL,

    CONSTRAINT "AntimicrobianoTabla4_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntimicrobianoTabla5" (
    "id" TEXT NOT NULL,
    "antimicrobiano" TEXT NOT NULL,
    "Listeria" JSONB NOT NULL,
    "Micrococcus" JSONB NOT NULL,
    "Moraxella" JSONB NOT NULL,
    "Pasteurella" JSONB NOT NULL,
    "Pediococcus" JSONB NOT NULL,
    "Rothia" JSONB NOT NULL,
    "Helycobacter" JSONB NOT NULL,

    CONSTRAINT "AntimicrobianoTabla5_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntimicrobianoTabla6" (
    "id" TEXT NOT NULL,
    "antimicrobiano" TEXT NOT NULL,
    "CandidaAlbicans" JSONB NOT NULL,
    "CandidaGlabrata" JSONB NOT NULL,
    "CandidaGuilliermondii" JSONB NOT NULL,
    "CandidaKrusei" JSONB NOT NULL,
    "CandidaParapsilosis" JSONB NOT NULL,
    "CandidaTropicalis" JSONB NOT NULL,
    "CandidaAuris" JSONB NOT NULL,
    "CandidaDubliniensis" JSONB NOT NULL,
    "CandidaKefyr" JSONB NOT NULL,
    "CandidaLusitaniae" JSONB NOT NULL,
    "CandidaPeliculosa" JSONB NOT NULL,
    "CandidaDuobushaemulonii" JSONB NOT NULL,
    "CandidaHaemulonii" JSONB NOT NULL,
    "CandidaPararugosa" JSONB NOT NULL,
    "CandidaRugosa" JSONB NOT NULL,
    "CryptococcusGatti" JSONB NOT NULL,
    "CryptococcusDeuterogatti" JSONB NOT NULL,
    "CryptococcusNeoformans" JSONB NOT NULL,
    "AspergillusFumigatus" JSONB NOT NULL,

    CONSTRAINT "AntimicrobianoTabla6_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indreobj" (
    "id" TEXT NOT NULL,
    "bacteria" TEXT NOT NULL,
    "resistanceMechanism" TEXT[],
    "antibiotic" TEXT[],
    "gene" TEXT[],
    "geneVariant" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalClues" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "dynamicData" JSONB NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Indreobj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateGeoJson" (
    "id" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "geoJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StateGeoJson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinicos_curp_key" ON "Clinicos"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Contacto_clinicosId_key" ON "Contacto"("clinicosId");

-- CreateIndex
CREATE UNIQUE INDEX "Otros_clinicosId_key" ON "Otros"("clinicosId");

-- CreateIndex
CREATE UNIQUE INDEX "Ocupacion_clinicosId_key" ON "Ocupacion"("clinicosId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_cedulaProfesional_key" ON "Profile"("cedulaProfesional");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_correoElectronico_key" ON "Profile"("correoElectronico");

-- CreateIndex
CREATE UNIQUE INDEX "Bacteria_bacteria_key" ON "Bacteria"("bacteria");

-- CreateIndex
CREATE UNIQUE INDEX "Resistance_resistanceMechanism_key" ON "Resistance"("resistanceMechanism");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_geneName_key" ON "Gene"("geneName");

-- CreateIndex
CREATE UNIQUE INDEX "Antibiotic_antibioticName_key" ON "Antibiotic"("antibioticName");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_clues_key" ON "Hospital"("clues");

-- CreateIndex
CREATE UNIQUE INDEX "State_stateName_key" ON "State"("stateName");

-- CreateIndex
CREATE UNIQUE INDEX "AntimicrobianoTabla3_antimicrobiano_key" ON "AntimicrobianoTabla3"("antimicrobiano");

-- CreateIndex
CREATE UNIQUE INDEX "AntimicrobianoTabla4_antimicrobiano_key" ON "AntimicrobianoTabla4"("antimicrobiano");

-- CreateIndex
CREATE UNIQUE INDEX "AntimicrobianoTabla5_antimicrobiano_key" ON "AntimicrobianoTabla5"("antimicrobiano");

-- CreateIndex
CREATE UNIQUE INDEX "AntimicrobianoTabla6_antimicrobiano_key" ON "AntimicrobianoTabla6"("antimicrobiano");

-- CreateIndex
CREATE UNIQUE INDEX "StateGeoJson_stateName_key" ON "StateGeoJson"("stateName");

-- AddForeignKey
ALTER TABLE "Visitation" ADD CONSTRAINT "Visitation_clinicosId_fkey" FOREIGN KEY ("clinicosId") REFERENCES "Clinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacto" ADD CONSTRAINT "Contacto_clinicosId_fkey" FOREIGN KEY ("clinicosId") REFERENCES "Clinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otros" ADD CONSTRAINT "Otros_clinicosId_fkey" FOREIGN KEY ("clinicosId") REFERENCES "Clinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocupacion" ADD CONSTRAINT "Ocupacion_clinicosId_fkey" FOREIGN KEY ("clinicosId") REFERENCES "Clinicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
