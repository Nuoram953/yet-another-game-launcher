import { MediaApi, RankingAPI } from "@common/ipc";
import type { ElectronAPI } from "@preload/electron-api-types";

declare global {
  interface Window {
    ranking: RankingAPI;
    media: MediaApi;
    library: LibraryApi;
  }
}

declare module "@tanstack/react-router" {
  interface RouteMeta {
    breadcrumb?: string | ((match: any) => string);
  }
}
