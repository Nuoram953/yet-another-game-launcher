import * as GameSchema from "./game.schema";
import * as GameService from "./game.service";
import queries from "../dal/dal";
import _ from "lodash";
import { ErrorMessage } from "@common/error";

export const launch = async (data: GameSchema.LaunchGameSchema) => {
  const result = await GameSchema.LaunchGameSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.launch(result.data.id, result.data.launchId, result.data.launchType);
};

export const refresh = async (data: GameSchema.RefreshGameSchema) => {
  const result = await GameSchema.RefreshGameSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.refresh(result.data.gameId);
};

export const install = async (data: GameSchema.InstallGameSchema) => {
  const result = await GameSchema.InstallGameSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.install(result.data.gameId);
};

export const uninstall = async (data: GameSchema.InstallGameSchema) => {
  const result = await GameSchema.UninstallGameSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.uninstall(result.data.gameId);
};

export const kill = async (data: GameSchema.KillGameSchema) => {
  const result = await GameSchema.KillGameSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.kill(result.data.id, result.data.launchId, result.data.launchType);
};

export const getReview = async (data: GameSchema.GetReviewSchema) => {
  const result = await GameSchema.GetReviewSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  const game = await queries.Game.getGameById(result.data.gameId);

  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  return await GameService.getReview(game.id);
};

export const setReview = async (data: GameSchema.SetReviewSchema) => {
  const result = await GameSchema.SetReviewSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.setReview(result.data);
};

export const createReviewThought = async (data: GameSchema.CreateReviewThoughtSchema) => {
  const result = await GameSchema.CreateReviewThoughtSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  const game = await queries.Game.getGameById(result.data.gameId);

  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  return await GameService.createReviewThought(result.data.gameId);
};

export const updateReviewThought = async (data: GameSchema.UpdateReviewThoughtSchema) => {
  const result = await GameSchema.UpdateReviewThoughtSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  const game = await queries.Game.getGameById(result.data.gameId);

  if (!game) throw new Error(ErrorMessage.NOT_FOUND);

  return await GameService.updateReviewThought(result.data);
};

export const deleteReviewThought = async (data: GameSchema.DeleteReviewThoughtSchema) => {
  const result = await GameSchema.DeleteReviewThoughtSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.deleteReviewThought(result.data.id);
};

export const createLaunch = async (data: GameSchema.CreateLaunchSchema) => {
  const result = await GameSchema.CreateLaunchSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.createLaunch();
};

export const updateLaunch = async (data: GameSchema.UpdateLaunchSchema) => {
  const result = await GameSchema.UpdateLaunchSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.updateLaunch();
};

export const deleteLaunch = async (data: GameSchema.DeleteLaunchSchema) => {
  const result = await GameSchema.DeleteLaunchSchema.safeParseAsync(data);

  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await GameService.deleteLaunch(result.data.type, result.data.id);
};
