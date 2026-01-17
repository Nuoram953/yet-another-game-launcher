import { prisma } from "..";
import queries from "./dal";

export async function findOrCreate(gameId: string, name: string) {
  const franchise = await queries.Franchise.findOrCreate(name);

  await prisma.gameFranchise.upsert({
    where: {
      gameId_franchiseId: {
        gameId: gameId,
        franchiseId: franchise.id,
      },
    },
    update: {},
    create: {
      gameId: gameId,
      franchiseId: franchise.id,
    },
  });
}
