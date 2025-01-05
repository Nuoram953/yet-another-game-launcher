import { DataSource } from "typeorm";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  name: "Yagl",
  type: "sqlite",
  entities: [User],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  database:"database.sqlite",
  synchronize: true,
  logging: false,
});
