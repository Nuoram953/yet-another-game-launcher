import { ipcMain } from "electron";
import _ from "lodash";
import { RouteRanking } from "../../common/constant";
import log from "electron-log/main";
import * as RankingService from "../ranking/ranking.service";
import { ErrorMessage } from "../../common/error";

ipcMain.handle(RouteRanking.GET_RANKING, async (_event, id) => {
  try {
    return await RankingService.getRanking(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteRanking.GET_RANKING,
      error: e,
    });
  }
});

ipcMain.handle(RouteRanking.GET_RANKINGS, async (_event) => {
  try {
    return await RankingService.getAll();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteRanking.GET_RANKINGS,
      error: e,
    });
  }
});

ipcMain.handle(RouteRanking.CREATE, async (_event, name, maxItems) => {
  try {
    return await RankingService.create(name, maxItems);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteRanking.CREATE,
      error: e,
    });
  }
});

ipcMain.handle(RouteRanking.DELETE, async (_event, id) => {
  try {
    return await RankingService.destroy(id);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteRanking.DELETE,
      error: e,
    });
  }
});

ipcMain.handle(RouteRanking.EDIT, async (_event, data) => {
  try {
    return await RankingService.edit(data);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteRanking.EDIT,
      error: e,
    });
  }
});

ipcMain.handle(RouteRanking.REMOVE_GAME_FROM_RANKING, async (_event, rankingId, gameId) => {
  try {
    return await RankingService.removeGameFromRanking(rankingId, gameId);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteRanking.REMOVE_GAME_FROM_RANKING,
      error: e,
    });
  }
});
