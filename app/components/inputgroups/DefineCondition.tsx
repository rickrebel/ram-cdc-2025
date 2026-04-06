type SymptomOption = {
  id: string;
  primary: string;
  additional: string[];
  additional_details: string[];
  checked: boolean[];
};

interface IProps {
  selectedPrimaryCondition: number;
  selectedSymptoms: SymptomOption;
  primaryConditionName: string;
  handleSecondarySymptomsClick: (
    primaryId: number,
    secondaryId: number
  ) => void;
}

const grouping = function (
  secondarySymptom: string,
  secondarySymptomId: number,
  associatedSymptomDetails: string[],
  associatedSymptomChecked: boolean[],
  handleSecondarySymptomsClick: (
    primaryId: number,
    secondaryId: number
  ) => void,
  selectedPrimaryCondition: number
) {
  return (
    <label
      key={secondarySymptomId}
      htmlFor={secondarySymptomId.toString()}
      className="flex items-center h-28 min-w-full px-3 bg-accent border rounded-md my-1 sm:my-2 md:my-4"
    >
      <input
        checked={associatedSymptomChecked[secondarySymptomId]}
        onChange={() =>
          handleSecondarySymptomsClick(
            selectedPrimaryCondition,
            secondarySymptomId
          )
        }
        id={secondarySymptomId.toString()}
        aria-describedby="comments-description"
        name={secondarySymptom.concat(
          " - ",
          associatedSymptomDetails[secondarySymptomId]
        )}
        type="checkbox"
        value={
          associatedSymptomChecked[secondarySymptomId]
            ? "selected"
            : "unselected"
        }
        className="checkbox checkbox-xs checkbox-info rounded-none"
      />
      <span className="text-xs lg:text-sm font-bold ml-3 text-primary">
        {secondarySymptom}
      </span>
      <span className="text-xs lg:text-sm ml-3 text-accent-content">
        {associatedSymptomDetails[secondarySymptomId]}
      </span>
    </label>
  );
};

export default function Define({
  selectedPrimaryCondition,
  selectedSymptoms,
  primaryConditionName,
  handleSecondarySymptomsClick,
}: IProps) {
  const associatedSymptoms: string[] = selectedSymptoms?.additional;
  const associatedSymptomDetails: string[] =
    selectedSymptoms?.additional_details;
  const associatedSymptomChecked: boolean[] = selectedSymptoms?.checked;

  if (associatedSymptoms) {
    // Get the index of "associatedSymptoms" that equals "Vómito".
    const indexOfVomito = associatedSymptoms.indexOf("Vómito");
    // Get the index of "associatedSymptoms" that equals "Diarrea".
    const indexOfDiarrea = associatedSymptoms.indexOf("Diarrea");
    return (
      <fieldset>
        <div className="grid grid-cols-1 gap-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6 px-4">
          {associatedSymptoms.map((secondarySymptom, secondarySymptomId) =>
            grouping(
              secondarySymptom,
              secondarySymptomId,
              associatedSymptomDetails,
              associatedSymptomChecked,
              handleSecondarySymptomsClick,
              selectedPrimaryCondition
            )
          )}
        </div>
        {primaryConditionName === "EDAS" &&
          associatedSymptomChecked[indexOfDiarrea] && (
            <div className="mt-6 grid grid-cols-1 gap-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6 px-4">
              <div className="bg-accent border rounded-md flex items-center h-16">
                <label
                  htmlFor="evacuaciones"
                  className="flex items-center font-bold text-xs lg:text-sm h-16 w-8/12 pl-3 my-1 sm:my-2 md:my-4"
                >
                  Cuántas evacuaciones en 24 horas.
                </label>
                <input
                  type="number"
                  name="evacuaciones"
                  id="evacuaciones"
                  step="1"
                  min="0"
                  required
                  className="input input-bordered input-info rounded w-4/12 py-1.5 shadow-sm mx-3 text-xs lg:text-sm sm:leading-6"
                />
              </div>
            </div>
          )}
        {primaryConditionName === "EDAS" &&
          associatedSymptomChecked[indexOfVomito] && (
            <div className="mt-6 grid grid-cols-1 gap-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6 px-4">
              <div className="bg-accent border rounded-md flex items-center h-16">
                <label
                  htmlFor="vomitos"
                  className="flex items-center font-bold text-xs lg:text-sm h-16 w-8/12 pl-3 my-1 sm:my-2 md:my-4"
                >
                  Cuántos vómitos en 24 horas.
                </label>
                <input
                  type="number"
                  name="vomitos"
                  id="vomitos"
                  step="1"
                  min="0"
                  required
                  className="input input-bordered input-info rounded w-4/12 py-1.5 shadow-sm mx-3 text-xs lg:text-sm sm:leading-6"
                />
              </div>
            </div>
          )}
      </fieldset>
    );
  } else {
    return <p>Please select a primary condition</p>;
  }
}
