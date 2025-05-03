import _ from "lodash";
import { MEDIA_TYPE } from "../../common/constant";
import queries from "../dal/dal";
import { app } from "electron";
import path from "path";
import fs from "fs";
import { ErrorMessage } from "../../common/error";
import { metadataManager } from "..";

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
  await metadataManager.deleteMedia(gameId, mediaType, mediaId);
};

export const search = async (gameId: string, mediaType: MEDIA_TYPE, page: number) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  return await metadataManager.search(game, mediaType, page);
};

export const downloadByUrl = async (gameId: string, mediaType: MEDIA_TYPE, url: string) => {
  const game = await queries.Game.getGameById(gameId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  return await metadataManager.downloadImage(mediaType, game, url);
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
