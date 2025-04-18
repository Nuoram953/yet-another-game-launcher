import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteGame } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as GameService from "../service/game"
import * as LaunchService from "../service/launch"

ipcMain.handle(RouteGame.LAUNCH, async (_event, id) => {
  try {
    await LaunchService.launch(id)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteGame.INSTALL, async (_event, id) => {
  try {
    await GameService.install(id)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteGame.UNINSTALL, async (_event, id) => {
  try {
    await GameService.uninstall(id)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteGame.KILL, async (_event, id) => {
  try {
    await GameService.kill(id)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});


ipcMain.handle(RouteGame.SET_REVIEW, async (_event, data) => {
  try {
    await GameService.setReview(data);
    await GameService.refreshGame(data.gameId)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteGame.SET_STATUS, async (_event, data) => {
  try {
    await GameService.setStatus(data);
    await GameService.refreshGame(data.id)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteGame.SET_SETTING_GAMESCOPE, async (_event, data) => {
  try {
    await GameService.setGamescope(data);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});

ipcMain.handle(RouteGame.REFRESH_PROGRESS_TRACKER, async (_event, id) => {
  try {
    await GameService.refreshProgressTracker(id);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});
