/*
  Warnings:

  - You are about to drop the `AntimicrobianoTabla3` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AntimicrobianoTabla4` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AntimicrobianoTabla5` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AntimicrobianoTabla6` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombreNormalizado]` on the table `Bacteria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombreNormalizado` to the `Bacteria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bacteria" ADD COLUMN     "descripcion" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nombreNormalizado" TEXT NOT NULL;

-- DropTable
DROP TABLE "AntimicrobianoTabla3";

-- DropTable
DROP TABLE "AntimicrobianoTabla4";

-- DropTable
DROP TABLE "AntimicrobianoTabla5";

-- DropTable
DROP TABLE "AntimicrobianoTabla6";

-- CreateTable
CREATE TABLE "Susceptibilidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Susceptibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Antimicrobiano" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tables" INTEGER[],
    "descripcion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Antimicrobiano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntimicrobianoSusceptibilidad" (
    "id" TEXT NOT NULL,
    "bacteriaId" TEXT NOT NULL,
    "antimicrobianoId" TEXT NOT NULL,
    "susceptibilidadId" TEXT NOT NULL,

    CONSTRAINT "AntimicrobianoSusceptibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Susceptibilidad_nombre_key" ON "Susceptibilidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Antimicrobiano_nombre_key" ON "Antimicrobiano"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "AntimicrobianoSusceptibilidad_antimicrobianoId_bacteriaId_key" ON "AntimicrobianoSusceptibilidad"("antimicrobianoId", "bacteriaId");

-- CreateIndex
CREATE UNIQUE INDEX "Bacteria_nombreNormalizado_key" ON "Bacteria"("nombreNormalizado");

-- AddForeignKey
ALTER TABLE "AntimicrobianoSusceptibilidad" ADD CONSTRAINT "AntimicrobianoSusceptibilidad_bacteriaId_fkey" FOREIGN KEY ("bacteriaId") REFERENCES "Bacteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntimicrobianoSusceptibilidad" ADD CONSTRAINT "AntimicrobianoSusceptibilidad_antimicrobianoId_fkey" FOREIGN KEY ("antimicrobianoId") REFERENCES "Antimicrobiano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntimicrobianoSusceptibilidad" ADD CONSTRAINT "AntimicrobianoSusceptibilidad_susceptibilidadId_fkey" FOREIGN KEY ("susceptibilidadId") REFERENCES "Susceptibilidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
