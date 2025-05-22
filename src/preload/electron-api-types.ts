import type {
  Company,
  DownloadHistory,
  FilterPreset,
  Game,
  GameConfigGamescope,
  GameReview,
  GameStatus,
  RankingGame,
  Storefront,
  Tag,
} from "@prisma/client";
import type { FilterConfig, GameWithRelations, RankingWithRelation, SortConfig } from "../common/types";
import { AppConfig } from "../common/interface";
import { PathsToProperties } from "../main/manager/configManager";
import { MEDIA_TYPE } from "../common/constant";

export interface ConfigAPI {
  get: (key: PathsToProperties<AppConfig>) => Promise<any>;
  set: (key: PathsToProperties<AppConfig>, value: any) => Promise<void>;
  getAll: () => Promise<AppConfig>;
}

export interface NotificationsAPI {
  send: (notification: any) => void;
  onReceive: (callback: (data: any) => void) => void;
  removeListener: () => void;
}

export interface StoreAPI {
  launch: (storeName: string) => Promise<void>;
}

export interface AppControlAPI {
  onAppBlur: (callback: () => void) => void;
  onAppFocus: (callback: () => void) => void;
}

export interface MediaAPI {
  getAllMedia: (gameId: string) => Promise<{
    backgrounds: {
      default: string | null;
      all: string[];
    };
    icons: {
      default: string | null;
      all: string[];
    };
    logos: {
      default: string | null;
      all: string[];
    };
    covers: {
      default: string | null;
      all: string[];
    };
    trailers: {
      default: string | null;
      all: string[];
    };
    screenshots: {
      default: string | null;
      all: string[];
    };
  }>;
  getBackgrounds: (gameId: string, count?: number) => Promise<string[]>;
  getRecentlyPlayedBackgrounds: (count: number) => Promise<string[]>;
  getLogos: (gameId: string, count?: number) => Promise<string[]>;
  getIcons: (gameId: string, count?: number) => Promise<string[]>;
  getCovers: (gameId: string, count?: number) => Promise<string[]>;
  getTrailers: (gameId: string, count?: number) => Promise<string[]>;
  getAchievements: (gameId: string, count?: number) => Promise<string[]>;
  getScreenshots: (gameId: string, count?: number) => Promise<string[]>;
  delete: (gameId: string, mediaType: string, mediaId: string) => Promise<void>;
  search: (gameId: string, mediaType: MEDIA_TYPE, page: number) => Promise<string[]>;
  downloadByUrl: (gameId: string, mediaType: MEDIA_TYPE, url: string) => Promise<void>;
  setDefault: (gameId: string, mediaType: MEDIA_TYPE, name: string) => Promise<void>;
  removeDefault: (gameId: string, mediaType: MEDIA_TYPE) => Promise<void>;
}

export interface RankingAPI {
  getRanking: (id: number) => Promise<RankingWithRelation>;
  getAll: () => Promise<RankingWithRelation[]>;
  create: (name: string, maxItems: number) => Promise<RankingWithRelation>;
  delete: (id: number) => Promise<void>;
  edit: (data: Partial<RankingGame>) => Promise<void>;
  removeGameFromRanking: (rankingId: number, gameId: string) => Promise<void>;
}

export interface LibraryAPI {
  refresh: () => Promise<void>;
  getGame: (id: string) => Promise<GameWithRelations>;
  getGames: (filters?: FilterConfig, sort?: SortConfig) => Promise<GameWithRelations[]>;
  getLastPlayed: (max: number) => Promise<GameWithRelations[]>;
  getCountForAllStatus: () => Promise<{ id: number; name: string; count: number }[]>;
  getStatus: () => Promise<GameStatus[]>;
  getDownloadHistory: () => Promise<DownloadHistory[]>;
  getStorefronts: () => Promise<Storefront[]>;
  getFilters: () => Promise<{
    presets: FilterPreset[];
    companies: Company[];
    tags: Tag[];
    status: GameStatus[];
    storefronts: Storefront[];
  }>;
  setFilterPreset: (data: Partial<FilterPreset>) => Promise<void>;
  deleteFilterPreset: (name: string) => Promise<void>;
}

export interface GameAPI {
  launch: (id: string) => Promise<void>;
  install: (id: string) => Promise<void>;
  uninstall: (id: string) => Promise<void>;
  kill: (id: string) => Promise<void>;
  setReview: (data: Partial<GameReview>) => Promise<void>;
  setStatus: (data: Partial<Game>) => Promise<void>;
  setGamescope: (data: GameConfigGamescope) => Promise<void>;
  setFavorite: (data: Partial<Game>) => Promise<void>;
  refreshProgressTracker: (id: string) => Promise<void>;
}

export interface DataAPI {
  on: (channel: string, callback: (data: any) => void) => (event: any, payload: any) => void;
  off: (channel: string, callback: (data: any) => void) => void;
  removeAllListeners: (channel: string) => void;
  subscribe: (channel: string, interval?: number) => Promise<void>;
  unsubscribe: (channel: string) => Promise<void>;
}

export interface ElectronAPI {
  config: ConfigAPI;
  notifications: NotificationsAPI;
  store: StoreAPI;
  appControl: AppControlAPI;
  media: MediaAPI;
  ranking: RankingAPI;
  library: LibraryAPI;
  game: GameAPI;
  data: DataAPI;
}
