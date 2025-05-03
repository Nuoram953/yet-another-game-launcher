import { MediaDefault } from "@prisma/client";
import { prisma } from "..";
import { MEDIA_TYPE } from "src/common/constant";
import queries from "../dal/dal";

export const createOrUpdate = async (data: Partial<MediaDefault>) => {
  return await prisma.mediaDefault.upsert({
    where: {
      mediaTypeId_gameId: {
        mediaTypeId: data.mediaTypeId!,
        gameId: data.gameId!,
      },
    },
    update: {
      mediaTypeId: data.mediaTypeId!,
      mediaName: data.mediaName,
    },
    create: {
      mediaTypeId: data.mediaTypeId!,
      gameId: data.gameId!,
      mediaName: data.mediaName!,
    },
  });
};

export const findByGameIdAndMediaType = async (gameId: string, mediaType: MEDIA_TYPE) => {
  const mediaTypeDb = await queries.MediaType.findByName(mediaType);

  return await prisma.mediaDefault.findUnique({
    where: {
      mediaTypeId_gameId: {
        mediaTypeId: mediaTypeDb!.id,
        gameId: gameId,
      },
    },
  });
};

export const deleteByGameIdAndMediaType = async (gameId: string, mediaType: MEDIA_TYPE) => {
  const mediaTypeDb = await queries.MediaType.findByName(mediaType);

  return await prisma.mediaDefault.delete({
    where: {
      mediaTypeId_gameId: {
        mediaTypeId: mediaTypeDb!.id,
        gameId: gameId,
      },
    },
  });
};
