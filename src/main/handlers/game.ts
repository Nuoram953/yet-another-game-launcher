import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteGame } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as GameService from "../service/game"

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
    await GameService.refreshGame(data.gameId)
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
  }
});
