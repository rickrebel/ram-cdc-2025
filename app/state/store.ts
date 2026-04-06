// A store in Zustand is essentially the place where you store your state and any functions that
// update that state. Your components can then access the store and access the values and functions
// that use and update the state.
import { create } from "zustand";

export type PrimaryCondition = {
  id: number;
  enabled: boolean;
  name: string;
  detail: string;
};

type PrimaryConditionStore = {
  primaryConditions: PrimaryCondition[];
  setPrimaryConditions: (primaryConditions: PrimaryCondition[]) => void;
  handlePrimaryConditionChange: (id: number) => void;
};

export const usePrimaryConditionStore = create<PrimaryConditionStore>(
  (set) => ({
    primaryConditions: [
      {
        id: 1,
        enabled: false,
        name: "IVU",
        detail: "Infección del tracto urinario",
      },
      {
        id: 2,
        enabled: false,
        name: "ITS",
        detail: "Infecciones de transmisión sexual",
      },
      {
        id: 3,
        enabled: false,
        name: "IRAS",
        detail: "Infecciones del aparato respiratorio superior",
      },
      {
        id: 4,
        enabled: false,
        name: "EDAS",
        detail: "Enfermedades diarreicas agudas",
      },
    ],
    setPrimaryConditions: (primaryConditions) => set({ primaryConditions }),
    handlePrimaryConditionChange: (id) =>
      set((state) => {
        const updatedPrimaryConditions = state.primaryConditions.map(
          (primaryCondition) => {
            if (primaryCondition.id === id) {
              return { ...primaryCondition, enabled: true };
            } else {
              return { ...primaryCondition, enabled: false };
            }
          }
        );

        return { primaryConditions: updatedPrimaryConditions };
      }),
  })
);

type ClinicalIDStore = {
  clinicosID: string;
  setClinicalID: (id: string) => void;
};

export const useClinicalIDStore = create<ClinicalIDStore>((set) => ({
  clinicosID: "",
  setClinicalID: (clinicosID) => set({ clinicosID }),
}));

type ContactoIDStore = {
  contactoID: string;
  setContactoID: (id: string) => void;
};

export const useContactoIDStore = create<ContactoIDStore>((set) => ({
  contactoID: "",
  setContactoID: (contactoID) => set({ contactoID }),
}));

type OtrosIDStore = {
  otrosID: string;
  setOtrosID: (id: string) => void;
};

export const useOtrosIDStore = create<OtrosIDStore>((set) => ({
  otrosID: "",
  setOtrosID: (otrosID) => set({ otrosID }),
}));

type OcupacionIDStore = {
  ocupacionID: string;
  setOcupacionID: (id: string) => void;
};

export const useOcupacionIDStore = create<OcupacionIDStore>((set) => ({
  ocupacionID: "",
  setOcupacionID: (ocupacionID) => set({ ocupacionID }),
}));

type VisitationIDStore = {
  visitationID: string;
  setVisitationID: (visitationID: string) => void;
};

export const useVisitationIDStore = create<VisitationIDStore>((set) => ({
  visitationID: "",
  setVisitationID: (visitationID) => set({ visitationID }),
}));
