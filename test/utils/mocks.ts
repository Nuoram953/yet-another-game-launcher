import { vi } from "vitest";

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
};

export const mockQueries = {};

export const mockElectronApp = {
  getPath: vi.fn().mockReturnValue("/mock/user/data"),
  isPackaged: false,
  getAppPath: vi.fn().mockReturnValue("/mock/app/path"),
};

export const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
};

export const mockFS = {
  readdirSync: vi.fn().mockReturnValue(["cover-1.jpg", "cover-2.jpg", "icon-1.png"]),
  existsSync: vi.fn().mockReturnValue(true),
  unlinkSync: vi.fn(),
};

export function setupMocks() {
  vi.mock("@main/media/media.service", () => mockMediaService);

  vi.mock("electron", () => ({
    app: mockElectronApp,
    ipcMain: mockIpcMain,
    BrowserWindow: vi.fn(),
  }));

  vi.mock("fs", () => mockFS);

  vi.mock("path", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      join: vi.fn().mockImplementation((...args: string[]) => args.join("/")),
    };
  });
}

export function resetMocks() {
  vi.clearAllMocks();

  mockMediaService.getMediaByType.mockImplementation(async (type: MediaType, gameId: string, count?: number) => {
    const mockMedia = [`mock-${type.toLowerCase()}-1-${gameId}.jpg`, `mock-${type.toLowerCase()}-2-${gameId}.jpg`];

    return count ? mockMedia.slice(0, count) : mockMedia;
  });
}

export function mockMediaForGame(gameId: string, mediaType: MediaType, files: string[]) {
  mockMediaService.getMediaByType.mockImplementation(async (type, id, count) => {
    if (type === mediaType && id === gameId) {
      return count ? files.slice(0, count) : files;
    }

    const mockMedia = [`mock-${type.toLowerCase()}-1-${id}.jpg`, `mock-${type.toLowerCase()}-2-${id}.jpg`];

    return count ? mockMedia.slice(0, count) : mockMedia;
  });
}
