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
  };
}>;

export interface FilterConfig {
  gameStatusId?: keyof Game;
}

export interface SortConfig extends Partial<GameWithRelations> {
  field: keyof Game;
  direction: "asc" | "desc";
}
