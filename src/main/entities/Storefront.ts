import { Entity, PrimaryGeneratedColumn, Column, Generated, OneToMany } from "typeorm";
import { Game } from "./Game";

@Entity()
export class Storefront {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string

  @OneToMany(()=>Game,(game)=>game.storefront)
  game: Game[];
}
