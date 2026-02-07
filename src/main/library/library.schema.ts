import { LaunchType } from "@common/types";
import z from "zod";

export const LaunchGame = z.object({
  gameId: z.string(),
  launchId: z.number(),
  launchType: z.enum(LaunchType),
});
export type LaunchGame = z.infer<typeof LaunchGame>;

export const RefreshGame = z.object({
  gameId: z.string(),
});
export type RefreshGame = z.infer<typeof RefreshGame>;
