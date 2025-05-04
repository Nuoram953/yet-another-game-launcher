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
