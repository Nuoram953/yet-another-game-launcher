
import { ipcMain } from "electron";
import _ from "lodash";
import { GameStatus } from "@prisma/client";
import * as GameStatusQueries from "../dal/game_status"

ipcMain.handle("statusAndCount", async (_event): Promise<GameStatus[]> => {
  return await GameStatusQueries.getStatusAndCount()
});


