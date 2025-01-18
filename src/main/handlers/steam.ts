import { ipcMain } from "electron";
import { spawn } from "child_process";
import log from "electron-log/main";
import { getGameByExtenalIdAndStorefront, updateTimePlayed } from "../dal/game";
import { Storefront } from "../constant";
import * as GameService from "../service/game"

ipcMain.handle("steam:launch", async (_event, appid: number) => {
  const game = await getGameByExtenalIdAndStorefront(appid, Storefront.STEAM)
  if(!game){
    throw new Error("invalid game")
  }

  await GameService.preLaunch(game)

  spawn("steam", ["-silent", `steam://launch/${appid}`], {
    detached: true,
    stdio: "ignore",
  });

  await GameService.postLaunch(game)
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
