import { DataRoute } from "@common/constant";
import { GameWithRelations } from "@common/types";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

interface GameStore {
  game: GameWithRelations;
  setGame: (game: GameWithRelations) => void;
  reset: () => void;
  subscribeToGame: () => void;
}

const useGameStore = create<GameStore>((set, get, store) => ({
  game: null,
  setGame: (game) => set({ game }),
  reset: () => {
    set(store.getInitialState());
  },
  subscribeToGame: () => {
    window.data.on(DataRoute.REQUEST_GAME, (payload: { data: any }) => {
      set({ game: payload.data });
    });
  },
}));

export default useGameStore;
