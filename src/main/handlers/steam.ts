import { ipcMain } from "electron";
import { spawn } from "child_process";
import log from "electron-log/main";
import { spawnAndTrackChildren } from "../utils/tracking";
import { delay } from "../utils/utils";

ipcMain.handle("steam:launch", async (_event, appid: number) => {
  log.info(`Starting steam game ${appid}`);
  const process = spawn("steam", ["-silent", `steam://launch/${appid}`], {
    detached: true,
    stdio: "ignore",
  });
  await delay(10000)
  await spawnAndTrackChildren()
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
