import { app, BrowserWindow, ipcMain, nativeTheme, Session } from "electron";
import * as path from "path";
import "./handlers/database";
import "./handlers/steam";
import "reflect-metadata";
import Steam from "./api/storefront/steam";
import log from 'electron-log/main';
import MetadataManager from "./manager/metadataManager";
import { PrismaClient } from '@prisma/client'

require("dotenv").config();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let hasRunInitialLibrariesUpdate: boolean = false;
export let metadataManager: MetadataManager
export let prisma:PrismaClient

class MainWindowManager {
  mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initialize = this.initialize.bind(this);
    this.createWindow = this.createWindow.bind(this);
    this.mainWindow = null;
  }

  async initialize(): Promise<void> {
    try {

      log.initialize()
      log.errorHandler.startCatching()

      metadataManager = new MetadataManager()

      nativeTheme.themeSource = "dark"


      await app.whenReady();
      log.warn('App is ready')

      await this.createWindow();
      log.info("Window created")

      prisma = new PrismaClient()


      app.on("activate", async () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          await this.createWindow();
        }
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
              "default-src 'self'; img-src 'self' file: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'; connect-src 'http://0.0.0.0:3000';",
            ],
          },
        });
      });
      // Ensure the listener is registered before resolving
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
        },
      });

      await this.setupCSP(this.mainWindow.webContents.session);

      await this.mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

      this.mainWindow.on("closed", () => {
        this.mainWindow = null;
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

ipcMain.handle("get-pictures-directory", async (event, id) => {
  const picturesDir = path.join(app.getPath("userData"), id);
  return picturesDir;
});

ipcMain.handle("update-libraries", async (event, forceReload) => {
  if (!hasRunInitialLibrariesUpdate || forceReload) {
    hasRunInitialLibrariesUpdate = true;
    const steam = new Steam();
    const games = await steam.initialize();
    return games;
  }
});

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})
