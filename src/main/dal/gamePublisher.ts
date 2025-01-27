import { prisma } from "..";
import queries from "./dal";

export async function findOrCreate(gameId: string, name: string) {
  const company = await queries.Company.findOrCreate(name);

  await prisma.gamePublisher.upsert({
    where: {
      gameId_companyId: {
        gameId: gameId,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      gameId: gameId,
      companyId: company.id,
    },
  });
}
