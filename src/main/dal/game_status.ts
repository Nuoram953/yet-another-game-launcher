
//export async function getGameStatusById(status: number) {
//  return await AppDataSource.getRepository(GameStatus).findOneBy({
//    id: status,
//  });
//}
//
//export async function getGameStatusPlayedAndUnplayed(): Promise<{
//  played: GameStatus;
//  unplayed: GameStatus;
//}> {
//  const status = await AppDataSource.getRepository(GameStatus).find({
//    where: { id: In([1, 2]) },
//  });
//
//  return { unplayed: status[0], played: status[1] };
//}
