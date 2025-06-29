import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteGame } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as GameService from "../game/game.service";
import * as LibraryService from "../library/library.service";

ipcMain.handle(RouteGame.LAUNCH, async (_event, id) => {
  try {
    await LibraryService.launch(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.LAUNCH,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.INSTALL, async (_event, id) => {
  try {
    await GameService.install(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.INSTALL,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.UNINSTALL, async (_event, id) => {
  try {
    await GameService.uninstall(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.UNINSTALL,
      error: e,
    });
  }
});

ipcMain.handle(RouteGame.KILL, async (_event, id) => {
  try {
    await GameService.kill(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteGame.KILL,
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

ipcMain.handle(RouteGame.SET_FAVORITE, async (_event, data) => {
  try {
    await GameService.setFavorite(data);
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
