import { useRouteError } from "@remix-run/react";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { isUniqueCURP, isValidCURP } from "~/server/validation.server";
import { appPath } from "~/server/basepath.server";
import {
  getPatientByCurp,
  getPatientsByCurp,
  getCurrentVisitationIdForClinicos,
  getContactoByClinicos,
  getOtrosByClinicos,
  getOcupacionByClinicos,
} from "~/server/getters.server";
import { requireUserSession } from "~/server/auth.server";
import { ErrorBody } from "~/utilities/ErrorBody";
import { Clinicos } from "@prisma/client";
import CurpSearch from "~/components/inputgroups/CURP";

export default function Characteristics() {
  return (
    <main className="mt-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-base-100">
      <CurpSearch />
    </main>
  );
}

// Runs on the server only.
// If a non-GET request is made to the route, this action function is called before
// any loader functions (if any).
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);
  const curp = formData.get("/add/characteristics?curp") || "";

  const clinicos: Clinicos | null = await getPatientByCurp(curp);

  if (clinicos) {
    // TODO: Revisar si hacer tantos promises vale la pena, parece 
    // poco eficiente o poco práctico. No es mejor traer all desde el principio?
    // Revisar porque hay otros lugares donde también se usan.
    const [visitationId, contacto, otros, ocupacion] = await Promise.all([
      getCurrentVisitationIdForClinicos(clinicos.id).catch(() => null),
      getContactoByClinicos(clinicos.id),
      getOtrosByClinicos(clinicos.id),
      getOcupacionByClinicos(clinicos.id),
    ]);

    const toReturn = {
      curp: clinicos.curp,
      dob: clinicos.dob,
      sexonacer: clinicos.sexonacer,
      dateAdded: clinicos.dateAdded,
      contactoId: contacto?.id ?? null,
      otrosId: otros?.id ?? null,
      ocupacionId: ocupacion?.id ?? null,
      visitationId: visitationId ?? null,
      id: clinicos.id,
    };

    return Response.json({ selected: toReturn });
  } else {
    throw new Error(
      "CHARACTERISTICS: No se encontró ningún paciente con esa CURP."
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);

  const url = new URL(request.url);
  const query = url.searchParams.get("curp") || "";
  const secondParam = url.searchParams.get("fCh") === "true";

  if (query.length < 3) {
    return null;
  }

  if (secondParam) {
    const isUnique: boolean = await isUniqueCURP(query);
    if (isUnique) {
      const isValid: boolean | string = isValidCURP(query);
      if (typeof isValid === "boolean") {
        if (isValid) {
          return redirect(
            appPath(`/add/characteristics/create?curp=${encodeURIComponent(query)}`)
          );
        }
      }
    }

    return Response.json({
      error:
        "La estructura de una CURP es de 4 letras, seguidas de 6 dígitos, seguidas de 6 letras, seguidas de 2 dígitos.",
    });
  }

  const clinicos: Clinicos[] = await getPatientsByCurp(query);

  // If "clinicos" records are returned, extract just the "curp" field from each record.
  // This is to populate the datalist in the client-side - but more importantly, to filter
  // out sensitive patient information from the client-side.
  const curpList: string[] = clinicos.map((cco) => cco.curp);

  return Response.json({ curpList });
}

export function headers() {
  return {
    "Cache-Control": "max-age=3",
  };
}

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  // To obtain the thrown object, we use the 'useRouteError' hook.
  const error = useRouteError();

  return (
    <ErrorBody
      error={error}
      routetext="_app.add._new.characteristics.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
