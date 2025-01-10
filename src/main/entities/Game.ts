import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
  Unique,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Storefront } from "./Storefront";
import { GameStatus } from "./GameStatus";
import { GameTimePlayed } from "./GameTimePlayed";

@Entity()
@Unique(['storefront', 'external_id'])
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Storefront, (storefront) => storefront.game)
  storefront: Storefront;

  @Column()
  external_id: number;

  @Column()
  name: string;

  @ManyToOne(() => GameStatus, (gameStatues) => gameStatues.game)
  game_status: GameStatus;

  @OneToOne(() => GameTimePlayed, (gameTimePlayed)=>gameTimePlayed.id)
  game_time_played_id: GameTimePlayed;

  @Column({type:"int", nullable:true})
  last_time_played: number;

  @Column({type:"boolean", default:false})
  is_installed: boolean;
}
