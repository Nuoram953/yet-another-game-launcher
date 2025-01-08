import { ipcMain } from "electron";
import { IGame } from "../types";
import { exec } from "child_process";
import { getGameById } from "../dal/game";
import log from 'electron-log/main';

ipcMain.handle("steam-run", async (event, appid: number) => {
  return new Promise((resolve, reject) => {
    log.info(`Starting steam game ${appid}`)

    exec(`steam steam://rungameid/${appid}`, (error, stdout, stderr) => {
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
