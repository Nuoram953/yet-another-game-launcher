import { Video } from "../externalApi/youtube/types";

export type ResponseGetMediaByType = string[];

export type ResponseGetAllMedia = {
  backgrounds: { default?: string; all: string[] };
  icons: { default?: string; all: string[] };
  logos: { default?: string; all: string[] };
  covers: { default?: string; all: string[] };
  trailers: { default?: string; all: string[] };
  screenshots: { default?: string; all: string[] };
  musics: { default?: string; all: string[] };
};

export type ResponseSearchMedia = string[] | Video[];

export type ResponseDownloadMedia = void;

export type ResponseDeleteMedia = void;

export type ResponseSetDefault = void;

export type ResponseRemoveDefault = void;
