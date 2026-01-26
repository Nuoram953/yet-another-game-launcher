import _ from "lodash";
import { MEDIA_TYPE } from "../../common/constant";
import queries from "../dal/dal";

import * as PathUtils from "./utils/paths";
import * as FileUtils from "./utils/fileOperations";
import * as MediaValidation from "./utils/mediaValidation";
import * as MediaTransform from "./utils/mediaTransform";

import { SearchMediaCommand } from "./commands/searchMedia";
import { DownloadMediaCommand } from "./commands/downloadMedia";
import { CleanupMediaCommand } from "./commands/cleanupMedia";

export const getAllMedia = async (gameId: string) => {
  const game = await MediaValidation.validateGameExists(gameId);

  const backgrounds = await getMediaByType(MEDIA_TYPE.BACKGROUND, gameId);
  const icons = await getMediaByType(MEDIA_TYPE.ICON, gameId);
  const logos = await getMediaByType(MEDIA_TYPE.LOGO, gameId);
  const covers = await getMediaByType(MEDIA_TYPE.COVER, gameId);
  const trailers = await getMediaByType(MEDIA_TYPE.TRAILER, gameId);
  const screenshots = await getMediaByType(MEDIA_TYPE.SCREENSHOT, gameId);
  const musics = await getMediaByType(MEDIA_TYPE.MUSIC, gameId);

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
    musics: {
      default: (await queries.MediaDefault.findByGameIdAndMediaType(gameId, MEDIA_TYPE.MUSIC))?.mediaName,
      all: musics,
    },
  };
};

export const getMediaByType = async (type: MEDIA_TYPE, gameId: string, count?: number): Promise<string[]> => {
  const game = await MediaValidation.validateGameExists(gameId);

  const dir = PathUtils.getMediaDirectory(game.id, type);

  try {
    if (!FileUtils.isDirectoryAccessible(dir)) {
      console.warn(`Media directory not accessible: ${dir}`);
      return [];
    }

    const allFiles = FileUtils.getGameMediaFiles(game.id, type);

    const originalFiles = MediaTransform.filterOriginalFiles(allFiles);

    if (originalFiles.length === 0) {
      return [];
    }

    const getPreferredForCurrentContext = (file: string) => MediaTransform.getPreferredFile(file, allFiles, type);

    if (_.isUndefined(count)) {
      return originalFiles.map((file) => PathUtils.createFileUri(dir, getPreferredForCurrentContext(file)));
    }

    const requestedCount = count as number;
    const paths: string[] = [];

    try {
      const defaultMedia = await queries.MediaDefault.findByGameIdAndMediaType(game.id, type);
      if (defaultMedia) {
        const defaultFileName = getPreferredForCurrentContext(defaultMedia.mediaName);
        const defaultPath = PathUtils.getMediaDirectory(game.id, type) + "/" + defaultFileName;

        if (FileUtils.fileExists(defaultPath)) {
          paths.push(PathUtils.createFileUri(dir, defaultFileName));
        }
      }
    } catch (defaultError) {
      console.error(`Error fetching default media for game ${gameId}, type ${type}:`, defaultError);
    }

    const shuffledFiles = MediaTransform.shuffleArray(originalFiles);
    const filesToAdd = shuffledFiles.slice(0, requestedCount);

    for (const file of filesToAdd) {
      paths.push(PathUtils.createFileUri(dir, getPreferredForCurrentContext(file)));
    }

    return MediaTransform.removeDuplicatesAndFill(
      paths,
      originalFiles,
      dir,
      getPreferredForCurrentContext,
      requestedCount,
      PathUtils.createFileUri,
    );
  } catch (error) {
    console.error(`Error accessing media directory ${dir}:`, error);
    return [];
  }
};

export const getRecentlyPlayedBackgrounds = async (count: number): Promise<string[]> => {
  const paths: string[] = [];

  const games = await queries.Game.getGames(count);
  for (const game of games) {
    const backgrounds = await getMediaByType(MEDIA_TYPE.BACKGROUND, game.id, 1);
    if (backgrounds.length > 0) {
      paths.push(backgrounds[0]);
    }
  }

  return paths;
};

export const deleteMediaByGameIdAndMediaId = async (gameId: string, mediaType: MEDIA_TYPE, mediaId: string) => {
  return await CleanupMediaCommand.execute(gameId, mediaType, mediaId);
};

export const search = async (gameId: string, mediaType: MEDIA_TYPE, search: string, page: number) => {
  return await SearchMediaCommand.execute(gameId, mediaType, search, page);
};

export const downloadByUrl = async (gameId: string, mediaType: MEDIA_TYPE, url: string) => {
  return await DownloadMediaCommand.execute(gameId, mediaType, url);
};

export const setDefault = async (gameId: string, mediaType: MEDIA_TYPE, name: string) => {
  const game = await MediaValidation.validateGameExists(gameId);

  const mediaTypeDb = await queries.MediaType.findByName(mediaType);

  await queries.MediaDefault.createOrUpdate({
    gameId: game.id,
    mediaTypeId: mediaTypeDb?.id,
    mediaName: name,
  });
};

export const removeDefault = async (gameId: string, mediaType: MEDIA_TYPE) => {
  const game = await MediaValidation.validateGameExists(gameId);

  await queries.MediaDefault.deleteByGameIdAndMediaType(game.id, mediaType);
};
