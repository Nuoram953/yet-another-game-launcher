import { ipcMain } from "electron";
import { spawn } from "child_process";
import log from "electron-log/main";
import { monitorDirectoryProcesses } from "../utils/tracking";
import { getGameByExtenalIdAndStorefront } from "../dal/game";
import { Storefront } from "../constant";
import { createGameActiviy } from "../dal/gameActiviy";

ipcMain.handle("steam:launch", async (_event, appid: number) => {
  const game = await getGameByExtenalIdAndStorefront(appid, Storefront.STEAM)
  if(!game){
    log.error("Invalid game")
  }

  log.info(`Starting steam game ${appid}`);
  spawn("steam", ["-silent", `steam://launch/${appid}`], {
    detached: true,
    stdio: "ignore",
  });

  const {startTime, endTime} = await monitorDirectoryProcesses(game?.location!);
  if(startTime && endTime){
    await createGameActiviy(game!.id!, startTime, endTime)
  }

  //mainApp.sendToRenderer("is-game-running", {
  //  isRunning: true,
  //});
});

ipcMain.handle("steam:install", async (_event, appid: number) => {
  log.info(`Installing steam game ${appid}`);
  spawn("steam", [`steam://install/${appid}`], {
    detached: true,
    stdio: "ignore",
  });
});


ipcMain.handle("steam:uninstall", async (_event, appid: number) => {
  log.info(`Installing steam game ${appid}`);
  spawn("steam", [`steam://uninstall/${appid}`], {
    detached: true,
    stdio: "ignore",
  });
});
