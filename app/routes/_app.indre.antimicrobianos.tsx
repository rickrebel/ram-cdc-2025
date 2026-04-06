import {
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";

import { ErrorBody } from "~/utilities/ErrorBody";

import { requireUserSession } from "~/server/auth.server";
import {
  getBacteriaByName,
  getSusceptibilidadesByBacteria,
} from "~/server/getters.server";
import { Bacteria } from "@prisma/client";

// Runs on the server only.
// Called by the "useFetcher" hook in "AntiMicrobianoChooser.tsx".
// Errors are returned as JSON (not thrown) because useFetcher
// does not trigger the route's ErrorBoundary.
export const loader: LoaderFunction = async ({ request }) => {
  await requireUserSession(request);

  const url = new URL(request.url);
  const bacteriaName: string | null =
    url.searchParams.get("bacteria");

  if (!bacteriaName) {
    return Response.json(
      { error: "Falta el parámetro de bacterias en la URL." },
      { status: 400 }
    );
  }

  const bacteriaData: Bacteria | null =
    await getBacteriaByName(bacteriaName);

  if (!bacteriaData) {
    return Response.json(
      { error: "No se encontró ninguna bacteria coincidente." },
      { status: 400 }
    );
  }

  try {
    const results =
      await getSusceptibilidadesByBacteria(bacteriaData.id);

    // Formato esperado por AntiMicrobianoChooser.tsx:
    // array de strings "NombreAntimicrobiano_#color"
    const antimicrobianoNames = results.map(
      (r) =>
        `${r.antimicrobiano.nombre}_${r.susceptibilidad.color}`
    );

    return Response.json({ antimicrobianoNames });
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
};

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <ErrorBody
        error={error}
        routetext="_app.indre.antimicrobianos.tsx"
        className="col-start-1 col-span-12 my-3 pt-1 pb-2
          px-2 rounded-md text-xs sm:text-sm md:text-base
          lg:text-lg"
      />
    );
  }
  return null;
}
