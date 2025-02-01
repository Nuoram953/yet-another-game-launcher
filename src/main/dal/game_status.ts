import { prisma } from "..";
import * as GameQueries from "./game";

export async function getStatusAndCount() {
  const countPerStatus = await GameQueries.getCountByStatus();
  const statuses = await getAllStatus();

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

export async function getAllStatus() {
  return await prisma.gameStatus.findMany();
}
