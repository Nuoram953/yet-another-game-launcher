import { prisma } from "..";
import { RankingWithRelation } from "src/common/types";

export async function findAll(): Promise<RankingWithRelation[]> {
  return await prisma.ranking.findMany({
    where: { rankingStatusId: { not: 4 } },
    include: { rankings: { orderBy: { rank: "asc" } } },
  });
}

export async function findById(
  id: number,
): Promise<RankingWithRelation | null> {
  return await prisma.ranking.findUnique({
    where: { id },
    include: { rankings: { orderBy: { rank: "asc" } } },
  });
}

export async function insert(name: string, maxItems: number) {
  return await prisma.ranking.create({
    data: { name, maxItems, rankingStatusId: 1 },
  });
}

export async function destroy(id: number) {
  return await prisma.ranking.update({
    data: { rankingStatusId: 4 },
    where: { id },
  });
}
