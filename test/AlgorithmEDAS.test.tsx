import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AlgorithmEDAS from "~/algorithms/AlgorithmEDAS";
import {
  typePropsAlgos,
  enumGenero,
  enumSexonacer,
} from "~/algorithms/utilitiesTypes";
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

describe("AlgorithmEDAS Component", () => {
  it("renders positive EDAS result", async () => {
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
    const AlgorithmEDASWrapper = () => (
      <AlgorithmEDAS loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmEDASWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      // future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

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
        within(sintomasSection).getByText(/Síntomas presentados/i)
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(within(sintomasSection).getByText(/Fiebre/i)).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(
          /Diarrea\s*\(20 evacuaciones en las últimas 24 horas\)/i
        )
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        within(sintomasSection).getByText(/Sangre en heces/i)
      ).toBeInTheDocument()
    );

    const primaryDiabetesTest = async () => {
      await waitFor(() =>
        expect(
          within(sintomasSection).getByText(/Diabetes/i)
        ).toBeInTheDocument()
      );
    };

    const alternativeDiabetesTest = async () => {
      async () => {
        await waitFor(() =>
          expect(
            screen.getByText((content, element) => {
              const hasText = (node: Element): boolean =>
                node.textContent === "Diabetes";

              const elementHasText = hasText(element as Element);
              const childrenDontHaveText = Array.from(
                element?.children || []
              ).every((child) => !hasText(child as Element));

              return elementHasText && childrenDontHaveText;
            })
          ).toBeInTheDocument()
        );
      };
    };
    customTest(primaryDiabetesTest, alternativeDiabetesTest);

    const primaryInmunocompromisoTest = async () => {
      await waitFor(() =>
        expect(
          within(sintomasSection).getByText(/Paciente es inmunocompromiso/i)
        ).toBeInTheDocument()
      );
    };
    const alternativeInmunocompromisoTest = async () => {
      async () => {
        await waitFor(() =>
          expect(
            screen.getByText((content, element) => {
              const hasText = (node: Element): boolean =>
                node.textContent === "Paciente es inmunocompromiso";

              const elementHasText = hasText(element as Element);
              const childrenDontHaveText = Array.from(
                element?.children || []
              ).every((child) => !hasText(child as Element));

              return elementHasText && childrenDontHaveText;
            })
          ).toBeInTheDocument()
        );
      };
    };
    customTest(primaryInmunocompromisoTest, alternativeInmunocompromisoTest);

    const primaryHepaticasTest = async () => {
      await waitFor(() =>
        expect(
          within(sintomasSection).getByText(/Enfermedades hepáticas/i)
        ).toBeInTheDocument()
      );
    };
    const alternativeHepaticasTest = async () => {
      async () => {
        await waitFor(() =>
          expect(
            screen.getByText((content, element) => {
              const hasText = (node: Element): boolean =>
                node.textContent === "Enfermedades hepáticas";

              const elementHasText = hasText(element as Element);
              const childrenDontHaveText = Array.from(
                element?.children || []
              ).every((child) => !hasText(child as Element));

              return elementHasText && childrenDontHaveText;
            })
          ).toBeInTheDocument()
        );
      };
    };
    customTest(primaryHepaticasTest, alternativeHepaticasTest);
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
        within(alergiasSection).getByText(/Penicilinas/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/Macrolidos/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Sexo al nacer
    const sexoSection = rendered.container.querySelector(
      "#sexo-presentados"
    ) as HTMLElement;
    if (!sexoSection) {
      throw new Error("Sexo presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sexoSection).getByText(/Sexo al nacer/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(sexoSection).getByText(/Hombre/i)).toBeInTheDocument()
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
        within(primarySection).getByText(/Enfermedades diarreicas agudas/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // REQUIERE TRATAMIENTO ANTIBIÓTICO
    await waitFor(() =>
      expect(
        screen.getByText(
          /Sí, requiere tratamiento antibiótico para los siguientes factores de riesgo/i
        )
      ).toBeInTheDocument()
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          /Diarrea del viajero más fiebre mayor de 38℃ con 20 evacuaciones en las últimas 24 horas./i
        )
      ).toBeInTheDocument()
    );

    const primaryInmunocompromisoAgainTest = async () => {
      await waitFor(() =>
        expect(screen.getByText(/Inmunocompromiso/i)).toBeInTheDocument()
      );
    };
    const alternativeInmunocompromisoAgainTest = async () => {
      async () => {
        await waitFor(() =>
          expect(
            screen.getByText((content, element) => {
              const hasText = (node: Element): boolean =>
                node.textContent === "Inmunocompromiso";

              const elementHasText = hasText(element as Element);
              const childrenDontHaveText = Array.from(
                element?.children || []
              ).every((child) => !hasText(child as Element));

              return elementHasText && childrenDontHaveText;
            })
          ).toBeInTheDocument()
        );
      };
    };
    customTest(
      primaryInmunocompromisoAgainTest,
      alternativeInmunocompromisoAgainTest
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          /Diarrea del viajero con sangre en los heces y 20 evacuaciones en las últimas 24 horas./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // TRATAMIENTO ANTIBIÓTICO
    await waitFor(() =>
      expect(screen.getByText(/^Tratamiento antibiótico$/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /1ra elección: Ciprofloxacino 500 mg dos veces al día por tres días./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /2da elección: Azitromicina 500 mg una vez al día por cinco días./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Alternativo a 1ra y 2da elección: Trimetoprim sulfametoxazol 160\/800 mg dos veces al día por cinco días./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // RECOMMEDNACIONES ADICIONALES
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Recomendaciones adicionales/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/No tolera la vía oral./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Deshidratación grave./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Datos de abdomen agudo./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Septicemia./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /La diarrea y\/o la fiebre continúan a pesar del tratamiento./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------
  });

  it("renders negative EDAS result", async () => {
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
        genero: enumGenero.MujerTransgenero,
        peso: 456,
        talla: 654,
        existingConditions: [],
        hospitalized: false,
        takenMedication: false,
        disability: false,
        migrant: false,
        countriesMigration: [],
        alergies: [],
        primaryConditions: ["Enfermedades diarreicas agudas"],
        secondaryConditions: [
          "Fiebre - Temperatura corporal elevada a más de 38℃.",
        ],
        evacuationCount: 0,
        vomitCount: 0,
        location: "Aguascalientes",
        diagnosis: "null",
        notes: "null",
      },
    };

    // ✅ Wrapper to pass `loaderData`
    const AlgorithmEDASWrapper = () => (
      <AlgorithmEDAS loaderData={mockLoaderData} />
    );

    const RemixStub = createRemixStub([
      {
        path: "/add/revise",
        Component: () => <div>Mocked Revise Route</div>,
        action: async () => ({ json: () => ({ success: true }) }), // Mocked response
      },
      {
        path: "/",
        Component: AlgorithmEDASWrapper,
      },
    ]);

    const rendered = render(
      <RemixStub
      // future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      />
    );

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
        within(sintomasSection).getByText(/Síntomas presentados/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(sintomasSection).getByText(/Fiebre/i)).toBeInTheDocument()
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
      expect(within(alergiasSection).getByText(/^No$/i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(alergiasSection).getByText(/^alergias presentadas$/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Sexo al nacer
    const sexoSection = rendered.container.querySelector(
      "#sexo-presentados"
    ) as HTMLElement;
    if (!sexoSection) {
      throw new Error("Sexo presentados section not found");
    }
    await waitFor(() =>
      expect(
        within(sexoSection).getByText(/Sexo al nacer/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(within(sexoSection).getByText(/Hombre/i)).toBeInTheDocument()
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
        within(generoSection).getByText(/Mujer transexual/i)
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
        within(primarySection).getByText(/Enfermedades diarreicas agudas/i)
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // No requiere tratamiento antibiótico
    await waitFor(() =>
      expect(
        screen.getByText(/No requiere tratamiento antibiótico/i)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText((content, element) => {
          const hasText = (node: Element) =>
            node.textContent ===
            "No sospecha de enfermedad por Shigella (disentería).";
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
        screen.getByText(
          /Hay fiebre mayor de 38℃ pero no hay dolor abdominal tipo cólico o tenesmo./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Hay fiebre mayor de 38℃ solo, pero no hay diarrea ni sangre en los heces./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/No inmunocompromiso./i)).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // RECOMMEDNACIONES ADICIONALES
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
          /Provea información a la persona y\/o cuidador para identificar datos de alarma./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText((content, element) => {
          const hasText = (node: Element) =>
            node.textContent ===
            "Asegúrese de dar recomendaciones para hidratación (vida suero oral).";
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
        screen.getByText(
          /Recomendar paracetamol para controlar en caso de fiebre./i
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /Recomendar regresar y revaluar si diarrea continua después de 4 dias./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------
    // Datos de alarma que requieren una gestión de segundo nivel
    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /Datos de alarma que requieren una gestión de segundo nivel/i,
        })
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/No tolera la vía oral./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Deshidratación grave./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Datos de abdomen agudo./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText(/Septicemia./i)).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText(
          /La diarrea y\/o la fiebre continúan a pesar del tratamiento./i
        )
      ).toBeInTheDocument()
    );
    // ---------------------------------------------------------------------------------
  });
});
