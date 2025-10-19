export interface AppConfig {
  sidebar: {
    display: {
      showGameCount: boolean;
    };
  };
  grid: {
    display: {
      fadeGamesNotInstalled: boolean;
    };
  };
  store: {
    steam: {
      enable: boolean;
      apiKey: string;
      accountName: string;
      isntallationPath?: string | null;
    };
    epic: {
      enable: boolean;
    };
  };
  page: {
    detail: {
      review: {
        blurExternalReviews: boolean;
      };
    };
  };
  extension: {
    youtube: {
      enable: boolean;
      ytDlpPath: string;
      cookie: string;
    };
    howLongToBeat: {
      enable: boolean;
    };
    openCritic: {
      enable: boolean;
    };
    steamGridDb: {
      enable: boolean;
      apiKey: string;
    };
    igdb: {
      enable: boolean;
      clientId: string;
      clientSecret: string;
    };
  };
}
