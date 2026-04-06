import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AlgorithmIRAS from "~/algorithms/AlgorithmIRAS";
import {
  typePropsAlgos,
  enumGenero,
  enumSexonacer,
} from "~/algorithms/utilitiesTypes";
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

describe("AlgorithmIRAS Component", () => {
  it("renders positive IRAS result", async () => {
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
        existingConditions: ["diabetes", "inmunosupresion", "hepaticos"],
        hospitalized: true,
        takenMedication: false,
        disability: true,
        migrant: false,
        countriesMigration: [],
        alergies: ["penicilinas", "macrolidos"],
        primaryConditions: ["Enfermedades diarreicas agudas"],
        secondaryConditions: [
          "Fiebre - Temperatura corporal elevada a más de 38℃.",
          "Diarrea - Cuántas evacuaciones en 24 horas.",
          "Sangre en heces - Con más de 3 evacuaciones.",
        ],
        evacuationCount: 20,
        vomitCount: 0,
        location: "Aguascalientes",
        diagnosis: "null",
        notes: "null",
      },
    };

    // ✅ Wrapper to pass `loaderData`
    const AlgorithmIRASWrapper = () => (
      <AlgorithmIRAS loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmIRASWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      // future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

    // ---------------------------------------------------------------------------------
    // Síntomas presentados
    await waitFor(() =>
      expect(screen.getByText(/^Síntomas presentados$/i)).toBeInTheDocument()
    );
    const sintomasSection = rendered.container.querySelector(
      "#sintomas-presentados"
    ) as HTMLElement;
    if (!sintomasSection) {
      throw new Error("Síntomas presentados section not found");
    }
    // ---------------------------------------------------------------------------------
  });
});
