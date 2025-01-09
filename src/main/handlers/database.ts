import { ipcMain } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import { Game } from "../entities/Game";
import _ from "lodash";
import SteamGridDB from "../service/metadata/steamgriddb";

ipcMain.handle("games", async (event):Promise<any|void> => {
  const games:Game[] =  await getAllGames()

  return games.map(game=>({
    id:game.id,
    name:game.name,
    externalId: game.external_id,
    timePlayed:game.time_played,
    status:game.game_status.name
  }))
});

//TODO: Fix types
ipcMain.handle("game", async (event, id):Promise<any|void> => {
  const game =  await getGameById(id)

  if(_.isNil(game)){
    throw new Error("Invalid game id ${id}")
  }

  const sgdb = new SteamGridDB()
  await sgdb.getGameIdByExternalId(game, "steam")

  return {
    id:game.id,
    externalId: game.external_id,
    name:game.name,
    timePlayed:game.time_played,
    status:game.game_status.name
  }

});
