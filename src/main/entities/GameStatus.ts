import { Entity, PrimaryGeneratedColumn, Column, Generated, OneToMany } from "typeorm";
import { Game } from "./Game";

@Entity()
export class GameStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string

  @OneToMany(()=>Game,(game)=>game.game_status)
  game: Game[];
}
