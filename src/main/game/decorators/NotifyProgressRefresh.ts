import notificationManager from "@main/manager/notificationManager";
import { getKeyPercentage } from "@main/utils/utils";
import { i18n } from "@main/index";

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

      const result = await originalMethod.apply(this, args);
      return result;
    };

    return descriptor;
  };
}
