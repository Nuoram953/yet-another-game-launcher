import _ from "lodash";
import { MEDIA_TYPE } from "../../common/constant";
import queries from "../dal/dal";
import { app } from "electron";
import path from "path";
import fs from "fs";
import { ErrorMessage } from "../../common/error";
import * as MetadataService from "@main/metadata/index";

export const getAllMedia = async (gameId: string) => {
  const game = await queries.Game.getGameById(gameId);

  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  const backgrounds = await getMediaByType(MEDIA_TYPE.BACKGROUND, gameId);
  const icons = await getMediaByType(MEDIA_TYPE.ICON, gameId);
  const logos = await getMediaByType(MEDIA_TYPE.LOGO, gameId);
  const covers = await getMediaByType(MEDIA_TYPE.COVER, gameId);
  const trailers = await getMediaByType(MEDIA_TYPE.TRAILER, gameId);
  const screenshots = await getMediaByType(MEDIA_TYPE.SCREENSHOT, gameId);

  return {
    backgrounds: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.BACKGROUND))?.mediaName,
      all: backgrounds,
    },
    icons: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.ICON))?.mediaName,
      all: icons,
    },
    logos: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.LOGO))?.mediaName,
      all: logos,
    },
    covers: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.COVER))?.mediaName,
      all: covers,
    },
    trailers: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.TRAILER))?.mediaName,
      all: trailers,
    },
    screenshots: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.SCREENSHOT))?.mediaName,
      all: screenshots,
    },
  };
};

export const getMediaByType = async (type: MEDIA_TYPE, gameId: string, count?: number) => {
  const game = await queries.Game.getGameById(gameId);

  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  try {
    const paths = [];
    const directory = path.join(app.getPath("userData"), game.id, type);

    const files = fs.readdirSync(directory);

    if (_.isUndefined(count)) {
      for (const file of files) {
        paths.push(`file://${path.join(directory, file)}`);
      }
      return paths;
    }

    const defaultMedia = await queries.MediaDefault.findByGameIdAndMediaType(game.id, type);

    if (defaultMedia) {
      paths.push(`file://${path.join(directory, defaultMedia.mediaName)}`);
    }

    const randomFiles = files.sort(() => 0.5 - Math.random()).slice(0, count);
    for (const file of randomFiles) {
      paths.push(`file://${path.join(directory, file)}`);
    }

    return paths;
  } catch (e) {
    return [];
  }
};

export const getRecentlyPlayedBackgrounds = async (count: number) => {
  const paths = [];

  const games = await queries.Game.getGames(count);
  for (const game of games) {
    const backgrounds = await getMediaByType(MEDIA_TYPE.BACKGROUND, game.id, 1);
    paths.push(backgrounds[0]);
  }
};

export const deleteMediaByGameIdAndMediaId = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string) => {
  await MetadataService.deleteMedia(gameId, mediaType, mediaId);
};

export const search = async (gameId: string, mediaType: MEDIA_TYPE, page: number) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  return await MetadataService.searchMedia(game, mediaType, page);
};

export const downloadByUrl = async (gameId: string, mediaType: MEDIA_TYPE, url: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  return await MetadataService.downloadImage(mediaType, game, url);
};

export const setDefault = async (gameId: string, mediaType: MEDIA_TYPE, name: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  const mediaTypeDb = await queries.MediaType.findByName(mediaType);

  await queries.MediaDefault.createOrUpdate({
    gameId: game.id,
    mediaTypeId: mediaTypeDb?.id,
    mediaName: name,
  });
};

export const removeDefault = async (gameId: string, mediaType: MEDIA_TYPE) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  await queries.MediaDefault.deleteByGameIdAndMediaType(game.id, mediaType);
};
