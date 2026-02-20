import { RequireConfig } from "@main/decorator/decorator";
import logger, { LogTag } from "../../logger";
import { NotificationType } from "@common/constant";
import { NotifyProgress } from "../decorator/NotifyProgressRefresh";
import notificationManager from "@main/manager/notificationManager";

import * as SteamService from "@main/storefront/steam/service";

export class RefreshLibraryCommand {
  notificationId: string;

  constructor() {
    this.notificationId = NotificationType.REFRESH;

    notificationManager.show({
      id: NotificationType.REFRESH,
      title: "Updating libraries",
      message: "You can continue to use the app while it's updating",
      type: "progress",
      current: 10,
      total: 100,
      autoClose: true,
    });
  }

  @RequireConfig("store.steam.enable")
  @NotifyProgress((self) => self.notificationId, "refreshSteam")
  async refreshSteam() {
    await SteamService.refresh();
  }

  async runAll() {
    const tasks: Array<() => Promise<void>> = [() => this.refreshSteam()];

    for (const task of tasks) {
      try {
        await task();
      } catch (err) {
        logger.warn(
          `Task failed but continuing`,
          {
            err,
          },
          LogTag.LIBRARY,
        );
      }
    }

    notificationManager.updateProgress(this.notificationId, 100);
  }
}
