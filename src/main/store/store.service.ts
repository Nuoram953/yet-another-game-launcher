import { spawn } from "child_process";

export const launchStorefront = async (storeName: string) => {
  switch (storeName.toLowerCase()) {
    case "steam": {
      spawn("steam", {
        detached: true,
        stdio: "ignore",
      });
    }
  }
};
