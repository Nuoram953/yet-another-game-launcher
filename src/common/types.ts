import { Game, Prisma } from "@prisma/client";

export type GameWithRelations = Prisma.GameGetPayload<{
  include: {
    gameStatus: true;
    storefront: true;
    achievements: true;
    activities: true;
    developers: { include: { company: true } };
    publishers: { include: { company: true } };
    tags: { include: { tag: true } };
    review: true
    gamescope:true
    downloadHistory:true
    statusHistory: {include: {gameStatus:true}}
  };
}>;

export interface FilterConfig {
  gameStatusId?: keyof Game;
  developpers?: {value:string, label:string}[]
  publishers?: {value:string, label:string}[]
}

export interface SortConfig extends Partial<GameWithRelations> {
  field: keyof Game;
  direction: "asc" | "desc";
}

export interface DownloadStats {
  id:string,
  progress: number;
  speed: number;
  timeRemaining: number;
  downloadedBytes: number;
  totalBytes: number;
}
