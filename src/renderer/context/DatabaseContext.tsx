import { Game, Prisma } from "@prisma/client";
import _ from "lodash";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  FilterConfig,
  GameWithRelations,
  SortConfig,
} from "../../common/types";
import { DataRoute } from "../../common/constant";

interface GamesContextValue {
  games: Game[];
  running: { id: string; time: number }[];
  loading: boolean;
  error: string | null;
  filters: FilterConfig | {};
  sortConfig: SortConfig | {};
  updateFilters: (newFilters: Partial<FilterConfig>) => void;
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
  const [running, setRunning] = useState<{ id: string; time: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterConfig | {}>({});
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

  const updateFilters = useCallback((newFilters: Partial<FilterConfig>) => {
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
  }, [filters, sortConfig]);

  React.useEffect(() => {
    window.data.on(DataRoute.REQUEST_GAMES, (payload) => {
      fetchGames();
    });

    window.data.on(DataRoute.REQUEST_GAME, (payload) => {
      setSelectedGame(payload.data);
    });

    window.data.on(DataRoute.RUNNING_GAME, (payload) => {
      if (payload.data.isRunning) {
        setRunning((prevItems) => [
          ...prevItems,
          { id: payload.data.id, time: 0 },
        ]);
      } else {
        setRunning((prevItems) =>
          prevItems.filter((item) => item.id !== payload.data.id),
        );
      }
    });

    window.electron.on("steam-download-1931730", (payload: DataPayload) => {
      console.log(payload.data)
    });

    return () => {
      window.data.removeAllListeners(DataRoute.REQUEST_GAME);
      window.data.removeAllListeners(DataRoute.REQUEST_GAMES);
      window.data.removeAllListeners(DataRoute.RUNNING_GAME);
    };
  }, []);

  useEffect(() => {
    fetchGames();
    window.library.refresh();
  }, []);

  const value: GamesContextValue = {
    games,
    running,
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
