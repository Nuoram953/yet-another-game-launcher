import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getMedia } from "@render/api/electron";

export const getGameCover = ({ gameId, count = 1 }: { gameId: string; count?: number }): Promise<string[]> => {
  return getMedia().getCovers(gameId, count);
};

export const getGameCoverQueryOptions = (gameId: string, count: number) => {
  return queryOptions({
    queryKey: ["cover", gameId],
    queryFn: () => getGameCover({ gameId, count }),
  });
};

type UseGameCoverOptions = {
  gameId: string;
  count?: number;
  queryConfig?: QueryConfig<typeof getGameCoverQueryOptions>;
};

export const useGameCover = ({ gameId, count = 1, queryConfig }: UseGameCoverOptions) => {
  return useQuery({
    ...getGameCoverQueryOptions(gameId, count),
    ...queryConfig,
  });
};
