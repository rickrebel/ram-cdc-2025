import { useSubmit } from "@remix-run/react";
import PrimaryCondition from "~/components/inputgroups/PrimaryCondition";
import {
  usePrimaryConditionStore,
  useClinicalIDStore,
  useVisitationIDStore,
} from "~/state/store";

export default function ToggleGroup() {
  const { primaryConditions, handlePrimaryConditionChange } =
    usePrimaryConditionStore();
  const submit = useSubmit();

  function submitForm(
    e: React.FormEvent<HTMLButtonElement>,
    detail: string,
    id: number
  ) {
    e.preventDefault();

    const clickedPrimary = new FormData();
    clickedPrimary.append("detail", detail);
    clickedPrimary.append(
      "clinicosID",
      useClinicalIDStore.getState().clinicosID ?? "null"
    );
    clickedPrimary.append(
      "visitationID",
      useVisitationIDStore.getState().visitationID ?? "null"
    );

    // Primary conditions is an array of objects. Use the 'id' to match up the appropriate object
    // and set the 'enabled' property of that object to true.
    handlePrimaryConditionChange(id);

    submit(clickedPrimary, {
      method: "POST",
      action: `/add/primary`,
    });
  }

  return (
    <div className="overflow-hidden rounded-lg shadow-lg my-20 bg-secondary mx-auto max-w-screen-lg">
      <div className="px-4 py-5 sm:p-6 flex justify-center">
        <div className="max-w-screen-sm flex flex-col items-center justify-center">
          <h1 className="text-secondary-content text-base sm:text-lg font-bold">
            Seleccione el motivo de consulta
          </h1>
          <div>
            {primaryConditions.map((condition) => (
              <PrimaryCondition
                key={condition.id}
                id={condition.id}
                name={condition.name}
                detail={condition.detail}
                submitForm={submitForm}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
