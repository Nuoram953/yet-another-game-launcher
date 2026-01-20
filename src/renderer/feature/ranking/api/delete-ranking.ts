import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@render/lib/react-query";
import { RouteRanking } from "@common/constant";

import * as RankingSchema from "@main/ranking/ranking.schema";
import { getRankingsQueryOptions } from "./get-rankings";

export const deleteRanking = (id: RankingSchema.DeleteRankingSchema) => {
  return window.ranking.deleteRanking(id);
};

export const deleteRankingQueryOptions = (data: RankingSchema.DeleteRankingSchema) => {
  return queryOptions({
    queryKey: [RouteRanking.DELETE],
    queryFn: () => deleteRanking(data),
  });
};

type UseDeleteRankingOptions = {
  id: RankingSchema.DeleteRankingSchema;
  mutationConfig?: MutationConfig<typeof deleteRanking>;
};

export const useDeleteRanking = ({ id, mutationConfig }: UseDeleteRankingOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRankingsQueryOptions().queryKey,
      });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteRanking,
  });
};
