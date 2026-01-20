import _ from "lodash";
import { RouteRanking } from "../../common/constant";
import { withHandler } from "@main/middleware/withHandler";

import * as RankingController from "../ranking/ranking.controller";

withHandler(RouteRanking.GET_RANKINGS, async (_event) => {
  return await RankingController.getRankings();
});

withHandler(RouteRanking.GET_RANKING, async (_event, id) => {
  return await RankingController.getRanking(id);
});

withHandler(RouteRanking.CREATE, async (_event, data) => {
  return await RankingController.createRanking(data);
});

withHandler(RouteRanking.DELETE, async (_event, id) => {
  return await RankingController.deleteRanking(id);
});

withHandler(RouteRanking.ADD_GAME_FROM_RANKING, async (_event, data) => {
  return await RankingController.addGameToRanking(data);
});

withHandler(RouteRanking.REMOVE_GAME_FROM_RANKING, async (_event, data) => {
  return await RankingController.removeGameFromRanking(data);
});

withHandler(RouteRanking.UPDATE_GAME_ORDER, async (_event, data) => {
  return await RankingController.updateGameOrder(data);
});
