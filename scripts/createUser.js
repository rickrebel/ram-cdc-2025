import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import pkg from "bcryptjs";
import { createInterface } from "readline";

const { hash } = pkg;

dotenv.config();
const prisma = new PrismaClient();

function ask(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    let password = "";

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onData = (char) => {
      // Enter
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
      // Ctrl+C
      } else if (char === "\u0003") {
        process.stdout.write("\n");
        process.exit(1);
      // Backspace
      } else if (char === "\u007F" || char === "\b") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        password += char;
        process.stdout.write("*");
      }
    };

    process.stdin.on("data", onData);
  });
}

async function main() {
  console.log("\n=== Crear usuario ===\n");

  const nombre = await ask("Nombre: ");
  const apellidoPaterno = await ask("Apellido paterno: ");
  const apellidoMaterno = await ask(
    "Apellido materno (Enter para omitir): "
  );
  const cedulaProfesional = await ask("Cédula profesional: ");
  const institution = await ask("Institución: ");
  const correoElectronico = await ask("Correo electrónico: ");
  const estado = await ask("Estado (ubicación): ");

  const password = await askPassword("Contraseña: ");
  const passwordConfirm = await askPassword("Confirmar contraseña: ");

  if (password !== passwordConfirm) {
    console.error("\nError: las contraseñas no coinciden.");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error(
      "\nError: la contraseña debe tener al menos 6 caracteres."
    );
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);

  try {
    const profile = await prisma.profile.create({
      data: {
        nombre,
        apellidoPaterno,
        apellidoMaterno: apellidoMaterno || "",
        cedulaProfesional,
        institution,
        correoElectronico,
        password: passwordHash,
        locations: [estado],
      },
    });

    console.log(`\nUsuario creado exitosamente (id: ${profile.id})`);
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.join(", ") || "desconocido";
      console.error(
        `\nError: ya existe un registro con ese valor ` +
        `en el campo: ${field}`
      );
    } else {
      console.error("\nError al crear usuario:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
