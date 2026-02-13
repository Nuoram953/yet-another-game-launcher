import { Storefront } from "@common/constant";
import { GameWithRelations } from "@common/types";
import logger, { LogMethod, LogTag } from "@main/logger";

import * as SteamCommand from "@main/storefront/steam/commands";
import * as SteamMonitor from "@main/storefront/steam/monitor";

import * as EpicCommand from "@main/storefront/epic/commands";

export class InstallGameCommand {
  game: GameWithRelations;

  constructor(game: GameWithRelations) {
    this.game = game;
  }

  @LogMethod(LogTag.GAME)
  async validate() {
    return false;
  }

  @LogMethod(LogTag.GAME)
  async install() {
    const isAlreadyInstalled = await this.validate();
    if (isAlreadyInstalled) {
      logger.info("Game is already installed", { gameId: this.game.id }, LogTag.GAME);
      return;
    }

    switch (this.game.storefrontId) {
      case Storefront.STEAM: {
        SteamCommand.install(this.game.externalId!);
        SteamMonitor.createDownloadTracker(this.game);
      }

      case Storefront.EPIC: {
        EpicCommand.install(this.game);
      }
    }
  }
}
