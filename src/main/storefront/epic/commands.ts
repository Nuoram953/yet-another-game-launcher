
import { spawn } from "child_process";
import { GameWithRelations } from "../../../common/types";

export const run = (game: GameWithRelations) => {
  spawn(
    "legendary",
    ['launch', game.name],
    {
      detached: false,
      stdio: "ignore",
    },
  );
};
