import { STORAGE_DEPENSES_KEY } from "@/constants/storage";
import { BudgetState } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const useBudgetStore = create<BudgetState>((set, get) => ({
  devise: "Ar",
  budgetJournalier: 30000 / 30,
  budgetMensuel: 300000,

  depenses: [],

  hydrate: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_DEPENSES_KEY);

    if (stored) {
      set({ depenses: JSON.parse(stored) });
    }
  },

  setBudget: (b) => set({ budgetMensuel: b }),

  addDepense: async (d) => {
    const state = get();

    const updated = [d, ...state.depenses];

    set({ depenses: updated });

    await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(updated));
  },

  removeDepense: async (id: string) => {
    const state = get();

    const updated = state.depenses.filter((d) => d.id !== id);

    set({ depenses: updated });

    await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(updated));
  },

  removeAllDepenses: async () => {
    set({ depenses: [] });

    await AsyncStorage.removeItem(STORAGE_DEPENSES_KEY);
  },

}));