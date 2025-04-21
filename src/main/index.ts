import { app, BrowserWindow, globalShortcut, session, Session } from "electron";
import * as path from "path";
import "./handlers/media";
import "./handlers/config";
import "./handlers/store";
import "./handlers/ranking";
import "./handlers/library";
import "./handlers/game";
import "reflect-metadata";
import log from "electron-log/main";
import MetadataManager from "./manager/metadataManager";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { initMainI18n } from "./i18n";
import Igdb from "./api/metadata/igdb";
import notificationManager from "./manager/notificationManager";
import ConfigManager from "./manager/configManager";
import { AppConfig } from "../common/interface";
import dataChannelManager from "./manager/dataChannelManager";
import {
  ElectronLogger,
  LogLevel,
  LogTag,
  createMainLogger,
} from "./manager/logManager";

require("dotenv").config();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export let metadataManager: MetadataManager;
export let igdb: Igdb;
export let prisma: PrismaClient;
export let dbPath: string;
export let i18n: Awaited<ReturnType<typeof initMainI18n>>;
export let config: ConfigManager<AppConfig>;
export let logger: ElectronLogger;

class MainWindowManager {
  mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initialize = this.initialize.bind(this);
    this.createWindow = this.createWindow.bind(this);
    this.mainWindow = null;
  }

  async initialize(): Promise<void> {
    try {
      dbPath = path.join(app.getPath("userData"), "app.sqlite");

      console.log(dbPath)
      process.env.DATABASE_URL = `file:${dbPath}`;

      log.initialize();
      log.errorHandler.startCatching();

      metadataManager = new MetadataManager();
      igdb = new Igdb();
      i18n = await initMainI18n();
      config = new ConfigManager<AppConfig>();
      logger = createMainLogger({
        minLevel: LogLevel.DEBUG,
      });

      await config.init({
        store: {
          steam: {
            enable: true,
          },
          epic: {
            enable: true,
          },
        },
      });

      await app.whenReady();
      logger.debug("Main process is ready");

      if (await config.get("store.steam.enable")) {
        const steamSession = session.fromPartition("persist:steamstore");

        await steamSession.cookies.set({
          url: "https://store.steampowered.com",
          name: "SteamLogin",
          value: "YOUR_COOKIE_VALUE_HERE", // Replace with a real cookie
          domain: ".steampowered.com",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "no_restriction", // Ensures cross-site access
        });

        logger.info("Steam store cookies set successfully");
      }

      if (await config.get("store.epic.enable")) {
        const epicSession = session.fromPartition("persist:epic");

        await epicSession.cookies.set({
          url: "https://store.epicgames.com/en-US/",
          name: "epicLogin",
          value: "YOUR_COOKIE_VALUE_HERE", // Replace with a real cookie
          domain: ".epicgames.com",
          path: "/",
          secure: true,
          httpOnly: true,
          sameSite: "no_restriction", // Ensures cross-site access
        });

        logger.info("Epic store cookies set successfully");
      }

      await this.createWindow();
      logger.info("Renderer window created");

      try {
        execSync("npx prisma migrate deploy");
      } catch (error) {
        logger.error("Error running Prisma migrations:", { error });
      }

      prisma = new PrismaClient();

      app.on("activate", async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          await this.createWindow();
        }
      });

      app.on("web-contents-created", (e, wc) => {
        wc.setWindowOpenHandler((handler) => {
          return { action: "allow" }; // deny or allow
        });
      });

      app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
          app.quit();
        }
      });
    } catch (error) {
      console.error("Failed to initialize application:", error);
      app.quit();
    }
  }

  async setupCSP(session: Session): Promise<void> {
    return new Promise((resolve) => {
      session.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;" +
                "frame-src 'self' https: http: steam: mailto: about: https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;" +
                "img-src 'self' http: https: file: data: blob: 'unsafe-inline' steam: https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;" +
                "media-src 'self' http: https: file: data: blob: 'unsafe-inline' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;" +
                "connect-src 'self' https: wss: steam: https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;" +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;" +
                "style-src 'self' 'unsafe-inline' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://*.epicgames.com https://www.epicgames.com https://*.store.epicgames.com;",
            ],
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
        webPreferences: {
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
          webSecurity: false,
          webviewTag: true,
          nodeIntegration: true,
        },
      });

      notificationManager.setMainWindow(this.mainWindow);
      dataChannelManager.setMainWindow(this.mainWindow);

      this.mainWindow.setMenuBarVisibility(false);

      await this.setupCSP(this.mainWindow.webContents.session);

      await this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

      this.mainWindow.on("closed", () => {
        this.mainWindow = null;
      });

      this.mainWindow.on("blur", () => {
        this.mainWindow?.webContents.send("app-blur");
      });

      this.mainWindow.on("focus", () => {
        this.mainWindow?.webContents.send("app-focus");
      });

      globalShortcut.register("F5", () => {
        logger.debug("F5 was pressed!", {}, LogTag.USER_INPUT);
        this.mainWindow?.reload();
      });
    } catch (error) {
      logger.error("Failed to create window:", { error });
      throw error;
    }
  }
}

export const mainApp = new MainWindowManager();
mainApp.initialize().catch(console.error);
