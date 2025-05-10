import { app, BrowserWindow, globalShortcut, session, Session } from "electron";
import { join } from "node:path";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import log from "electron-log/main";
import "reflect-metadata";
require("dotenv").config();

import "./media/media.handler";
import "./config/config.handler";
import "./store/store.handler";
import "./ranking/ranking.handler";
import "./library/library.handler";
import "./game/game.handler";

import MetadataManager from "./manager/metadataManager";
import notificationManager from "./manager/notificationManager";
import ConfigManager from "./manager/configManager";
import dataChannelManager from "./manager/dataChannelManager";
import { ElectronLogger, LogLevel, LogTag, createMainLogger } from "./manager/logManager";
import { initMainI18n } from "./i18n";
import { AppConfig } from "../common/interface";
import { t } from "i18next";
import { createEinf } from "einf";
import { AppController } from "./app.controller";

export let metadataManager: MetadataManager;
export let prisma: PrismaClient;
export let dbPath: string;
export let i18n: Awaited<ReturnType<typeof initMainI18n>>;
export let config: ConfigManager<AppConfig>;
export let logger: ElectronLogger;

// Define the window creation function more explicitly
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"), // Make sure the path is correct
      webSecurity: false,
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;

  // Set up handlers for the window
  mainWindow.setMenuBarVisibility(false);

  // Set up event listeners
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F5" && input.type === "keyDown") {
      console.log("F5 was pressed!");
      mainWindow.reload();
      event.preventDefault();
    }
  });

  // Load the URL
  const URL = isDev ? "http://localhost:5173" : `file://${join(app.getAppPath(), "dist/renderer/index.html")}`;

  mainWindow.loadURL(URL);

  return mainWindow;
}

async function electronAppInit() {
  const isDev = !app.isPackaged;

  // Set up basic app event handlers
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.exit();
  });

  if (isDev) {
    if (process.platform === "win32") {
      process.on("message", (data) => {
        if (data === "graceful-exit") app.exit();
      });
    } else {
      process.on("SIGTERM", () => {
        app.exit();
      });
    }
  }

  try {
    // Initialize database path
    dbPath = path.join(app.getPath("userData"), "app.sqlite");
    process.env.DATABASE_URL = `file:${dbPath}`;

    // Initialize logging
    log.initialize();
    log.errorHandler.startCatching();

    // Initialize i18n
    i18n = await initMainI18n();

    // Initialize config
    config = new ConfigManager<AppConfig>();
    logger = createMainLogger({ minLevel: LogLevel.DEBUG });

    await config.init({
      store: {
        steam: { enable: true },
        epic: { enable: true },
      },
    });

    // Set up database
    try {
      execSync("npx prisma migrate deploy");
      prisma = new PrismaClient();
    } catch (error) {
      console.error("Error running Prisma migrations:", error);
      prisma = new PrismaClient();
    }
  } catch (error) {
    console.error("Failed to initialize application:", error);
    app.exit();
  }
}

async function bootstrap() {
  try {
    await app.whenReady();
    await electronAppInit();

    // Make sure the AppController is properly implemented
    // const appController = new AppController();

    await createEinf({
      window: createWindow,
      controllers: [], // Make sure AppController is properly implemented
      injects: [
        {
          name: "IS_DEV",
          inject: !app.isPackaged,
        },
      ],
    });

    logger?.info("Application started successfully");
  } catch (error) {
    console.error("Bootstrap error:", error);
    app.quit();
  }
}

bootstrap();
