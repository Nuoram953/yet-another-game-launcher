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

import * as MediaResponse from "../main/media/media.response";
import * as MediaSchema from "../main/media/media.schema";

export interface MediaApi {
  getMediaByType(data: MediaSchema.GetMediaByType): Promise<MediaResponse.ResponseGetMediaByType>;
  getAllMedia(): Promise<MediaResponse.ResponseGetAllMedia>;
  deleteMedia(data: MediaSchema.DeleteMediaSchema): Promise<MediaResponse.ResponseDeleteMedia>;
  searchMedia(data: MediaSchema.SearchMediaSchema): Promise<MediaResponse.ResponseSearchMedia>;
  downloadByUrl(data: MediaSchema.DownloadMediaSchema): Promise<MediaResponse.ResponseDownloadMedia>;
  setDefault(data: MediaSchema.SetDefaultMediaSchema): Promise<MediaResponse.ResponseSetDefault>;
  removeDefault(data: MediaSchema.RemoveDefaultMediaSchema): Promise<MediaResponse.ResponseRemoveDefault>;
}

import * as GameResponse from "../main/game/game.response";
import * as GameSchema from "../main/game/game.schema";
import { LaunchType } from "../common/types";

export interface GameAPI {
  launch(data: GameSchema.LaunchGameSchema): Promise<void>;
  refresh(data: GameSchema.RefreshGameSchema): Promise<void>;
  setReview(data: GameSchema.SetReviewSchema): Promise<GameResponse.ResponseSetGameStatus>;
  setGameStatus(data: GameSchema.SetGameStatusSchema): Promise<GameResponse.ResponseSetGameStatus>;
  setGameFavorite(data: GameSchema.SetGameFavoriteSchema): Promise<GameResponse.ResponseSetGameFavorite>;
  installGame(data: GameSchema.GameOperationSchema): Promise<GameResponse.ResponseGameOperation>;
  uninstallGame(data: GameSchema.GameOperationSchema): Promise<GameResponse.ResponseGameOperation>;
  killGame(id: string, launchId: number, type: LaunchType): Promise<GameResponse.ResponseGameOperation>;
  createReviewThought(data: GameSchema.CreateReviewThoughtSchema): Promise<GameResponse.ResponseGameOperation>;
  updateReviewThought(data: GameSchema.UpdateReviewThoughtSchema): Promise<GameResponse.ResponseGameOperation>;
  deleteReviewThought(data: GameSchema.DeleteReviewThoughtSchema): Promise<GameResponse.ResponseGameOperation>;
}

// import * as LibraryResponse from "../main/library/library.response";
import * as LibrarySchema from "../main/library/library.schema";

export interface LibraryApi {
  launch(data: LibrarySchema.LaunchGame): Promise<void>;
  refreshGame(data: LibrarySchema.RefreshGame): Promise<void>;
}
