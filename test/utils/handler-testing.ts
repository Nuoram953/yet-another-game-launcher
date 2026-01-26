import { vi } from "vitest";

export const createMockIpcEvent = (): Electron.IpcMainInvokeEvent => ({
  frameId: 1,
  processId: 1,
  sender: {
    id: 1,
  } as any,
  senderFrame: {} as any,
  type: "frame" as any,
  preventDefault: vi.fn(),
  defaultPrevented: false,
});

export const handlerRegistry = new Map<string, Function>();

export const mockIpcMain = {
  handle: vi.fn().mockImplementation((route: string, handler: Function) => {
    handlerRegistry.set(route, handler);
  }),
  removeAllListeners: vi.fn(),
  removeHandler: vi.fn().mockImplementation((route: string) => {
    handlerRegistry.delete(route);
  }),
};

export function setupHandlerTesting() {
  vi.mock("electron", () => ({
    ipcMain: mockIpcMain,
    app: {
      getPath: vi.fn().mockReturnValue("/mock/path"),
      isPackaged: false,
      whenReady: vi.fn().mockResolvedValue(undefined),
      quit: vi.fn(),
    },
    BrowserWindow: vi.fn(),
  }));

  handlerRegistry.clear();
}

export async function invokeHandler(route: string, ...args: any[]) {
  const handler = handlerRegistry.get(route);
  if (!handler) {
    throw new Error(`No handler registered for route: ${route}`);
  }

  const mockEvent = createMockIpcEvent();
  return await handler(mockEvent, ...args);
}

export function isHandlerRegistered(route: string): boolean {
  return handlerRegistry.has(route);
}

export function getRegisteredRoutes(): string[] {
  return Array.from(handlerRegistry.keys());
}

export function resetHandlers() {
  handlerRegistry.clear();
  vi.clearAllMocks();
}
