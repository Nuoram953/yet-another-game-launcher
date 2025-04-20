import { config } from "..";
import { AppConfig } from "../../common/interface";
import { PathsToProperties } from "../manager/configManager";

export const get = async (key: PathsToProperties<AppConfig>) => {
  const value = await config.get(key);
  if (!value) {
    throw new Error(`Config key ${key} not found`);
  }
  return value;
};

export const getAll = async () => {
  return await config.load();
};

export const set = async (key: PathsToProperties<AppConfig>, value: any) => {
  config.set(key, value);
};
