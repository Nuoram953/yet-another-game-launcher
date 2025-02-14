import { GameConfigGamescope } from "@prisma/client";
import { prisma } from "..";

export const createOrUpdate = async (data: GameConfigGamescope) => {
  return await prisma.gameConfigGamescope.upsert({
    where: {
      gameId: data.gameId,
    },
    update: {
      isEnabled: data.isEnabled,
      isBorderless: data.isBorderless,
      isFullscreen: data.isFullscreen,
      isFsr: data.isFsr,
      isAllowUnfocused: data.isAllowUnfocused,
      isEnableSteamOverlay: data.isEnableSteamOverlay,
      isForceGrabCursor: data.isForceGrabCursor,
      width: data.width,
      height: data.height,
      refreshRate: data.refreshRate,
    },
    create: {
      gameId: data.gameId!,
      isEnabled: data.isEnabled,
      isBorderless: data.isBorderless,
      isFullscreen: data.isFullscreen,
      isFsr: data.isFsr,
      isAllowUnfocused: data.isAllowUnfocused,
      isEnableSteamOverlay: data.isEnableSteamOverlay,
      isForceGrabCursor: data.isForceGrabCursor,
      width: data.width,
      height: data.height,
      refreshRate: data.refreshRate,
    },
  });
};
