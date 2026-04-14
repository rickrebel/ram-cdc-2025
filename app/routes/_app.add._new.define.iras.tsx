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
import { updateSecondaryCondition } from "~/server/updates.server";
import PrevioSiguiente from "~/components/inputgroups/PrevioSiguiente";
import convertCheckboxValuesToArray from "~/utilities/ConvertCheckBoxToArray";
import SelectSecondaries from "~/utilities/SelectSecondaries";
import {
  buildSymptomCatalog,
  type SecondarySymptom,
} from "~/utilities/buildSymptomCatalog";
import {
  ALL_IRAS_SYMPTOMS,
  ALL_IRAS_LABELS,
} from "~/algorithms/IRAS/utilitiesSymptoms";
import { getSymptomsDropdowns } from "~/algorithms/IRAS/utilitiesForDiagnosis";

type NewSecondaryCondition = {
  clinicosId: string;
  visitationId: string;
  [key: string]: string;
};

interface LoadData {
  clinicosId: string;
  visitationId: string;
}

export default function DefineRecord() {
  const loaderData = useLoaderData<LoadData>();

  // Catálogo de síntomas secundarios para IRAS, construido localmente
  const [symptomData, setSymptomData] = useState<SecondarySymptom[]>(
    () => [buildSymptomCatalog(
      "03", "IRAS", ALL_IRAS_SYMPTOMS, ALL_IRAS_LABELS
    )]
  );

  const selectedSymptoms = symptomData[0];
  const checkedSecondarySymptoms: SecondarySymptom["checked"] =
    selectedSymptoms.checked;

  const submit = useSubmit();
  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const serializedData = new FormData();
    const secondaryConditions: { [key: string]: string } = {};

    checkedSecondarySymptoms.forEach(function (checked: boolean, idx: number) {
      if (checked) {
        secondaryConditions[idx.toString()] = selectedSymptoms.additional[idx];
      }
    });

    Object.keys(secondaryConditions).forEach((key) => {
      serializedData.append(key, secondaryConditions[key]);
    });

    serializedData.append("clinicosId", loaderData.clinicosId);
    serializedData.append("visitationId", loaderData.visitationId);

    submit(serializedData, {
      method: "POST",
      action: `/add/define/iras`,
    });
  }

  const {
    baja_bronquitis,
    baja_ante_epoc,
    baja_exac_epoc,
    baja_enviar_sec_nivel,
    baja_neumonia,
    alta_oma,
    alta_faringitis,
    alta_sinusitis_sintomatic,
    alta_sinusitis_antibiotic,
    alta_sinusitis_hospital,
  } = getSymptomsDropdowns(selectedSymptoms, checkedSecondarySymptoms);

  return (
    <main className="max-w-7xl mx-auto mt-10 px-4 pb-4">
      <Form onSubmit={submitForm}>
        <div className="grid grid-cols-1 gap-y-4 items-center mx-auto md:max-w-3xl md:gap-x-3 md:gap-y-6 md:grid-cols-6 lg:gap-x-10 lg:max-w-5xl xl:max-w-7xl text-sm sm:text-base font-medium">
          {SelectSecondaries(
            null,
            "baja_bronquitis",
            "El paciente presenta tos de inicio agudo, más uno de los siguiente symptomas:",
            baja_bronquitis,
            0,
            "lg:col-start-1",
            "lg:col-start-1",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "baja_ante_epoc",
            "El paciente tiene antecedente de EPOC o enfermedad pulmonar crónica:",
            baja_ante_epoc,
            0,
            "lg:col-start-4",
            "lg:col-start-4",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "baja_exac_epoc",
            "El paciente presenta exacerbación de EPOC:",
            baja_exac_epoc,
            0,
            "lg:col-start-1",
            "lg:col-start-1",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "baja_enviar_sec_nivel",
            "El paciente tiene exacerbación adicional de EPOC:",
            baja_enviar_sec_nivel,
            0,
            "lg:col-start-4",
            "lg:col-start-4",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "baja_neumonia",
            "El paciente presenta tos de inicio agudo más uno de los siguientes:",
            baja_neumonia,
            0,
            "lg:col-start-1",
            "lg:col-start-1",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "alta_oma",
            "El paciente presenta tos de inicio agudo más uno de los siguientes:",
            alta_oma,
            0,
            "lg:col-start-4",
            "lg:col-start-4",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "alta_faringitis",
            "El paciente presenta tos de inicio agudo más uno de los siguientes:",
            alta_faringitis,
            0,
            "lg:col-start-1",
            "lg:col-start-1",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "alta_sinusitis_sintomatic",
            "El paciente presenta Sinusitis sintomático:",
            alta_sinusitis_sintomatic,
            0,
            "lg:col-start-4",
            "lg:col-start-4",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "alta_sinusitis_hospital",
            "Para la Sinusitis sintomático, ¿alguno de los siguientes síntomas está presente?",
            alta_sinusitis_hospital,
            0,
            "lg:col-start-1",
            "lg:col-start-1",
            symptomData,
            setSymptomData
          )}

          {SelectSecondaries(
            null,
            "alta_sinusitis_antibiotic",
            "El paciente presenta los siguientes síntomas adicionales de Sinusitis:",
            alta_sinusitis_antibiotic,
            0,
            "lg:col-start-4",
            "lg:col-start-4",
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

  return redirect(`/add/revise?vID=${visitationId}&cID=${clinicosId}`);
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

  return Response.json({ clinicosId, visitationId });
}

// All errors for this route will be caught by this ErrorBoundary.
export function ErrorBoundary() {
  // To obtain the thrown object, we use the 'useRouteError' hook.
  const error = useRouteError();

  return (
    <ErrorBody
      error={error}
      routetext="_app.add._new.define.iras.tsx"
      className="col-start-1 col-span-12 my-3 pt-1 pb-2 px-2 rounded-md text-xs sm:text-sm md:text-base lg:text-lg"
    />
  );
}
