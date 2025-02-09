import { Game, Prisma } from "@prisma/client";
import _ from "lodash";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { FiltersConfig, GameWithRelations, SortConfig } from "../../common/types";

interface GamesContextValue {
  games: Game[];
  gameRunning: object;
  loading: boolean;
  error: string | null;
  filters: FiltersConfig | {};
  sortConfig: SortConfig | {};
  updateFilters: (newFilters: Partial<FiltersConfig>) => void;
  updateSort: (field: keyof Game) => void;
  refreshGames: () => Promise<void>;
  selectedGame: GameWithRelations | null;
  updateSelectedGame: (game: Game | null) => Promise<void>;
}

interface GamesProviderProps {
  children: React.ReactNode;
}

const GamesContext = createContext<GamesContextValue | undefined>(undefined);

export const useGames = (): GamesContextValue => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGames must be used within a GamesProvider");
  }
  return context;
};

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [gameRunning, setGameRunning] = useState<object>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersConfig | {}>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | {}>({});
  const [selectedGame, setSelectedGame] = useState<GameWithRelations | null>(
    null,
  );

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.library.getGames({
        filters,
        sort: sortConfig,
      });

      setGames(response);

      if (selectedGame != null) {
        const game = response.find((game) => game.id === selectedGame.id);
        setSelectedGame(game);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig]);

  const updateFilters = useCallback((newFilters: Partial<FiltersConfig>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateSelectedGame = useCallback(async (game: Game | null) => {
    setSelectedGame(game);
  }, []);

  const updateSort = useCallback((field: keyof Game) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  React.useEffect(() => {
    fetchGames();
  }, [filters, sortConfig, fetchGames]);

  React.useEffect(() => {
    window.data.on("request:games", (payload) => {
      fetchGames();
    });

    window.api.onReceiveFromMain("request:game", (game) => {
      setSelectedGame(game);
    });

    window.api.onReceiveFromMain(
      "is-game-running",
      (data: { isRunning: boolean }) => {
        setGameRunning(data);
      },
    );

    return () => {
      window.api.removeListener("request:games");
      window.api.removeListener("request:game");
      window.api.removeListener("is-game-running");
    };
  }, []);

  useEffect(()=>{
    fetchGames();
    window.library.refresh();
  },[])

  const value: GamesContextValue = {
    games,
    gameRunning,
    loading,
    error,
    filters,
    sortConfig,
    updateFilters,
    updateSort,
    refreshGames: fetchGames,
    selectedGame,
    updateSelectedGame,
  };

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
};
