import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  session,
  Session,
} from "electron";
import * as path from "path";
import "./handlers/database";
import "./handlers/steam";
import "./handlers/status";
import "./handlers/ressource";
import "reflect-metadata";
import Steam from "./api/storefront/steam";
import log from "electron-log/main";
import MetadataManager from "./manager/metadataManager";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { execSync, exec } from "child_process";
import { initMainI18n } from "./i18n";
import Igdb from "./api/metadata/igdb";

require("dotenv").config();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let hasRunInitialLibrariesUpdate: boolean = false;
export let metadataManager: MetadataManager;
export let igdb: Igdb;
export let prisma: PrismaClient;
export let dbPath: string;
export let i18n: Awaited<ReturnType<typeof initMainI18n>>;

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

      process.env.DATABASE_URL = `file:${dbPath}`;

      log.initialize();
      log.errorHandler.startCatching();

      metadataManager = new MetadataManager();
      igdb = new Igdb();

      nativeTheme.themeSource = "dark";

      await app.whenReady();
      log.warn("App is ready");

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

      console.log("Steam store cookies set successfully");

      i18n = await initMainI18n();

      await this.createWindow();
      log.info("Window created");

      try {
        execSync("npx prisma migrate deploy");
      } catch (error) {
        console.error("Error running Prisma migrations:", error);
      }

      prisma = new PrismaClient();

      app.on("activate", async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          await this.createWindow();
        }
      });

      //app.on("before-quit", () => {
      //  fs.copyFileSync("../../.webpack/database.sqlite", app.getPath('userData')+"/db_back.db");
      //  console.log("Database backup saved.");
      //});
      //
      //

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
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com;" +
                "frame-src 'self' https: http: steam: mailto: about: https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com;" +
                "img-src 'self' http: https: file: data: blob: 'unsafe-inline' steam: https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com;" +
                "media-src 'self' http: https: file: data: blob: 'unsafe-inline' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com;" +
                "connect-src 'self' https: wss: steam: https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com;" +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com https://login.steampowered.com;" +
                "style-src 'self' 'unsafe-inline' https://*.steamcontent.com https://*.steamstatic.com https://*.steamcdn.com https://*.steampowered.com https://steamcommunity.com https://*.steamcommunity.com https://help.steampowered.com;",
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
        },
      });

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
    } catch (error) {
      console.error("Failed to create window:", error);
      throw error;
    }
  }
  sendToRenderer(channel, data) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
}

export const mainApp = new MainWindowManager();
mainApp.initialize().catch(console.error);

ipcMain.handle("update-libraries", async (event, forceReload) => {
  if (!hasRunInitialLibrariesUpdate || forceReload) {
    mainApp.sendToRenderer("notification", {
      title: "Updating libraries",
      message: "You can continue to use the app while it's updating",
      useToast: true,
    });
    hasRunInitialLibrariesUpdate = true;
    const steam = new Steam();
    const games = await steam.initialize();
    return games;
  }
});

ipcMain.handle("dark-mode:toggle", () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = "light";
  } else {
    nativeTheme.themeSource = "dark";
  }
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle("dark-mode:system", () => {
  nativeTheme.themeSource = "system";
});
