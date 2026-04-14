import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import pkg from "bcryptjs";

const { hash } = pkg;

dotenv.config();
const prisma = new PrismaClient();

// Datos alineados con e2e/loginAndSignup.test.ts.
const TEST_USER = {
  nombre: "Test",
  apellidoPaterno: "User",
  apellidoMaterno: "",
  cedulaProfesional: "999999",
  institution: "Hospital de Pruebas",
  correoElectronico: "test@gmail.com",
  password: "Password$123",
  locations: ["Ciudad de México"],
};

// Paciente usado en el bloque "Finding CURPs".
const TEST_PATIENT = {
  curp: "AAAA000000AAAAAA00",
  dob: new Date("1990-03-01T12:00:00Z"),
  sexonacer: "Mujer",
  indigenous: false,
  afrodescendant: false,
  dateAdded: new Date("2025-02-13T12:00:00Z"),
};

// Primera visita del paciente de prueba.
const TEST_VISITATION = {
  curp: TEST_PATIENT.curp,
  date: new Date("2025-02-13T12:00:00Z"),
  genero: "Mujer cisgénero",
  peso: 60.0,
  talla: 165.0,
  existingConditions: [],
  hospitalized: false,
  takenMedication: false,
  disability: false,
  migrant: false,
  countriesMigration: [],
  alergies: [],
  primaryConditions: [],
  secondaryConditions: [],
  evacuationCount: 0,
  vomitCount: 0,
  location: "Ciudad de México",
};

async function main() {
  const passwordHash = await hash(TEST_USER.password, 12);

  const profile = await prisma.profile.upsert({
    where: { correoElectronico: TEST_USER.correoElectronico },
    update: {},
    create: {
      nombre: TEST_USER.nombre,
      apellidoPaterno: TEST_USER.apellidoPaterno,
      apellidoMaterno: TEST_USER.apellidoMaterno,
      cedulaProfesional: TEST_USER.cedulaProfesional,
      institution: TEST_USER.institution,
      correoElectronico: TEST_USER.correoElectronico,
      password: passwordHash,
      locations: TEST_USER.locations,
    },
  });

  console.log(
    `Usuario de prueba listo (id: ${profile.id}, ` +
    `email: ${profile.correoElectronico})`
  );

  // Upsert del paciente de prueba con su primera visita.
  // Borrar visitas previas del paciente de prueba antes de
  // recrearlo, para que la fecha de dob y visita sea correcta.
  await prisma.visitation.deleteMany({
    where: { curp: TEST_PATIENT.curp },
  });
  await prisma.clinicos.deleteMany({
    where: { curp: TEST_PATIENT.curp },
  });

  const clinico = await prisma.clinicos.create({
    data: {
      ...TEST_PATIENT,
      visitations: { create: TEST_VISITATION },
    },
  });

  console.log(
    `Paciente de prueba listo (id: ${clinico.id}, ` +
    `curp: ${clinico.curp})`
  );
}

main()
  .catch((e) => {
    console.error("Error al crear usuario de prueba:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());