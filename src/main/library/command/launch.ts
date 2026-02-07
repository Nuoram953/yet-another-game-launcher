import path from "path";
import { GameWithRelations, LaunchType } from "@common/types";
import logger, { LogMethod, LogTag } from "@main/logger";
import queries from "@main/dal/dal";
import _ from "lodash";
import { DataRoute, Storefront } from "@common/constant";
import { spawn } from "child_process";
import { monitorDirectoryProcesses } from "@main/utils/tracking";
import { getMinutesBetween } from "@main/utils/utils";
import { createGameActiviy } from "@main/dal/gameActiviy";
import { ErrorMessage } from "@common/error";
import dataManager from "@main/manager/dataChannelManager";
import { refreshGame } from "@main/game/game.service";

import * as SteamCommand from "@main/storefront/steam/commands";
import * as EpicCommand from "@main/storefront/epic/commands";

import * as AchievementService from "@main/achievement/achievement.service";

export class LaunchGameCommand {
  game: GameWithRelations;
  launchId: number;
  launchType: LaunchType;

  constructor(game: GameWithRelations, launchId: number, launchType: LaunchType) {
    this.game = game;
    this.launchId = launchId;
    this.launchType = launchType;

    this.preLaunch();
  }

  @LogMethod(LogTag.TRACKING)
  async preLaunch() {
    this.launch();
  }

  @LogMethod(LogTag.TRACKING)
  async launch() {
    const location = await this.getGameLaunchLocation();

    switch (this.launchType) {
      case LaunchType.APP:
        this.launchApp();
        break;
      case LaunchType.STOREFRONT:
        this.launchStorefront();
        break;
      case LaunchType.EMULATOR:
        this.launchEmulator();
        break;
      default:
        logger.warn("Invalid Launch type", { type: this.launchType }, LogTag.TRACKING);
    }

    const { startTime, endTime } = await monitorDirectoryProcesses(location);

    await this.postLauch(startTime, endTime);
  }

  @LogMethod(LogTag.TRACKING)
  async launchApp() {
    const launch = await queries.GameLaunchApp.getById(this.launchId);
    const normalizedPath = path.normalize(launch.path);

    spawn(normalizedPath, [], {
      detached: true,
      stdio: "ignore",
    });
  }

  @LogMethod(LogTag.TRACKING)
  async launchEmulator() {
    const launch = await queries.GameLaunchEmulator.getById(this.launchId);

    if (!launch) throw new Error(ErrorMessage.INVALID_GAME_PATH);

    const emulatorPath = launch.emulator.path;
    const emulatorCmd = launch.emulator.cmd;
    const normalizedPath = emulatorPath ? path.normalize(emulatorPath ?? "" + emulatorCmd) : emulatorCmd;

    spawn(normalizedPath, [launch.path], {
      detached: true,
      stdio: "ignore",
    });
  }

  @LogMethod(LogTag.TRACKING)
  async launchStorefront() {
    switch (this.game.storefrontId) {
      case Storefront.STEAM:
        SteamCommand.run(this.game);
        break;
      case Storefront.EPIC:
        EpicCommand.run(this.game);
        break;
      default:
        logger.warn("Invalid storefront", { type: this.game.storefrontId }, LogTag.TRACKING);
    }
  }

  @LogMethod(LogTag.TRACKING)
  async postLauch(startTime: Date, endTime: Date | null) {
    if (!startTime || !endTime) throw new Error("invalid start or end time");

    const minutes = await getMinutesBetween(startTime, endTime);

    await createGameActiviy(this.game.id, startTime, endTime);

    logger.info(
      "Session created",
      {
        minutes,
        gameId: this.game.id,
      },
      LogTag.TRACKING,
    );

    if (this.game.gameStatusId === 7) {
      await queries.Game.update(this.game.id, { gameStatusId: 6 });
    }

    await AchievementService.updateAchievements(this.game);

    dataManager.send(DataRoute.RUNNING_GAME, {
      isRunning: false,
      id: this.game.id,
    });

    await refreshGame(this.game.id);
  }

  async getGameLaunchLocation() {
    switch (this.launchType) {
      case LaunchType.APP: {
        const launch = await queries.GameLaunchApp.getById(this.launchId);
        if (!launch) throw new Error(ErrorMessage.INVALID_GAME_PATH);
        return launch.path;
      }
      case LaunchType.STOREFRONT: {
        return this.game.location!;
      }
      case LaunchType.EMULATOR: {
        const gamePath = await queries.GameLaunchEmulator.getById(this.launchId);
        if (!gamePath) throw new Error(ErrorMessage.INVALID_GAME_PATH);

        return gamePath.path;
      }
    }
  }
}
