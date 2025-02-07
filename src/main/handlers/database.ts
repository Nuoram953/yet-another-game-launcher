import { ipcMain } from "electron";
import _ from "lodash";
import { Game } from "@prisma/client";
import queries from "../dal/dal";

ipcMain.handle(
  "database:recentlyPlayed",
  async (_event, max): Promise<Game[]> => {
    return await queries.Game.getGames(max);
  },
);
