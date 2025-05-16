import { ipcMain } from "electron";
import { RouteStore } from "../../common/constant";
import * as StoreService from "../store/store.service";
import { ErrorMessage } from "../../common/error";
import logger from "@main/logger";

ipcMain.handle(RouteStore.LAUNCH, async (_event, storeName: string) => {
  try {
    return await StoreService.launchStorefront(storeName);
  } catch (e) {
    logger.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteStore.LAUNCH,
      error: e,
    });
  }
});
