import queries from "../dal/dal";
import _ from "lodash";
import { LaunchType } from "../../common/types";
import { LaunchGameCommand } from "./commands/launch";
import { ErrorMessage } from "@common/error";
import { RefreshGameCommand } from "./commands/refresh";
import { InstallGameCommand } from "./commands/install";
import { UninstallGameCommand } from "./commands/uninstall";
import { KillGameCommand } from "./commands/kill";

import * as GameSchema from "./game.schema";

export const create = async (data: GameSchema.CreateGameSchema) => {
  const game = await queries.Game.create(data.gameData);

  if (!game) throw new Error(ErrorMessage.INVALID_GAME);

  if (data.emulatorData) {
    await queries.GameLaunchEmulator.createOrUpdate({ gameId: game.id, ...data.emulatorData });
  }

  if (data.storefrontData) {
    await queries.GameLaunchStorefront.createOrUpdate({
      gameId: game.id,
      externalId: game.externalId,
      ...data.storefrontData,
    });
  }
};

export const launch = async (gameId: string, launchId: number, launchType: LaunchType) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  new LaunchGameCommand(game, launchId, launchType);
};

export const refresh = async (gameId: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  await new RefreshGameCommand(game).runAll();
};

export const install = async (gameId: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  await new InstallGameCommand(game).install();
};

export const uninstall = async (gameId: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  await new UninstallGameCommand(game).uninstall();
};

export const kill = async (gameId: string, launchId: number, launchType: LaunchType) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  await new KillGameCommand(game, launchId, launchType).kill();
};

export const setReview = async (data: GameSchema.SetReviewSchema) => {
  const game = await queries.Game.getGameById(data.gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  await queries.GameReview.createOrUpdate(data);
};

export const createReviewThought = async (gameId: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  return await queries.GameReviewThoughts.create(gameId);
};

export const updateReviewThought = async (data: GameSchema.UpdateReviewThoughtSchema) => {
  return await queries.GameReviewThoughts.update(data.id, { ...data });
};

export const deleteReviewThought = async (id: string) => {
  const reviewThought = await queries.GameReviewThoughts.getById(id);
  if (!reviewThought) throw new Error(ErrorMessage.NOT_FOUND);

  return await queries.GameReviewThoughts.deleteById(id);
};

export const createLaunch = async () => {
  throw new Error(ErrorMessage.NOT_IMPLEMENTED);
};

export const updateLaunch = async () => {
  throw new Error(ErrorMessage.NOT_IMPLEMENTED);
};

export const deleteLaunch = async () => {
  throw new Error(ErrorMessage.NOT_IMPLEMENTED);
};

export const setStatus = async (gameId: string, newStatusId: number) => {
  const game = await queries.Game.getGameById(gameId);
  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  const status = await queries.GameStatus.findById(newStatusId);
  if (!status) throw new Error(ErrorMessage.NOT_FOUND);

  await queries.Game.update(gameId, { gameStatusId: newStatusId });
};
