import { app, ipcMain } from "electron";
import _ from "lodash";
import fs from "fs";
import * as path from "path";
import { IMAGE_TYPE } from "../../common/constant";
import * as GameQueries from "../dal/game";

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

ipcMain.handle("ressource:singleTrailer", async (event, id) => {
  try {
    const file = path.join(app.getPath("userData"), id, "trailer.mp4");
    console.log(file)

    return `file://${file}`;
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
