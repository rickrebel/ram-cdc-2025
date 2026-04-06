import { useLocation } from "@remix-run/react";
import CheckIcon from "~/icons/check";

type StepType = {
  id: string;
  name: string;
  description: string;
  href: string;
  status: string;
};

const stepsData = [
  {
    id: "01",
    name: "Características del Paciente.",
    description:
      "Definir las características y factores de riesgo del paciente.",
    href: "characteristics",
  },
  {
    id: "02",
    name: "La condición primaria.",
    description: "Definir la condición primaria sospechosa.",
    href: "primary",
  },
  {
    id: "03",
    name: "Los síntomas secundarios.",
    description:
      "Definir la condición sospechosa específica con más detalle.",
    href: "define",
  },
  {
    id: "04",
    name: "Revisar las Opciones de Tratamiento.",
    description:
      "Opciones de tratamiento, recomendaciones y más detalles.",
    href: "revise",
  },
];

function classNames(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const CompleteStep: React.FC<{ step: StepType; stepIdx: number }> = ({
  step,
  stepIdx,
}) => {
  return (
    <div className="group">
      <span
        className="absolute left-0 top-0 h-full w-1 bg-transparent lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
        aria-hidden="true"
      />
      <span
        className={classNames(
          stepIdx !== 0 ? "lg:pl-9" : "",
          "flex items-start px-6 py-5 text-sm font-medium"
        )}
      >
        <span className="flex-shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-full">
            <CheckIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          </span>
        </span>
        <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
          <span className="text-sm font-medium text-primary">{step.name}</span>
          <span className="text-sm font-medium text-primary">
            {step.description}
          </span>
        </span>
      </span>
    </div>
  );
};

const CurrentStep: React.FC<{ step: StepType; stepIdx: number }> = ({
  step,
  stepIdx,
}) => {
  return (
    <div aria-current="step">
      <span
        className="absolute left-0 top-0 h-full w-1 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
        aria-hidden="true"
      />
      <span
        className={classNames(
          stepIdx !== 0 ? "lg:pl-9" : "",
          "flex items-start px-6 py-5 text-sm font-medium"
        )}
      >
        <span className="flex-shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent">
            <span className="text-accent">{step.id}</span>
          </span>
        </span>
        <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
          <span className="text-sm font-medium text-accent">{step.name}</span>
          <span className="text-sm font-medium text-accent">
            {step.description}
          </span>
        </span>
      </span>
    </div>
  );
};

const Steps = () => {
  const { pathname } = useLocation();
  const currentStepId =
    pathname.includes("/revise")  ? "04" :
    pathname.includes("/define")  ? "03" :
    pathname.includes("/primary") ? "02" : "01";

  const steps: StepType[] = stepsData.map((step) => ({
    ...step,
    status:
      step.id < currentStepId ? "complete" :
      step.id === currentStepId ? "current" : "upcoming",
  }));

  return (
    <div className="mt-6 lg:border-b lg:border-t lg:border-secondary">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Progress"
      >
        <ol className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-secondary">
          {steps.map((step, stepIdx) => (
            <li
              key={step.id}
              className="relative overflow-hidden lg:flex-1 cursor-auto"
            >
              <div
                className={classNames(
                  stepIdx === 0 ? "rounded-t-md border-b-0" : "",
                  stepIdx === steps.length - 1 ? "rounded-b-md border-t-0" : "",
                  "overflow-hidden border border-accent lg:border-0"
                )}
              >
                {step.status === "complete" ? (
                  <CompleteStep step={step} stepIdx={stepIdx} />
                ) : step.status === "current" ? (
                  <CurrentStep step={step} stepIdx={stepIdx} />
                ) : (
                  <div className="group">
                    <span
                      className="absolute left-0 top-0 h-full w-1 bg-transparent lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                      aria-hidden="true"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? "lg:pl-9" : "",
                        "flex items-start px-6 py-5 text-sm font-medium"
                      )}
                    >
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary">
                          <span className="text-secondary">{step.id}</span>
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-secondary">
                          {step.name}
                        </span>
                        <span className="text-sm font-medium text-secondary">
                          {step.description}
                        </span>
                      </span>
                    </span>
                  </div>
                )}

                {stepIdx !== 0 ? (
                  <>
                    {/* Separator */}
                    <div
                      className="absolute inset-0 left-0 top-0 hidden w-3 lg:block"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-full w-full text-secondary"
                        viewBox="0 0 12 82"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0.5 0V31L10.5 41L0.5 51V82"
                          stroke="currentcolor"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Steps;
