import type { ElectronAPI } from "@preload/electron-api-types";

// Extend the Window interface once with the ElectronAPI
declare global {
  interface Window extends ElectronAPI {}
}
