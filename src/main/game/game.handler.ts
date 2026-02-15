import { RouteGame } from "../../common/constant";
import * as GameController from "../game/game.controller";
import { withHandler } from "@main/middleware/withHandler";

withHandler(RouteGame.LAUNCH, async (_event, data) => {
  return await GameController.launch(data);
});

withHandler(RouteGame.REFRESH, async (_event, data) => {
  return await GameController.refresh(data);
});

withHandler(RouteGame.INSTALL, async (_event, data) => {
  return await GameController.install(data);
});

withHandler(RouteGame.UNINSTALL, async (_event, data) => {
  return await GameController.uninstall(data);
});

withHandler(RouteGame.KILL, async (_event, data) => {
  return await GameController.kill(data);
});

withHandler(RouteGame.GET_REVIEW, async (_event, data) => {
  return await GameController.getReview(data);
});

withHandler(RouteGame.SET_REVIEW, async (_event, data) => {
  return await GameController.setReview(data);
});

withHandler(RouteGame.CREATE_REVIEW_THOUGHT, async (_event, data) => {
  return await GameController.createReviewThought(data);
});

withHandler(RouteGame.UPDATE_REVIEW_THOUGHT, async (_event, data) => {
  return await GameController.updateReviewThought(data);
});

withHandler(RouteGame.DELETE_REVIEW_THOUGHT, async (_event, data) => {
  return await GameController.deleteReviewThought(data);
});

withHandler(RouteGame.ADD_LAUNCH_APP, async (_event, data) => {
  return await GameController.createOrUpdateLaunchApp(data);
});

withHandler(RouteGame.ADD_LAUNCH_EMULATOR, async (_event, data) => {
  return await GameController.createOrUpdateLaunchEmulator(data);
});

withHandler(RouteGame.DELETE_LAUNCH, async (_event, data) => {
  return await GameController.deleteLaunch(data);
});

withHandler(RouteGame.SET_STATUS, async (_event, data) => {
  return await GameController.setStatus(data);
});

withHandler(RouteGame.SET_FAVORITE, async (_event, data) => {
  return await GameController.deleteLaunch(data);
});

withHandler(RouteGame.RESET_REVIEW, async (_event, data) => {
  return await GameController.deleteLaunch(data);
});
