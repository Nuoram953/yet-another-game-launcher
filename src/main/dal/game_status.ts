import { prisma } from "..";
import * as GameQueries from "./game";

export async function getCountForAllStatus() {
  const countPerStatus = await GameQueries.getCountByStatus();
  const statuses = await getAll();

  const result = statuses.map((status) => {
    const matchedStatus = countPerStatus.find((gs) => gs.gameStatusId === status.id);

    return {
      id: status.id,
      count: matchedStatus?._count.gameStatusId,
      name: status.name,
    };
  });

  return result
}

export async function getAll() {
  return await prisma.gameStatus.findMany();
}

export async function findAll() {
  return await prisma.gameStatus.findMany();
}
