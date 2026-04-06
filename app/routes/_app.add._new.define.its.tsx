import { useState } from "react";
import {
  useLoaderData,
  Form,
  useSubmit,
  useRouteError,
} from "@remix-run/react";
import {
  redirect,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { ErrorBody } from "~/utilities/ErrorBody";
import { requireUserSession } from "~/server/auth.server";
import { appPath } from "~/server/basepath.server";
import secondarySymptomsDropdown from "~/components/inputgroups/SecondarySymptomsDropdown";
import { updateSecondaryCondition } from "~/server/updates.server";
import { getClinicos, getVisitation } from "~/server/getters.server";
import PrevioSiguiente from "~/components/inputgroups/PrevioSiguiente";
import convertCheckboxValuesToArray from "~/utilities/ConvertCheckBoxToArray";
import SelectSecondaries from "~/utilities/SelectSecondaries";
import {
  buildSymptomCatalog,
  type SecondarySymptom,
} from "~/utilities/buildSymptomCatalog";
import {
  ALL_ITS_SYMPTOMS,
  ALL_ITS_LABELS,
} from "~/algorithms/ITS/utilitiesSymptoms";
import {
  typeVisitationStringified,
  SSDropDown,
  typeClinicosStringified,
} from "~/utilities/types";
import { Clinicos, Visitation } from "@prisma/client";

type NewSecondaryCondition = {
  clinicosId: string;
  visitationId: string;
  [key: string]: string;
};
interface LoadData {
  visitation: typeVisitationStringified;
  clinicos: typeClinicosStringified;
}

const idx_uleceras_genitales = [0, 1, 2, 3, 4];
const idx_secrecion_uretral = [5, 6];
const idx_flujo_vaginal = [7, 8, 9, 10, 11, 12, 13];
const idx_inflamacion_escrotal = [14, 15, 16, 17, 18, 19];
const idx_dolor_abdominal_bajo = [20, 21, 22, 23, 24, 25, 26, 27];
const idx_ano_rectal = [28, 29, 30, 31, 32, 33, 34];

export default function DefineRecord() {
  const loaderData = useLoaderData<LoadData>();
  const sexo_al_nacer: string = loaderData.clinicos.sexonacer;

  // Catálogo de síntomas secundarios para ITS, construido localmente
  // en vez de leer del store de Zustand. useState solo usa el valor
  // inicial en el primer render.
  const [symptomData, setSymptomData] = useState<SecondarySymptom[]>(
    () => [buildSymptomCatalog(
      "02", "ITS", ALL_ITS_SYMPTOMS, ALL_ITS_LABELS
    )]
  );

  // Único elemento del array — los síntomas de ITS
  const selectedSymptoms = symptomData[0];
  const checkedSecondarySymptoms: boolean[] = selectedSymptoms.checked;

  // At the bottom of the form the 'Siguente' button has the type 'submit'. On clicking it the form
  // is submitted and the following 'submitForm' function is called.
  const submit = useSubmit();
  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Get all inputs by name.
    const serializedData = new FormData();
    const secondaryConditions: { [key: string]: string } = {};

    checkedSecondarySymptoms.forEach(function (checked: boolean, idx: number) {
      if (checked) {
        secondaryConditions[idx.toString()] =
          selectedSymptoms.additional[idx] +
          " - " +
          selectedSymptoms.additional_details[idx];
      }
    });

    Object.keys(secondaryConditions).forEach((key) => {
      serializedData.append(key, secondaryConditions[key]);
    });

    serializedData.append(
      "clinicosId",
      loaderData.clinicos.id
    );
    serializedData.append(
      "visitationId",
      loaderData.visitation.id
    );

    submit(serializedData, {
      method: "POST",
      action: `/add/define/its`,
    });
  }

  // The id arrays passed in here correspond to secondary symptoms of Ulceras Genitales.
  // 'ulcerasGenitales.availableSecondarySymptoms' - isolates just the secondary symptoms that are
  //                                                 relevant to Ulceras Genitales (as an object
  //                                                 with the id, value, and label), regardless of
  //                                                 whether they have been selected or not.
  // 'ulcerasGenitales.initialOptions' - isolates which of these same secondary symptoms have already
  //                                     been selected (as an object with the id, value, and label).
  //                                     It therefore dynamically updates as secondary symptoms are
  //                                     selected or deselected.
  //
  // Thus 'ulcerasGenitales.initialOptions' keeps a dynamically updating list of the secondary
  // symptoms that have been selected (out of the subset for Ulceras Genitales).
  //
  // In the 'Form' below, everytime you select or deselect a secondary symptom, an 'onChange' event
  // is triggered. This event calls the 'handleITSClick' function, which updates the 'checked' array
  // of the selected secondary symptoms. Since this 'checked' array exists in the function '_app.tsx'
  // and is passed in above as state, it therefore triggers a re-render of this component. Thus the
  // updated 'checked' array is used to update the 'ulcerasGenitales.initialOptions' object.
  const ulcerasGenitales = secondarySymptomsDropdown(
    idx_uleceras_genitales,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of secrecion uretral.
  const secrecionUretral = secondarySymptomsDropdown(
    idx_secrecion_uretral,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  // The id arrays passed in here correspond to secondary symptoms of flujo vaginal.
  let flujoVaginal: SSDropDown = null;
  if (sexo_al_nacer === "Mujer") {
    flujoVaginal = secondarySymptomsDropdown(
      idx_flujo_vaginal,
      selectedSymptoms,
      checkedSecondarySymptoms
    );
  }

  // The id arrays passed in here correspond to secondary symptoms of inflamacion escrotal.
  let inflamacionEscrotal: SSDropDown = null;
  if (sexo_al_nacer === "Hombre") {
    inflamacionEscrotal = secondarySymptomsDropdown(
      idx_inflamacion_escrotal,
      selectedSymptoms,
      checkedSecondarySymptoms
    );
  }

  // The id arrays passed in here correspond to secondary symptoms of dolor abdominal bajo.
  let dolorAbdominalBajo: SSDropDown = null;
  if (sexo_al_nacer === "Mujer") {
    dolorAbdominalBajo = secondarySymptomsDropdown(
      idx_dolor_abdominal_bajo,
      selectedSymptoms,
      checkedSecondarySymptoms
    );
  }

  // The id arrays passed in here correspond to secondary symptoms of ano rectal.
  const anoRectal = secondarySymptomsDropdown(
    idx_ano_rectal,
    selectedSymptoms,
    checkedSecondarySymptoms
  );

  return (
    <main className="max-w-7xl mx-auto mt-12 p-4">
      <Form onSubmit={submitForm}>
        <div className="grid grid-cols-1 gap-y-4 items-center mx-auto md:max-w-3xl md:gap-x-3 md:gap-y-6 md:grid-cols-6 lg:gap-x-10 lg:max-w-5xl xl:max-w-7xl text-sm sm:text-base font-medium">
          {inflamacionEscrotal &&
            SelectSecondaries(
              sexo_al_nacer,
              "inflamacionEscrotal",
              "El paciente (hombre) presenta signos o síntomas de dolor e inflamación escrotal",
              inflamacionEscrotal,
              0,
              "lg:col-start-1",
              "lg:col-start-4",
              symptomData,
              setSymptomData
            )}

          {SelectSecondaries(
            sexo_al_nacer,
            "secrecionUretral",
            "El paciente presenta signos o síntomas de secreción uretral",
            secrecionUretral,
            0,
            "lg:col-start-4",
            "lg:col-start-1",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            sexo_al_nacer,
            "anoRectal",
            "El paciente presenta signos o síntomas de secreción ano-rectal",
            anoRectal,
            0,
            "lg:col-start-1",
            "lg:col-start-4",
            symptomData,
            setSymptomData
          )}

          {flujoVaginal &&
            SelectSecondaries(
              sexo_al_nacer,
              "flujoVaginal",
              "La paciente (mujer) presenta signos o síntomas de flujo vaginal",
              flujoVaginal,
              0,
              "lg:col-start-1",
              "lg:col-start-1",
              symptomData,
              setSymptomData
            )}

          {SelectSecondaries(
            sexo_al_nacer,
            "ulcerasGenitales",
            "El paciente presenta signos o síntomas de úlceras genitales",
            ulcerasGenitales,
            0,
            "lg:col-start-4",
            "lg:col-start-4",
            symptomData,
            setSymptomData
          )}

          {dolorAbdominalBajo &&
            SelectSecondaries(
              sexo_al_nacer,
              "dolorAbdominalBajo",
              "La paciente (mujer) presenta signos o síntomas de dolor abdominal bajo",
              dolorAbdominalBajo,
              0,
              "lg:col-start-1",
              "lg:col-start-1",
              symptomData,
              setSymptomData
            )}
        </div>

        <PrevioSiguiente />
      </Form>
    </main>
  );
}

// Runs on the server only.
// If a non-GET request is made to the route, this action function is called before
// any loader functions (if any).
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const formData = new URLSearchParams(body);
  const newSecondaryConditions = Object.fromEntries(
    formData
  ) as unknown as NewSecondaryCondition;

  const { clinicosId, visitationId, ...secondaryConditions } =
    newSecondaryConditions;

  // Create an array of the secondary conditions - with duplicates removed.
  const arraySecondaryConditions: string[] =
    convertCheckboxValuesToArray(secondaryConditions);

  // Add the new secondary conditions to the database.
  await updateSecondaryCondition(visitationId, arraySecondaryConditions);

  return redirect(appPath(`/add/revise?vID=${visitationId}&cID=${clinicosId}`));
}

// Runs on the server only.
// Runs for GET requests made to the route. But runs after any action functions (if any).
// On the initial server render, it will provide data to the HTML document.
// On navigations in the browser, Remix will call the function via fetch from the browser.
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);

  const url = new URL(request.url);
  const clinicosId: string | null = url.searchParams.get("cID");
  const visitationId: string | null = url.searchParams.get("vID");

  if (!clinicosId) {
    throw new Error(
      "No se proporcionó identificación del paciente (clinicosId)."
    );
  }
  if (!visitationId) {
    throw new Error(
      "No se proporcionó identificación del paciente (visitationId)."
    );
  }

  const clinicos: Clinicos | null = await getClinicos(clinicosId);
  const visitation: Visitation | null = await getVisitation(visitationId);

  if (!clinicos) {
    throw new Error("Ningún paciente encontrado (clinicos).");
  }
  if (!visitation) {
    throw new Error("Ningún paciente encontrado (visitation).");
  }

  return Response.json({ visitation, clinicos });
}

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  // To obtain the thrown object, we use the 'useRouteError' hook.
  const error = useRouteError();

  return (
    <ErrorBody
      error={error}
      routetext="_app.add._new.define.its.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
