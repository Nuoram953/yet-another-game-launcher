import { ipcMain } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import { Game } from "../entities/Game";
import log from 'electron-log/main';
import _ from "lodash";
import { IGame } from "../../common/types";

ipcMain.handle("games", async (event):Promise<IGame[]> => {
  const dbGames:Game[] =  await getAllGames()

  return dbGames.map(game=>({
    id:game.id,
    name:game.name,
    timePlayed:game.time_played,
    status:game.game_status.name
  }))
});

ipcMain.handle("game", async (event, id):Promise<any|void> => {
  const dbGame =  await getGameById(id)

  if(_.isNil(dbGame)){
    throw new Error("Invalid game id ${id}")
  }

  return {
    id:dbGame.id,
    externalId: dbGame.external_id,
    name:dbGame.name,
    timePlayed:dbGame.time_played,
    status:dbGame.game_status.name
  }

});
