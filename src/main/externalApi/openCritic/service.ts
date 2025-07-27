import queries from "@main/dal/dal";
import * as OpenCriticEndpoints from "./endpoints";
import { GameWithRelations } from "@common/types";

export const setGameReviewLanding = async (game: GameWithRelations, openCriticId?: number) => {
  const hasReviews = game.externalReviewMap.map(
    (review) => review.gameId === game.id && review.externalReview.isCritic,
  ).length;
  if (hasReviews) return;

  if (!openCriticId) {
    openCriticId = (await OpenCriticEndpoints.getGame(game.name)).id;
  }
  const reviews = await OpenCriticEndpoints.getGameReviewLanding(openCriticId);

  for (const review of reviews) {
    const externalReview = await queries.ExternalReview.create({
      review: review.snippet,
      isPositive: review.score >= 70,
      isCritic: true,
      author: review.alias,
      reviewedAt: new Date(review.createdAt.valueOf()),
      score: review.score,
      source: review.Outlet.name,
      sourceUrl: review.externalUrl,
      iconUrl: `https://img.opencritic.com/${review.Outlet.imageSrc.lg}`,
    });

    await queries.GameExternalReviewMap.create(game.id, externalReview.id);
  }
};
