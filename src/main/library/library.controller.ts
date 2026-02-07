import { ErrorMessage } from "@common/error";
import { Game } from "@prisma/client";
import _ from "lodash";
import * as LibraryService from "./library.service";
import * as GameService from "../game/game.service";
import * as LibrarySchema from "./library.schema";

import queries from "../dal/dal";

export const launchGame = async (data: LibrarySchema.LaunchGame) => {
  const result = await LibrarySchema.LaunchGame.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  const game = await queries.Game.getGameById(result.data.gameId);
  if (!game) throw new Error(ErrorMessage.INVALID_GAME);

  return await LibraryService.launchGame(game, result.data.launchId, result.data.launchType);
};

export const refreshGame = async (data: LibrarySchema.RefreshGame) => {
  const result = await LibrarySchema.RefreshGame.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  const game = await queries.Game.getGameById(result.data.gameId);
  if (!game) throw new Error(ErrorMessage.INVALID_GAME);

  return await LibraryService.refreshGame(game);
};

export const search = async (query: string) => {
  if (_.isNil(query)) {
    throw new Error(ErrorMessage.INVALID_BODY);
  }

  return await LibraryService.search(query);
};

export const addGame = async (data: Partial<Game>) => {
  if (_.isNil(data.name)) {
    throw new Error(ErrorMessage.INVALID_BODY);
  }

  const game = await LibraryService.addGame(data);
  await GameService.updateInfo(game.id);
};

export const getEmulators = async () => {
  return await LibraryService.getEmulators();
};
