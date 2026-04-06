// Pathless layout route
// DOMAIN/add

// The home page for any route named under the `_app`.
// You have access to the "Añadir Nuevo Registro" navigation item from the public navigation
// (`PublicNavigation.tsx` assuming you successfully logged in).
// Clicking on it will bring you under the control of this (`_app.tsx`) file.
// In turn that also puts the `AppNavigation.tsx` file in control of the navigation.

import { Outlet, useRouteError } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";

import { useState } from "react";
import { ErrorBody } from "~/utilities/ErrorBody";
import { getProfileFromSession } from "~/server/auth.server";

import AppHeader from "~/components/navigation/AppNavigation";

import {
  usePrimaryConditionStore,
  useClinicalIDStore,
  useContactoIDStore,
  useOtrosIDStore,
  useOcupacionIDStore,
  useVisitationIDStore,
} from "~/state/store";

import { AppProps } from "~/utilities/types";

export default function MainAppLayout() {
  const { primaryConditions, setPrimaryConditions } =
    usePrimaryConditionStore();

  const { setClinicalID } = useClinicalIDStore();
  const { setContactoID } = useContactoIDStore();
  const { setOtrosID } = useOtrosIDStore();
  const { setOcupacionID } = useOcupacionIDStore();
  const { setVisitationID } = useVisitationIDStore();
  // -----------------------------------------------------------------------------------------------

  // -----------------------------------------------------------------------------------------------
  // Flush the state of useState items for primaryConditions, secondarySymptoms, clinicosID, contactoID, otrosID, ocupacionID.
  const [flushed, setFlushed] = useState<boolean>(false);

  const flushState: AppProps["flushState"] = () => {
    const flushPrimary = primaryConditions.map((condition) => {
      return { ...condition, enabled: false };
    });
    setPrimaryConditions(flushPrimary);

    setClinicalID("");
    setContactoID("");
    setOtrosID("");
    setOcupacionID("");
    setVisitationID("");

    setFlushed(true);

    window.sessionStorage.setItem("dataForForm", "");
  };
  // -----------------------------------------------------------------------------------------------

  return (
    <main className="flex-auto w-screen bg-base-100">
      <AppHeader flushState={flushState} />
      <Outlet context={[flushState, flushed, setFlushed]} />
    </main>
  );
}

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export async function loader({ request }: LoaderFunctionArgs) {
  const profileId: string | null = await getProfileFromSession(request);
  return profileId;
}

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  // To obtain the thrown object, we use the 'useRouteError' hook.
  const error = useRouteError();

  return (
    <ErrorBody
      error={error}
      routetext="_app.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
