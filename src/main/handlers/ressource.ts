import { app, ipcMain } from "electron";
import _ from "lodash";
import fs from "fs";
import * as path from "path";
import { IMAGE_TYPE } from "../../common/constant";
import * as GameQueries from "../dal/game";
import log from "electron-log/main";

ipcMain.handle("ressource:getAll", async (event, id) => {
  const ressource: { [key: string]: any } = {};
  try {
    for (const type of Object.values(IMAGE_TYPE)) {
      ressource[type] = [];
      const directory = path.join(app.getPath("userData"), id, type);
      if (!fs.existsSync(directory)) {
        break;
      }
      const files = fs.readdirSync(directory);
      for (const file of files) {
        ressource[type].push(`file://${path.join(directory, file)}`);
      }
    }
    return ressource;
  } catch (e) {
    log.warn(e);
    return "";
  }
});

ipcMain.handle("ressource:singleBackground", async (event, id) => {
  try {
    const directory = path.join(
      app.getPath("userData"),
      id,
      IMAGE_TYPE.BACKGROUND,
    );
    const files = fs.readdirSync(directory);
    const file = Math.floor(Math.random() * files.length);
    return `file://${path.join(directory, files[file])}`;
  } catch {
    return "";
  }
});

ipcMain.handle("ressource:singleLogo", async (event, id) => {
  try {
    const directory = path.join(app.getPath("userData"), id, IMAGE_TYPE.LOGO);
    const files = fs.readdirSync(directory);
    const file = Math.floor(Math.random() * files.length);
    return `file://${path.join(directory, files[file])}`;
  } catch (e) {
    console.log(e);

    return "";
  }
});

ipcMain.handle("ressource:singleIcon", async (event, id) => {
  try {
    const directory = path.join(app.getPath("userData"), id, IMAGE_TYPE.LOGO);
    const files = fs.readdirSync(directory);
    const file = Math.floor(Math.random() * files.length);
    return `file://${path.join(directory, files[file])}`;
  } catch (e) {
    console.log(e);

    return "";
  }
});

ipcMain.handle("ressource:singleCover", async (event, id) => {
  try {
    const directory = path.join(app.getPath("userData"), id, IMAGE_TYPE.COVER);
    const files = fs.readdirSync(directory);
    return `file://${path.join(directory, files[0])}`;
  } catch (e) {
    return "";
  }
});

ipcMain.handle("ressource:singleTrailer", async (event, id) => {
  try {
    const videoExtensions = [
      ".mp4",
      ".mkv",
      ".avi",
      ".mov",
      ".flv",
      ".wmv",
      ".webm",
    ];

    const directory = path.join(
      app.getPath("userData"),
      id,
      IMAGE_TYPE.TRAILER,
    );
    const files = fs.readdirSync(directory);

    if (files.length === 1) {
      return `file://${path.join(directory, files[0])}`;
    }

    const file = Math.floor(Math.random() * files.length);
    return `file://${path.join(directory, files[file])}`;
  } catch (e) {
    console.log(e);
    return "";
  }
});

ipcMain.handle("ressource:recentlyPlayedBackground", async (event, max) => {
  try {
    const gamePictures: string[] = [];
    const games = await GameQueries.getAllGames(max);
    for (const game of games) {
      const directory = path.join(
        app.getPath("userData"),
        game.id,
        IMAGE_TYPE.BACKGROUND,
      );
      const files = fs.readdirSync(directory);
      const file = Math.floor(Math.random() * files.length);
      gamePictures.push(`file://${path.join(directory, files[file])}`);
    }
    return gamePictures;
  } catch (e) {
    console.log(e);

    return "";
  }
});

ipcMain.handle("ressource:achievements", async (event, id) => {
  try {
    const achievements = []
    const directory = path.join(app.getPath("userData"), id, IMAGE_TYPE.ACHIEVEMENT);
    const files = fs.readdirSync(directory);
    for(const file of files){
      achievements.push(`file://${path.join(directory, file)}`)
    }
    return achievements;
  } catch (e) {
    console.log(e);
    return [];
  }
});
