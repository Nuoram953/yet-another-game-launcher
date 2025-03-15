import { Company } from "@prisma/client";
import { prisma } from "..";
import queries from "./dal";

export async function findOrCreate(gameId: string, data:Partial<Company>) {
  const company = await queries.Company.findOrCreate(data);

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
