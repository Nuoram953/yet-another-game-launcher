import { ipcMain } from "electron";
import log from "electron-log/main";
import { RouteDialog } from "../../common/constant";
import { ErrorMessage } from "../../common/error";
import * as DialogService from "../dialog/dialog.service";

ipcMain.handle(RouteDialog.OPEN, async (_event) => {
  try {
    return await DialogService.open();
  } catch (e) {
    log.error(ErrorMessage.ERROR_IN_ROUTE, {
      route: RouteDialog.OPEN,
      error: e,
    });
  }
});
