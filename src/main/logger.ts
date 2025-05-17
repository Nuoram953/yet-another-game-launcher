import { app, ipcMain, ipcRenderer } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export enum LogTag {
  NETWORK = "NETWORK",
  NOTIFICATION = "NOTIFICATION",
  TRACKING = "TRACKING",
  USER_INPUT = "USER_INPUT",
  STORE = "STORE",
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: any;
  process: "main" | "renderer";
  rendererName?: string;
  tag?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  logToMain?: boolean;
  defaultTag?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: "",
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 5,
  logToMain: true,
  defaultTag: undefined,
};

export class ElectronLogger {
  private static instances: Map<string, ElectronLogger> = new Map();
  private config: LoggerConfig;
  private isMain: boolean;
  private rendererName?: string;
  private logFilePath: string;
  private ipcChannelName = "electron-logger-channel";
  private instanceName: string;

  /**
   * Private constructor for logger instances
   */
  private constructor(instanceName: string, partialConfig: Partial<LoggerConfig> = {}, rendererName?: string) {
    this.instanceName = instanceName;

    this.config = { ...DEFAULT_CONFIG, ...partialConfig };

    this.isMain = process.type === "browser";
    this.rendererName = rendererName;

    if (!this.config.filePath) {
      const appName = this.isMain ? app.getName() : "electron-app";

      const logDir = this.isMain ? path.join(app.getPath("userData"), "logs") : path.join(os.tmpdir(), appName, "logs");

      if (this.isMain && this.config.enableFile) {
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
      }

      this.logFilePath = path.join(logDir, "app.log");
    } else {
      this.logFilePath = this.config.filePath;
    }

    this.setupIPC();
  }

  /**
   * Get or create a logger instance
   */
  public static getInstance(
    instanceName: string = "default",
    config?: Partial<LoggerConfig>,
    rendererName?: string,
  ): ElectronLogger {
    if (!ElectronLogger.instances.has(instanceName)) {
      const instance = new ElectronLogger(instanceName, config, rendererName);
      ElectronLogger.instances.set(instanceName, instance);
    } else if (config) {
      ElectronLogger.instances.get(instanceName)!.updateConfig(config);
    }
    return ElectronLogger.instances.get(instanceName)!;
  }

  /**
   * Create a tagged logger that adds a specific tag to all log messages
   */
  public createTaggedLogger(tag: string): TaggedLogger {
    return new TaggedLogger(this, tag);
  }

  /**
   * Update logger configuration
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Set up IPC communication between main and renderer processes
   */
  private setupIPC(): void {
    if (this.isMain) {
      if (!ipcMain.listeners(this.ipcChannelName).length) {
        ipcMain.on(this.ipcChannelName, (_, logEntry: LogEntry) => {
          this.processLogEntry(logEntry);
        });
      }
    }
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(logEntry: LogEntry): string {
    const process = logEntry.rendererName ? `${logEntry.process}:${logEntry.rendererName}` : logEntry.process;

    let parts = [`[${logEntry.timestamp}]`, `[${LogLevel[logEntry.level]}]`, `[${process}]`];

    if (logEntry.tag) {
      parts.push(`[${logEntry.tag}]`);
    }

    let formattedMessage = `${parts.join(" ")} ${logEntry.message}`;

    if (logEntry.metadata) {
      formattedMessage += `\n${JSON.stringify(logEntry.metadata, null, 2)}`;
    }

    return formattedMessage;
  }

  /**
   * Write log entry to console with colors
   */
  private writeToConsole(logEntry: LogEntry): void {
    const formattedMessage = this.formatLogEntry(logEntry);

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug("\x1b[36m%s\x1b[0m", formattedMessage);
        break;
      case LogLevel.INFO:
        console.info("\x1b[32m%s\x1b[0m", formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn("\x1b[33m%s\x1b[0m", formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error("\x1b[31m%s\x1b[0m", formattedMessage);
        break;
    }
  }

  /**
   * Write log entry to file with rotation
   */
  private writeToFile(logEntry: LogEntry): void {
    if (!this.isMain) return;

    const formattedMessage = this.formatLogEntry(logEntry) + "\n";

    try {
      if (fs.existsSync(this.logFilePath)) {
        const stats = fs.statSync(this.logFilePath);
        if (stats.size >= (this.config.maxFileSize ?? DEFAULT_CONFIG.maxFileSize!)) {
          this.rotateLogFiles();
        }
      }

      fs.appendFileSync(this.logFilePath, formattedMessage);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * Rotate log files
   */
  private rotateLogFiles(): void {
    const maxFiles = this.config.maxFiles ?? DEFAULT_CONFIG.maxFiles!;

    try {
      const oldestLog = `${this.logFilePath}.${maxFiles - 1}`;
      if (fs.existsSync(oldestLog)) {
        fs.unlinkSync(oldestLog);
      }

      for (let i = maxFiles - 2; i >= 0; i--) {
        const oldFile = i === 0 ? this.logFilePath : `${this.logFilePath}.${i}`;
        const newFile = `${this.logFilePath}.${i + 1}`;

        if (fs.existsSync(oldFile)) {
          fs.renameSync(oldFile, newFile);
        }
      }

      fs.writeFileSync(this.logFilePath, "");
    } catch (error) {
      console.error("Failed to rotate log files:", error);
    }
  }

  /**
   * Process a log entry (console, file, IPC)
   */
  private processLogEntry(logEntry: LogEntry): void {
    if (logEntry.level < this.config.minLevel) return;

    if (this.config.enableConsole) {
      this.writeToConsole(logEntry);
    }

    if (this.config.enableFile && this.isMain) {
      this.writeToFile(logEntry);
    }
  }

  /**
   * Create a log entry and process it
   */
  public log(level: LogLevel, message: string, metadata?: any, tag?: string): void {
    const logTag = tag || this.config.defaultTag;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      process: this.isMain ? "main" : "renderer",
      rendererName: this.rendererName,
      tag: logTag,
    };

    if (this.isMain) {
      this.processLogEntry(logEntry);
    } else {
      if (this.config.logToMain) {
        try {
          ipcRenderer.send(this.ipcChannelName, logEntry);
        } catch (e) {
          console.error("Failed to send log to main process:", e);
        }
      }

      if (this.config.enableConsole) {
        this.writeToConsole(logEntry);
      }
    }
  }

  public debug(message: string, metadata?: any, tag?: string): void {
    this.log(LogLevel.DEBUG, message, metadata, tag);
  }

  public info(message: string, metadata?: any, tag?: string): void {
    this.log(LogLevel.INFO, message, metadata, tag);
  }

  public warn(message: string, metadata?: any, tag?: string): void {
    this.log(LogLevel.WARN, message, metadata, tag);
  }

  public error(message: string, metadata?: any, tag?: string): void {
    this.log(LogLevel.ERROR, message, metadata, tag);
  }
}

/**
 * TaggedLogger - A wrapper around ElectronLogger that adds a specific tag to all logs
 */
export class TaggedLogger {
  private logger: ElectronLogger;
  private tag: string;

  constructor(logger: ElectronLogger, tag: string) {
    this.logger = logger;
    this.tag = tag;
  }

  public debug(message: string, metadata?: any): void {
    this.logger.debug(message, metadata, this.tag);
  }

  public info(message: string, metadata?: any): void {
    this.logger.info(message, metadata, this.tag);
  }

  public warn(message: string, metadata?: any): void {
    this.logger.warn(message, metadata, this.tag);
  }

  public error(message: string, metadata?: any): void {
    this.logger.error(message, metadata, this.tag);
  }
}

/**
 * Helper function to create logger instance in main process
 */
export function createMainLogger(config?: Partial<LoggerConfig>, instanceName: string = "main"): ElectronLogger {
  return ElectronLogger.getInstance(instanceName, config);
}

/**
 * Helper function to create logger instance in renderer process
 */
export function createRendererLogger(
  rendererName: string,
  config?: Partial<LoggerConfig>,
  instanceName: string = `renderer-${rendererName}`,
): ElectronLogger {
  return ElectronLogger.getInstance(instanceName, config, rendererName);
}

/**
 * Helper function to create a tagged logger
 */
export function createTaggedLogger(
  tag: string,
  baseLogger?: ElectronLogger,
  config?: Partial<LoggerConfig>,
): TaggedLogger {
  const logger = baseLogger || ElectronLogger.getInstance("default", config);
  return logger.createTaggedLogger(tag);
}

const logger = createMainLogger({ minLevel: LogLevel.DEBUG });

export default logger;
