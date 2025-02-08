import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

// Type for nested path strings like 'windowBounds.width'
type PathsToProperties<T> = {
  [K in keyof T]: T[K] extends object
    ? `${string & K}.${PathsToProperties<T[K]>}`
    : string & K;
}[keyof T];

interface Config {
  [key: string]: any;
}

class ConfigManager<T extends Config> {
  private userDataPath: string;
  private configPath: string;
  private config: T | null;

  constructor(filename: string = 'config.json') {
    this.userDataPath = app.getPath('userData');
    this.configPath = path.join(this.userDataPath, filename);
    this.config = null;
  }

  async init(defaultConfig: T): Promise<T> {
    try {
      await this.load();
    } catch (error) {
      this.config = defaultConfig;
      await this.save();
    }
    return this.config as T;
  }

  async load(): Promise<T> {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(data);
      return this.config as T;
    } catch (error) {
      throw new Error(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async save(): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Config is not initialized');
      }
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        'utf8'
      );
    } catch (error) {
      throw new Error(`Failed to save config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get value by nested path
  getValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // Set value by nested path
  setValue(obj: any, path: string, value: any) {
    const parts = path.split('.');
    const last = parts.pop()!;
    const target = parts.reduce((acc, part) => {
      if (!(part in acc)) acc[part] = {};
      return acc[part];
    }, obj);
    target[last] = value;
  }

  // Get a value using dot notation
  get<K extends PathsToProperties<T>>(path: K): any {
    if (!this.config) {
      throw new Error('Config is not initialized');
    }
    return this.getValue(this.config, path);
  }

  // Set a value using dot notation
  async set<K extends PathsToProperties<T>>(path: K, value: any): Promise<void> {
    if (!this.config) {
      throw new Error('Config is not initialized');
    }
    this.setValue(this.config, path, value);
    await this.save();
  }
}

export default ConfigManager;
