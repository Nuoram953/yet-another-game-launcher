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
      startedAt: parseInt((new Date().getTime()).toFixed(0)),
      endedAt: parseInt((new Date().getTime()).toFixed(0)),
      duration: await getMinutesBetween(startedAt, endedAt),
    },
  });
}
