import { app, BrowserWindow } from "electron";
import { join } from "node:path";
import * as path from "path";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { createEinf } from "einf";
import "reflect-metadata";

import { initMainI18n } from "@main/i18n";
import { AppConfig } from "@common/interface";

import "@main/media/media.handler";
import "@main/config/config.handler";
import "@main/store/store.handler";
import "@main/ranking/ranking.handler";
import "@main/library/library.handler";
import "@main/game/game.handler";
import "@main/dialog/dialog.handler";

import notificationManager from "@main/manager/notificationManager";
import ConfigManager from "@main/manager/configManager";
import dataChannelManager from "@main/manager/dataChannelManager";
import logger, { LogTag } from "./logger";

export let prisma: PrismaClient;
export let dbPath: string;
export let i18n: Awaited<ReturnType<typeof initMainI18n>>;
export let config: ConfigManager<AppConfig>;
let mainWindow: BrowserWindow | undefined;

require("dotenv").config();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      webSecurity: false,
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;

  mainWindow.setMenuBarVisibility(false);

  notificationManager.setMainWindow(mainWindow);
  dataChannelManager.setMainWindow(mainWindow);

  if (process.env.NODE_ENV != "test") {
    mainWindow.on("ready-to-show", () => {
      mainWindow.show();
    });
  }

  mainWindow.on("blur", () => {
    mainWindow?.webContents.send("app-blur");
  });

  mainWindow.on("focus", () => {
    mainWindow?.webContents.send("app-focus");
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F5" && input.type === "keyDown") {
      logger?.debug("F5 was pressed!", {}, LogTag.USER_INPUT);
      mainWindow.reload();
      event.preventDefault();
    }
  });

  const URL = isDev ? "http://localhost:5173" : `file://${join(app.getAppPath(), "dist/renderer/index.html")}`;

  mainWindow.loadURL(URL);

  return mainWindow;
}

async function electronAppInit() {
  const isDev = !app.isPackaged;

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
    if (process.env.NODE_ENV === "test") {
      process.env.DATABASE_URL = `file:${path.join(app.getPath("userData"), "test_app.sqlite")}`;
    } else {
      process.env.DATABASE_URL = `file:${path.join(app.getPath("userData"), "app.sqlite")}`;
    }

    i18n = await initMainI18n();

    config = new ConfigManager<AppConfig>();

    await config.init({
      store: {
        steam: { enable: true, apiKey: "", accountName: "", isntallationPath: null },
        epic: { enable: true },
      },
      extension: {
        youtube: { enable: true, ytDlpPath: "" },
        howLongToBeat: {
          enable: false,
        },
        openCritic: {
          enable: false,
        },
        steamGridDb: {
          enable: false,
          apiKey: "",
        },
        igdb: {
          enable: false,
          clientId: "",
          clientSecret: "",
        },
      },
    });

    try {
      const schemaPath = join(__dirname, "../../prisma/schema.prisma");
      execSync(`npx prisma migrate deploy --schema=${schemaPath}`);

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

export async function bootstrap(): Promise<BrowserWindow | undefined> {
  try {
    await app.whenReady();
    await electronAppInit();

    mainWindow = await createWindow();

    await createEinf({
      window: () => mainWindow!,
      controllers: [],
      injects: [
        {
          name: "IS_DEV",
          inject: !app.isPackaged,
        },
      ],
    });

    logger?.info("Application started successfully");
    return mainWindow;
  } catch (error) {
    console.error("Bootstrap error:", error);
    app.quit();
  }
}

bootstrap();
