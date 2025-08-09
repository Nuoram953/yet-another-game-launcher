import queries from "@main/dal/dal";
import _ from "lodash";
import { Storefront } from "@common/constant";
import { createDownloadTracker } from "@main/storefront/steam/monitor";

import * as SteamCommand from "@main/storefront/steam/commands";
import * as EpicCommand from "@main/storefront/epic/commands";

import { delay } from "@main/utils/utils";
import { GameWithRelations } from "@common/types";

export const install = async (game: GameWithRelations) => {
  switch (game.storefrontId) {
    case Storefront.STEAM: {
      SteamCommand.install(game.externalId!);
      await delay(10000);
      createDownloadTracker(game);
    }

    case Storefront.EPIC: {
      EpicCommand.install(game);
    }
  }
};
