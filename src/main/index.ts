import { app, BrowserWindow, ipcMain } from "electron";
import { exec } from "child_process";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
import * as path from "path";

import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; img-src 'self' file: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval';",
          ],
        },
      });
    },
  );

  AppDataSource.initialize()
    .then(async () => {
      console.log("Inserting a new user into the database...");
      const user = new User();
      user.firstName = "Timber";
      user.lastName = "Saw";
      user.age = 25;
      await AppDataSource.manager.save(user);
      console.log("Saved a new user with id: " + user.id);

      console.log("Loading users from the database...");
      const users = await AppDataSource.manager.find(User);
      console.log("Loaded users: ", users);

      console.log(
        "Here you can setup and run express / fastify / any other framework.",
      );
    })
    .catch((error) => console.log(error));

  //mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("run-command", async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle("get-pictures-directory", async (event, command) => {
  const picturesDir = path.join(app.getPath("userData"), "images");
  return picturesDir;
});
