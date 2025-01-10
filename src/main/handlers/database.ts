import { ipcMain } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import { Game } from "../entities/Game";
import _ from "lodash";
import SteamGridDB from "../api/metadata/steamgriddb";

ipcMain.handle("games", async (_event): Promise<Game[]> => {
  return await getAllGames();
});

//TODO: Fix types
ipcMain.handle("game", async (_event, id): Promise<any | void> => {
  const game = await getGameById(id);

  if (_.isNil(game)) {
    throw new Error("Invalid game id ${id}");
  }

  const sgdb = new SteamGridDB();
  await sgdb.getGameIdByExternalId(game, "steam");

  return {
    id: game.id,
    externalId: game.external_id,
    name: game.name,
    timePlayed: game.game_time_played_id.time_played,
    status: game.game_status.name,
  };
});
