import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getConfig } from "@render/api/electron";
import { AppConfig } from "@common/interface";
import { PathsToProperties } from "@main/manager/configManager";
import { DataRoute } from "@common/constant";

interface ConfigContextType {
  config: AppConfig;
  loading: boolean;
  error: string | null;
  renderKey: number;
  getConfigValue: <T = any>(path: PathsToProperties<AppConfig>, defaultValue?: T) => Promise<T>;
  setConfigValue: <T = any>(path: PathsToProperties<AppConfig>, value: T) => Promise<void>;
  getCurrentConfig: () => AppConfig;
  getCurrentConfigValue: <T = any>(path: PathsToProperties<AppConfig>, defaultValue?: T) => T;
  forceRefresh: () => Promise<void>;
  loadConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await getConfig().getAll();
      setConfig(configData);
    } catch (err) {
      console.error("Failed to load config:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getConfigValue = useCallback(async (path, defaultValue = null) => {
    try {
      const value = await getConfig().get(path);
      return value !== undefined ? value : defaultValue;
    } catch (err) {
      console.error("Failed to get config value:", err);
      return defaultValue;
    }
  }, []);

  const setConfigValue = useCallback(async (path, value) => {
    try {
      await getConfig().set(path, value);
      setConfig((prev) => {
        const newConfig = { ...prev };
        const parts = path.split(".");
        const lastKey = parts.pop();

        let current = newConfig;
        for (const key of parts) {
          if (!(key in current)) {
            current[key] = {};
          }
          current = current[key];
        }

        current[lastKey] = value;
        return newConfig;
      });
    } catch (err) {
      console.error("Failed to set config value:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    await loadConfig();
    setRenderKey((prev) => prev + 1);
  }, [loadConfig]);

  const getCurrentConfig = useCallback(() => {
    return config;
  }, [config]);

  const getCurrentConfigValue = useCallback(
    (path, defaultValue = null) => {
      const getValue = (obj, path) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
      };

      const value = getValue(config, path);
      return value !== undefined ? value : defaultValue;
    },
    [config],
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    window.data.on(DataRoute.CONFIG_CHANGE, (payload) => {
      setConfig(payload);
      setRenderKey((prev) => prev + 1);
    });

    return () => {
      window.data.removeAllListeners(DataRoute.CONFIG_CHANGE);
    };
  }, []);

  const contextValue: ConfigContextType = {
    config,
    loading,
    error,
    renderKey,
    getConfigValue,
    setConfigValue,
    getCurrentConfig,
    getCurrentConfigValue,
    forceRefresh,
    loadConfig,
  };

  return <ConfigContext.Provider value={contextValue}>{children}</ConfigContext.Provider>;
};
