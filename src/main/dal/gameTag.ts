import { GameTag } from "@prisma/client";
import { prisma } from "..";
import queries from "./dal";

export async function findOrCreate(gameId: string, name: string, type: Partial<GameTag>) {
  const tag = await queries.Tag.findOrCreate(name);

  await prisma.gameTag.upsert({
    where: {
      gameId_tagId: {
        gameId: gameId,
        tagId: tag.id,
      },
    },
    update: {},
    create: {
      gameId: gameId,
      tagId: tag.id,
      ...type
    },
  });
}
