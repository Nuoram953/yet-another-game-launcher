import { z } from "zod";
import { LaunchType } from "../../common/types";
import { Emulator, GameStatus, Storefront } from "@common/constant";

export const CreateGameSchema = z.object({
  gameData: z.object({
    name: z.string(),
    externalId: z.optional(z.string()),
    storefrontId: z.optional(z.enum(Storefront)),
    gameStatusId: z.optional(z.enum(GameStatus)),
    lastTimePlayed: z.optional(z.bigint()),
    timePlayed: z.optional(z.number()),
    timePlayedWindows: z.optional(z.number()),
    timePlayedMac: z.optional(z.number()),
    timePlayedLinux: z.optional(z.number()),
    timePlayedSteamdeck: z.optional(z.number()),
    timePlayedDisconnected: z.optional(z.number()),
    size: z.optional(z.bigint()),
    location: z.optional(z.string()),
    isInstalled: z.boolean(),
  }),
  storefrontData: z.optional(
    z.object({
      name: z.string(),
      isEnabled: z.boolean(),
      storefrontId: z.enum(Storefront),
    }),
  ),
  emulatorData: z.optional(
    z.object({
      name: z.string(),
      emulatorId: z.enum(Emulator),
      isEnabled: z.boolean(),
      path: z.string(),
    }),
  ),
});

export const LaunchGameSchema = z.object({
  gameId: z.string(),
  launchType: z.enum(LaunchType),
  launchId: z.number(),
});

export const RefreshGameSchema = z.object({
  gameId: z.string(),
});

export const InstallGameSchema = z.object({
  gameId: z.string(),
});

export const UninstallGameSchema = z.object({
  gameId: z.string(),
});

export const KillGameSchema = z.object({
  id: z.string(),
  launchType: z.enum(LaunchType),
  launchId: z.number(),
});

export const GetReviewSchema = z.object({
  gameId: z.string(),
});

export const SetReviewSchema = z.object({
  gameId: z.string(),
  isAdvanceReview: z.optional(z.boolean()),
  score: z.optional(z.number()),
  review: z.optional(z.string()),
});

export const CreateReviewThoughtSchema = z.object({
  gameId: z.string(),
});

export const UpdateReviewThoughtSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  text: z.string(),
  isPositive: z.optional(z.boolean()),
  isNegative: z.optional(z.boolean()),
  createdAt: z.optional(z.date()),
  updatedAt: z.optional(z.date()),
});

export const DeleteReviewThoughtSchema = z.object({
  id: z.string(),
});

export const SetGameStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export const SetGameFavoriteSchema = z.object({
  id: z.string(),
  isFavorite: z.boolean(),
});

export const GameOperationSchema = z.object({
  id: z.string(),
});

export const CreateLaunchSchema = z.object({
  gameId: z.string(),
  name: z.string(),
  path: z.string(),
  type: z.enum(LaunchType),
});

export const UpdateLaunchSchema = z.object({
  id: z.optional(z.string()),
  gameId: z.string(),
  name: z.string(),
  path: z.string(),
  isEnabled: z.boolean(),
  type: z.enum(LaunchType),
});

export const DeleteLaunchSchema = z.object({
  id: z.number(),
  type: z.enum(LaunchType),
});

export const SetStatusSchema = z.object({
  gameId: z.string(),
  statusId: z.number(),
});

export type CreateGameSchema = z.infer<typeof CreateGameSchema>;
export type LaunchGameSchema = z.infer<typeof LaunchGameSchema>;
export type RefreshGameSchema = z.infer<typeof RefreshGameSchema>;
export type InstallGameSchema = z.infer<typeof InstallGameSchema>;
export type UninstallGameSchema = z.infer<typeof UninstallGameSchema>;
export type KillGameSchema = z.infer<typeof KillGameSchema>;
export type GetReviewSchema = z.infer<typeof GetReviewSchema>;
export type SetReviewSchema = z.infer<typeof SetReviewSchema>;
export type CreateReviewThoughtSchema = z.infer<typeof CreateReviewThoughtSchema>;
export type UpdateReviewThoughtSchema = z.infer<typeof UpdateReviewThoughtSchema>;
export type DeleteReviewThoughtSchema = z.infer<typeof DeleteReviewThoughtSchema>;

export type SetGameStatusSchema = z.infer<typeof SetGameStatusSchema>;
export type SetGameFavoriteSchema = z.infer<typeof SetGameFavoriteSchema>;
export type GameOperationSchema = z.infer<typeof GameOperationSchema>;

export type CreateLaunchSchema = z.infer<typeof CreateLaunchSchema>;
export type UpdateLaunchSchema = z.infer<typeof UpdateLaunchSchema>;
export type DeleteLaunchSchema = z.infer<typeof DeleteLaunchSchema>;

export type SetStatusSchema = z.infer<typeof SetStatusSchema>;
