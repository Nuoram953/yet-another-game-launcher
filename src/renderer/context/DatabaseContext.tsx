import { Game, Prisma } from "@prisma/client";
import _ from "lodash";
import React, { createContext, useContext, useState, useCallback } from "react";

export interface GameFilters {
  gameStatusId:number|null;
}

export interface SortConfig {
  field: keyof Game;
  direction: "asc" | "desc";
}

interface GamesContextValue {
  games: Game[];
  gameRunning: object;
  loading: boolean;
  error: string | null;
  filters: GameFilters;
  sortConfig: SortConfig;
  updateFilters: (newFilters: Partial<GameFilters>) => void;
  updateSort: (field: keyof Game) => void;
  refreshGames: () => Promise<void>;
  selectedGame: Prisma.GameGetPayload<{
    include: {
      gameStatus: true;
      storefront: true;
      achievements: true;
      activities: true;
      developers: {
        include: {
          company: true;
        };
      };
      publishers: {
        include: {
          company: true;
        };
      };
      tags: {
        include: {
          tag: true;
        };
      };
    };
  }>;
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
  const [filters, setFilters] = useState<GameFilters>({
    gameStatusId:null
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.database.getGames({
        filters,
        sort: sortConfig,
      });

      const updatedGames = response.map((newGame) => {
        const existingGame = games.find((g) => g.id === newGame.id);
        if (existingGame && _.isEqual(existingGame, newGame)) {
          return existingGame;
        }
        return newGame;
      });

      setGames(updatedGames);

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

  const updateFilters = useCallback((newFilters: Partial<GameFilters>) => {
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
    window.api.onReceiveFromMain("request:games", (data) => {
      fetchGames();
    });

    window.api.onReceiveFromMain("request:game", (game) => {
      setSelectedGame(game);
    });

    return () => {
      window.api.removeListener("request:games");
      window.api.removeListener("request:game");
    };
  }, []);

  React.useEffect(() => {
    window.api.onReceiveFromMain(
      "is-game-running",
      (data: { isRunning: boolean }) => {
        console.log(`is running? : ${data.isRunning}`);
        setGameRunning(data);
      },
    );

    return () => {
      window.api.removeListener("is-game-running");
    };
  }, []);

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
