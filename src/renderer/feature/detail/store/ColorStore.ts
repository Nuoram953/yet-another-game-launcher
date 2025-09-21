import { create } from "zustand";

interface ColorStore {
  color: string;
  setColor: (color: string) => void;
  theme: {
    text: string;
    subtleText: string;
    foreground: string;
    background: string;
    border: string;
    isDark: boolean;
  };
  setTheme: (theme: {
    text: string;
    subtleText: string;
    foreground: string;
    background: string;
    border: string;
    isDark: boolean;
  }) => void;
}

const useColorStore = create<ColorStore>((set, get, store) => ({
  color: null,
  setColor: (color) => set({ color }),
  theme: {
    text: "",
    subtleText: "",
    foreground: "",
    background: "",
    border: "",
    isDark: false,
  },
  setTheme: (theme) => set({ theme }),
}));

export default useColorStore;
