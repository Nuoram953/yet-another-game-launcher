import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteRanking } from "@common/constant";

import * as RankingSchema from "@main/ranking/ranking.schema";
import { getRankingQueryOptions } from "./get-ranking";

export const updateGameOrder = (data: RankingSchema.UpdateGameOrderSchema) => {
  return window.ranking.updateGameOrder(data);
};

export const createGameRankingQueryOptions = (data: RankingSchema.UpdateGameOrderSchema) => {
  return queryOptions({
    queryKey: [RouteRanking.UPDATE_GAME_ORDER],
    queryFn: () => updateGameOrder(data),
  });
};

type UseCreateGameRankingOptions = {
  data: RankingSchema.UpdateGameOrderSchema;
  mutationConfig?: MutationConfig<typeof updateGameOrder>;
};

export const useUpdateRankingGameOrder = ({ data, mutationConfig }: UseCreateGameRankingOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRankingQueryOptions(data.rankingId).queryKey,
      });
    },
    ...restConfig,
    mutationFn: updateGameOrder,
  });
};
