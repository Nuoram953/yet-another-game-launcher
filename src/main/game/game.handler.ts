import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteGame } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as GameService from "../game/game.service";
import * as GameController from "../game/game.controller";

import { launch } from "@main/library/command/launch";
import { install } from "@main/library/command/install";
import { uninstall } from "@main/library/command/uninstall";
import { withEntity } from "@main/middleware/withEntity";
import { GameWithRelations, LaunchType } from "@common/types";
import { withHandler } from "@main/middleware/withHandler";
import { GameLaunchApp, GameLaunchEmulation } from "@prisma/client";

withEntity<GameWithRelations>(RouteGame.LAUNCH, async (game, _event, launchType, launchId) => {
  await launch(game, launchType, launchId);
});

withEntity<GameWithRelations>(RouteGame.INSTALL, async (game, _event) => {
  await install(game);
});

ipcMain.handle(RouteGame.UNINSTALL, async (_event, id) => {
  try {
    await uninstall(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.UNINSTALL,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.KILL, async (_event, id, launchId, type) => {
  try {
    await GameService.kill(id, launchId, type);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.KILL,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.GET_REVIEW, async (_event, id) => {
  try {
    return await GameService.getReview(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.SET_REVIEW,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.SET_REVIEW, async (_event, data) => {
  try {
    await GameService.setReview(data);
    await GameService.refreshGame(data.gameId);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.SET_REVIEW,
      error: e,
    });
  }
});

withHandler(RouteGame.CREATE_REVIEW_THOUGHT, async (_event, gameId) => {
  return await GameService.createReviewThought(gameId);
});

withHandler(RouteGame.UPDATE_REVIEW_THOUGHT, async (_event, data) => {
  return await GameService.updateReviewThought(data);
});

withHandler(RouteGame.DELETE_REVIEW_THOUGHT, async (_event, id) => {
  return await GameService.deleteReviewThought(id);
});

ipcMain.handle(RouteGame.SET_STATUS, async (_event, data) => {
  try {
    await GameService.setStatus(data);
    await GameService.refreshGame(data.id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.SET_STATUS,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.SET_SETTING_GAMESCOPE, async (_event, data) => {
  try {
    await GameService.setGamescope(data);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.SET_SETTING_GAMESCOPE,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.REFRESH_PROGRESS_TRACKER, async (_event, id) => {
  try {
    await GameService.refreshProgressTracker(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.REFRESH_PROGRESS_TRACKER,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.SET_FAVORITE, async (_event, id, isFavorite) => {
  try {
    await GameService.setFavorite(id, isFavorite);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.SET_FAVORITE,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.REFRESH_INFO, async (_event, id) => {
  try {
    await GameService.refreshInfo(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.REFRESH_PROGRESS_TRACKER,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.RESET_REVIEW, async (_event, id) => {
  try {
    await GameService.resetReview(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.RESET_REVIEW,
      error: e,
    });
  }
});

withHandler(RouteGame.ADD_LAUNCH_APP, async (_event, data: Partial<GameLaunchApp>) => {
  return await GameController.createOrUpdateLaunchApp(data);
});

withHandler(RouteGame.ADD_LAUNCH_EMULATOR, async (_event, data: Partial<GameLaunchEmulation>) => {
  return await GameController.createOrUpdateLaunchEmulator(data);
});

withHandler(RouteGame.DELETE_LAUNCH, async (_event, type: LaunchType, id: number) => {
  return await GameController.deleteLaunch(type, id);
});
