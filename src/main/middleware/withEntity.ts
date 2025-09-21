import { ipcMain } from "electron";
import logger, { LogTag } from "@main/logger";
import _ from "lodash";
import { ErrorMessage } from "@common/error";
import queries from "@main/dal/dal";

export function withEntity<T>(
  route: string,
  handler: (entity: T, event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>,
) {
  ipcMain.handle(route, async (event, id: string, ...args: any[]) => {
    try {
      logger.debug(`Validating game for route`, { route, id }, LogTag.MIDDLEWARE);
      const entity = (await queries.Game.getGameById(id)) as T;
      if (_.isNil(entity)) {
        logger.error(`Entity not found`, { id }, LogTag.MIDDLEWARE);
        throw new Error(ErrorMessage.NOT_FOUND);
      }

      return await handler(entity, event, ...args);
    } catch (e) {
      logger.error(ErrorMessage.ERROR_IN_ROUTE, { route, error: e });
      throw e;
    }
  });
}
