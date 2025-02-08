import { BrowserWindow } from "electron";
import log from "electron-log/main";

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
      id: options.id || `notification-${Date.now()}`,
      type: options.type || "info",
      duration: options.type === "progress" ? null : options.duration || 5000,
      priority: options.priority || "normal",
      ...options,
    };

    if (notification.type === "progress") {
      // Update existing progress notification if it exists
      const existingNotification = this.activeNotifications.get(
        notification.id,
      );
      if (existingNotification) {
        this.updateProgress(
          notification.id,
          (notification as ProgressNotificationOptions).current,
        );
        return;
      }
    }

    this.queue.push(notification);
    log.info(`Notification queued: ${notification.id}`);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  updateProgress(id: string, current: number, message?: string) {
    const notification = this.activeNotifications.get(id);
    if (notification && notification.type === "progress") {
      const updatedNotification: ProgressNotificationOptions = {
        ...notification,
        current,
        message: message || notification.message,
      };

      this.activeNotifications.set(id, updatedNotification);

      if (this.mainWindow) {
        this.mainWindow.webContents.send("notification-update", {
          id,
          current,
          message: message || notification.message,
        });
      }

      // Auto-close if progress is complete and autoClose is true
      if (
        current >= (notification as ProgressNotificationOptions).total &&
        (notification as ProgressNotificationOptions).autoClose
      ) {
        setTimeout(() => {
          this.close(id);
        }, 1000);
      }
    }
  }

  close(id: string) {
    this.activeNotifications.delete(id);
    if (this.mainWindow) {
      this.mainWindow.webContents.send("notification-close", id);
    }
  }

  private async processQueue() {
    if (!this.queue.length || !this.mainWindow || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Sort queue by priority
      this.queue.sort((a, b) => {
        const priorities = { high: 3, normal: 2, low: 1 };
        return (
          priorities[b.priority || "normal"] -
          priorities[a.priority || "normal"]
        );
      });

      const notification = this.queue.shift();
      if (!notification) return;

      this.activeNotifications.set(notification.id!, notification);
      this.mainWindow.webContents.send("notification", notification);
      log.info(`Notification sent to renderer: ${notification.id}`);

      // For non-progress notifications, remove after duration
      if (notification.type !== "progress" && notification.duration) {
        await new Promise((resolve) =>
          setTimeout(resolve, notification.duration),
        );
        this.close(notification.id!);
      }
    } catch (error) {
      log.error("Error processing notification:", error);
    } finally {
      this.isProcessing = false;
      if (this.queue.length) {
        this.processQueue();
      }
    }
  }

  clear() {
    this.queue = [];
    this.activeNotifications.clear();
    if (this.mainWindow) {
      this.mainWindow.webContents.send("clear-notifications");
    }
  }
}

export const notificationManager = new NotificationManager();
export default notificationManager;
