export interface GetOwnedGamesResponse {
  response: {
    game_count: number;
    games: {
      appid: number;
      name: string;
      playtime_forever: number;
      img_icon_url: string;
      has_community_visible_stats: true;
      playtime_windows_forever: number;
      playtime_mac_forever: number;
      playtime_linux_forever: number;
      playtime_deck_forever: number;
      rtime_last_played: bigint;
      content_descriptorids: number[];
      playtime_disconnected: number;
    }[];
  };
}

export interface GetSchemaForGameResponse {
  game: {
    gameName: string;
    gameVersion: string;
    availableGameStats: {
      achievements: {
        name: string;
        defaultvalue: number;
        displayName: string;
        hidden: number;
        description?: string;
        icon: string;
        icongray: string;
      }[];
    };
  };
}

export interface GetPlayerAchievementsResponse {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: {
      apiname: string;
      achieved: number;
      unlocktime: bigint;
    }[];
    success: boolean;
  };
}

export interface GetPlayerSummariesResponse {
  response: {
    players: {
      steamid: string;
      communityvisibilitystate: number;
      profilestate: number;
      personaname: string;
      commentpermission: number;
      profileurl: string;
      avatar: string;
      avatarmedium: string;
      avatarfull: string;
      avatarhash: string;
      personastate: number;
      realname?: string;
      primaryclanid: string;
      timecreated: number;
      personastateflags: number;
      loccountrycode?: string;
      locstatecode?: string;
    }[];
  };
}

export interface GetAppReviewsResponse {
  success: number;
  query_summary: {
    num_reviews: number;
    review_score: number;
    review_score_desc: string;
    total_positive: number;
    total_negative: number;
    total_reviews: number;
  };
  reviews: {
    recommendationid: string;
    author: {
      steamid: string;
      num_games_owned: number;
      num_reviews: number;
      playtime_forever: number;
      playtime_last_two_weeks: number;
      playtime_at_review: number;
      last_played: number;
    };
    language: string;
    review: string;
    timestamp_created: number;
    timestamp_updated: number;
    voted_up: boolean;
    votes_up: number;
    votes_funny: number;
    weighted_vote_score: string;
    comment_count: number;
    steam_purchase: boolean;
    received_for_free: boolean;
    written_during_early_access: boolean;
  }[];
  cursor: string;
}

export interface SteamAccountInfo {
  AccountName: string;
  PersonaName: string;
  RememberPassword: number;
  WantsOfflineMode: number;
  SkipOfflineModeWarning: number;
  AllowAutoLogin: number;
  MostRecent: number;
  Timestamp: number;
}

export type SteamAccountsArray = [string, SteamAccountInfo][];
