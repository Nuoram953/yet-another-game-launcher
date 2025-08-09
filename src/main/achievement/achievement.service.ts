import { Storefront } from "@common/constant";
import { GameWithRelations } from "@common/types";
import * as SteamService from "@main/storefront/steam/service";
import logger, { LogTag } from "@main/logger";

export const updateAchievements = async (game: GameWithRelations) => {
  switch (game.storefrontId) {
    case Storefront.STEAM: {
      await SteamService.getGameAchievements(game);
      await SteamService.getPlayerAchievements(game);
      await SteamService.updateGlobalAchievmentPercentages(game);
      break;
    }
    case Storefront.EPIC: {
      // const storeEpic = new Steam();
      // await storeEpic.getAchievementsForGame(game);
      // await storeEpic.getUserAchievementsForGame(game);
      break;
    }
    default:
      logger.warn(`Invalid storefront: ${game.storefrontId}`, LogTag.ACHIEVEMENT);
      break;
  }
};
