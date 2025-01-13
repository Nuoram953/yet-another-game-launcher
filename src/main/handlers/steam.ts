import { ipcMain } from "electron";
import { spawn } from "child_process";
import log from "electron-log/main";
import { monitorDirectoryProcesses, spawnAndTrackChildren } from "../utils/tracking";
import { delay } from "../utils/utils";
import { getGameByExtenalIdAndStorefront } from "../dal/game";
import { Storefront } from "../constant";
import { createGameActiviy } from "../dal/gameActiviy";

ipcMain.handle("steam:launch", async (_event, appid: number) => {
  const game = await getGameByExtenalIdAndStorefront(appid, Storefront.STEAM)
  log.info(`Starting steam game ${appid}`);
  spawn("steam", ["-silent", `steam://launch/${appid}`], {
    detached: true,
    stdio: "ignore",
  });
  const {startTime, endTime} = await monitorDirectoryProcesses(game?.location!);
  if(startTime && endTime){
    await createGameActiviy(game!.id!, startTime, endTime)
  }
  //await trackAllChildProcessesRecursive(process.pid);
  //
  //setInterval(checkIfAllProcessesTerminated, 5000);

  //const result = await spawnAndTrackChildren('steam', [`steam://rungameid/${appid}`]);
  //console.log(`Parent PID: ${result.parentPid}`);
  //console.log(`Child PIDs: ${result.childPids}`);

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
