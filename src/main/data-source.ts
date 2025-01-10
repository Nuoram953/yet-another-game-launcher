import { DataSource } from "typeorm";
import { Game } from "./entities/Game";
import { Storefront } from "./entities/Storefront";
import { GameStatus } from "./entities/GameStatus";
import { GameTimePlayed } from "./entities/GameTimePlayed";

export const AppDataSource = new DataSource({
  name: "Yagl",
  type: "sqlite",
  entities: [Game,Storefront, GameStatus, GameTimePlayed],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  database:"database.sqlite",
  synchronize: true,
  logging: ["query", "error"],
});
