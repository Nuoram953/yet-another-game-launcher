import { MEDIA_TYPE } from "../../common/constant";
import * as z from "zod";

export const GetMediaByType = z.object({
  gameId: z.string(),
  count: z.optional(z.number()),
  type: z.enum(MEDIA_TYPE),
});
export type GetMediaByType = z.infer<typeof GetMediaByType>;

export const SearchMediaSchema = z.object({
  gameId: z.string(),
  mediaType: z.enum(MEDIA_TYPE),
  search: z.string(),
  page: z.number().int().min(1),
});
export type SearchMediaSchema = z.infer<typeof SearchMediaSchema>;

export const DownloadMediaSchema = z.object({
  gameId: z.string(),
  mediaType: z.enum(MEDIA_TYPE),
  url: z.string().url(),
});
export type DownloadMediaSchema = z.infer<typeof DownloadMediaSchema>;

export const DeleteMediaSchema = z.object({
  gameId: z.string(),
  mediaType: z.enum(MEDIA_TYPE),
  mediaId: z.string(),
});
export type DeleteMediaSchema = z.infer<typeof DeleteMediaSchema>;

export const SetDefaultMediaSchema = z.object({
  gameId: z.string(),
  mediaType: z.enum(MEDIA_TYPE),
  name: z.string(),
});
export type SetDefaultMediaSchema = z.infer<typeof SetDefaultMediaSchema>;

export const RemoveDefaultMediaSchema = z.object({
  gameId: z.string(),
  mediaType: z.enum(MEDIA_TYPE),
});
export type RemoveDefaultMediaSchema = z.infer<typeof RemoveDefaultMediaSchema>;

export const GetAllMediaSchema = z.object({
  gameId: z.string(),
});
export type GetAllMediaSchema = z.infer<typeof GetAllMediaSchema>;

export const GetMediaBySpecificTypeSchema = z.object({
  gameId: z.string(),
  count: z.optional(z.number().int().min(1)),
});
export type GetMediaBySpecificTypeSchema = z.infer<typeof GetMediaBySpecificTypeSchema>;
