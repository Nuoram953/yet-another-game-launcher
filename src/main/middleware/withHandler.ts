import { ipcMain } from "electron";
import logger, { LogTag } from "@main/logger";
import _ from "lodash";
import { ErrorMessage } from "@common/error";

export function withHandler(
  route: string,
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>,
) {
  ipcMain.handle(route, async (event, ...args: any[]) => {
    try {
      logger.info(
        "Calling route",
        {
          route,
          args,
        },
        LogTag.MIDDLEWARE,
      );
      return await handler(event, ...args);
    } catch (e) {
      logger.error(ErrorMessage.ERROR_IN_ROUTE, { route, error: e }, LogTag.MIDDLEWARE);
      throw e;
    }
  });
}
