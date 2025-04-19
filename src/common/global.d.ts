import type {
  Company,
  DownloadHistory,
  Game,
  GameConfigGamescope,
  GameReview,
  GameStatus,
  Ranking,
  RankingGame,
  Storefront,
  Tag,
} from "@prisma/client";
import type {
  FilterConfig,
  GameWithRelations,
  RankingWithRelation,
  SortConfig,
} from "./types";
declare global {
  interface Window {
    notifications: {
      send: (notification: any) => void;
      onReceive: (callback: (data: any) => void) => void;
      removeListener: () => void;
    };
    store: {
      launch: (storeName: string) => Promise<void>;
    };
    appControl: {
      onAppBlur: (callback: () => void) => void;
      onAppFocus: (callback: () => void) => void;
    };
    media: {
      getAllMedia: (gameId: string) => Promise<{
        backgrounds: string[];
        icons: string[];
        logos: string[];
        covers: string[];
        trailers: string[];
      }>;
      getBackgrounds: (gameId: string, count?: number) => Promise<string[]>;
      getRecentlyPlayedBackgrounds: (count: number) => Promise<string[]>;
      getLogos: (gameId: string, count?: number) => Promise<string[]>;
      getIcons: (gameId: string, count?: number) => Promise<string[]>;
      getCovers: (gameId: string, count?: number) => Promise<string[]>;
      getTrailers: (gameId: string, count?: number) => Promise<string[]>;
      getAchievements: (gameId: string, count?: number) => Promise<string[]>;
      getScreenshots: (gameId: string, count?: number) => Promise<string[]>;
    };
    ranking: {
      getRanking: (id: number) => Promise<RankingWithRelation>;
      getAll: () => Promise<RankingWithRelation[]>;
      create: (name: string, maxItems: number) => Promise<RankingWithRelation>;
      delete: (id: number) => Promise<void>;
      edit: (data: Partial<RankingGame>) => Promise<void>;
      removeGameFromRanking: (
        rankingId: number,
        gameId: string,
      ) => Promise<void>;
    };
    library: {
      refresh: () => Promise<void>;
      getGame: (id: string) => Promise<GameWithRelations>;
      getGames: (
        filters?: FilterConfig,
        sort?: SortConfig,
      ) => Promise<GameWithRelations[]>;
      getLastPlayed: (max: number) => Promise<Game[]>;
      getCountForAllStatus: () => Promise<
        { id: number; name: string; count: number }[]
      >;

      getStatus: () => Promise<GameStatus[]>;
      getDownloadHistory: () => Promise<DownloadHistory[]>;
      getStorefronts: () => Promise<Storefront[]>;
      getFilters: () => Promise<{
        companies: Company[];
        tags: Tag[];
        status: GameStatus[];
      }>;
    };
    game: {
      launch: (id: string) => Promise<void>;
      install: (id: string) => Promise<void>;
      uninstall: (id: string) => Promise<void>;
      kill: (id: string) => Promise<void>;
      setReview: (data: Partial<GameReview>) => Promise<void>;
      setStatus: (data: Partial<Game>) => Promise<void>;
      setGamescope: (data: GameConfigGamescope) => Promise<void>;
      refreshProgressTracker: (id: string) => Promise<void>;
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
