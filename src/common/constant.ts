export enum LOCALE_NAMESPACE {
  COMMON = "common",
  GAME_STATUS = "GameStatus",
  FILTER = "filter",
  SETTINGS = "settings",
  DETAIL = "detail",
}

export enum MEDIA_TYPE {
  COVER = "cover",
  BACKGROUND = "background",
  LOGO = "logo",
  ICON = "icon",
  TRAILER = "trailer",
  ACHIEVEMENT = "achievement",
  SCREENSHOT = "screenshot",
  MUSIC = "music",
}

export enum NotificationType {
  REFRESH = "library:refresh",
  INSTALLED = "library:game:installed",
  NEW_GAME = "library:game:new",
}

export enum RouteDownload {
  ON_DOWNLOAD_STATUS = "data:download:status",
  ON_DOWNLOAD_STOP = "data:download:stop",
}

export enum DataRoute {
  REQUEST_GAMES = "data:request:games",
  REQUEST_GAME = "data:request:game",
  RUNNING_GAME = "data:running:game",
  CONFIG_CHANGE = "data:request:config",
}

export enum RouteLibrary {
  REFRESH = "library:refresh",
  GET_SIDEBAR = "library:getSidebar",
  GET_GAME = "library:getGame",
  GET_GAMES = "library:getGames",
  GET_LAST_PLAYED = "library:getLastPlayed",
  GET_COUNT_STATUS = "library:countStatus",
  GET_COUNT_PLATFORM = "library:countPlatform",
  GET_COUNT_STORE = "library:countStore",
  GET_STATUS = "library:getStatus",
  GET_DOWNLOAD_HISTORY = "library:getDownloadHistory",
  CLEAR_DOWNLOAD_HISTORY = "library:clearDownloadHistory",
  GET_STOREFRONTS = "library:storefront",
  GET_FILTERS = "library:getFilters",
  SET_FILTER_PRESET = "library:setFilterPreset",
  DELETE_FILTER_PRESET = "library:deleteFilterPreset",
  SEARCH = "library:search",
  ADD_GAME = "library:addGame",
  GET_EMULATORS = "library:getEmulators",
}

export enum ConfigRoute {
  GET = "config:get",
  SET = "config:set",
  GET_ALL = "config:getAll",
}

export enum RouteStore {
  LAUNCH = "store:launch",
}

export enum RouteMedia {
  GET_ALL_MEDIA = "media:getAll",
  GET_MEDIA_BY_TYPE = "media:getByType",
  DELETE = "media:delete",
  SEARCH = "media:search",
  DOWNLOAD_BY_URL = "media:downloadByUrl",
  SET_DEFAULT = "media:setDefault",
  REMOVE_DEFAULT = "media:removeDefault",
  EDIT = "media:edit",
}

export enum RouteRanking {
  GET_RANKING = "ranking:getRanking",
  GET_RANKINGS = "ranking:getAll",
  CREATE = "ranking:create",
  DELETE = "ranking:delete",
  EDIT = "ranking:edit",
  ADD_GAME_FROM_RANKING = "ranking:addGameFromRanking",
  REMOVE_GAME_FROM_RANKING = "ranking:removeGameFromRanking",
  UPDATE_GAME_ORDER = "ranking:updateGameOrder",
}

export enum RouteThirdParty {
  IGDB_GET_GAMES_BY_SEARCH = "thirdparty:getGamesBySearchIGDB",
}

export enum RouteWishlist {
  SEARCH = "wishlist:search",
  ADD = "wishlist:add",
  GET = "wishlist:get",
  REMOVE = "wishlist:remove",
}

export enum RouteGame {
  LAUNCH = "game:launch",
  INSTALL = "game:install",
  KILL = "game:kill",
  UNINSTALL = "game:uninstall",
  SET_REVIEW = "game:setReview",
  GET_REVIEW = "game:getReview",
  CREATE_REVIEW_THOUGHT = "game:createReviewThought",
  UPDATE_REVIEW_THOUGHT = "game:updateReviewThought",
  DELETE_REVIEW_THOUGHT = "game:deleteReviewThought",
  SET_STATUS = "game:setStatus",
  SET_FAVORITE = "game:setFavorite",
  SET_SETTING_GAMESCOPE = "game:setGamescope",
  REFRESH_PROGRESS_TRACKER = "game:refreshprogressTracker",
  REFRESH_INFO = "game:refreshInfo",
  RESET_REVIEW = "game:resetReview",
  ADD_LAUNCH_APP = "game:addLaunchApp",
  ADD_LAUNCH_EMULATOR = "game:addLaunchEmulator",
  DELETE_LAUNCH = "game:deleteLaunch",
}

export enum RouteDialog {
  OPEN = "dialog:open",
}

export enum GameStatus {
  UNPLAYED = 1,
  PLAYED = 2,
  COMPLETED = 3,
  beaten = 4,
  DROPPED = 5,
  playing = 6,
  planned = 7,
}

export enum Storefront {
  STEAM = 1,
  EPIC = 2,
}

export enum Emulator {
  DOLPHIN = 1,
  CITRON = 2,
  RYUJINX = 3,
  SHADPS4 = 4,
  EDEN = 5,
}
