import { prisma } from "..";
import * as GameQueries from "./game";

export async function getStatusAndCount() {
  const countPerStatus = await GameQueries.getCountByStatus();
  const statuses = await getAllStatus();

  const result = countPerStatus.map((status) => {
    const matchedStatus = statuses.find((gs) => gs.id === status.gameStatusId);

    return {
      id: status.gameStatusId,
      count: status._count.gameStatusId,
      name: matchedStatus ? matchedStatus.name : null,
    };
  });

  return result
}

export async function getAllStatus() {
  return await prisma.gameStatus.findMany();
}
