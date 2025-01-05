import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
} from "typeorm";
import { Storefront } from "./Storefront";

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne(() => Storefront, (storefront) => storefront.game)
  storefront: Storefront;

  @Column()
  external_id: number;

  @ManyToOne(() => GameStatus, (gameStatues) => gameStatues.game)
  game_status: GameStatus;
}
