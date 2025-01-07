import { ipcMain } from "electron";
import { getAllGames } from "../dal/game";
import { IGame } from "../types";
import { Game } from "../entities/Game";

ipcMain.handle("games", async (event):Promise<IGame[]> => {
  const dbGames:Game[] =  await getAllGames()

  return dbGames.map(game=>({
    id:game.id,
    name:game.name,
    timePlayed:game.time_played,
    status:game.game_status.name
  }))
});
