export enum MEDIA_TYPE {
  COVER = "cover",
  BACKGROUND = "background",
  LOGO = "logo",
  ICON = "icon",
  TRAILER = "trailer",
  ACHIEVEMENT = "achievement",
  SCREENSHOT = "screenshot",
}

export enum NotificationType {
  REFRESH = "library:refresh",
  INSTALLED = "library:game:installed",
  NEW_GAME = "library:game:new",
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
  GET_DOWNLOAD_HISTORY = "library:getDownloadHistory",
  GET_STOREFRONTS = "library:storefront",
  GET_FILTERS = "library:getFilters",
}

export enum ConfigRoute {
  GET = "config:get",
  SET = "config:set",
  GET_ALL = "config:getAll",
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
  GET_SCREENSHOTS = "media:getScreenshots",
  DELETE = "media:delete",
  SEARCH = "media:search",
  DOWNLOAD_BY_URL = "media:downloadByUrl",
  SET_DEFAULT = "media:setDefault",
  EDIT = "media:edit",
}

export enum RouteRanking {
  GET_RANKING = "ranking:getRanking",
  GET_RANKINGS = "ranking:getAll",
  CREATE = "ranking:create",
  DELETE = "ranking:delete",
  EDIT = "ranking:edit",
  REMOVE_GAME_FROM_RANKING = "ranking:removeGameFromRanking",
}

export enum RouteGame {
  LAUNCH = "game:launch",
  INSTALL = "game:install",
  KILL = "game:kill",
  UNINSTALL = "game:uninstall",
  SET_REVIEW = "game:setReview",
  SET_STATUS = "game:setStatus",
  SET_SETTING_GAMESCOPE = "game:setGamescope",
  REFRESH_PROGRESS_TRACKER = "game:refreshprogressTracker",
}
