import { ipcMain, ipcRenderer } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import _ from "lodash";
import { Game } from "@prisma/client";
import queries from "../dal/dal"
import SteamGridDB from "../api/metadata/steamgriddb";
import { YouTubeDownloader } from "../api/video/youtube";
import Igdb from "../api/metadata/igdb";
import { igdb } from "..";

ipcMain.handle("games", async (_event): Promise<Game[]> => {
  return await getAllGames();
});

//TODO: Fix types
ipcMain.handle("game", async (_event, id): Promise<any | void> => {
  const game = await getGameById(id);

  if (_.isNil(game)) {
    throw new Error("Invalid game id ${id}");
  }

  const sgdb = new SteamGridDB(game);
  await sgdb.getGameIdByExternalId("steam");
  await sgdb.downloadAllImageType(1, 1);

  await YouTubeDownloader.searchAndDownloadVideos(game);

  const {developers, publishers} = await igdb.getGame(game.externalId!);

  for(const developer of developers){
    await queries.GameDeveloper.findOrCreate(game.id, developer)
  }

  for(const publisher of publishers){
    await queries.GamePublisher.findOrCreate(game.id, publisher)
  }

  console.log(developers, publishers)

  return game;
});

ipcMain.handle(
  "database:recentlyPlayed",
  async (_event, max): Promise<Game[]> => {
    return await queries.Game.getAllGames(max);
  },
);
