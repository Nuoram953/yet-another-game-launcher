import { DataRoute } from "@common/constant";
import { create } from "zustand";

interface ElectronState {
  events: Record<string, any>;
  setEvent: (eventName: string, payload: any) => void;
}

export const useElectronStore = create<ElectronState>((set) => ({
  events: {},
  setEvent: (eventName, payload) => set((state) => ({ events: { ...state.events, [eventName]: payload } })),
}));

if (typeof window !== "undefined" && window.data?.on) {
  const handleEvent = (eventName: string) => (payload: any) => {
    useElectronStore.getState().setEvent(eventName, payload);
  };

  Object.values(DataRoute).forEach((eventName) => {
    window.data.on(eventName, handleEvent(eventName));
  });
}
