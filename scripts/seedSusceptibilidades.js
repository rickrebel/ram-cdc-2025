import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const susceptibilidades = [
  { nombre: "PRESENTE", color: "#000000" },
  { nombre: "RESISTENTE", color: "#ff0000" },
  { nombre: "SENSIBLE", color: "#3cb371" },
  { nombre: "INTERMEDIO", color: "#ffa500" },
];

async function populateSusceptibilidades() {
  for (const s of susceptibilidades) {
    await prisma.susceptibilidad.upsert({
      where: { nombre: s.nombre },
      update: { color: s.color },
      create: s,
    });
  }
  console.log("Database 'Susceptibilidad' seeded successfully!");
}

async function main() {
  try {
    await populateSusceptibilidades();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
