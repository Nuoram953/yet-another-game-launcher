import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteRanking } from "@common/constant";

import * as RankingSchema from "@main/ranking/ranking.schema";
import { getRankingsQueryOptions } from "./get-rankings";

export const createRanking = (data: RankingSchema.CreateRankingSchema) => {
  return window.ranking.createRanking(data);
};

export const createRankingQueryOptions = (data: RankingSchema.CreateRankingSchema) => {
  return queryOptions({
    queryKey: [RouteRanking.CREATE],
    queryFn: () => createRanking(data),
  });
};

type UseCreateRankingOptions = {
  data: RankingSchema.CreateRankingSchema;
  mutationConfig?: MutationConfig<typeof createRanking>;
};

export const useCreateRanking = ({ data, mutationConfig }: UseCreateRankingOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRankingsQueryOptions().queryKey,
      });
    },
    ...restConfig,
    mutationFn: createRanking,
  });
};
