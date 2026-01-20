import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteRanking } from "@common/constant";

import * as RankingSchema from "@main/ranking/ranking.schema";
import { getRankingsQueryOptions } from "./get-rankings";
import { getRankingQueryOptions } from "./get-ranking";

export const createGameRanking = (data: RankingSchema.AddGameRankingSchema) => {
  return window.ranking.addGameRanking(data);
};

export const createGameRankingQueryOptions = (data: RankingSchema.AddGameRankingSchema) => {
  return queryOptions({
    queryKey: [RouteRanking.CREATE],
    queryFn: () => createGameRanking(data),
  });
};

type UseCreateGameRankingOptions = {
  data: RankingSchema.AddGameRankingSchema;
  mutationConfig?: MutationConfig<typeof createGameRanking>;
};

export const useCreateGameRanking = ({ data, mutationConfig }: UseCreateGameRankingOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRankingsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getRankingQueryOptions(data.rankingId).queryKey,
      });
    },
    ...restConfig,
    mutationFn: createGameRanking,
  });
};
