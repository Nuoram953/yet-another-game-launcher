import { app, BrowserWindow, globalShortcut, session, Session } from "electron";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import log from "electron-log/main";
import "reflect-metadata";
require("dotenv").config();

// Import handlers
import "./handlers/media";
import "./handlers/config";
import "./handlers/store";
import "./handlers/ranking";
import "./handlers/library";
import "./handlers/game";

// Import managers and APIs
import MetadataManager from "./manager/metadataManager";
import Igdb from "./api/metadata/igdb";
import notificationManager from "./manager/notificationManager";
import ConfigManager from "./manager/configManager";
import dataChannelManager from "./manager/dataChannelManager";
import { ElectronLogger, LogLevel, LogTag, createMainLogger } from "./manager/logManager";
import { initMainI18n } from "./i18n";
import { AppConfig } from "../common/interface";

// Webpack entries
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Export global instances for other modules to use
export let metadataManager: MetadataManager;
export let igdb: Igdb;
export let prisma: PrismaClient;
export let dbPath: string;
export let i18n: Awaited<ReturnType<typeof initMainI18n>>;
export let config: ConfigManager<AppConfig>;
export let logger: ElectronLogger;

class MainWindowManager {
  mainWindow: BrowserWindow | null = null;
  loadingWindow: BrowserWindow | null = null;

  constructor() {
    this.initialize = this.initialize.bind(this);
    this.createWindow = this.createWindow.bind(this);
    this.createLoadingWindow = this.createLoadingWindow.bind(this);
    this.updateLoadingProgress = this.updateLoadingProgress.bind(this);
  }

  async initialize(): Promise<void> {
    try {
      // Set up database path
      dbPath = path.join(app.getPath("userData"), "app.sqlite");
      process.env.DATABASE_URL = `file:${dbPath}`;

      // Initialize logging
      log.initialize();
      log.errorHandler.startCatching();

      await app.whenReady();

      // Create loading window and initialize components
      await this.createLoadingWindow();
      await this.initializeComponents();

      // Set up app event handlers
      this.setupAppEventHandlers();
    } catch (error) {
      this.handleFatalError("Failed to initialize application:", error);
    }
  }

  private async initializeComponents(): Promise<void> {
    try {
      // Initialize components with loading progress updates
      this.updateLoadingProgress(10, "Initializing components...");

      metadataManager = new MetadataManager();
      this.updateLoadingProgress(20, "Loading metadata manager...");

      igdb = new Igdb();
      this.updateLoadingProgress(30, "Connecting to IGDB...");

      i18n = await initMainI18n();
      this.updateLoadingProgress(40, "Setting up localization...");

      // Initialize config and logger
      config = new ConfigManager<AppConfig>();
      logger = createMainLogger({ minLevel: LogLevel.DEBUG });

      await config.init({
        store: {
          steam: { enable: true },
          epic: { enable: true },
        },
      });
      this.updateLoadingProgress(50, "Loading configuration...");

      await app.whenReady();
      logger.debug("Main process is ready");
      this.updateLoadingProgress(60, "Main process ready...");

      // Set up store integrations
      await this.setupStoreIntegrations();
      this.updateLoadingProgress(80, "Preparing database...");

      // Initialize database
      await this.initializeDatabase();
      this.updateLoadingProgress(90, "Creating main window...");

      // Create and show main window
      await this.createWindow();
      logger.info("Renderer window created");
    } catch (error) {
      this.handleFatalError("Failed to initialize components:", error);
    }
  }

  private async setupStoreIntegrations(): Promise<void> {
    try {
      // Setup Steam store if enabled
      if (await config.get("store.steam.enable")) {
        const steamSession = session.fromPartition("persist:steamstore");
        await this.setupStoreCookies(
          steamSession,
          "https://store.steampowered.com",
          "SteamLogin",
          "YOUR_COOKIE_VALUE_HERE",
          ".steampowered.com",
        );
        logger.info("Steam store cookies set successfully");
      }

      // Setup Epic store if enabled
      if (await config.get("store.epic.enable")) {
        const epicSession = session.fromPartition("persist:epic");
        await this.setupStoreCookies(
          epicSession,
          "https://store.epicgames.com/en-US/",
          "epicLogin",
          "YOUR_COOKIE_VALUE_HERE",
          ".epicgames.com",
        );
        logger.info("Epic store cookies set successfully");
      }
    } catch (error) {
      logger.error("Error setting up store integrations:", { error });
      // Non-fatal error, continue initialization
    }
  }

  private async setupStoreCookies(
    storeSession: Session,
    url: string,
    cookieName: string,
    cookieValue: string,
    domain: string,
  ): Promise<void> {
    await storeSession.cookies.set({
      url,
      name: cookieName,
      value: cookieValue,
      domain,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "no_restriction",
    });
  }

  private async initializeDatabase(): Promise<void> {
    try {
      execSync("npx prisma migrate deploy");
      prisma = new PrismaClient();
    } catch (error) {
      logger.error("Error running Prisma migrations:", { error });
      // Create new client anyway to avoid application failure
      prisma = new PrismaClient();
    }
  }

  private setupAppEventHandlers(): void {
    // Handle activation (macOS)
    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createWindow();
      }
    });

    // Handle window-all-closed event
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // Handle web contents creation
    app.on("web-contents-created", (e, wc) => {
      wc.setWindowOpenHandler(() => {
        return { action: "allow" };
      });
    });
  }

  updateLoadingProgress(percent: number, message: string = ""): void {
    if (this.loadingWindow && !this.loadingWindow.isDestroyed()) {
      this.loadingWindow.webContents.send("update-progress", { percent, message });
    }
  }

  async createLoadingWindow(): Promise<void> {
    try {
      const loadingHtmlPath = path.join(app.getAppPath(), "loading.html");

      // Create loading HTML file if it doesn't exist
      if (!fs.existsSync(loadingHtmlPath)) {
        fs.writeFileSync(loadingHtmlPath, this.getLoadingHtmlContent());
      }

      // Create loading window
      this.loadingWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        resizable: false,
        show: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      await this.loadingWindow.loadFile(loadingHtmlPath);
      this.loadingWindow.center();

      this.loadingWindow.on("closed", () => {
        this.loadingWindow = null;
      });
    } catch (error) {
      this.handleFatalError("Failed to create loading window:", error);
    }
  }

  private getLoadingHtmlContent(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Loading...</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #1e1e1e;
      color: white;
      overflow: hidden;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 20px;
    }
    .logo {
      width: 120px;
      height: 120px;
      margin-bottom: 20px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    .progress-container {
      width: 80%;
      height: 6px;
      background-color: #333;
      border-radius: 3px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #4d79ff, #0044cc);
      transition: width 0.3s ease;
    }
    .app-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .loading-text {
      font-size: 14px;
      opacity: 0.8;
      height: 20px;
    }
    .progress-percent {
      font-size: 12px;
      opacity: 0.6;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="app-name">Game Library</div>
    <div class="progress-container">
      <div class="progress-bar" id="progress-bar"></div>
    </div>
    <div class="loading-text" id="loading-message">Initializing...</div>
    <div class="progress-percent" id="progress-text">0%</div>
  </div>

  <script>
    const { ipcRenderer } = require('electron');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const loadingMessage = document.getElementById('loading-message');

    ipcRenderer.on('update-progress', (event, data) => {
      progressBar.style.width = \`\${data.percent}%\`;
      progressText.textContent = \`\${data.percent}%\`;
      
      if (data.message) {
        loadingMessage.textContent = data.message;
      }
    });
  </script>
</body>
</html>`;
  }

  private getContentSecurityPolicy(): string {
    // Common domains for both stores
    const commonDomains = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];

    // Steam domains
    const steamDomains = [
      "https://*.steamcontent.com",
      "https://*.steamstatic.com",
      "https://*.steamcdn.com",
      "https://*.steampowered.com",
      "https://steamcommunity.com",
      "https://*.steamcommunity.com",
      "https://help.steampowered.com",
      "https://login.steampowered.com",
    ];

    // Epic domains
    const epicDomains = ["https://*.epicgames.com", "https://www.epicgames.com", "https://*.store.epicgames.com"];

    // Combine all domains
    const allDomains = [...commonDomains, ...steamDomains, ...epicDomains].join(" ");

    // Content Security Policy directives
    return [
      `default-src ${allDomains};`,
      `frame-src 'self' https: http: steam: mailto: about: ${steamDomains.join(" ")} ${epicDomains.join(" ")};`,
      `img-src 'self' http: https: file: data: blob: 'unsafe-inline' steam: ${steamDomains.join(" ")} ${epicDomains.join(" ")};`,
      `media-src 'self' http: https: file: data: blob: 'unsafe-inline' ${steamDomains.join(" ")} ${epicDomains.join(" ")};`,
      `connect-src 'self' https: wss: steam: ${steamDomains.join(" ")} ${epicDomains.join(" ")};`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${steamDomains.join(" ")} ${epicDomains.join(" ")};`,
      `style-src 'self' 'unsafe-inline' ${steamDomains.join(" ")} ${epicDomains.join(" ")};`,
    ].join(" ");
  }

  async setupCSP(session: Session): Promise<void> {
    return new Promise((resolve) => {
      session.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [this.getContentSecurityPolicy()],
          },
        });
      });
      resolve();
    });
  }

  async createWindow(): Promise<void> {
    try {
      this.mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Initially hidden
        webPreferences: {
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
          webSecurity: false,
          webviewTag: true,
          nodeIntegration: true,
        },
      });

      // Set up managers
      notificationManager.setMainWindow(this.mainWindow);
      dataChannelManager.setMainWindow(this.mainWindow);

      this.mainWindow.setMenuBarVisibility(false);
      await this.setupCSP(this.mainWindow.webContents.session);

      // Set up window event handlers
      this.setupWindowEventHandlers();

      // Load the application
      await this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    } catch (error) {
      this.handleFatalError("Failed to create window:", error);
    }
  }

  private setupWindowEventHandlers(): void {
    if (!this.mainWindow) return;

    // Show main window when ready and close loading window
    this.mainWindow.on("ready-to-show", () => {
      this.updateLoadingProgress(100, "Ready to launch!");

      setTimeout(() => {
        if (this.mainWindow) {
          this.mainWindow.show();
        }

        if (this.loadingWindow && !this.loadingWindow.isDestroyed()) {
          this.loadingWindow.close();
        }
      }, 500);
    });

    // Handle window closed event
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    // Handle focus/blur events
    this.mainWindow.on("blur", () => {
      this.mainWindow?.webContents.send("app-blur");
    });

    this.mainWindow.on("focus", () => {
      this.mainWindow?.webContents.send("app-focus");
    });

    // Handle key events (F5 reload)
    this.mainWindow.webContents.on("before-input-event", (event, input) => {
      if (input.key === "F5" && input.type === "keyDown") {
        logger?.debug("F5 was pressed!", {}, LogTag.USER_INPUT);
        this.mainWindow?.reload();
        event.preventDefault();
      }
    });
  }

  private handleFatalError(message: string, error: unknown): void {
    if (logger) {
      logger.error(message, { error });
    } else {
      console.error(message, error);
    }
    app.quit();
  }
}

export const mainApp = new MainWindowManager();
mainApp.initialize();
