export enum IMAGE_TYPE {
  COVER = "cover",
  BACKGROUND = "background",
  LOGO = "logo",
  ICON = "icon",
  TRAILER = "trailer",
  ACHIEVEMENT = "achievement",
}

export enum NotificationType {
  REFRESH = "library:refresh",
  INSTALLED = "library:game:installed",
}

export enum RouteDownload{
  ON_DOWNLOAD_STATUS="data:download:status",
  ON_DOWNLOAD_STOP="data:download:stop",
}

export enum DataRoute{
  REQUEST_GAMES="data:request:games",
  REQUEST_GAME="data:request:game",
  RUNNING_GAME="data:running:game"
}

export enum RouteLibrary {
  REFRESH = "library:refresh",
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
  KILL = "game:kill",
  UNINSTALL = "game:uninstall",
  SET_REVIEW = "game:setReview",
  SET_STATUS = "game:setStatus",
}
