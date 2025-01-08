import { AxiosResponse } from "axios";
import { Game } from "./entities/Game";

export interface IGame {
  id: number;
  name: string;
  timePlayed: number;
}

export interface IStorefront {
  initialize(): Promise<void>;
  getOwnedGames(): Promise<IGame[]>;
  parseResponse(response: AxiosResponse): Promise<IGame[]>;
}
