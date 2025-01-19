import { app, ipcMain } from "electron";
import _ from "lodash";
import fs from "fs";
import * as path from "path";
import { IMAGE_TYPE } from "../../common/constant";

ipcMain.handle("ressource:singleBackground", async (event, id) => {
  try {
    const directory = path.join(
      app.getPath("userData"),
      id,
      IMAGE_TYPE.BACKGROUND,
    );
    const files = fs.readdirSync(directory);
    return `file://${path.join(directory, files[2])}`;
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
  } catch (e){
    console.log(e)

    return "";
  }
});
