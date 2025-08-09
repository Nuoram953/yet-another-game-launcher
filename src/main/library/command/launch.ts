import { GameWithRelations } from "@common/types";
import logger, { LogTag } from "@main/logger";
import queries from "@main/dal/dal";
import _ from "lodash";
import { DataRoute, Storefront } from "@common/constant";
import dataManager from "@main/manager/dataChannelManager";

import * as SteamCommand from "@main/storefront/steam/commands";
import * as EpicCommand from "@main/storefront/epic/commands";

import * as AchievementService from "@main/achievement/achievement.service";

import { monitorDirectoryProcesses } from "@main/utils/tracking";
import { getMinutesBetween } from "@main/utils/utils";
import { createGameActiviy } from "@main/dal/gameActiviy";
import { refreshGame } from "@main/game/game.service";

export const preLaunch = async (game: GameWithRelations) => {
  logger.info(`preLaunch for game`, { id: game.id }, LogTag.TRACKING);
};

export const launch = async (game: GameWithRelations) => {
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

  const { startTime, endTime } = await monitorDirectoryProcesses(game?.location!);
  await postLaunch(game, startTime, endTime);
};

export const postLaunch = async (game: GameWithRelations, startTime: Date, endTime: Date | null) => {
  logger.info(`postLaunch for game`, { id: game.id }, LogTag.TRACKING);
  if (startTime && endTime) {
    const minutes = await getMinutesBetween(startTime, endTime);
    if (minutes > 0) {
      await createGameActiviy(game.id, startTime, endTime);
      await queries.Game.updateTimePlayed(game.id, minutes + 5);
    } else {
      logger.info(`Game session for ${game.id} was ${minutes} minutes. Won't create a game activity`);
    }

    if (game.gameStatusId === 7) {
      await queries.Game.update(game.id, { gameStatusId: 6 });
    }

    await AchievementService.updateAchievements(game);
  }

  dataManager.send(DataRoute.RUNNING_GAME, {
    isRunning: false,
    id: game.id,
  });

  await refreshGame(game.id);
};
