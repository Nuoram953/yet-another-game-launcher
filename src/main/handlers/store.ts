import { spawn } from "child_process";
import { ipcMain } from "electron";

ipcMain.handle("store:launch", async (_event, storeName: string) => {
  switch (storeName.toLowerCase()) {
    case "steam": {
      spawn("steam" , {
        detached: true,
        stdio: "ignore",
      });
    }
  }
});
