import { session, Session } from "electron";
import { Controller, IpcHandle } from "einf";
import { logger, config } from "./index";

/**
 * Main application controller for handling IPC communication
 */
@Controller()
export class AppController {
  /**
   * Get the application configuration
   */
  @IpcHandle("get-config")
  async getConfig() {
    return await config.getAll();
  }

  /**
   * Update a specific configuration value
   */
  @IpcHandle("update-config")
  async updateConfig(key: string, value: any) {
    return await config.set(key, value);
  }

  /**
   * Get system information
   */
  @IpcHandle("get-system-info")
  async getSystemInfo() {
    return {
      version: process.env.npm_package_version,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    };
  }

  /**
   * Setup store integration cookies
   */
  @IpcHandle("setup-store-integration")
  async setupStoreIntegration(store: "steam" | "epic", enable: boolean) {
    try {
      await config.set(`store.${store}.enable`, enable);

      if (enable) {
        await this.setupStoreSession(store);
      }

      return { success: true };
    } catch (error) {
      logger.error(`Error setting up ${store} integration:`, { error });
      return { success: false, error: String(error) };
    }
  }

  /**
   * Setup store session cookies
   */
  private async setupStoreSession(store: "steam" | "epic"): Promise<void> {
    const storeConfigs = {
      steam: {
        sessionName: "persist:steamstore",
        url: "https://store.steampowered.com",
        cookieName: "SteamLogin",
        cookieValue: (await config.get("store.steam.token")) || "",
        domain: ".steampowered.com",
      },
      epic: {
        sessionName: "persist:epic",
        url: "https://store.epicgames.com/en-US/",
        cookieName: "epicLogin",
        cookieValue: (await config.get("store.epic.token")) || "",
        domain: ".epicgames.com",
      },
    };

    const storeConfig = storeConfigs[store];
    const storeSession = session.fromPartition(storeConfig.sessionName);

    await this.setupStoreCookies(
      storeSession,
      storeConfig.url,
      storeConfig.cookieName,
      storeConfig.cookieValue,
      storeConfig.domain,
    );

    logger.info(`${store} store cookies set successfully`);
  }

  /**
   * Set up cookies for a store session
   */
  private async setupStoreCookies(
    storeSession: Session,
    url: string,
    cookieName: string,
    cookieValue: string,
    domain: string,
  ): Promise<void> {
    await storeSession.cookies.set({
      url,
      name: cookieName,
      value: cookieValue,
      domain,
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: "no_restriction",
    });
  }
}
