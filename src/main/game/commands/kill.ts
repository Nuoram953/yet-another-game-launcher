import { ErrorMessage } from "@common/error";
import { GameWithRelations, LaunchType } from "@common/types";
import { LogMethod, LogTag } from "@main/logger";
import queries from "@main/dal/dal";
import { killDirectoyProcess } from "@main/utils/tracking";

export class KillGameCommand {
  game: GameWithRelations;
  launchId: number;
  launchType: LaunchType;

  constructor(game: GameWithRelations, launchId: number, launchType: LaunchType) {
    this.game = game;
    this.launchId = launchId;
    this.launchType = launchType;
  }

  @LogMethod(LogTag.GAME)
  async kill() {
    const location = await this.getGameLaunchLocation();

    await killDirectoyProcess(location);
  }

  async getGameLaunchLocation() {
    switch (this.launchType) {
      case LaunchType.APP: {
        const launch = await queries.GameLaunchApp.getById(this.launchId);
        if (!launch) throw new Error(ErrorMessage.INVALID_GAME_PATH);
        return launch.path;
      }
      case LaunchType.STOREFRONT: {
        return this.game.location!;
      }
      case LaunchType.EMULATOR: {
        const gamePath = await queries.GameLaunchEmulator.getById(this.launchId);
        if (!gamePath) throw new Error(ErrorMessage.INVALID_GAME_PATH);

        return gamePath.path;
      }
    }
  }
}
