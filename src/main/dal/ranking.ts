import { Ranking } from "@prisma/client";
import { prisma } from "..";
import { RankingWithRelation } from "src/common/types";

export async function findAll(): Promise<RankingWithRelation[]> {
  return await prisma.ranking.findMany({
    include: { games: { include: { game: true }, orderBy: { rank: "asc" } }, tags: { include: { rankingTag: true } } },
  });
}

export async function findUnique(id: number): Promise<RankingWithRelation | null> {
  return await prisma.ranking.findUnique({
    include: { games: { include: { game: true }, orderBy: { rank: "asc" } }, tags: { include: { rankingTag: true } } },
    where: { id },
  });
}

export async function create(name: string, description: string): Promise<Ranking> {
  return await prisma.ranking.create({
    data: {
      name,
      description,
      rankingStatusId: 1,
    },
  });
}

export async function deleteById(id: number) {
  return await prisma.ranking.delete({ where: { id } });
}
