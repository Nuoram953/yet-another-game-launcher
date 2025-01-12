import { ipcMain } from "electron";
import { exec, spawn } from "child_process";
import log from "electron-log/main";
import { mainApp } from "..";
import { checkIfAllProcessesTerminated, spawnAndTrackChildren, trackAllChildProcessesRecursive, trackGameTime } from "../utils/tracking";
import { delay } from "../utils/utils";

ipcMain.handle("steam-run", async (_event, appid: number) => {
  log.info(`Starting steam game ${appid}`);
  const process = spawn("steam", ["-silent",`steam://launch/${appid}`], {
    detached: true,
    stdio: "ignore",
  });

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
