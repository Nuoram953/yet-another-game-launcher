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
  DownloadStats,
  FilterConfig,
  GameWithRelations,
  SortConfig,
} from "../../common/types";
import { DataRoute, RouteDownload } from "../../common/constant";

interface GamesContextValue {
  games: Game[];
  downloading: DownloadStats[];
  running: { id: string; time: number }[];
  loading: boolean;
  error: string | null;
  filters: FilterConfig;
  sortConfig: SortConfig;
  updateFilters: (newFilters: Partial<FilterConfig>) => void;
  updateSort: (newSort: SortConfig) => void;
  refreshGames: () => Promise<void>;
  selectedGame: GameWithRelations | null;
  updateSelectedGame: (game: GameWithRelations | null) => Promise<void>;
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
  const [downloading, setDownloading] = useState<DownloadStats[]>([]);
  const [running, setRunning] = useState<{ id: string; time: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterConfig | {}>({});
  const [sort, setSortConfig] = useState<SortConfig>({
    field: "lastTimePlayed",
    direction: "desc",
  });
  const [selectedGame, setSelectedGame] = useState<GameWithRelations | null>(
    null,
  );

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await window.library.getGames(filters, sort);

      setGames(response);

      if (selectedGame != null) {
        const game = response.find((game) => game.id === selectedGame.id);
        if (game) {
          setSelectedGame(game);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  const updateFilters = useCallback((newFilters: Partial<FilterConfig>) => {
    setFilters((prev) => {
      const combinedFilters = { ...prev, ...newFilters };

      const cleanedFilters = Object.fromEntries(
        Object.entries(combinedFilters).filter(([_, value]) => {
          return !(Array.isArray(value) && value.length === 0);
        }),
      );

      return cleanedFilters;
    });
  }, []);

  const updateSelectedGame = useCallback(
    async (game: GameWithRelations | null) => {
      setSelectedGame(game);
    },
    [],
  );

  const updateSort = useCallback((newSort: SortConfig) => {
    setSortConfig(newSort);
  }, []);

  React.useEffect(() => {
    fetchGames();
  }, [filters, sort]);

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

    window.data.on(
      RouteDownload.ON_DOWNLOAD_STATUS,
      (payload: { data: DownloadStats }) => {
        setDownloading((prevData) => {
          const exists = prevData.some((item) => item.id === payload.data.id);

          if (exists) {
            return prevData.map((item) =>
              item.id === payload.data.id ? { ...item, ...payload.data } : item,
            );
          } else {
            return [...prevData, payload.data];
          }
        });
      },
    );

    window.data.on(
      RouteDownload.ON_DOWNLOAD_STOP,
      (payload: { data: { id: string } }) => {
        setDownloading((prevData) =>
          prevData.filter((item) => item.id !== payload.data.id),
        );
      },
    );

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
    downloading,
    loading,
    error,
    filters,
    sortConfig: sort,
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
