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

export type RankingWithRelation = Prisma.RankingGetPayload<{
  include: {
    rankings: true;
  };
}>;

export interface FilterConfig {
  gameStatusId?: number;
  developpers?: {value:string, label:string}[]
  publishers?: {value:string, label:string}[]
  tags?: {value:string, label:string}[]
  status?: {value:number, label:string}[]
}

export interface SortConfig extends Partial<GameWithRelations> {
  field: keyof Game;
  direction: "asc" | "desc";
  label?: string
}

export interface DownloadStats {
  id:string,
  progress: number;
  speed: number;
  timeRemaining: number;
  downloadedBytes: number;
  totalBytes: number;
}
