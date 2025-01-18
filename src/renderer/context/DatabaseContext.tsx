import { Game } from '@prisma/client';
import React, { createContext, useContext, useState, useCallback } from 'react';


// Define filter types
export interface GameFilters {
  search: string;
  genre: string;
  platform: string;
  minRating: number;
}

// Define sort configuration type
export interface SortConfig {
  field: keyof Game;
  direction: 'asc' | 'desc';
}

// Define the context value type
interface GamesContextValue {
  games: Game[];
  loading: boolean;
  error: string | null;
  filters: GameFilters;
  sortConfig: SortConfig;
  updateFilters: (newFilters: Partial<GameFilters>) => void;
  updateSort: (field: keyof Game) => void;
  refreshGames: () => Promise<void>;
}

// Define provider props type
interface GamesProviderProps {
  children: React.ReactNode;
}

// Create the context with an undefined initial value
const GamesContext = createContext<GamesContextValue | undefined>(undefined);

// Custom hook to use the games context with type safety
export const useGames = (): GamesContextValue => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GameFilters>({
    search: '',
    genre: '',
    platform: '',
    minRating: 0,
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'title',
    direction: 'asc',
  });

  // Function to fetch games with sort and filter params
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await window.database.getGames({
        filters,
        sort:sortConfig
      });
      setGames(response as Game[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig]);

  // Update filters with type safety
  const updateFilters = useCallback((newFilters: Partial<GameFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update sort with type safety
  const updateSort = useCallback((field: keyof Game) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  React.useEffect(() => {
    fetchGames();
  }, [filters, sortConfig, fetchGames]);

  const value: GamesContextValue = {
    games,
    loading,
    error,
    filters,
    sortConfig,
    updateFilters,
    updateSort,
    refreshGames: fetchGames,
  };

  return (
    <GamesContext.Provider value={value}>
      {children}
    </GamesContext.Provider>
  );
};
