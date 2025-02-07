export enum IMAGE_TYPE {
  COVER = "cover",
  BACKGROUND = "background",
  LOGO = "logo",
  ICON = "icon",
  TRAILER = "trailer",
  ACHIEVEMENT = "achievement",
}

export enum RouteLibrary {
  GET_COUNT_STATUS = "library:countStatus",
  GET_COUNT_PLATFORM = "library:countPlatform",
  GET_COUNT_STORE = "library:countStore",
}

export enum RouteMedia {
  GET_ALL_MEDIA = "media:getAll",
  GET_BACKGROUNDS = "media:getBackgrounds",
  GET_RECENTLY_PLAYED_BACKGROUNDS = "media:getRecentlyPlayedBackgrounds",
  GET_LOGOS = "media:getLogos",
  GET_ICONS = "media:getIcons",
  GET_COVERS = "media:getCovers",
  GET_TRAILERS = "media:getTrailer",
  GET_ACHIEVEMENTS = "media:getAchievements",
}

export enum RouteGame {
  SET_REVIEW = "game:setReview",
}
