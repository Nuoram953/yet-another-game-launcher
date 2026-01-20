import * as RankingResponse from "../main/ranking/ranking.response";
import * as RankingSchema from "../main/ranking/ranking.schema";

export interface RankingAPI {
  getRanking(id: number): Promise<RankingResponse.ResponseGetRanking>;
  getRankings(): Promise<RankingResponse.ResponseGetRankings>;
  createRanking(data: RankingSchema.CreateRankingSchema): Promise<RankingResponse.ResponseCreateRanking>;
  deleteRanking(id: number): Promise<void>;
  addGameRanking(data: RankingSchema.AddGameRankingSchema): Promise<RankingResponse.ResponseAddGameRanking>;
  removeGameRanking(data: RankingSchema.RemoveGameRankingSchema): Promise<void>;
  updateGameOrder(data: RankingSchema.UpdateGameOrderSchema): Promise<void>;
}
