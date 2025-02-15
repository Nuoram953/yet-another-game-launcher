import { spawn } from "child_process";
import { GameWithRelations } from "../../../common/types";

export const run = (game: GameWithRelations) => {
  spawn(
    "steam",
    [`steam://rungameid/${game.externalId!}`],
    {
      detached: true,
      stdio: "ignore",
    },
  );
};

export const install = (id: number) => {
  spawn("steam", ["-silent", `steam://install/${id}`], {
    detached: true,
    stdio: "ignore",
  });
};

export const uninstall = (id: number) => {
  spawn("steam", ["-silent", `steam://uninstall/${id}`], {
    detached: true,
    stdio: "ignore",
  });
};
