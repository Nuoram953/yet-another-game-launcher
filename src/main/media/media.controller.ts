import * as MediaService from "./media.service";
import * as MediaSchema from "./media.schema";
import { ErrorMessage } from "../../common/error";

export const getMediaByType = async (data: MediaSchema.GetMediaByType) => {
  const result = await MediaSchema.GetMediaByType.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.getMediaByType(result.data.type, result.data.gameId, result.data.count);
};

export const getAllMedia = async (data: MediaSchema.GetAllMediaSchema) => {
  const result = await MediaSchema.GetAllMediaSchema.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.getAllMedia(result.data.gameId);
};

export const searchMedia = async (data: MediaSchema.SearchMediaSchema) => {
  const result = await MediaSchema.SearchMediaSchema.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.search(result.data.gameId, result.data.mediaType, result.data.search, result.data.page);
};

export const downloadMedia = async (data: MediaSchema.DownloadMediaSchema) => {
  const result = await MediaSchema.DownloadMediaSchema.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.downloadByUrl(result.data.gameId, result.data.mediaType, result.data.url);
};

export const deleteMedia = async (data: MediaSchema.DeleteMediaSchema) => {
  const result = await MediaSchema.DeleteMediaSchema.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.deleteMediaByGameIdAndMediaId(
    result.data.gameId,
    result.data.mediaType,
    result.data.mediaId,
  );
};

export const setDefaultMedia = async (data: MediaSchema.SetDefaultMediaSchema) => {
  const result = await MediaSchema.SetDefaultMediaSchema.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.setDefault(result.data.gameId, result.data.mediaType, result.data.name);
};

export const removeDefaultMedia = async (data: MediaSchema.RemoveDefaultMediaSchema) => {
  const result = await MediaSchema.RemoveDefaultMediaSchema.safeParseAsync(data);
  if (!result.success) throw new Error(ErrorMessage.INVALID_BODY);

  return await MediaService.removeDefault(result.data.gameId, result.data.mediaType);
};
