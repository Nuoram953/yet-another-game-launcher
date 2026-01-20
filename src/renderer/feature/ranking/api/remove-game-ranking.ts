import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteRanking } from "@common/constant";

import * as RankingSchema from "@main/ranking/ranking.schema";
import { getRankingQueryOptions } from "./get-ranking";

export const deleteGameRanking = (data: RankingSchema.RemoveGameRankingSchema) => {
  return window.ranking.removeGameRanking(data);
};

export const deleteGameRankingQueryOptions = (data: RankingSchema.RemoveGameRankingSchema) => {
  return queryOptions({
    queryKey: [RouteRanking.DELETE],
    queryFn: () => deleteGameRanking(data),
  });
};

type UseDeleteRankingOptions = {
  data: RankingSchema.RemoveGameRankingSchema;
  mutationConfig?: MutationConfig<typeof deleteGameRanking>;
};

export const useDeleteGameRanking = ({ data, mutationConfig }: UseDeleteRankingOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRankingQueryOptions(data.rankingId).queryKey,
      });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteGameRanking,
  });
};
