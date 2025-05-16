import { spawn } from "child_process";
import { GameWithRelations } from "@common/types";

export const run = (game: GameWithRelations) => {
  spawn("steam", ["-nofriendsui", "-nochatui", "-silent", `steam://rungameid/${game.externalId!}`], {
    detached: true,
    stdio: "ignore",
  });
};

export const install = (id: string) => {
  spawn("steam", ["-silent", `steam://install/${id}`], {
    detached: true,
    stdio: "ignore",
  });
};

export const uninstall = (id: string) => {
  spawn("steam", ["-silent", `steam://uninstall/${id}`], {
    detached: true,
    stdio: "ignore",
  });
};
