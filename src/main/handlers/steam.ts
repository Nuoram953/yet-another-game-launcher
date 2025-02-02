import { ipcMain } from "electron";
import { spawn } from "child_process";
import log from "electron-log/main";
import { getGameByExtenalIdAndStorefront } from "../dal/game";
import { Storefront } from "../constant";
import * as GameService from "../service/game"

ipcMain.handle("steam:launch", async (_event, appid: number) => {
  const game = await getGameByExtenalIdAndStorefront(appid, Storefront.STEAM)
  if(!game){
    throw new Error("invalid game")
  }

  await GameService.launch(game)
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
