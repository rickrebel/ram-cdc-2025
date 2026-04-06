import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AlgorithmITS from "~/algorithms/AlgorithmITS";
import {
  typePropsAlgos,
  enumGenero,
  enumSexonacer,
} from "~/algorithms/utilitiesTypes";
import {
  ALL_ITS_SYMPTOMS,
  ALL_ITS_LABELS,
} from "~/algorithms/ITS/utilitiesSymptoms";
import { createRemixStub } from "@remix-run/testing";
import "@testing-library/jest-dom";

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

describe("AlgorithmITS Component", () => {
  it("renders positive ITS result A", async () => {
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
        existingConditions: [],
        hospitalized: false,
        takenMedication: false,
        disability: false,
        migrant: false,
        countriesMigration: [],
        alergies: [],
        primaryConditions: ["Infecciones de transmisión sexual"],
        secondaryConditions: [
          ALL_ITS_SYMPTOMS.FLUJO_VAGINAL.CERVICITIS_FLUJO_CERVICAL +
            " - " +
            ALL_ITS_LABELS.FLUJO_VAGINAL.CERVICITIS_FLUJO_CERVICAL,
        ],
        evacuationCount: 0,
        vomitCount: 0,
        location: "Aguascalientes",
        diagnosis: "null",
        notes: "null",
      },
    };

    // ✅ Wrapper to pass `loaderData`
    const AlgorithmITSWrapper = () => (
      <AlgorithmITS loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmITSWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      // future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

    const resumenSection = rendered.container.querySelector(
      "#patientCard"
    ) as HTMLElement;
    if (!resumenSection) {
      throw new Error("Resumen del Paciente section not found");
    }

    // ---------------------------------------------------------------------------------
    // Check if the patient card is rendered.
    await waitFor(() =>
      expect(
        within(resumenSection).getByText(/^Resumen del Paciente$/i)
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
        within(nacimientoSection).getByText(/1990-03-02/i)
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
        within(primarySection).getByText(/Infecciones de transmisión sexual/i)
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
        within(sintomasSection).getByText(/^Cervicitis o flujo cervical$/i)
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
          name: /Requiere tratamiento antibiótico para Gonorrea y otras causas de Cervicitis/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Cervicitis o flujo cervical./i)
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
        screen.getByText(/Ceftriaxona 1 gramo IM DU mas./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Doxiciclina 100 mg VO cada 12 hrs por 7 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Metronidazol 500 mg VO cada 12 hrs por 7 días./i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText((content, element) => {
          const hasText = (node: Element) =>
            node.textContent === "Tratamiento a pareja(s) sexual(es).";

          const elementHasText = hasText(element as Element);
          const childrenDontHaveText = Array.from(
            element?.children || []
          ).every((child) => !hasText(child as Element));

          return elementHasText && childrenDontHaveText;
        })
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
        screen.getByText(
          /Si este no es el primer episodio considerar realizar cultivo y PCR\/NAATS./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Considerar el algoritmo para Enfermedad Pélvica Inflamatoria./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------
  });
});
