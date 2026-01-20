import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";

export const getRankings = () => {
  return window.ranking.getRankings();
};

export const getRankingsQueryOptions = () => {
  return queryOptions({
    queryKey: ["rankings"],

    queryFn: () => getRankings(),
  });
};

type UseRankingsOptions = {
  queryConfig?: QueryConfig<typeof getRankingsQueryOptions>;
};

export const useRankings = ({ queryConfig }: UseRankingsOptions) => {
  return useQuery({
    ...getRankingsQueryOptions(),
    ...queryConfig,
  });
};
