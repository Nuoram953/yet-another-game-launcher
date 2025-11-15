import { getLibrary, getMedia } from "@render/api/electron";

export const getGameDetails = async (id: string) => {
  return await getLibrary().getGame(id);
};

export const getGameBackground = async (id: string) => {
  return await getMedia().getBackgrounds(id);
};

export const getGameLogo = async (id: string) => {
  return await getMedia().getLogos(id, 1);
};

export const getGameTrailers = async (id: string) => {
  return await getMedia().getTrailers(id);
};

export const getGameMusics = async (id: string) => {
  return await getMedia().getMusics(id, 1);
};

export const getGameCover = async (id: string) => {
  return await getMedia().getCovers(id, 1);
};
