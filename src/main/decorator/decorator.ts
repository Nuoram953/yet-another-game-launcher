import { AppConfig } from "@common/interface";
import * as ConfigService from "@main/config/config.service";
import { PathsToProperties } from "@main/manager/configManager";
import notificationManager from "@main/manager/notificationManager";
import { getKeyPercentage } from "@main/utils/utils";
import { i18n } from "..";

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

type MaybeGetter<T> = T | ((self: any) => T);

export function NotifyProgress(notificationId: MaybeGetter<string>, key: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const resolvedNotificationId = typeof notificationId === "function" ? notificationId(this) : notificationId;

      const notificationsObject = i18n.t("newGame", {
        ns: "notification",
        returnObjects: true,
      });

      notificationManager.updateProgress(
        resolvedNotificationId,
        getKeyPercentage(notificationsObject, key),
        i18n.t(`newGame.${key}`, { ns: "notification" }),
      );

      // Call the original method
      const result = await originalMethod.apply(this, args);
      return result;
    };

    return descriptor;
  };
}
