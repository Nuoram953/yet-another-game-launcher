import queries from "../dal/dal";
import { Storefront } from "../constant";
import { logger } from "..";
import { monitorDirectoryProcesses } from "../utils/tracking";
import { getMinutesBetween } from "../utils/utils";
import { createGameActiviy } from "../dal/gameActiviy";
import _ from "lodash";
import { GameWithRelations } from "../../common/types";
import dataManager from "../manager/dataChannelManager";
import { DataRoute } from "../../common/constant";
import * as SteamCommand from "../storefront/steam/commands";
import * as EpicCommand from "../storefront/epic/commands";
import { LogTag } from "../manager/logManager";
import { updateAchievements, refreshGame } from "./game";

export const preLaunch = async (game: GameWithRelations) => {
  logger.info(`preLaunch for game`, { id: game.id }, LogTag.TRACKING);
};

export const launch = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }
  await preLaunch(game);
  logger.info(`Launch game`, { id: game.id }, LogTag.TRACKING);

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamCommand.run(game);
      break;
    }
    case Storefront.EPIC: {
      await EpicCommand.run(game);
      break;
    }
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: true,
    id: game.id,
  });

  const { startTime, endTime } = await monitorDirectoryProcesses(
    game?.location!,
  );
  await postLaunch(game, startTime, endTime);
};

export const postLaunch = async (
  game: GameWithRelations,
  startTime: Date,
  endTime: Date | null,
) => {
  logger.info(`postLaunch for game`, { id: game.id }, LogTag.TRACKING);
  if (startTime && endTime) {
    const minutes = await getMinutesBetween(startTime, endTime);
    if (minutes > 0) {
      await createGameActiviy(game.id, startTime, endTime);
      await queries.Game.updateTimePlayed(game.id, minutes + 5);
    } else {
      logger.info(
        `Game session for ${game.id} was ${minutes} minutes. Won't create a game activity`,
      );
    }

    if (game.gameStatusId === 7) {
      await queries.Game.update(game.id, { gameStatusId: 6 });
    }

    await updateAchievements(game);
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });

  await refreshGame(game.id);
};
