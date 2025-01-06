import { app, BrowserWindow, ipcMain, Session } from "electron";
import { exec } from "child_process";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
import * as path from "path";

import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import Steam from "./service/storefront/steam";
import { join } from "path";

require("dotenv").config();

let hasRunInitialLibrariesUpdate: boolean = false;

class MainApplication {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    // Bind methods to ensure correct 'this' context
    this.initialize = this.initialize.bind(this);
    this.createWindow = this.createWindow.bind(this);
  }

  async initialize(): Promise<void> {
    try {
      // Wait for Electron app to be ready
      await app.whenReady();

      // Create the browser window
      await this.createWindow();

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
}

// Create and start the application
const mainApp = new MainApplication();
mainApp.initialize().catch(console.error);

ipcMain.handle("get-pictures-directory", async (event, command) => {
  const picturesDir = path.join(app.getPath("userData"), "images");
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
