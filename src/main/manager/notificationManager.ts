import { BrowserWindow } from "electron";
import log from "electron-log/main";
import { logger } from "../index";
import { LogTag } from "./logManager";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "progress";

export interface BaseNotificationOptions {
  id?: string;
  title: string;
  message: string;
  type?: NotificationType;
  useToast?: boolean;
  duration?: number;
  actions?: Array<{
    label: string;
    callback: string;
  }>;
  priority?: "low" | "normal" | "high";
}

export interface ProgressNotificationOptions extends BaseNotificationOptions {
  type: "progress";
  total: number;
  current: number;
  autoClose?: boolean;
}

export type NotificationOptions =
  | BaseNotificationOptions
  | ProgressNotificationOptions;

class NotificationManager {
  private queue: NotificationOptions[] = [];
  private activeNotifications: Map<string, NotificationOptions> = new Map();
  private isProcessing: boolean = false;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.processQueue = this.processQueue.bind(this);
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  show(options: NotificationOptions) {
    const notification = {
      ...options,
      id: options.id || `notification-${Date.now()}`,
      type: options.type || "info",
      duration:
        options.type === "progress" ? undefined : options.duration || 5000,
      priority: options.priority || "normal",
    };

    if (notification.type === "progress") {
      const existingNotification = this.activeNotifications.get(
        notification.id,
      );
      if (existingNotification && existingNotification.type === "progress") {
        this.updateProgress(
          notification.id,
          (notification as ProgressNotificationOptions).current,
          notification.message,
        );
        return;
      }
    }

    this.queue.push(notification);
    logger.info(`Notification queued:`, { notification }, LogTag.NOTIFICATION);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  updateProgress(id: string, current: number, message?: string) {
    const notification = this.activeNotifications.get(id);
    if (!notification || notification.type !== "progress") {
      return;
    }

    const progressNotification = notification as ProgressNotificationOptions;
    const updatedNotification: ProgressNotificationOptions = {
      ...progressNotification,
      current,
      message: message || progressNotification.message,
    };

    this.activeNotifications.set(id, updatedNotification);

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("notification-update", {
        id,
        current,
        message: updatedNotification.message,
      });
    }

    if (
      current >= progressNotification.total &&
      progressNotification.autoClose
    ) {
      setTimeout(() => {
        this.close(id);
      }, 1000);
    }
  }

  close(id: string) {
    if (!this.activeNotifications.has(id)) {
      return;
    }

    this.activeNotifications.delete(id);

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("notification-close", id);
    }
  }

  private async processQueue() {
    if (
      this.isProcessing ||
      this.queue.length === 0 ||
      !this.mainWindow ||
      this.mainWindow.isDestroyed()
    ) {
      return;
    }

    this.isProcessing = true;

    try {
      this.queue.sort((a, b) => {
        const priorities = { high: 3, normal: 2, low: 1 };
        return (
          priorities[b.priority || "normal"] -
          priorities[a.priority || "normal"]
        );
      });

      const notification = this.queue.shift();
      if (!notification) {
        this.isProcessing = false;
        return;
      }

      this.activeNotifications.set(notification.id!, notification);

      if (!this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send("notification", notification);
        logger.info(
          `Notification sent to renderer:`,
          { notification },
          LogTag.NOTIFICATION,
        );
      }

      if (notification.type !== "progress" && notification.duration) {
        setTimeout(() => {
          this.close(notification.id!);

          this.isProcessing = false;
          this.processQueue();
        }, notification.duration);
      } else {
        this.isProcessing = false;
        if (this.queue.length > 0) {
          this.processQueue();
        }
      }
    } catch (error) {
      logger.error("Error processing notification:", {error}, LogTag.NOTIFICATION);
      this.isProcessing = false;

      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  clear() {
    this.queue = [];
    this.activeNotifications.clear();
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("clear-notifications");
    }
  }
}

export const notificationManager = new NotificationManager();
export default notificationManager;
