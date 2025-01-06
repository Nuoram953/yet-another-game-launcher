import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
} from "typeorm";
import { Storefront } from "./Storefront";
import { GameStatus } from "./GameStatus";

@Entity()
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @ManyToOne(() => Storefront, (storefront) => storefront.game)
  storefront: Storefront;

  @Column()
  external_id: number;

  @Column()
  name: string;

  @ManyToOne(() => GameStatus, (gameStatues) => gameStatues.game)
  game_status: GameStatus;

  @Column({type:"bigint"})
  time_played: number;
}
