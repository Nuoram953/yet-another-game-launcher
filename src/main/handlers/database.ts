import { ipcMain, ipcRenderer } from "electron";
import { getAllGames, getGameById } from "../dal/game";
import _ from "lodash";
import { Game } from "@prisma/client";
import queries from "../dal/dal"
import SteamGridDB from "../api/metadata/steamgriddb";
import { YouTubeDownloader } from "../api/video/youtube";
import Igdb from "../api/metadata/igdb";
import { igdb, mainApp } from "..";

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

  const {developers, publishers, partialGameData, themes, genres, gameModes, engine, playerPerspective} = await igdb.getGame(game.externalId!);

  for(const developer of developers){
    await queries.GameDeveloper.findOrCreate(game.id, developer)
  }

  for(const publisher of publishers){
    await queries.GamePublisher.findOrCreate(game.id, publisher)
  }

  for(const theme of themes){
    await queries.GameTag.findOrCreate(game.id, theme, {isTheme:true})
  }

  for(const genre of genres){
    await queries.GameTag.findOrCreate(game.id, genre, {isGenre:true})
  }

  for(const mode of gameModes){
    await queries.GameTag.findOrCreate(game.id, mode, {isGameMode:true})
  }

  for(const perspective of playerPerspective){
    await queries.GameTag.findOrCreate(game.id, perspective, {isPlayerPerspective:true})
  }

  await queries.Game.updateGame(game.id, partialGameData)

  const updatedGame = await getGameById(id);

  return updatedGame;
});

ipcMain.handle(
  "database:recentlyPlayed",
  async (_event, max): Promise<Game[]> => {
    return await queries.Game.getAllGames(max);
  },
);
