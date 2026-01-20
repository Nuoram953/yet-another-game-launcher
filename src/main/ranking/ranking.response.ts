import { RankingGame } from "@prisma/client";

export type ResponseGetRanking = {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  tags: string[];
  games: {
    id: string;
    name: string;
    cover: string;
  }[];
};

export type ResponseGetRankings = ResponseGetRanking[];

export type ResponseCreateRanking = {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  tags: string[];
}[];

export type ResponseAddGameRanking = RankingGame;
