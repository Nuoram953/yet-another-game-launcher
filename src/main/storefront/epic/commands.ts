import { spawn } from "child_process";
import { GameWithRelations } from "../../../common/types";

export const run = (game: GameWithRelations) => {
  spawn("legendary", ["launch", game.name], {
    detached: false,
    stdio: "ignore",
  });
};

export const install = (game: GameWithRelations) => {
  try {
    const test = spawn("legendary", ["install", game.externalId!], {
      detached: false,
      stdio: "pipe",
    });

    console.log(test)
  } catch (e) {
    console.log(e);
  }
};
