import fs from "fs";
import path from "path";
import os from "os";

import VDF from "vdf-parser";

export const getDefaultSteamPath = (): string => {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case "win32":
      const programFiles = "C:\\Program Files (x86)\\Steam";
      const programFilesAlt = "C:\\Program Files\\Steam";
      if (fs.existsSync(programFiles)) return programFiles;
      if (fs.existsSync(programFilesAlt)) return programFilesAlt;
      break;

    case "darwin":
      return path.join(homeDir, "Library/Application Support/Steam");

    case "linux":
      const linuxPaths = [
        path.join(homeDir, ".local/share/Steam"),
        path.join(homeDir, ".steam/steam"),
        "/usr/share/steam",
      ];
      for (const p of linuxPaths) {
        if (fs.existsSync(p)) return p;
      }
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  throw new Error("Steam installation not found in default locations");
};

export const getSteamUserId = async () => {
  const steamDir = getDefaultSteamPath();
  const steamConfigDirectory = path.join(steamDir, "config");
  const data = await fs.promises.readFile(`${steamConfigDirectory}/loginusers.vdf`, "utf8");

  const loginUsersJson: any = await VDF.parse(data);
  const users = Object.entries(loginUsersJson.users);

  const user = users[0];
  return user[0];
};
