export enum IMAGE_TYPE {
  COVER = "cover",
  BACKGROUND = "background",
  LOGO = "logo",
  ICON = "icon",
  TRAILER = "trailer",
  ACHIEVEMENT = "achievement",
}

export enum RouteLibrary {
  GET_GAME = "library:getGame",
  GET_GAMES = "library:getGames",
  GET_LAST_PLAYED = "library:getLastPlayed",
  GET_COUNT_STATUS = "library:countStatus",
  GET_COUNT_PLATFORM = "library:countPlatform",
  GET_COUNT_STORE = "library:countStore",
  GET_STATUS = "library:getStatus",
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
  LAUNCH = "game:launch",
  INSTALL = "game:install",
  SET_REVIEW = "game:setReview",
  SET_STATUS = "game:setStatus",
}
