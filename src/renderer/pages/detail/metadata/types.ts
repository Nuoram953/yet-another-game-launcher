import { MEDIA_TYPE } from "../../../../common/constant";

export interface MediaItem {
  src: string;
  alt: string;
  name: string;
  type: MEDIA_TYPE;
}

export interface MediaGroup {
  all: MediaItem[];
  default: string | null;
}

export interface MediaState {
  background: MediaGroup;
  icon: MediaGroup;
  logo: MediaGroup;
  cover: MediaGroup;
  screenshot: MediaGroup;
  [key: string]: MediaGroup;
}
