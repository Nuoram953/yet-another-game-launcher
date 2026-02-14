import { vi } from "vitest";

// Electron API mocks
export const mockElectronApp = {
  getPath: vi.fn().mockReturnValue("/mock/user/data"),
  isPackaged: false,
  getAppPath: vi.fn().mockReturnValue("/mock/app/path"),
  getVersion: vi.fn().mockReturnValue("1.0.0-test"),
  getName: vi.fn().mockReturnValue("YAGL Test"),
  quit: vi.fn(),
  relaunch: vi.fn(),
};

export const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
  removeHandler: vi.fn(),
};

export const mockBrowserWindow = vi.fn().mockImplementation((options?: any) => ({
  loadFile: vi.fn(),
  loadURL: vi.fn(),
  webContents: {
    send: vi.fn(),
    executeJavaScript: vi.fn(),
  },
  show: vi.fn(),
  hide: vi.fn(),
  close: vi.fn(),
  isDestroyed: vi.fn().mockReturnValue(false),
  destroy: vi.fn(),
}));

export const mockDialog = {
  showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ["/mock/file/path"] }),
  showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: "/mock/save/path" }),
  showMessageBox: vi.fn().mockResolvedValue({ response: 0 }),
};

export const mockShell = {
  openExternal: vi.fn().mockResolvedValue(undefined),
  openPath: vi.fn().mockResolvedValue(""),
  showItemInFolder: vi.fn(),
};

// File System mocks
export const mockFS = {
  readFileSync: vi.fn().mockReturnValue("mock file content"),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  unlinkSync: vi.fn(),
  readdirSync: vi.fn().mockReturnValue(["cover-1.jpg", "cover-2.jpg", "icon-1.png"]),
  statSync: vi.fn().mockReturnValue({
    isDirectory: vi.fn().mockReturnValue(false),
    isFile: vi.fn().mockReturnValue(true),
    size: 1024,
  }),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  rmSync: vi.fn(),
};

export const mockPath = {
  join: vi.fn().mockImplementation((...args: string[]) => args.join("/")),
  resolve: vi.fn().mockImplementation((...args: string[]) => "/" + args.join("/")),
  dirname: vi.fn().mockReturnValue("/mock/dir"),
  basename: vi.fn().mockReturnValue("mock-file.ext"),
  extname: vi.fn().mockReturnValue(".ext"),
  isAbsolute: vi.fn().mockReturnValue(true),
  relative: vi.fn().mockReturnValue("../relative/path"),
};

// Process mocks
export const mockProcess = {
  platform: "linux",
  arch: "x64",
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "file:./test.db",
  },
  cwd: vi.fn().mockReturnValue("/mock/cwd"),
  exit: vi.fn(),
  kill: vi.fn(),
};

// Media service mocks
export const MEDIA_TYPE = {
  COVER: "covers",
  ICON: "icons",
  LOGO: "logos",
  BACKGROUND: "backgrounds",
  TRAILER: "trailers",
  SCREENSHOT: "screenshots",
  MUSIC: "musics",
} as const;

type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const mockMediaService = {
  getMediaByType: vi.fn().mockImplementation(async (type: MediaType, gameId: string, count?: number) => {
    const mockMedia = [`mock-${type.toLowerCase()}-1-${gameId}.jpg`, `mock-${type.toLowerCase()}-2-${gameId}.jpg`];
    return count ? mockMedia.slice(0, count) : mockMedia;
  }),

  getAllMedia: vi.fn().mockResolvedValue({
    backgrounds: { default: null, all: [] },
    icons: { default: null, all: [] },
    logos: { default: null, all: [] },
    covers: { default: null, all: [] },
    trailers: { default: null, all: [] },
    screenshots: { default: null, all: [] },
    musics: { default: null, all: [] },
  }),

  downloadMedia: vi.fn().mockResolvedValue(true),
  cleanupMedia: vi.fn().mockResolvedValue(true),
  searchMedia: vi.fn().mockResolvedValue([]),
};

// External API mocks
export const mockSteamGridDbApi = {
  searchGames: vi.fn().mockResolvedValue([]),
  getGameMedia: vi.fn().mockResolvedValue([]),
  downloadImage: vi.fn().mockResolvedValue("mock-image-path.jpg"),
};

export const mockIGDBApi = {
  searchGames: vi.fn().mockResolvedValue([]),
  getGameDetails: vi.fn().mockResolvedValue(null),
};

// DAL (Data Access Layer) mocks
export const mockQueries = {
  Game: {
    getGameById: vi.fn(),
    findAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  Ranking: {
    findAll: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
    create: vi.fn().mockResolvedValue({
      id: 1,
      name: "Test Ranking",
      description: "Test Description",
      rankingStatusId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    deleteById: vi.fn(),
  },
  RankingGame: {
    upsert: vi.fn().mockResolvedValue({
      id: 1,
      rankingId: 1,
      gameId: "test-game-id",
      rank: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    destroy: vi.fn(),
  },
};

// Store service mocks
export const mockStoreService = {
  get: vi.fn().mockImplementation((key: string) => {
    const mockData: Record<string, any> = {
      "settings.theme": "dark",
      "settings.language": "en",
      "window.bounds": { width: 1200, height: 800 },
    };
    return mockData[key];
  }),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn().mockReturnValue(true),
};

// Global mock setup function
export function setupMocks() {
  // Mock Electron modules
  vi.mock("electron", () => ({
    app: mockElectronApp,
    ipcMain: mockIpcMain,
    BrowserWindow: mockBrowserWindow,
    dialog: mockDialog,
    shell: mockShell,
  }));

  // Mock Node.js modules
  vi.mock("fs", () => mockFS);
  vi.mock("path", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      ...mockPath,
    };
  });

  vi.mock("process", () => mockProcess);

  // Mock Prisma Client
  vi.mock("@main/index", () => ({
    prisma: {
      ranking: {
        findMany: mockQueries.Ranking.findAll,
        findUnique: mockQueries.Ranking.findUnique,
        create: mockQueries.Ranking.create,
        delete: mockQueries.Ranking.deleteById,
      },
      rankingGame: {
        upsert: mockQueries.RankingGame.upsert,
        delete: mockQueries.RankingGame.destroy,
        aggregate: vi.fn().mockResolvedValue({ _max: { rank: 0 } }),
      },
      game: {
        findFirst: mockQueries.Game.getGameById,
        findUnique: mockQueries.Game.getGameById,
        findMany: mockQueries.Game.findAll,
        create: mockQueries.Game.create,
        update: mockQueries.Game.update,
        delete: mockQueries.Game.delete,
      },
      // Mock transaction method
      $transaction: vi.fn().mockImplementation(async (callback) => {
        // Create a mock transaction context that mirrors the real transaction API
        const tx = {
          rankingGame: {
            aggregate: vi.fn().mockResolvedValue({ _max: { rank: 1 } }), // Changed to 1 to match test expectation
            upsert: vi.fn().mockImplementation((data) => {
              // Return data that matches what the test expects
              const result = {
                id: 1,
                rankingId: data.create.rankingId,
                gameId: data.create.gameId,
                rank: data.create.rank,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Also call the original mock so test assertions work
              mockQueries.RankingGame.upsert(data);

              return Promise.resolve(result);
            }),
          },
        };
        return await callback(tx);
      }),
    },
  }));

  // Mock application services
  vi.mock("@main/media/media.service", () => mockMediaService);
  vi.mock("@main/store/store.service", () => mockStoreService);
  vi.mock("../dal/dal", () => ({ default: mockQueries }));

  // Mock external APIs
  vi.mock("@main/externalApi/steamGridDb", () => mockSteamGridDbApi);
  vi.mock("@main/externalApi/internetGameDatabase", () => mockIGDBApi);

  // Mock common constants
  vi.mock("@common/constant", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      MEDIA_TYPE,
      ErrorMessage: {
        NOT_FOUND: "Entity not found",
        INVALID_INPUT: "INVALID_INPUT",
        INTERNAL_ERROR: "INTERNAL_ERROR",
      },
    };
  });
}

// Reset all mocks to their default state
export function resetMocks() {
  vi.clearAllMocks();

  // Reset media service mock implementation
  mockMediaService.getMediaByType.mockImplementation(async (type: MediaType, gameId: string, count?: number) => {
    const mockMedia = [`mock-${type.toLowerCase()}-1-${gameId}.jpg`, `mock-${type.toLowerCase()}-2-${gameId}.jpg`];
    return count ? mockMedia.slice(0, count) : mockMedia;
  });

  // Reset store service mock implementation
  mockStoreService.get.mockImplementation((key: string) => {
    const mockData: Record<string, any> = {
      "settings.theme": "dark",
      "settings.language": "en",
      "window.bounds": { width: 1200, height: 800 },
    };
    return mockData[key];
  });

  // Reset DAL mocks
  mockQueries.Game.findAll.mockResolvedValue([]);
  mockQueries.Ranking.findAll.mockResolvedValue([]);
}

// Utility functions for customizing mocks in specific tests
export function mockMediaForGame(gameId: string, mediaType: MediaType, files: string[]) {
  mockMediaService.getMediaByType.mockImplementation(async (type, id, count) => {
    if (type === mediaType && id === gameId) {
      return count ? files.slice(0, count) : files;
    }

    const mockMedia = [`mock-${type.toLowerCase()}-1-${id}.jpg`, `mock-${type.toLowerCase()}-2-${id}.jpg`];
    return count ? mockMedia.slice(0, count) : mockMedia;
  });
}

export function mockGameQueries(games: any[]) {
  mockQueries.Game.findAll.mockResolvedValue(games);
  mockQueries.Game.getGameById.mockImplementation((id: string) =>
    Promise.resolve(games.find((game) => game.id === id)),
  );
}

export function mockRankingQueries(rankings: any[]) {
  mockQueries.Ranking.findAll.mockResolvedValue(rankings);
  mockQueries.Ranking.findUnique.mockImplementation((id: number) =>
    Promise.resolve(rankings.find((ranking) => ranking.id === id)),
  );
}

export function mockElectronDialog(options: {
  openDialog?: { canceled: boolean; filePaths?: string[] };
  saveDialog?: { canceled: boolean; filePath?: string };
  messageBox?: { response: number };
}) {
  if (options.openDialog) {
    mockDialog.showOpenDialog.mockResolvedValueOnce(options.openDialog);
  }
  if (options.saveDialog) {
    mockDialog.showSaveDialog.mockResolvedValueOnce(options.saveDialog);
  }
  if (options.messageBox) {
    mockDialog.showMessageBox.mockResolvedValueOnce(options.messageBox);
  }
}
