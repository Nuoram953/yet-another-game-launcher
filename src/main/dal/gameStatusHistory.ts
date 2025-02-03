import { prisma } from "..";

export async function create(gameId: string, statusId:number) {
  await prisma.gameStatusHistory.create({
    data: {
      gameId: gameId,
      gameStatusId: statusId,
    },
  });
}
