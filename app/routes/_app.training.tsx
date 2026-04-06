import { LoaderFunctionArgs } from "@remix-run/node";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import React from "react";

import XCircleIcon from "~/icons/xcircle_icon";

import { requireUserSession } from "~/server/auth.server";
import TrainingCard from "~/components/inputgroups/TrainingCard";

const VideoSection: React.FC<{ title: string }> = ({ title }) => (
  <div className="border border-secondary rounded-md shadow-lg my-8">
    <div className="flex items-center">
      <h3 className="text-base md:text-2xl font-bold tracking-tight
        text-primary">
        {title}
      </h3>
    </div>
    <div className="flex items-center justify-center pb-8
      text-gray-500 italic">
      El video estará disponible próximamente.
    </div>
  </div>
);

export default function Training() {
  return (
    <main>
      <div className="mx-auto max-w-9xl pt-10 pb-6 px-6 lg:px-8">
        <h1 className="mx-5 text-xl font-bold tracking-tight sm:text-4xl text-primary">
          Guía operativa para la vigilancia de Resistencia Antimicrobiana (RAM)
          en bacterias prioritarias por laboratorio
        </h1>

        <TrainingCard />

        <div className="py-4 px-4 sm:px-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1">
            <VideoSection
              title="Enfermedad Diarreica Aguda - Manejo de Muestras"
            />
            <VideoSection
              title="Infecciones de Transmisión Sexual - Manejo de Muestras"
            />
            <VideoSection
              title="Infecciones de Vías Urinarias - Manejo de Muestras"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return Response.json({
    headers: {
      "Permissions-Policy": "ch-ua-form-factor *",
    },
  });
}

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
      <>
        <div className="rounded-md bg-red-50 p-4 m-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-red-50 p-4 m-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Stack Trace</h3>
              <div className="mt-2 text-sm text-red-700">
                <pre>{error.stack}</pre>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
