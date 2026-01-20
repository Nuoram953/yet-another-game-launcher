import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";

export const getRanking = (id: number) => {
  return window.ranking.getRanking(id);
};

export const getRankingQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ["ranking", id],
    queryFn: () => getRanking(id),
  });
};

type UseRankingOptions = {
  id: number;
  queryConfig?: QueryConfig<typeof getRankingQueryOptions>;
};

export const useRanking = ({ id, queryConfig }: UseRankingOptions) => {
  return useQuery({
    ...getRankingQueryOptions(id),
    ...queryConfig,
  });
};
