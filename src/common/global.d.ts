import type {
    Company,
  DownloadHistory,
  Game,
  GameConfigGamescope,
  GameReview,
  GameStatus,
  Storefront,
  Tag,
} from "@prisma/client";
import type { FilterConfig, GameWithRelations, SortConfig } from "./types";
declare global {
  interface Window {
    media: {
      getAllMedia: (gameId: string) => Promise<object>;
      getBackgrounds: (gameId: string, count?: number) => Promise<string[]>;
      getRecentlyPlayedBackgrounds: (count: number) => Promise<string[]>;
      getLogos: (gameId: string, count?: number) => Promise<string[]>;
      getIcons: (gameId: string, count?: number) => Promise<string[]>;
      getCovers: (gameId: string, count?: number) => Promise<string[]>;
      getTrailers: (gameId: string, count?: number) => Promise<string[]>;
      getAchievements: (gameId: string, count?: number) => Promise<string[]>;
      getScreenshots: (gameId: string, count?: number) => Promise<string[]>;
    };
    library: {
      refresh: () => Promise<void>;
      getGame: (id: string) => Promise<GameWithRelations>;
      getGames: (filters?: FilterConfig, sort?: SortConfig) => Promise<GameWithRelations[]>;
      getLastPlayed: (max: number) => Promise<Game[]>;
      getCountForAllStatus: () => Promise<object[]>;
      getStatus: () => Promise<GameStatus[]>;
      getDownloadHistory: () => Promise<DownloadHistory[]>;
      getStorefronts: () => Promise<Storefront[]>;
      getFilters: () => Promise<{companies:Company[], tags:Tag[], status:GameStatus[]}>;
    };
    game: {
      launch: (id: string) => Promise<void>;
      install: (id: string) => Promise<void>;
      uninstall: (id: string) => Promise<void>;
      kill: (id: string) => Promise<void>;
      setReview: (data: Partial<GameReview>) => Promise<void>;
      setStatus: (data: Partial<Game>) => Promise<void>;
      setGamescope: (data: GameConfigGamescope) => Promise<void>;
    };
    data: {
      on: (
        channel: string,
        callback: (data: any) => void,
      ) => (event: any, payload: any) => void;
      off: (channel: string, callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
      subscribe: (channel: string, interval?: number) => Promise<void>;
      unsubscribe: (channel: string) => Promise<void>;
    };
  }
}
