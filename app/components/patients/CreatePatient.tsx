import {
  Form,
  Link,
  useActionData,
  useSubmit,
  SubmitFunction,
  useNavigation,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import ChevronUpDownIcon from "~/icons/chevron_updown";
import ChevronDownIcon from "~/icons/chevron_down";
import NewContacto from "~/components/patients/NewContacto";
import NewClinicos from "~/components/patients/NewClinicos";
import NewOcupacion from "~/components/patients/NewOcupacion";
import NewOtros from "~/components/patients/NewOtros";
import GenericButton from "~/components/inputgroups/GenericButton";
import {
  useClinicalIDStore,
  useContactoIDStore,
  useOcupacionIDStore,
  useOtrosIDStore,
  useVisitationIDStore,
} from "~/state/store";

import {
  AppProps,
  typeClinicosStringified,
  ContactoObjectStringify,
  OcupacionObjectStringify,
  OtrosObjectStringify,
  typeVisitationStringified,
} from "~/utilities/types";

interface IProps {
  flushState: AppProps["flushState"];
  flushed: AppProps["flushed"];
  setFlushed: AppProps["setFlushed"];
  profileId: string;
  formRef: React.RefObject<HTMLFormElement | null>;
  finalData: {
    createdClinicosObject?: typeClinicosStringified | null;
    createdContactoObject?: ContactoObjectStringify | null;
    createdOtrosObject?: OtrosObjectStringify | null;
    createdOcupacionObject?: OcupacionObjectStringify | null;
  } | null;
}

// Represents the data returned from the 'action' function (app/routes/_app.add._new.characteristics.create.tsx).
// Needs to accommodate the possibility of an error - so basically everything can be undefined.
// Layered on top is the fact the 'Contacto', 'Otros' and 'Ocupacion' objects can specifically be null.
interface ActionData {
  createdClinicosObject?: typeClinicosStringified;
  createdContactoObject?: ContactoObjectStringify | null;
  createdOtrosObject?: OtrosObjectStringify | null;
  createdOcupacionObject?: OcupacionObjectStringify | null;
  createdVisitationObject?: typeVisitationStringified | null;
  error?: Record<string, string>;
  validation_error?: boolean;
}

const renderButtons = (nextButton: boolean) => {
  if (useVisitationIDStore.getState().visitationID) {
    if (nextButton) {
      // User submitted the form, there were no errors.
      // Or, the user re-submitted after a previous mistake or a change they wanted to
      // make, and their change or re-submission is fine.
      // User can now either update the patient (and re-submit the form) or move to the next step.
      return (
        <>
          <GenericButton text="Actualizar" type="submit" />
          <Link
            to="/add/primary"
            className="btn btn-primary btn-sm"
          >
            Siguiente
          </Link>
        </>
      );
    }

    // User re-submits form but they have now introduced an error(s) or not corrected
    // a previous error.
    return (
      <>
        <GenericButton text="Actualizar" type="submit" />
        <button className="btn btn-sm" disabled>
          Siguiente
        </button>
      </>
    );
  }

  // First arrived at the page. Have made no attempt at submitted anything yet.
  // Or, the user submitted the form for the first time but made an error.
  return (
    <>
      <GenericButton text="Guardar" type="submit" />
      <button className="btn btn-sm" disabled>
        Siguiente
      </button>
    </>
  );
};

const CreatePatient: React.FC<IProps> = ({
  flushState,
  flushed,
  setFlushed,
  profileId,
  formRef,
  finalData,
}) => {
  const { setClinicalID } = useClinicalIDStore();
  const { setContactoID } = useContactoIDStore();
  const { setOtrosID } = useOtrosIDStore();
  const { setOcupacionID } = useOcupacionIDStore();
  const { setVisitationID } = useVisitationIDStore();

  const [nextButton, setNextButton] = useState<boolean>(false);

  // Use "useRef" to store the initial data for the form. This initial data is provided
  // by the user when they first arrive at the page. It was then updated within the
  // "useEffect" after the user submitted the form. This updating caused a re-render of
  // the component, i.e. the "loader" function of "app/routes/_app.add._new.characteristics.create.tsx"
  // was called again. This is an unnecessary re-render, which "useRef" helps to avoid.
  const dataForFormRef = useRef<string | null>(
    finalData
      ? JSON.stringify({
          createdClinicosObject: finalData.createdClinicosObject,
          createdContactoObject: finalData.createdContactoObject,
          createdOtrosObject: finalData.createdOtrosObject,
          createdOcupacionObject: finalData.createdOcupacionObject,
          createdVisitationObject: null,
        })
      : null
  );

  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";
  const myRef = useRef<HTMLDivElement>(null);

  // The 'useActionData' hook will return the data from the 'action' function, which
  // can be found in 'app/routes/_app.add._new.characteristics.create.tsx'.
  // It would be 'undefined' on the very first page render (the first GET request).
  // Hitting the refresh button in the browser will also result in 'undefined'.
  const actionReturned = useActionData<ActionData | undefined>();
  const hasValidationErrors =
    actionReturned?.validation_error && actionReturned.error;
  const prevActionReturned = useRef(actionReturned);

  // If the 'action' function returns a response we need to check whether the contained
  // data is different. In which case we update the state.
  useEffect(() => {
    const executeScroll = () => {
      if (myRef.current !== null) {
        myRef.current.scrollIntoView();
      }
    };
    if (
      actionReturned &&
      !actionReturned.validation_error &&
      actionReturned !== prevActionReturned.current
    ) {
      prevActionReturned.current = actionReturned;

      if (actionReturned.createdClinicosObject) {
        setClinicalID(actionReturned.createdClinicosObject.id);
      }
      if (actionReturned.createdContactoObject) {
        setContactoID(actionReturned.createdContactoObject.id);
      }
      if (actionReturned.createdOtrosObject) {
        setOtrosID(actionReturned.createdOtrosObject.id);
      }
      if (actionReturned.createdOcupacionObject) {
        setOcupacionID(actionReturned.createdOcupacionObject.id);
      }
      if (actionReturned.createdVisitationObject) {
        setVisitationID(actionReturned.createdVisitationObject.id);
      }

      // The 'sessionStorage' is reset in the function 'flushState' of 'app/routes/_app.tsx'.
      // TypeScript requires that we use the "JSON.stringify" method.
      window.sessionStorage.setItem(
        "dataForForm",
        JSON.stringify(actionReturned)
      );

      // Using "useRef" here helps to avoid unnecessary re-renders.
      dataForFormRef.current = JSON.stringify(actionReturned);

      // The form was submitted, and there were no errors. We can now enable the 'Siguiente' button.
      setNextButton(true);
    }
    // If the 'action' function returns an response, and that response contains an error,
    // we need to scroll to the top of the page to display the error message.
    if (actionReturned && actionReturned.validation_error) {
      setNextButton(false);
      if (!isSubmitting) {
        executeScroll();
      }
    }
    if (!actionReturned) {
      // setdataForForm(null);
      setFlushed(false);
      window.sessionStorage.setItem("dataForForm", "");
    }
  }, [
    setFlushed,
    actionReturned,
    isSubmitting,
    setClinicalID,
    setContactoID,
    setOtrosID,
    setOcupacionID,
    setVisitationID,
  ]);

  const getSelectedCountries = (e: React.FormEvent<HTMLFormElement>) => {
    const countriesSelect = (e.target as HTMLFormElement).elements.namedItem(
      "countriesMigration"
    ) as HTMLSelectElement | null;
    if (!countriesSelect) return [];

    return Array.from(
      countriesSelect.selectedOptions,
      (option) => option.value
    );
  };

  const submit: SubmitFunction = useSubmit();
  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Get the selected countries from the named multi-select dropdown
    // See 'app/components/patients/NewDatosClinicos.tsx' ('name="countriesMigration"').
    const selectedCountries: string[] = getSelectedCountries(e);

    const submitThis: FormData = new FormData(e.target as HTMLFormElement);

    submitThis.append(
      "clinicosID",
      useClinicalIDStore.getState().clinicosID ?? "null"
    );
    submitThis.append(
      "contactoID",
      useContactoIDStore.getState().contactoID ?? "null"
    );
    submitThis.append(
      "otrosID",
      useOtrosIDStore.getState().otrosID ?? "null"
    );
    submitThis.append(
      "ocupacionID",
      useOcupacionIDStore.getState().ocupacionID ?? "null"
    );
    submitThis.append(
      "visitationID",
      useVisitationIDStore.getState().visitationID ?? "null"
    );

    submitThis.append("countriesMigration", JSON.stringify(selectedCountries));
    submitThis.append("currentProfileId", profileId);

    submit(submitThis, {
      method: "post",
      action: "/add/characteristics/create",
    });
  }

  const [formSections, setFormSections] = useState({
    otros: false,
    contacto: false,
    ocupacion: false,
  });

  const toggleSection = (section: "otros" | "contacto" | "ocupacion") => {
    setFormSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const handleCancel = () => {
    navigate("/add/characteristics");
  };

  return (
    <div className="max-w-7xl mx-auto bg-base-100">
      <Form onSubmit={submitForm} id="mainform" ref={formRef}>
        <div className="mx-6 mt-8 pb-10">
          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 md:gap-x-8 pt-5 sm:pt-7 my-5 sm:my-7 border-t border-accent md:grid-cols-3">
            <div className="col-span-1 text-center md:text-left">
              <div ref={myRef} className="px-4 sm:px-0">
                <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                  Datos Clínicos
                </h2>
                <p className="mt-3 text-xs sm:text-sm leading-6 text-red-500 bg-red-200 rounded-md text-center font-bold italic">
                  Todos estos elementos son obligatorios
                </p>
                {hasValidationErrors && (
                  <ul className="mt-2 text-red-500 font-bold">
                    {Object.values(actionReturned?.error ?? {}).map(
                      (error, index) => (
                        <li className="my-2 text-sm" key={index}>
                          {error}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            </div>
            <div className="col-span-2 bg-accent shadow-md sm:rounded-xl">
              <NewClinicos data={dataForFormRef.current} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 md:gap-x-8 pt-5 sm:pt-7 my-5 sm:my-7 border-t border-accent md:grid-cols-3">
            {formSections.otros ? (
              <>
                <div className="col-span-1 text-center md:text-left">
                  <div className="px-4 sm:px-0">
                    <button
                      className="col-span-1 text-center md:text-left"
                      type="button"
                      onClick={() => toggleSection("otros")}
                      onKeyDown={(event) => {
                        // Enter or Space key
                        if (event.key === "Enter" || event.key === " ") {
                          toggleSection("otros");
                        }
                      }}
                    >
                      <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                        Otros datos del paciente
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm leading-6 text-accent">
                        Todos estos elementos son opcionales, pero cuanto más
                        recopilamos, ¡más podemos estudiar! 😄
                      </p>
                      <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7">
                        Haga clic para alternar
                        <ChevronDownIcon className="h-6 w-6 inline-block" />
                      </h2>
                    </button>
                  </div>
                </div>
                <div className="col-span-2 bg-accent shadow-md sm:rounded-xl">
                  <NewOtros data={dataForFormRef.current} />
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center">
                <button
                  type="button"
                  onClick={() => toggleSection("otros")}
                  onKeyDown={(event) => {
                    // Enter or Space key
                    if (event.key === "Enter" || event.key === " ") {
                      toggleSection("otros");
                    }
                  }}
                >
                  <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                    Otros datos del paciente
                  </h2>
                  <h2 className="font-semibold italic text-sm underline text-secondary">
                    Opcional
                  </h2>
                  <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7">
                    Haga clic para alternar
                    <ChevronUpDownIcon className="h-6 w-6 inline-block" />
                  </h2>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 md:gap-x-8 pt-5 sm:pt-7 my-5 sm:my-7 border-t border-accent md:grid-cols-3">
            {formSections.contacto ? (
              <>
                <div className="col-span-1 text-center md:text-left">
                  <div className="px-4 sm:px-0">
                    <button
                      className="col-span-1 text-center md:text-left"
                      type="button"
                      onClick={() => toggleSection("contacto")}
                      onKeyDown={(event) => {
                        // Enter or Space key
                        if (event.key === "Enter" || event.key === " ") {
                          toggleSection("contacto");
                        }
                      }}
                    >
                      <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                        Información del contacto (opcional)
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm leading-6 text-accent">
                        Todos estos elementos son opcionales, pero cuanto más
                        recopilamos, ¡más podemos estudiar! 😄
                      </p>
                      <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7">
                        Haga clic para alternar
                        <ChevronDownIcon className="h-6 w-6 inline-block" />
                      </h2>
                    </button>
                  </div>
                </div>
                <div className="col-span-2 bg-accent shadow-md sm:rounded-xl">
                  <NewContacto data={dataForFormRef.current} />
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center">
                <button
                  type="button"
                  onClick={() => toggleSection("contacto")}
                  onKeyDown={(event) => {
                    // Enter or Space key
                    if (event.key === "Enter" || event.key === " ") {
                      toggleSection("contacto");
                    }
                  }}
                >
                  <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                    Información del contacto (opcional)
                  </h2>
                  <h2 className="font-semibold italic text-sm underline text-secondary">
                    Opcional
                  </h2>
                  <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7">
                    Haga clic para alternar
                    <ChevronUpDownIcon className="h-6 w-6 inline-block" />
                  </h2>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 md:gap-x-8 pt-5 sm:pt-7 my-5 sm:my-7 border-t border-accent md:grid-cols-3">
            {formSections.ocupacion ? (
              <>
                <div className="col-span-1 text-center md:text-left">
                  <div className="px-4 sm:px-0">
                    <button
                      className="col-span-1 text-center md:text-left"
                      type="button"
                      onClick={() => toggleSection("ocupacion")}
                      onKeyDown={(event) => {
                        // Enter or Space key
                        if (event.key === "Enter" || event.key === " ") {
                          toggleSection("ocupacion");
                        }
                      }}
                    >
                      <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                        Ocupación y Lugar de Trabajo (opcional)
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm leading-6 text-accent">
                        Todos estos elementos son opcionales, pero cuanto más
                        recopilamos, ¡más podemos estudiar! 😄
                      </p>
                      <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7">
                        Haga clic para alternar
                        <ChevronDownIcon className="h-6 w-6 inline-block" />
                      </h2>
                    </button>
                  </div>
                </div>
                <div className="col-span-2 bg-accent shadow-md sm:rounded-xl">
                  <NewOcupacion data={dataForFormRef.current} />
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center">
                <button
                  type="button"
                  onClick={() => toggleSection("ocupacion")}
                  onKeyDown={(event) => {
                    // Enter or Space key
                    if (event.key === "Enter" || event.key === " ") {
                      toggleSection("ocupacion");
                    }
                  }}
                >
                  <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7 text-secondary">
                    Ocupación y Lugar de Trabajo (opcional)
                  </h2>
                  <h2 className="font-semibold italic text-sm underline text-secondary">
                    Opcional
                  </h2>
                  <h2 className="font-semibold text-sm sm:text-base leading-6 sm:leading-7">
                    Haga clic para alternar
                    <ChevronUpDownIcon className="h-6 w-6 inline-block" />
                  </h2>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-y-8 md:gap-x-8 md:grid-cols-3">
            <div className="flex items-center justify-evenly sm:justify-end sm:col-span-3 gap-x-6 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-sm btn-neutral"
              >
                Cancelar
              </button>
              {renderButtons(nextButton)}
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CreatePatient;
