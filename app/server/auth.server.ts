import pkg from "bcryptjs";
const { hash, compare } = pkg;
import { Prisma } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { prisma } from "~/server/database.server";
import { appPath } from "~/server/basepath.server";
import { Profile } from "@prisma/client";
import { stat } from "fs";

type SignupCredentials = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  license: string;
  institution: string;
  whichEstado: string;
  email: string;
  password: string;
};

type LoginCredentials = {
  whichEstado: string;
  email: string;
  password: string;
};

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("Se debe establecer la variable de entorno SESSION_SECRET.");
}

const BASE_PATH = process.env.BASE_PATH || "";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: BASE_PATH ? `/${BASE_PATH}` : "/",
  },
});

class HttpError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    // Call super(message) to call the constructor of the Error class.
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// Function 'createUserSession' is used below in 'signup()' and 'login()' to create a new session.
async function createUserSession(
  profileId: string,
  redirectPath: string
): Promise<Response> {
  const session = await sessionStorage.getSession();
  session.set("profileId", profileId);

  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function requireUserSession(request: Request): Promise<string> {
  const profileId: string | null = await getProfileFromSession(request);

  if (!profileId) {
    throw redirect(appPath("/auth?mode=login"));
  }

  return profileId;
}

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return redirect(appPath("/"), {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function getProfileFromSession(
  request: Request
): Promise<string | null> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const profileId: string = session.get("profileId");

  if (!profileId) {
    return null;
  }

  return profileId;
}

export async function getUserSession(request: Request) {
  requireUserSession(request);

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return session;
}

export async function setAndCommitSession(
  request: Request,
  key: string,
  value: string | number | object
): Promise<string> {
  const session = await getUserSession(request);

  if (!session) {
    throw new Error("No se pudo obtener la sesión.");
  }

  session.set(key, value);

  return await sessionStorage.commitSession(session);
}

async function findProfileByLicense(license: string): Promise<Profile | null> {
  return prisma.profile.findUnique({
    where: { cedulaProfesional: license },
  });
}

async function findProfileByEmail(email: string): Promise<Profile | null> {
  try {
    const profile = await prisma.profile.findFirst({
      where: { correoElectronico: email },
    });

    return profile;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "1008") {
        console.log(
          "PrismaClientKnownRequestError - code 1008: ",
          error.message
        );
      }
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      console.log("PrismaClientUnknownRequestError: ", error.message);
    } else {
      // Note: If Prisma cannot connect to the database (e.g., due to a connection issue or
      // misconfigured DATABASE_URL), it might not throw a traditional error.
      // Instead, the query remains pending until it times out, resulting in a silent timeout.
      // No exception is thrown until the database driver/network stack eventually gives
      // up (default timeout settings, often long).
      // So it's possible that the error is not an instance of 'Error' and thus this block
      // will not catch it (even with Prisma specific error types).
      console.log("'auth.server.ts/findProfileByEmail' error:", error);
    }
    throw error;
  }
}

export async function signup(credentials: SignupCredentials) {
  let existingProfile: Profile | null = null;
  const license = credentials.license;
  existingProfile = await findProfileByLicense(license);
  if (existingProfile) {
    const error = {
      license: "Ya existe una cuenta con la Cédula Profesional proporcionada.",
    };
    throw error;
  }

  // No profile with the provided license found, check if there is a profile with the provided email.
  const email = credentials.email;
  existingProfile = await findProfileByEmail(email);
  if (existingProfile) {
    const error = {
      email:
        "Ya existe una cuenta con la dirección de correo electrónico proporcionada.",
    };
    throw error;
  }

  // No profile with the provided license or email found, proceed with signup.
  const nombre = credentials.nombre;
  const apellidoPaterno = credentials.apellidoPaterno;
  const apellidoMaterno = credentials.apellidoMaterno
    ? credentials.apellidoMaterno
    : "";
  const institution = credentials.institution;
  const whichEstado = credentials.whichEstado;
  const password = credentials.password;

  const passwordHash = await hash(password, 12);

  // In Prisma, you can use the `$transaction` method to group multiple database operations into
  // a single transaction. This will mean that they either all succeed or all fail as a single
  // unit of work. If one operation in the transaction fails, the entire transaction is rolled back,
  // which ensures the consistency and integrity of your data. It also reduces round trips to the
  // database, which can improve performance.
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const newProfile = await prisma.profile.create({
        data: {
          nombre: nombre,
          apellidoPaterno: apellidoPaterno,
          apellidoMaterno: apellidoMaterno,
          cedulaProfesional: license,
          institution: institution,
          correoElectronico: email,
          password: passwordHash,
          locations: [whichEstado],
        },
      });

      return { newProfile };
    });
    return createUserSession(result.newProfile.id, appPath("/add/characteristics"));
  } catch {
    throw new HttpError("Error al registrarse.", 500);
  }
}

export async function login(credentials: LoginCredentials) {
  type ValidationErrors = {
    email?: string;
    password?: string;
  };

  const email = credentials.email;

  // Check if a profile with the provided email exists.
  let existingProfile: Profile | null = null;
  try {
    existingProfile = await findProfileByEmail(email);

    if (!existingProfile) {
      const error: ValidationErrors = {};
      error.email =
        "No se pudo iniciar sesión, verifique las credenciales proporcionadas.";
      throw error;
    }
  } catch (error) {
    throw error;
  }

  // Profile found, check the password.
  const passwordCorrect = await compare(
    credentials.password,
    existingProfile.password
  );
  if (!passwordCorrect) {
    const error: ValidationErrors = {};
    error.password =
      "No se pudo iniciar sesión, verifique las credenciales proporcionadas.";
    throw error;
  }

  // Profile found and password correct, proceed with login.
  const whichEstado = credentials.whichEstado;

  // In Prisma, you can use the `$transaction` method to group multiple database operations into
  // a single transaction. This will mean that they either all succeed or all fail as a single
  // unit of work. If one operation in the transaction fails, the entire transaction is rolled back,
  // which ensures the consistency and integrity of your data. It also reduces round trips to the
  // database, which can improve performance.
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: { locations: { push: whichEstado } },
      });
    });

    return createUserSession(existingProfile.id, appPath("/add/characteristics"));
  } catch {
    throw new HttpError("Error al iniciar sesión.", 500);
  }
}
