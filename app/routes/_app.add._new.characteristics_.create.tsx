// Clicking on the "Añadir Nuevo Registro" button in the navigation bar (remember it's specifically
// the `AppNavigation.tsx` file) will trigger the `handleStepChange("01")` function and the `flushState()` function.
// Meanwhile `_app.tsx` will pass down props to this file via the `useOutletContext()` hook.

import {
  useOutletContext,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import { ErrorBody } from "~/utilities/ErrorBody";
import CreatePatient from "~/components/patients/CreatePatient";
import { addVisitation } from "~/server/additions.server";
import {
  upsertClinicos,
  upsertContacto,
  upsertOcupacion,
  upsertOtros,
} from "~/server/upsert.server";
import { requireUserSession } from "~/server/auth.server";
import { validateDatosClinicos } from "~/server/validation.server";
import {
  getProfile,
  getPatientByCurp,
  getContactoByClinicos,
  getOtrosByClinicos,
  getOcupacionByClinicos,
} from "~/server/getters.server";
import {
  ClinicalDataType,
  AppProps,
  typeClinicosStringified,
  ContactoObjectStringify,
  OtrosObjectStringify,
  OcupacionObjectStringify,
} from "~/utilities/types";
import { enumAllergies, enumRiskFactors } from "~/algorithms/utilitiesTypes";
import {
  Clinicos,
  Visitation,
  Contacto,
  Otros,
  Ocupacion,
} from "@prisma/client";

interface ExistingData {
  createdClinicosObject?: Clinicos | null | { curp: string };
  createdContactoObject?: Contacto | null;
  createdOtrosObject?: Otros | null;
  createdOcupacionObject?: Ocupacion | null;
}
interface LoaderData {
  profileId: string;
  finalData: {
    createdClinicosObject?: typeClinicosStringified | null;
    createdContactoObject?: ContactoObjectStringify | null;
    createdOtrosObject?: OtrosObjectStringify | null;
    createdOcupacionObject?: OcupacionObjectStringify | null;
  } | null;
}
type OutletContext = [
  AppProps["flushState"],
  AppProps["flushed"],
  AppProps["setFlushed"],
  formRef: React.RefObject<HTMLFormElement | null>
];

const convertCheckboxValuesToArray = (
  clinicalData: Partial<ClinicalDataType>,
  which: string
): string[] => {
  const checkboxValues: string[] = [];

  // These items will either be the string "on" or they'll be undefined.
  if (which === "existingConditions") {
    // See div element with css id 'factoresDeRiesgo' in the 'NewClinicos.tsx' file.
    if (clinicalData.diabetes) {
      checkboxValues.push(enumRiskFactors.Diabetes);
    }
    if (clinicalData.inmunosupresion) {
      checkboxValues.push(enumRiskFactors.Inmunosupresion);
    }
    if (clinicalData.cardiovasculares) {
      checkboxValues.push(enumRiskFactors.Cardiovasculares);
    }
    if (clinicalData.hasRenalIssues) {
      checkboxValues.push(enumRiskFactors.HasRenalIssues);
    }
    if (clinicalData.hepaticos) {
      checkboxValues.push(enumRiskFactors.Hepaticos);
    }
    if (clinicalData.embarazo) {
      checkboxValues.push(enumRiskFactors.Embarazo);
    }
  } else if (which === "alergies") {
    // See div element with css id 'alergies' in the 'NewClinicos.tsx' file.
    if (clinicalData.penicilinas) {
      checkboxValues.push(enumAllergies.Penicilinas);
    }
    if (clinicalData.quinolonas) {
      checkboxValues.push(enumAllergies.Quinolonas);
    }
    if (clinicalData.macrolidos) {
      checkboxValues.push(enumAllergies.Macrolidos);
    }
    if (clinicalData.cefalosporinas) {
      checkboxValues.push(enumAllergies.Cefalosporinas);
    }
    if (clinicalData.tetraciclinas) {
      checkboxValues.push(enumAllergies.Tetraciclinas);
    }
    if (clinicalData.sulfonamidas) {
      checkboxValues.push(enumAllergies.Sulfonamidas);
    }
    if (clinicalData.aminoglucosidos) {
      checkboxValues.push(enumAllergies.Aminoglucosidos);
    }
  } else {
    throw new Error("Parámetro 'which' no válido.");
  }

  return checkboxValues;
};

export default function AddPatient() {
  const [flushState, flushed, setFlushed, formRef] =
    useOutletContext<OutletContext>();

  const { profileId, finalData } = useLoaderData<LoaderData>();

  return (
    <CreatePatient
      flushState={flushState}
      flushed={flushed}
      setFlushed={setFlushed}
      profileId={profileId}
      formRef={formRef}
      finalData={finalData}
    />
  );
}

// Runs on the server only.
// If a non-GET request is made to the route, this action function is called before
// any loader functions (if any).
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);
  // Everything will be stringified. See the type definition for ClinicalDataType.
  const clinicalData = Object.fromEntries(
    formData
  ) as unknown as ClinicalDataType;

  const profile = await getProfile(clinicalData.currentProfileId);
  if (!profile) {
    throw new Error("No profile found.");
  }

  // Get the last location entry from the 'locations' field string array of the
  // 'Profile' model (whose id is 'profileId') in the database.
  clinicalData.location = profile.locations[profile.locations.length - 1];

  // If no existing conditions were selected on the form then 'existingConditions' will
  // be an empty string array.
  const existingConditions: string[] = convertCheckboxValuesToArray(
    clinicalData,
    "existingConditions"
  );

  // If no alergies were selected on the form then 'alergies' will be an empty string array.
  const alergies: string[] = convertCheckboxValuesToArray(
    clinicalData,
    "alergies"
  );

  try {
    await validateDatosClinicos(clinicalData);
  } catch (error) {
    return Response.json({ error, validation_error: true });
  }

  // Add the new 'Clinicos' object to the database.
  // Note: although this will create a 'Clinicos' object id, it won't yet be able to store
  // any associated 'Contacto', 'Otros', or 'Ocupacion' objects (since they don't exist yet).
  // So just before returning from this 'POST' section you'll notice we update this 'Clinicos'
  // object with the ids of the 'Contacto', 'Otros', and 'Ocupacion' objects (if they get
  // created just below).
  let createdClinicosObject: Clinicos = await upsertClinicos(clinicalData);

  // Make the new 'Clinicos' object id available to the 'Contacto', 'Otros', and 'Ocupacion' objects.
  clinicalData.clinicosID = createdClinicosObject.id;

  let createdVisitationObject: Visitation = await addVisitation(
    clinicalData,
    existingConditions,
    alergies
  );

  // Bringing the id of the newly created 'Clinicos' object to the 'Contacto' object allows
  // you to connect the two objects together (from the point of view of the 'Contacto' object).
  const createdContactoObject: Contacto | null = await upsertContacto(
    clinicalData
  );
  const createdOtrosObject: Otros | null = await upsertOtros(clinicalData);
  const createdOcupacionObject: Ocupacion | null = await upsertOcupacion(
    clinicalData
  );

  // And so here, as mentioned just above, you're updating the 'Clinicos' object with links to
  // the ids of the 'Contacto', 'Otros', and 'Ocupacion' objects (if they got created just above).
  if (createdContactoObject) {
    clinicalData.contactoID = createdContactoObject.id;
  }
  if (createdOtrosObject) {
    clinicalData.otrosID = createdOtrosObject.id;
  }
  if (createdOcupacionObject) {
    clinicalData.ocupacionID = createdOcupacionObject.id;
  }
  if (createdVisitationObject) {
    clinicalData.latestVisitationID = createdVisitationObject.id;
  }

  // Update the 'Clinicos' object in the database with the ids of the 'Contacto', 'Otros',
  // and 'Ocupacion' objects (if they got created just above).
  if (
    createdVisitationObject ||
    createdContactoObject ||
    createdOtrosObject ||
    createdOcupacionObject
  ) {
    createdClinicosObject = await upsertClinicos(clinicalData);
  }

  return Response.json({
    createdClinicosObject,
    createdContactoObject,
    createdOtrosObject,
    createdOcupacionObject,
    createdVisitationObject,
  });
}

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export async function loader({
  request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderData>> {
  const profileId = await requireUserSession(request);
  const url = new URL(request.url);
  const curp = url.searchParams.get("curp");

  let clinicos: Clinicos | null = null;
  let contacto: Contacto | null = null;
  let otros: Otros | null = null;
  let ocupacion: Ocupacion | null = null;
  let finalData: ExistingData = {
    createdClinicosObject: clinicos,
    createdContactoObject: contacto,
    createdOtrosObject: otros,
    createdOcupacionObject: ocupacion,
  };

  if (curp) {
    clinicos = await getPatientByCurp(curp);
    if (clinicos) {
      [contacto, otros, ocupacion] = await Promise.all([
        getContactoByClinicos(clinicos.id),
        getOtrosByClinicos(clinicos.id),
        getOcupacionByClinicos(clinicos.id),
      ]);
    }

    if (clinicos) {
      finalData = {
        createdClinicosObject: clinicos,
        createdContactoObject: contacto,
        createdOtrosObject: otros,
        createdOcupacionObject: ocupacion,
      };
    } else {
      finalData.createdClinicosObject = { curp: curp };
    }

    return Response.json({ profileId, finalData });
  }

  // Return a minimal response if no curp was provided.
  // The expectation here is that the user has completed and submitted the form
  // and Remix's internal mechanics are triggering a route data revalidation. In that
  // condition no parameters will be passed, and so we end up here.
  // If however you wanted to entirely avoid this loader call, you could either explicitly
  // redirect the user to another route after form submission, or you could structure
  // the UI to rely solely on "useActionData" for udpdating the UI after form submission.
  return Response.json({ profileId: profileId, finalData: null });
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
      routetext="_app.add._new.characteristics.create.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
