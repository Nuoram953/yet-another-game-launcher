import _ from "lodash";
import { RouteMedia } from "../../common/constant";
import * as MediaController from "../media/media.controller";
import { withHandler } from "@main/middleware/withHandler";

withHandler(RouteMedia.GET_MEDIA_BY_TYPE, async (_event, data) => {
  return await MediaController.getMediaByType(data);
});

withHandler(RouteMedia.GET_ALL_MEDIA, async (_event, data) => {
  return await MediaController.getMediaByType(data);
});

withHandler(RouteMedia.DELETE, async (_event, data) => {
  return await MediaController.deleteMedia(data);
});

withHandler(RouteMedia.SEARCH, async (_event, data) => {
  return MediaController.searchMedia(data);
});

withHandler(RouteMedia.DOWNLOAD_BY_URL, async (_event, data) => {
  return await MediaController.downloadMedia(data);
});

withHandler(RouteMedia.SET_DEFAULT, async (_event, data) => {
  return await MediaController.setDefaultMedia(data);
});

withHandler(RouteMedia.REMOVE_DEFAULT, async (_event, data) => {
  return await MediaController.removeDefaultMedia(data);
});
