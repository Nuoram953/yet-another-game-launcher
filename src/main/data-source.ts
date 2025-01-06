import { DataSource } from "typeorm";
import { Game } from "./entities/Game";
import { Storefront } from "./entities/Storefront";
import { GameStatus } from "./entities/GameStatus";

export const AppDataSource = new DataSource({
  name: "Yagl",
  type: "sqlite",
  entities: [Game,Storefront, GameStatus],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  database:"database.sqlite",
  synchronize: true,
  logging: false,
});
