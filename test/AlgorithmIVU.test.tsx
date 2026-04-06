import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AlgorithmIVU from "~/algorithms/AlgorithmIVU";
import {
  typePropsAlgos,
  enumGenero,
  enumSexonacer,
  enumRiskFactors,
  enumAllergies,
} from "~/algorithms/utilitiesTypes";
import {
  ALL_IVU_SYMPTOMS,
  ALL_IVU_LABELS,
} from "~/algorithms/IVU/utilitiesSymptoms";
import { createRemixStub } from "@remix-run/testing";
import "@testing-library/jest-dom";

// Custom test function
export async function customTest(
  primaryTest: () => Promise<void>,
  alternativeTest: () => Promise<void>
) {
  try {
    await primaryTest();
  } catch (error) {
    console.error("Primary test failed, trying alternative test", error);
    try {
      await alternativeTest();
    } catch (alternativeError) {
      console.error("Alternative test also failed", alternativeError);
      throw alternativeError; // Re-throw the error to report the test failure
    }
  }
}

// Mock `useFetcher()` to prevent real form submissions.
vi.mock("@remix-run/react", async () => {
  const actual = await import("@remix-run/react");
  return {
    ...actual, // Use the "actual" module namespace object.
    useFetcher: () => ({
      submit: vi.fn(), // Prevent real form submissions.
    }),
  };
});

// Mock `fetch()` globally.
global.fetch = vi.fn(async () => {
  // Return an actual "Response" instance using the "Response" constructor.
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: new Headers(),
  });
});

describe("AlgorithmIVU Component", () => {
  it("renders positive IVU result A", async () => {
    const mockLoaderData: typePropsAlgos["loaderData"] = {
      clinicos: {
        id: "123",
        location: "null",
        curp: "AAAA000000AAAAAA00",
        dob: "1990-03-02T00:00:00.000Z",
        sexonacer: enumSexonacer.Hombre,
        indigenous: true,
        afrodescendant: false,
        dateAdded: "2025-02-11T02:51:26.244Z",
      },
      visitation: {
        id: "321",
        curp: "AAAA000000AAAAAA00",
        date: "2025-02-11T03:53:11.490Z",
        clinicosId: "123",
        genero: enumGenero.HombreCisgenero,
        peso: 123,
        talla: 321,
        existingConditions: [
          enumRiskFactors.Diabetes,
          enumRiskFactors.Inmunosupresion,
          enumRiskFactors.Hepaticos,
        ],
        hospitalized: true,
        takenMedication: false,
        disability: true,
        migrant: false,
        countriesMigration: [],
        alergies: [enumAllergies.Penicilinas, enumAllergies.Macrolidos],
        primaryConditions: ["Infección del tracto urinario"],
        secondaryConditions: [
          ALL_IVU_SYMPTOMS.DISURIA + " - " + ALL_IVU_LABELS.DISURIA,
        ],
        evacuationCount: 0,
        vomitCount: 0,
        location: "Aguascalientes",
        diagnosis: "null",
        notes: "null",
      },
    };

    // ✅ Wrapper to pass `loaderData`
    const AlgorithmIVUWrapper = () => (
      <AlgorithmIVU loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmIVUWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      // future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

    const resumenSectionA = rendered.container.querySelector(
      "#patientCard"
    ) as HTMLElement;
    if (!resumenSectionA) {
      throw new Error("Resumen del Paciente section not found");
    }

    // ---------------------------------------------------------------------------------
    // Check if the patient card is rendered.
    await waitFor(() =>
      expect(
        within(resumenSectionA).getByText(/^Resumen del Paciente$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Fecha de nacimiento (edad)
    const primaryTest = async () => {
      await waitFor(() =>
        expect(
          screen.getByText((content, element) => {
            const hasText = (node: Element) =>
              node.textContent === "Fecha de nacimiento (edad)";
            const elementHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(
              element?.children || []
            ).every((child) => !hasText(child as Element));
            return elementHasText && childrenDontHaveText;
          })
        ).toBeInTheDocument()
      );
    };
    const alternativeTest = async () => {
      await waitFor(() =>
        expect(
          screen.getByText((content, element) => {
            const hasText = (node: Element): boolean =>
              node.textContent === "1990-03-02 (34 años, 11 meses, 16 días)";

            const elementHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(
              element?.children || []
            ).every((child) => !hasText(child as Element));

            return elementHasText && childrenDontHaveText;
          })
        ).toBeInTheDocument()
      );
    };
    await customTest(primaryTest, alternativeTest);
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Sexo al nacer
    const sexoNacerSection = rendered.container.querySelector(
      "#sexo-presentados"
    ) as HTMLElement;
    if (!sexoNacerSection) {
      throw new Error("Sexo presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sexoNacerSection).getByText(/^Sexo al nacer$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(sexoNacerSection).getByText(/Hombre/i)).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Identidad de género
    const generoSection = rendered.container.querySelector(
      "#genero-presentados"
    ) as HTMLElement;
    if (!generoSection) {
      throw new Error("Genero presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(generoSection).getByText(/Identidad de género/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(generoSection).getByText(/Hombre cisgénero/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Condición primaria
    const primarySection = rendered.container.querySelector(
      "#primary-presentados"
    ) as HTMLElement;
    if (!primarySection) {
      throw new Error("Primary presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(primarySection).getByText(/Condición primaria/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(primarySection).getByText(/Infección del tracto urinario/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Síntomas presentados
    const sintomasSection = rendered.container.querySelector(
      "#sintomas-presentados"
    ) as HTMLElement;
    if (!sintomasSection) {
      throw new Error("Síntomas presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Síntomas presentados$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Disuria$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Diabetes$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Paciente es inmunocompromiso$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Enfermedades hepáticas$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Alergias presentadas
    const alergiasSection = rendered.container.querySelector(
      "#allergies-presentados"
    ) as HTMLElement;
    if (!alergiasSection) {
      throw new Error("Alergias presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/Penicilinas/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/^Macrólidos$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Require IVU treatment
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Requiere tratamiento antibiótico para Cistitis Aguda/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Disuria - Dolor al orinar./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Tratamiento empírico
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Tratamiento empírico/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Elección:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Nitrofurantoina 100 mg VO cada 8 hrs por 5 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Alternativo:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Fosfomicina 3 gramos VO dosis única./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Factores de riesgo
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Factores de riesgo de resistencia antibiótica que presenta el paciente/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() => {
      const elements = screen.getAllByText(
        /Hospitalización en tres meses previos./i
      );
      expect(elements).toHaveLength(2);
    });
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Siempre pregunte/considere los siguientes factores de riesgo
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Siempre pregunte\/considere los siguientes factores de riesgo/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() => {
      const elements = screen.getAllByText(/Diabetes./i);
      expect(elements).toHaveLength(1);
    });
    await waitFor(() =>
      expect(screen.getByText(/Inmunosupresión./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Infección de vías urinarias complicada./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /No cambia el tratamiento, pero el paciente debe vigilarse por mayor riesgo de complicaciones./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Recomendaciones adicionales
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Recomendaciones adicionales/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/No repetición:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Investigar causas./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Tomar urocultivo antes de tratamiento empírico, guiarse por patrones locales./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Siempre confirmar que no hay alergias./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Proporcionar datos de alarma./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------
  });

  it("renders positive IVU result B", async () => {
    const mockLoaderData: typePropsAlgos["loaderData"] = {
      clinicos: {
        id: "123",
        location: "null",
        curp: "AAAA000000AAAAAA00",
        dob: "1990-03-02T00:00:00.000Z",
        sexonacer: enumSexonacer.Mujer,
        indigenous: false,
        afrodescendant: false,
        dateAdded: "2025-02-11T02:51:26.244Z",
      },
      visitation: {
        id: "321",
        curp: "AAAA000000AAAAAA00",
        date: "2025-02-11T03:53:11.490Z",
        clinicosId: "123",
        genero: enumGenero.MujerCisgenero,
        peso: 123,
        talla: 321,
        existingConditions: [enumRiskFactors.Embarazo],
        hospitalized: false,
        takenMedication: false,
        disability: false,
        migrant: false,
        countriesMigration: [],
        alergies: [],
        primaryConditions: ["Infección del tracto urinario"],
        secondaryConditions: [
          ALL_IVU_SYMPTOMS.URGENCIA + " - " + ALL_IVU_LABELS.URGENCIA,
          ALL_IVU_SYMPTOMS.POLAQUIURIA + " - " + ALL_IVU_LABELS.POLAQUIURIA,
          ALL_IVU_SYMPTOMS.TENESMO_VESICAL +
            " - " +
            ALL_IVU_LABELS.TENESMO_VESICAL,
        ],
        evacuationCount: 0,
        vomitCount: 0,
        location: "Aguascalientes",
        diagnosis: "null",
        notes: "null",
      },
    };

    // ✅ Wrapper to pass `loaderData`
    const AlgorithmIVUWrapper = () => (
      <AlgorithmIVU loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmIVUWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      //future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

    const resumenSectionB = rendered.container.querySelector(
      "#patientCard"
    ) as HTMLElement;
    if (!resumenSectionB) {
      throw new Error("Resumen del Paciente section not found");
    }

    // ---------------------------------------------------------------------------------
    // Check if the patient card is rendered.
    await waitFor(() =>
      expect(
        within(resumenSectionB).getByText(/^Resumen del Paciente$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Fecha de nacimiento (edad)
    const primaryTest = async () => {
      const fechaNacimientoSection = rendered.container.querySelector(
        "#fecha-nacimiento"
      ) as HTMLElement;
      if (!fechaNacimientoSection) {
        throw new Error("Fecha de nacimiento (edad)section not found");
      }
      await waitFor(() =>
        expect(
          within(fechaNacimientoSection).getByText(
            /Fecha de nacimiento (edad)/i
          )
        ).toBeInTheDocument()
      );
    };

    const alternativeTest = async () => {
      await waitFor(() =>
        expect(
          screen.getByText((content, element) => {
            const hasText = (node: Element) =>
              node.textContent === "Fecha de nacimiento (edad)";

            const elementHasText = hasText(element as Element);
            const childrenDontHaveText = Array.from(
              element?.children || []
            ).every((child) => !hasText(child as Element));

            return elementHasText && childrenDontHaveText;
          })
        ).toBeInTheDocument()
      );
    };
    // Execute the custom test function
    await customTest(primaryTest, alternativeTest);

    /* await waitFor(() =>
      expect(
        screen.getByText((content, element) => {
          const hasText = (node: Element) => node.textContent === "1990-03-02";

          const elementHasText = hasText(element as Element);
          const childrenDontHaveText = Array.from(
            element?.children || []
          ).every((child) => !hasText(child as Element));

          return elementHasText && childrenDontHaveText;
        })
      ).toBeInTheDocument()
    ); */
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Sexo al nacer
    const sexoNacerSection = rendered.container.querySelector(
      "#sexo-presentados"
    ) as HTMLElement;
    if (!sexoNacerSection) {
      throw new Error("Sexo presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sexoNacerSection).getByText(/^Sexo al nacer$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(sexoNacerSection).getByText(/Mujer/i)).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Identidad de género
    const generoSection = rendered.container.querySelector(
      "#genero-presentados"
    ) as HTMLElement;
    if (!generoSection) {
      throw new Error("Genero presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(generoSection).getByText(/Identidad de género/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(generoSection).getByText(/Mujer cisgénero/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Condición primaria
    const primarySection = rendered.container.querySelector(
      "#primary-presentados"
    ) as HTMLElement;
    if (!primarySection) {
      throw new Error("Primary presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(primarySection).getByText(/Condición primaria/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(primarySection).getByText(/Infección del tracto urinario/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Síntomas presentados
    const sintomasSection = rendered.container.querySelector(
      "#sintomas-presentados"
    ) as HTMLElement;
    if (!sintomasSection) {
      throw new Error("Síntomas presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Síntomas presentados$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Polaquiuria$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Urgencia$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Tenesmo vesical$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Embarazo actual$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Alergias presentadas
    const alergiasSection = rendered.container.querySelector(
      "#allergies-presentados"
    ) as HTMLElement;
    if (!alergiasSection) {
      throw new Error("Alergias presentados section not found");
    }
    await waitFor(() =>
      expect(within(alergiasSection).getByText(/No/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/alergias presentadas/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Require IVU treatment
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Requiere tratamiento antibiótico para Cistitis Aguda/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Urgencia - Necesidad urgente de orinar./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Polaquiuria - Incremento de la frecuencia urinaria./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Tenesmo vesical - Sensación de no vaciar la vejiga./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Tratamiento empírico
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Tratamiento empírico/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Elección:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Nitrofurantoina 100 mg VO cada 8 hrs por 5 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Alternativo:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Fosfomicina 3 gramos VO dosis única./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Siempre pregunte/considere los siguientes factores de riesgo
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Siempre pregunte\/considere los siguientes factores de riesgo/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() => {
      const elements = screen.getAllByText(/Embarazo actual./i);
      expect(elements).toHaveLength(1);
    });
    await waitFor(() =>
      expect(
        screen.getByText(/Infección de vías urinarias complicada./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /No cambia el tratamiento, pero el paciente debe vigilarse por mayor riesgo de complicaciones./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Recomendaciones adicionales
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Recomendaciones adicionales/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/En embarazo, independientemente de la repetición:/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Investigar causas./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Tomar urocultivo antes de tratamiento empírico, guiarse por patrones locales./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /En embarazo: NO Ciprofloxacino - NO Trimetoprim sulfametoxazol./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Siempre confirmar que no hay alergias./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Proporcionar datos de alarma./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------
  });

  it("renders positive IVU result C", async () => {
    const mockLoaderData: typePropsAlgos["loaderData"] = {
      clinicos: {
        id: "123",
        location: "null",
        curp: "AAAA000000AAAAAA00",
        dob: "1929-03-02T00:00:00.000Z",
        sexonacer: enumSexonacer.PrefiereNoDecir,
        indigenous: false,
        afrodescendant: true,
        dateAdded: "2025-02-11T02:51:26.244Z",
      },
      visitation: {
        id: "321",
        curp: "AAAA000000AAAAAA00",
        date: "2025-02-11T03:53:11.490Z",
        clinicosId: "123",
        genero: enumGenero.PersonaNoBinaria,
        peso: 123,
        talla: 321,
        existingConditions: [enumRiskFactors.HasRenalIssues],
        hospitalized: false,
        takenMedication: true,
        disability: false,
        migrant: true,
        countriesMigration: ["Belice", "Bolivia"],
        alergies: [
          enumAllergies.Cefalosporinas,
          enumAllergies.Sulfonamidas,
          enumAllergies.Aminoglucosidos,
        ],
        primaryConditions: ["Infección del tracto urinario"],
        secondaryConditions: [
          ALL_IVU_SYMPTOMS.DOLOR_LUMBAR + " - " + ALL_IVU_LABELS.DOLOR_LUMBAR,
          ALL_IVU_SYMPTOMS.FIEBRE + " - " + ALL_IVU_LABELS.FIEBRE,
        ],
        evacuationCount: 0,
        vomitCount: 0,
        location: "Aguascalientes",
        diagnosis: "null",
        notes: "null",
      },
    };

    // ✅ Wrapper to pass `loaderData`
    const AlgorithmIVUWrapper = () => (
      <AlgorithmIVU loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmIVUWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      // future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

    const resumenSectionC = rendered.container.querySelector(
      "#patientCard"
    ) as HTMLElement;
    if (!resumenSectionC) {
      throw new Error("Resumen del Paciente section not found");
    }

    // ---------------------------------------------------------------------------------
    // Check if the patient card is rendered.
    await waitFor(() =>
      expect(
        within(resumenSectionC).getByText(/^Resumen del Paciente$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Fecha de nacimiento (edad)
    const nacimientoSection = rendered.container.querySelector(
      "#fecha-nacimiento"
    ) as HTMLElement;
    if (!nacimientoSection) {
      throw new Error("Nacimiento Section section not found");
    }
    await waitFor(() =>
      expect(
        screen.getByText((content, element) => {
          const hasText = (node: Element) =>
            node.textContent === "Fecha de nacimiento (edad)";
          const elementHasText = hasText(element as Element);
          const childrenDontHaveText = Array.from(
            element?.children || []
          ).every((child) => !hasText(child as Element));
          return elementHasText && childrenDontHaveText;
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(nacimientoSection).getByText(/1929-03-02/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Sexo al nacer
    const sexoNacerSection = rendered.container.querySelector(
      "#sexo-presentados"
    ) as HTMLElement;
    if (!sexoNacerSection) {
      throw new Error("Sexo presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sexoNacerSection).getByText(/^Sexo al nacer$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sexoNacerSection).getByText(/Prefiere no decir/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Identidad de género
    const generoSection = rendered.container.querySelector(
      "#genero-presentados"
    ) as HTMLElement;
    if (!generoSection) {
      throw new Error("Genero presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(generoSection).getByText(/Identidad de género/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(generoSection).getByText(/Persona No Binaria/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Condición primaria
    const primarySection = rendered.container.querySelector(
      "#primary-presentados"
    ) as HTMLElement;
    if (!primarySection) {
      throw new Error("Primary presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(primarySection).getByText(/Condición primaria/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(primarySection).getByText(/Infección del tracto urinario/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Síntomas presentados
    const sintomasSection = rendered.container.querySelector(
      "#sintomas-presentados"
    ) as HTMLElement;
    if (!sintomasSection) {
      throw new Error("Síntomas presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Síntomas presentados$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Dolor lumbar$/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(sintomasSection).getByText(/^Fiebre$/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/^Enfermedades renales$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Alergias presentadas
    const alergiasSection = rendered.container.querySelector(
      "#allergies-presentados"
    ) as HTMLElement;
    if (!alergiasSection) {
      throw new Error("Alergias presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/Alergias presentadas/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/Cefalosporinas/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/Sulfonamidas/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/Aminoglucósidos/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Require IVU treatment
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Requiere tratamiento antibiótico para Pielonefritis Aguda/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Dolar lumbar - Dolor en la espalda baja./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Fiebre - Temperatura corporal elevada mas que 38℃./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Tratamiento empírico
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Tratamiento empírico/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Elección:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Ciprofloxacino 750 mg VO cada 12 hrs por 7 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Levofloxacino 750 mg VO cada 24 hrs por 5 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Cefotaxima 1 gramo IV cada 8 hrs por 7 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Ceftriaxona 1 gramo IV cada 12 hrs por 7 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Alternativo:/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Trimetoprim sulfametoxazol 160\/800 mg VO cada 12 hrs por 14 días./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Factores de riesgo de resistencia antibiótica que presenta el paciente
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Factores de riesgo de resistencia antibiótica que presenta el paciente/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() => {
      const elements = screen.getAllByText(
        /Uso de antibióticos en los tres meses previos./i
      );
      expect(elements).toHaveLength(1);
    });
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Recomendaciones adicionales
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Recomendaciones adicionales/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Solicitar urocultivo y USG renal de ser posible./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Solicitar BH y VSG./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Hay sepsis\? Considerar tratamiento IV y canalizar segundo nivel de atención./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Siempre confirmar que no hay alergias./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Proporcionar datos de alarma./i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------
  });
});
