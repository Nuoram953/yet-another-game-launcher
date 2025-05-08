import { ipcMain } from "electron";
import { RouteStore } from "../../common/constant";
import * as StoreService from "../store/store.service";
import log from "electron-log/main";
import { ErrorMessage } from "../../common/error";

ipcMain.handle(RouteStore.LAUNCH, async (_event, storeName: string) => {
  try {
    return await StoreService.launchStorefront(storeName);
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteStore.LAUNCH,
      error: e,
    });
  }
});
