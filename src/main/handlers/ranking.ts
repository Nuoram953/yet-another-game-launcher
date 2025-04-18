import { ipcMain } from "electron";
import _ from "lodash";
import { RouteRanking } from "../../common/constant";
import log from "electron-log/main";
import * as RankingService from "../service/ranking";
import { ErrorMessage } from "../../common/error";

ipcMain.handle(RouteRanking.GET_RANKING, async (_event, id) => {
  try {
    return await RankingService.getRanking(id);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteRanking.GET_RANKINGS, async (_event) => {
  try {
    return await RankingService.getAll();
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteRanking.CREATE, async (_event, name, maxItems) => {
  try {
    return await RankingService.create(name, maxItems);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteRanking.DELETE, async (_event, id) => {
  try {
    return await RankingService.destroy(id);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteRanking.EDIT, async (_event, data) => {
  try {
    return await RankingService.edit(data);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});

ipcMain.handle(RouteRanking.REMOVE_GAME_FROM_RANKING, async (_event, rankingId, gameId) => {
  try {
    return await RankingService.removeGameFromRanking(rankingId, gameId);
  } catch (e) {
    log.warn(ErrorMessage.ERROR_WHILE_FETCHING_MEDIA);
    log.debug(e);
    return [];
  }
});
