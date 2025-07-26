import { ExternalReview } from "@prisma/client";
import { prisma } from "..";

export const create = async (data: Partial<ExternalReview>) => {
  delete data.id;
  return await prisma.externalReview.create({
    data: {
      review: data.review,
      isPositive: data.isPositive,
      isCritic: data.isCritic,
      author: data.author,
      reviewedAt: data.reviewedAt,
      source: data.source,
      timePlayed: data.timePlayed,
      iconUrl: data.iconUrl,
      sourceUrl: data.sourceUrl,
      score: data.score,
    },
  });
};

export const deleteById = async (externalReviewId: number) => {
  return await prisma.externalReview.deleteMany({ where: { id: externalReviewId } });
};
