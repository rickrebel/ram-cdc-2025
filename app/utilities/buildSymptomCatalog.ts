export type SecondarySymptom = {
  id: string;
  primary: string;
  additional: string[];
  additional_details: string[];
  checked: boolean[];
};

export const flattenNestedSymptoms = (
  nestedSymptoms: object
): string[] => {
  return Object.values(nestedSymptoms).flatMap(
    (symptom) =>
      typeof symptom === "string"
        ? symptom
        : Object.values(symptom)
  );
};

export const buildSymptomCatalog = (
  id: string,
  primary: string,
  symptoms: object,
  labels: object
): SecondarySymptom => {
  const additional = [
    ...flattenNestedSymptoms(symptoms),
    "Ninguno(a)",
  ];
  const additional_details = [
    ...flattenNestedSymptoms(labels),
    "No se muestra ninguno de los síntomas anteriores.",
  ];
  return {
    id,
    primary,
    additional,
    additional_details,
    checked: new Array(additional.length).fill(false),
  };
};