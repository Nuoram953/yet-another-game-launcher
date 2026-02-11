import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getGame } from "@render/api/electron";

export const getGameReview = ({ gameId }: { gameId: string }) => {
  return getGame().getReview({ gameId });
};

export const getGameReviewQueryOptions = (gameId: string) => {
  return queryOptions({
    queryKey: ["review", gameId],
    queryFn: () => getGameReview({ gameId }),
  });
};

type UseGameReviewOptions = {
  gameId: string;
  queryConfig?: QueryConfig<typeof getGameReviewQueryOptions>;
};

export const useGameReview = ({ gameId, queryConfig }: UseGameReviewOptions) => {
  return useQuery({
    ...getGameReviewQueryOptions(gameId),
    ...queryConfig,
  });
};
