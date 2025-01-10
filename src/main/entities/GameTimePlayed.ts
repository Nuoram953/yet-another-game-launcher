import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export class GameTimePlayed {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "bigint", default: 0 })
  time_played: number;

  @Column({ type: "bigint", default: 0 })
  time_played_windows: number;

  @Column({ type: "bigint", default: 0 })
  time_played_linux: number;

  @Column({ type: "bigint", default: 0 })
  time_played_mac: number;

  @Column({ type: "bigint", default: 0 })
  time_played_steamdeck: number;

  @Column({ type: "bigint", default: 0 })
  time_played_disconnected: number;
}
