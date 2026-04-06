import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/node";

import { ErrorBody } from "~/utilities/ErrorBody";

import { requireUserSession } from "~/server/auth.server";
import {
  getAllAntimicrobianosT3,
  getAllAntimicrobianosT4,
  getAllAntimicrobianosT5,
  getAllAntimicrobianosT6,
  getBacteriaByName,
} from "~/server/getters.server";
import { getReplacement } from "~/utilities/bacteriaReplacer.js";
import {
  AntimicrobianoTabla3,
  AntimicrobianoTabla4,
  AntimicrobianoTabla5,
  AntimicrobianoTabla6,
  Bacteria,
} from "@prisma/client";

type antimicrobianoListT =
  | AntimicrobianoTabla3[]
  | AntimicrobianoTabla4[]
  | AntimicrobianoTabla5[]
  | AntimicrobianoTabla6[];

type antimicrobianoT =
  | AntimicrobianoTabla3
  | AntimicrobianoTabla4
  | AntimicrobianoTabla5
  | AntimicrobianoTabla6;

type genericAntiMicrobialObj = {
  present: boolean;
  colour: string;
};

const rearrangeAntimicrobials = (
  antimicrobianoArray: antimicrobianoListT,
  bacteriaShortName: string
): string[] => {
  if (!bacteriaShortName) {
    throw new Error("bacteriaShortName cannot be null or undefined");
  }

  // Loop over the combined array and find the first matching antimicrobiano.
  const foundAntimicrobianoObject: Record<string, string> = {};

  for (let i = 0; i < antimicrobianoArray.length; i++) {
    const antimicrobiano = antimicrobianoArray[i] as antimicrobianoT;

    const bacteriaData: string | genericAntiMicrobialObj =
      antimicrobiano[bacteriaShortName as keyof typeof antimicrobiano];

    // Type guard to check if 'bacteriaData' is of type 'BactColour'.
    if (
      bacteriaData &&
      typeof bacteriaData !== "string" &&
      "present" in bacteriaData
    ) {
      if (bacteriaData["present"]) {
        foundAntimicrobianoObject[antimicrobiano["antimicrobiano"]] =
          bacteriaData["colour"];
      }
    }
  }

  if (Object.keys(foundAntimicrobianoObject).length === 0) {
    // Return a JSON response with an error message.
    throw new Error(
      "rearrangeAntimicrobials(): No se encontró ningún antimicrobiano coincidente."
    );
  }

  // Create an array of strings that contains both the antimicrobiano names and the colours.
  const antimicrobianoNames = Object.keys(foundAntimicrobianoObject);
  const antimicrobianoColours = Object.values(foundAntimicrobianoObject);

  // Edit the 'antimicrobianoNames' array to include the colours (separated by an underscore).
  for (let i = 0; i < antimicrobianoNames.length; i++) {
    antimicrobianoNames[i] += `_${antimicrobianoColours[i]}`;
  }

  return antimicrobianoNames;
};

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export const loader: LoaderFunction = async ({ request }) => {
  // We arrive here from component "AntiMicrobianoChooser.tsx".
  // There, the "useFetcher" hook programmatically invokes this "loader" function.
  //
  // A note regarding throwing and catching errors from this route.
  // When the "useFetcher" hook is used to programmatically invoke a route (like this one),
  // any error thrown by the "loader" will not trigger the route's "ErrorBoundary".
  //
  // Instead, the error propagates to the parent route, or shows as an HTTP response
  // error, because the fetcher operates outside the context of a full route transition.
  //
  // Therefore you need to handle errors directly in the component where the "useFetcher"
  // was invoked ("AntiMicrobianoChooser.tsx" in this case). And since "fetcher.data" or
  // "fetcher.state" provides the response status and data, you can check for errors and
  // display an error message conditionally.
  //
  // And note, this also means that you should "return" errors, rather than "throw" them.
  // This way the error becomes part of the response that "fetcher.data" receives - and
  // is thus something you can check for in "AntiMicrobianoChooser.tsx".

  await requireUserSession(request);

  const url = new URL(request.url);
  const bacteria_temp: string | null = url.searchParams.get("bacteria");

  if (!bacteria_temp) {
    return Response.json(
      { error: "Falta el parámetro de bacterias en la URL." },
      { status: 400 }
    );
  }

  // Get the bacteria object ("id", "bacteria", "table") with this name from the table "Bacteria".
  const bacteriaData: Bacteria | null = await getBacteriaByName(bacteria_temp);

  if (!bacteriaData) {
    // Since this route is called by the "useFetcher" hook, we must return a JSON
    // response (with an error message) rather than throw an error.
    return Response.json(
      {
        error: "No se encontró ninguna bacteria coincidente.",
      },
      { status: 400 }
    );
  }

  const antimicroTable: Number = bacteriaData.table;

  // When you selected the bacteria (in "BacteriaChooser.tsx") you selected it from a
  // list where the bacteria names had spaces (for multi-word bacteria names).
  // So here, the "getReplacement" function converts bacteria names to their short name
  // equivalent, i.e. without spaces.
  const bacteriaShortName: string | null = getReplacement(bacteria_temp);

  if (!bacteriaShortName) {
    // Since this route is called by the "useFetcher" hook, we must return a JSON
    // response (with an error message) rather than throw an error.
    return Response.json(
      {
        error: `Bacteria "${bacteria_temp}" no tiene un nombre corto equivalente.`,
      },
      { status: 400 }
    );
  }

  let antimicrobianoNames: string[] = [];

  if (antimicroTable === 3) {
    const antimicrobianosT3: AntimicrobianoTabla3[] =
      await getAllAntimicrobianosT3();

    try {
      antimicrobianoNames = rearrangeAntimicrobials(
        antimicrobianosT3,
        bacteriaShortName
      );
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ antimicrobianoNames });
  } else if (antimicroTable === 4) {
    const antimicrobianosT4: AntimicrobianoTabla4[] =
      await getAllAntimicrobianosT4();

    try {
      antimicrobianoNames = rearrangeAntimicrobials(
        antimicrobianosT4,
        bacteriaShortName
      );
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ antimicrobianoNames });
  } else if (antimicroTable === 5) {
    const antimicrobianosT5: AntimicrobianoTabla5[] =
      await getAllAntimicrobianosT5();

    try {
      antimicrobianoNames = rearrangeAntimicrobials(
        antimicrobianosT5,
        bacteriaShortName
      );
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ antimicrobianoNames });
  } else if (antimicroTable === 6) {
    const antimicrobianosT6: AntimicrobianoTabla6[] =
      await getAllAntimicrobianosT6();

    try {
      antimicrobianoNames = rearrangeAntimicrobials(
        antimicrobianosT6,
        bacteriaShortName
      );
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ antimicrobianoNames });
  } else {
    // Since this route is called by the "useFetcher" hook, we must return a JSON
    // response (with an error message) rather than throw an error.
    return Response.json(
      {
        error: "No se encontró ninguna tabla de antimicrobianos coincidente.",
      },
      { status: 400 }
    );
  }
};

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  // To obtain the thrown object, we use the 'useRouteError' hook.
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
        className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
      />
    );
  }
  return null;
}
