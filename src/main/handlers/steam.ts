import { ipcMain } from "electron";
import { exec } from "child_process";
import log from 'electron-log/main';
import { mainApp } from "..";

ipcMain.handle("steam-run", async (_event, appid: number) => {
  return new Promise((resolve, reject) => {
    log.info(`Starting steam game ${appid}`)

    exec(`steam steam://rungameid/${appid}`, (error, stdout, stderr) => {
      mainApp.sendToRenderer("is-game-running", {
        isRunning:true
      });

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
