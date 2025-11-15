import { create } from "zustand";

interface SidebarStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const useSidebarStore = create<SidebarStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export default useSidebarStore;
