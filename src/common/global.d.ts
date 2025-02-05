interface Window {
  api: {
    getStoredPicturesDirectory: (id: string) => Promise<string>;
  };
  media: {
    getAllMedia: () => Promise<string[][]>;
    getBackgrounds: (gameId: string, count?: number) => Promise<string[]>;
    getRecentlyPlayedBackground: () => Promise<string[]>;
    getLogos: (gameId: string, count?: number) => Promise<string[]>;
    getIcons: (gameId: string, count?: number) => Promise<string[]>;
    getCovers: (gameId: string, count?: number) => Promise<string[]>;
    getTrailers: (gameId: string, count?: number) => Promise<string[]>;
    getAchievements: (gameId: string, count?: number) => Promise<string[]>;
  };
}
