import { ipcMain, ipcRenderer } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import _ from "lodash";
import { Game } from "@prisma/client";
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

  return game;
});
