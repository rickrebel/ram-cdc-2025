import React from "react";
import { describe, it, expect } from "vitest";
import buildPatientReportCard from "~/algorithms/BuildPatientReportCard";
import "@testing-library/jest-dom";
import {
  typeClinicosStringified,
  typeVisitationStringified,
} from "~/utilities/types";
import {
  enumGenero,
  enumSexonacer,
  enumCondition,
} from "~/algorithms/utilitiesTypes";

describe("buildPatientReportCard", () => {
  const mockClinicos: typeClinicosStringified = {
    id: "123",
    curp: "AAAA000000AAAAAA00",
    dob: "2000-01-01T00:00:00.000Z",
    sexonacer: enumSexonacer.Hombre,
    indigenous: false,
    afrodescendant: false,
    dateAdded: "2025-01-29T19:34:05.604Z",
    location: "null",
  };

  const mockVisitation: typeVisitationStringified = {
    id: "202",
    curp: "AAAA000000AAAAAA00",
    date: "2025-02-05T19:34:05.604Z",
    clinicosId: "123",
    genero: enumGenero.HombreCisgenero,
    peso: 70,
    talla: 175,
    existingConditions: ["Diabetes"],
    hospitalized: false,
    takenMedication: false,
    disability: false,
    migrant: false,
    countriesMigration: [],
    alergies: [],
    primaryConditions: [],
    secondaryConditions: ["Fiebre"],
    evacuationCount: 3,
    vomitCount: 1,
    location: "Casa",
    diagnosis: "Gripe",
    notes: "Paciente con hasFiebre",
  };

  it("should correctly build a patient report card", () => {
    const reportCard = buildPatientReportCard(
      mockClinicos,
      mockVisitation,
      enumCondition.Edas
    );

    expect(reportCard.dob).toBe(mockClinicos.dob);
    expect(reportCard.patientType).toBe("Adulto");
    expect(reportCard.symptoms).toContain("Fiebre");
  });

  it("should correctly determine postmenopausal status", () => {
    const updatedClinicos = { ...mockClinicos, sexonacer: enumSexonacer.Mujer };
    const updatedReportCard = buildPatientReportCard(
      updatedClinicos,
      mockVisitation,
      enumCondition.Edas
    );

    expect(updatedReportCard.postmenopausia).toBe(false);
  });
});
