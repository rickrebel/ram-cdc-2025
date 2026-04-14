import { Link, useRouteError } from "@remix-run/react";
import {
  redirect,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { ErrorBody } from "~/utilities/ErrorBody";
import PrimaryConditionState from "~/components/inputgroups/PrimaryConditionState";
import { requireUserSession } from "~/server/auth.server";
import { updatePrimaryCondition } from "~/server/updates.server";
import { getPrimaryCondition } from "~/server/getters.server";

type NewPrimaryCondition = {
  clinicosID: string;
  visitationID: string;
  detail: string;
};

export default function PrimaryCondition() {
  return (
    <main>
      <PrimaryConditionState />
      <div className="flex items-center justify-end gap-x-6 border-t border-accent px-4 py-4 sm:px-8 mt-12">
        <Link
          to="/add/characteristics/create"
          className="btn btn-secondary btn-sm"
        >
          Previo
        </Link>
      </div>
    </main>
  );
}

// Runs on the server only.
// If a non-GET request is made to the route, this action function is called before
// any loader functions (if any).
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);
  const newPrimaryCondition = Object.fromEntries(
    formData
  ) as unknown as NewPrimaryCondition;

  const visitationId: string = newPrimaryCondition.visitationID;

  // Get the existing primary conditions from within the most recent 'Visitation' object.
  // Since the first user form doesn't ask about primary conditions an empty array is
  // all that will be returned.
  const exisitingPrimaryCondition: string[] = await getPrimaryCondition(
    visitationId
  );

  // Always start with an empty array of primary conditions.
  let arrayPrimaryConditions: string[] = [];
  if (exisitingPrimaryCondition) {
    if (exisitingPrimaryCondition.length > 0) {
      arrayPrimaryConditions.push(
        ...exisitingPrimaryCondition.map((condition) => condition)
      );
    }
    arrayPrimaryConditions.push(newPrimaryCondition.detail);
  }

  // Remove any duplicates.
  arrayPrimaryConditions = [...new Set(arrayPrimaryConditions)];

  // Update the new primary condition string array in the 'Visitation' object.
  await updatePrimaryCondition(visitationId, arrayPrimaryConditions);

  const clinicosId: string = newPrimaryCondition.clinicosID;
  const detail: string = newPrimaryCondition.detail;
  if (detail === "Infecciones de transmisión sexual") {
    return redirect(`/add/define/its?vID=${visitationId}&cID=${clinicosId}`);
  } else if (detail === "Infecciones del aparato respiratorio superior") {
    return redirect(`/add/define/iras?vID=${visitationId}&cID=${clinicosId}`);
  } else {
    return redirect(`/add/define/alpha?vID=${visitationId}&cID=${clinicosId}`);
  }
}

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export async function loader({ request }: LoaderFunctionArgs): Promise<null> {
  await requireUserSession(request);
  return null;
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
      routetext="_app.add._new.primary.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
