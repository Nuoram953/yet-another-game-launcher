export interface AppConfig {
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
}
