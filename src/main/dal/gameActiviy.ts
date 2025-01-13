import { prisma } from "..";
import { getMinutesBetween } from "../utils/utils";

export async function createGameActiviy(
  gameId: string,
  startedAt: Date,
  endedAt: Date,
) {
  await prisma.gameActivity.create({
    data: {
      gameId: gameId,
      startedAt: new Date(startedAt).getTime(),
      endedAt: new Date(endedAt).getTime(),
      duration: await getMinutesBetween(startedAt, endedAt),
    },
  });
}
