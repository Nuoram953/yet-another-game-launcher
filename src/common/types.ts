import { Game, Prisma } from "@prisma/client";

export enum LaunchType {
  STOREFRONT = "storefront",
  APP = "app",
  EMULATOR = "emulator",
}

export type GameWithRelations = Prisma.GameGetPayload<{
  include: {
    gameStatus: true;
    storefront: true;
    achievements: true;
    activities: true;
    developers: { include: { company: true } };
    publishers: { include: { company: true } };
    tags: { include: { tag: true } };
    franchises: { include: { franchise: true } };
    review: true;
    reviewToughts: true;
    gamescope: true;
    downloadHistory: true;
    statusHistory: { include: { gameStatus: true } };
    externalReviewMap: { include: { externalReview: true } };
    platform: { include: { platform: true } };
    launchApp: true;
    launchStorefront: { include: { storefront: true } };
    launchEmulation: { include: { emulator: true } };
  };
}>;

export type RankingWithRelation = Prisma.RankingGetPayload<{
  include: {
    rankings: true;
  };
}>;

export interface FilterConfig {
  selectedPreset: { value: string; label: string } | null;
  gameStatusId?: number;
  developpers?: { value: string; label: string }[];
  publishers?: { value: string; label: string }[];
  tags?: { value: string; label: string }[];
  storefronts?: { value: string; label: string }[];
  status?: { value: string; label: string }[];
  isInstalled?: boolean | "indeterminate";
  isFavorite?: boolean | "indeterminate";
  timePlayed?: { value: string; label: string }[];
  mainStory?: { value: string; label: string }[];
  hasActiveFilters?: boolean;
  dateAdded?: { value: string; label: string }[];
  lastTimePlayed?: { value: string; label: string }[];
}

export interface SortConfig extends Partial<GameWithRelations> {
  field: keyof Game;
  direction: "asc" | "desc";
  label?: string;
}

export interface DownloadStats {
  id: string;
  progress: number;
  speed: number;
  timeRemaining: number;
  downloadedBytes: number;
  totalBytes: number;
}

export interface SidebarData {
  storefronts?: SidebarStorefrontsData[];
  status?: SidebarStatusData[];
  platforms?: SidebarPlatformsData[];
}

export interface SidebarStorefrontsData {
  id: number;
  name: string;
  count?: number;
  web?: string;
  hasExecutable: boolean;
}
export interface SidebarStatusData {
  id: number;
  name: string;
  count?: number;
}
export interface SidebarPlatformsData {
  id: number;
  name: string;
  count?: number;
}
