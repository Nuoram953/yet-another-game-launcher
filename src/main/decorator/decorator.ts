import { AppConfig } from "@common/interface";
import * as ConfigService from "@main/config/config.service";
import { PathsToProperties } from "@main/manager/configManager";
import notificationManager from "@main/manager/notificationManager";
import { getKeyPercentage } from "@main/utils/utils";
import { i18n } from "..";
import { refresh } from "@main/game/game.service";

export function RequireConfig(key: PathsToProperties<AppConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      if (!(await ConfigService.get(key))) {
        return;
      }

      const result = await originalMethod.apply(this, args);

      return result;
    };

    return descriptor;
  };
}

export function RefreshGame(gameId: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      await refresh(gameId);

      return result;
    };

    return descriptor;
  };
}
