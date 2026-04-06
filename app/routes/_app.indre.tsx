import { useRouteError, useLoaderData, Outlet } from "@remix-run/react";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import CreateInDRE from "~/components/inDRE/CreateInDRE";
import { ErrorBody } from "~/utilities/ErrorBody";
import { requireUserSession } from "~/server/auth.server";
import {
  getAllResistanceMechanisms,
  getAllGenes,
  getAllBacteria,
} from "~/server/getters.server";
import {
  validateInDREInput,
  validateInDREHospitalSelection,
} from "~/server/validation.server";
import {
  addInDRE,
  addResistanceMechanism,
  addAntibiotic,
  addGene,
  // addHospital, — comentada junto con la función; hospitales solo vía catálogo
} from "~/server/additions.server";
import {
  InDRELoader,
  InDRESelected,
  InDRECreated,
} from "~/utilities/InDRETypes";
import { Gene, Bacteria, Resistance } from "@prisma/client";

export default function AddInDRE() {
  const loaderData = useLoaderData<InDRELoader>();

  return (
    <>
      <CreateInDRE loaderData={loaderData} />
      <Outlet />
    </>
  );
}

// Runs on the server only.
// If a non-GET request is made to the route, this action function is called before
// any loader functions (if any).
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);

  // Everything will be stringified. See the type definition for InDRESelected.
  // The parsing is done in 'addInDRE' in the 'additions.server.ts' file.
  let indreData = Object.fromEntries(formData) as unknown as InDRESelected;

  // If this is a POST request then you're creating a new 'InDREObj' object in the database.
  if (request.method === "POST" && indreData.action === "addingindre") {
    try {
      indreData = await validateInDREHospitalSelection(indreData);
      validateInDREInput(indreData);
    } catch (error) {
      return Response.json({ error, validation_error: true });
    }

    let createdInDRE: InDRECreated;
    try {
      createdInDRE = await addInDRE(indreData);
    } catch (error) {
      return Response.json({ error, validation_error: true });
    }

    return Response.json(
      { createdInDRE },
      {
        headers: {
          "Cache-Control": "max-age=3",
          "Content-Type": "application/json",
        },
      }
    );
  } else if (
    request.method === "PATCH" &&
    indreData.action === "updatingindre"
  ) {
    // Split the 'newResistanceCreator' string at the semicolon character and create an array of objects.
    const newResistanceCreator = indreData.newResistanceCreator;
    const resistanceMechanismArray = newResistanceCreator.split(";");

    // Split the 'newAntibioticCreator' string at the semicolon character and create an array of objects.
    const newAntibioticCreator = indreData.newAntibioticCreator;
    const antibioticArray = newAntibioticCreator.split(";");

    // Split the 'newGeneCreator' string at the semicolon character and create an array of objects.
    const newGeneCreator = indreData.newAntibioticCreator;
    const geneArray = newGeneCreator.split(";");

    // Variables de hospital comentadas — addHospital deshabilitada.
    // const newHospitalCreator = indreData.newHospitalCreator;
    // const hospitalArray = newHospitalCreator.split(";");
    // const hospitalName: string[] = [];
    // const clues: string[] = [];
    // for (let i = 0; i < hospitalArray.length; i++) {
    //   const temp = hospitalArray[i].split(",");
    //   clues.push(temp[0]);
    //   hospitalName.push(temp[1]);
    // }

    // Make sure the 'resistanceMechanismArray' is not empty.
    if (
      !(
        resistanceMechanismArray.length === 0 ||
        (resistanceMechanismArray.length === 1 &&
          resistanceMechanismArray[0] === "")
      )
    ) {
      // Make sure the first letter of each entry in the 'resistanceMechanismArray' is capitalized.
      for (let i = 0; i < resistanceMechanismArray.length; i++) {
        resistanceMechanismArray[i] =
          resistanceMechanismArray[i].charAt(0).toUpperCase() +
          resistanceMechanismArray[i].slice(1);
      }
      // If the 'resistanceMechanismArray' is not empty, then create a new 'Resistance' object in the database.
      await addResistanceMechanism(resistanceMechanismArray);
    }

    // Make sure the 'antibioticArray' is not empty.
    if (
      !(
        antibioticArray.length === 0 ||
        (antibioticArray.length === 1 && antibioticArray[0] === "")
      )
    ) {
      // Make sure the first letter of each entry in the 'antibioticArray' is capitalized.
      for (let i = 0; i < antibioticArray.length; i++) {
        antibioticArray[i] =
          antibioticArray[i].charAt(0).toUpperCase() +
          antibioticArray[i].slice(1);
      }
      // If the 'antibioticArray' is not empty, then create a new 'Antibiotic' object in the database.
      await addAntibiotic(antibioticArray);
    }

    // Make sure the 'geneArray' is not empty.
    if (
      !(
        geneArray.length === 0 ||
        (geneArray.length === 1 && geneArray[0] === "")
      )
    ) {
      // If the 'geneArray' is not empty, then create a new 'Gene' object in the database.
      await addGene(geneArray);
    }

    // Bloque addHospital comentado — hospitales solo vía catálogo oficial.
    // if (
    //   !(
    //     hospitalArray.length === 0 ||
    //     (hospitalArray.length === 1 && hospitalArray[0] === "")
    //   )
    // ) {
    //   for (let i = 0; i < hospitalName.length; i++) {
    //     hospitalName[i] = hospitalName[i]
    //       .split(" ")
    //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //       .join(" ");
    //   }
    //   await addHospital(hospitalArray, hospitalName, clues);
    // }

    return null;
  }
}

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export async function loader({
  request,
}: LoaderFunctionArgs): Promise<Response> {
  const profileId: string = await requireUserSession(request);

  const resistanceListing: Resistance[] = await getAllResistanceMechanisms();
  const geneFamilyListing: Gene[] = await getAllGenes();
  const bacteriaListing: Bacteria[] = await getAllBacteria();

  return Response.json({
    profileId,
    bacteriaListing,
    resistanceListing,
    geneFamilyListing,
  });
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
      routetext="_app.indre.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
