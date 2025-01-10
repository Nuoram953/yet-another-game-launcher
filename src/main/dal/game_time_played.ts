import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { GameTimePlayed } from "../entities/GameTimePlayed";

export async function updateGameTimePlayed(
  id: string,
  newData: Partial<GameTimePlayed>,
) {
  const result = await AppDataSource.getRepository(GameTimePlayed)
    .createQueryBuilder()
    .update(GameTimePlayed)
    .set(newData)
    .where("id = :id", { id })
    .execute();

  if (result.affected === 0) {
    throw new Error("Game not found!");
  }
}

export async function create(
  newData: Partial<GameTimePlayed> | GameTimePlayed,
) {
  const result = AppDataSource.getRepository(GameTimePlayed).save(newData);

  return result;
}

export async function getGameTimePlayedById(id: string) {
  return await AppDataSource.getRepository(GameTimePlayed).findOneBy({ id });
}

export async function createOrUpdate(
  game: Game,
  newData: GameTimePlayed,
): Promise<GameTimePlayed> {
  let gameTimePlayed = await getGameTimePlayedById(game.game_time_played_id.id);

  if (!gameTimePlayed) {
    gameTimePlayed = await create(newData);
  } else {
    gameTimePlayed.time_played = newData.time_played;
    await AppDataSource.getRepository(GameTimePlayed).save(gameTimePlayed);
  }

  game.game_time_played_id = gameTimePlayed;
  await AppDataSource.getRepository(Game).save(game);

  return gameTimePlayed;
}
