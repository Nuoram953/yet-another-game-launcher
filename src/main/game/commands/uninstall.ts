import { Storefront } from "@common/constant";
import { GameWithRelations } from "@common/types";
import logger, { LogMethod, LogTag } from "@main/logger";

import * as SteamCommand from "@main/storefront/steam/commands";

export class UninstallGameCommand {
  game: GameWithRelations;

  constructor(game: GameWithRelations) {
    this.game = game;
  }

  @LogMethod(LogTag.GAME)
  async uninstall() {
    switch (this.game.storefrontId) {
      case Storefront.STEAM: {
        SteamCommand.uninstall(this.game.externalId!);
      }
    }
  }
}
