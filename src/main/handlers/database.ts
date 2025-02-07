import { ipcMain } from "electron";
import { getGames, getGameById } from "../dal/game";
import _ from "lodash";
import { Game } from "@prisma/client";
import queries from "../dal/dal";
import SteamGridDB from "../api/metadata/steamgriddb";
import { YouTubeDownloader } from "../api/video/youtube";
import { igdb } from "..";
import { refreshGame, updateAchievements } from "../service/game";
import { GameWithRelations } from "src/common/types";

ipcMain.handle("games", async (_event, filters, sort): Promise<Game[]> => {
  return await getGames(null, filters);
});

//TODO: Fix types
// ipcMain.handle("game", async (_event, id): Promise<GameWithRelations> => {
//   const game = await getGameById(id);
//
//   if (_.isNil(game)) {
//     throw new Error("Invalid game id ${id}");
//   }
//
//   const sgdb = new SteamGridDB(game);
//   await sgdb.getGameIdByExternalId("steam");
//   await sgdb.downloadAllImageType(1, 1);
//
//   await YouTubeDownloader.searchAndDownloadVideos(game);
//
//   // const {
//   //   developers,
//   //   publishers,
//   //   partialGameData,
//   //   themes,
//   //   genres,
//   //   gameModes,
//   //   engine,
//   //   playerPerspective,
//   // } = await igdb.getGame(game.externalId!);
//   //
//   // for (const developer of developers) {
//   //   await queries.GameDeveloper.findOrCreate(game.id, developer);
//   // }
//   //
//   // for (const publisher of publishers) {
//   //   await queries.GamePublisher.findOrCreate(game.id, publisher);
//   // }
//   //
//   // for (const theme of themes) {
//   //   await queries.GameTag.findOrCreate(game.id, theme, { isTheme: true });
//   // }
//   //
//   // for (const genre of genres) {
//   //   await queries.GameTag.findOrCreate(game.id, genre, { isGenre: true });
//   // }
//   //
//   // for (const mode of gameModes) {
//   //   await queries.GameTag.findOrCreate(game.id, mode, { isGameMode: true });
//   // }
//   //
//   // for (const perspective of playerPerspective) {
//   //   await queries.GameTag.findOrCreate(game.id, perspective, {
//   //     isPlayerPerspective: true,
//   //   });
//   // }
//   //
//   // await queries.Game.updateGame(game.id, partialGameData);
//
//   await updateAchievements(game);
//
//   const updatedGame = await getGameById(id);
//
//   if (_.isNil(updatedGame)) {
//     throw new Error("Invalid game id ${id}");
//   }
//
//   return updatedGame;
// });

ipcMain.handle(
  "database:recentlyPlayed",
  async (_event, max): Promise<Game[]> => {
    return await queries.Game.getGames(max);
  },
);
