import { BrowserWindow } from "electron";
import log from "electron-log/main";

export interface DataPayload {
  type?: string;
  data: any;
  timestamp?: number;
}

type DataProvider = () => Promise<any> | any;

class DataManager {
  private mainWindow: BrowserWindow | null = null;
  private queuedMessages: Map<string, DataPayload[]> = new Map();
  private providers: Map<string, DataProvider> = new Map();
  private intervals: Map<string, NodeJS.Timer> = new Map();

  constructor() {
    this.processQueue = this.processQueue.bind(this);
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
    this.processQueue();
  }

  send(channel: string, data: any, type?: string) {
    const payload: DataPayload = {
      type,
      data,
      timestamp: Date.now(),
    };

    if (!this.mainWindow) {
      const queuedForChannel = this.queuedMessages.get(channel) || [];
      queuedForChannel.push(payload);
      this.queuedMessages.set(channel, queuedForChannel);
      log.info(`Message queued for channel ${channel} (window not ready)`);
      return;
    }

    try {
      this.mainWindow.webContents.send(channel, payload);
      log.info(`Data sent on channel: ${channel}`);
    } catch (error) {
      log.error(`Error sending data on channel ${channel}:`, error);
    }
  }

  registerProvider(
    channel: string,
    provider: DataProvider,
    interval: number = 1000,
  ) {
    this.providers.set(channel, provider);
    log.info(`Provider registered for channel: ${channel}`);
  }

  async startRealtimeUpdates(channel: string, interval: number = 1000) {
    const provider = this.providers.get(channel);
    if (!provider) {
      log.error(`No provider registered for channel: ${channel}`);
      return;
    }

    this.stopRealtimeUpdates(channel);

    try {
      const initialData = await provider();
      this.send(channel, initialData, "realtime-update");
    } catch (error) {
      log.error(`Error getting initial data for channel ${channel}:`, error);
    }

    const timer = setInterval(async () => {
      try {
        const data = await provider();
        this.send(channel, data, "realtime-update");
      } catch (error) {
        log.error(`Error getting update for channel ${channel}:`, error);
      }
    }, interval);

    this.intervals.set(channel, timer);
    log.info(`Started real-time updates for channel: ${channel}`);
  }

  stopRealtimeUpdates(channel: string) {
    const timer = this.intervals.get(channel);
    if (timer) {
      clearInterval(timer as NodeJS.Timeout);
      this.intervals.delete(channel);
      log.info(`Stopped real-time updates for channel: ${channel}`);
    }
  }

  private processQueue() {
    if (!this.mainWindow) return;

    for (const [channel, messages] of this.queuedMessages.entries()) {
      messages.forEach((payload) => {
        this.send(channel, payload.data, payload.type);
      });
      this.queuedMessages.delete(channel);
    }
  }
}

export const dataManager = new DataManager();
export default dataManager;
