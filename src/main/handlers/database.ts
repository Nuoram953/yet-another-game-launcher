import { ipcMain, ipcRenderer } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import _ from "lodash";
import { Game } from "@prisma/client";
import * as GameQueries from '../dal/game'
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

  //const sgdb = new SteamGridDB(game);
  //await sgdb.getGameIdByExternalId("steam");
  //await sgdb.downladHeroesForGame(3);

  return game;
});


ipcMain.handle("database:recentlyPlayed", async (_event, max): Promise<Game[]> => {
  return await GameQueries.getAllGames(max);
});
