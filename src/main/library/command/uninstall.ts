import queries from "@main/dal/dal";
import _ from "lodash";
import { Storefront } from "@common/constant";

import * as SteamCommand from "@main/storefront/steam/commands";

import { refreshGame } from "@main/game/game.service";

export const uninstall = async (id: string) => {
  const game = await queries.Game.getGameById(id);
  if (_.isNil(game)) {
    throw new Error("game not found");
  }

  switch (game.storefrontId) {
    case Storefront.STEAM: {
      SteamCommand.uninstall(game.externalId!);
    }
  }

  await queries.Game.update(game.id, { isInstalled: false });
  await refreshGame(game.id);
};
