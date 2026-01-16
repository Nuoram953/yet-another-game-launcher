import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getMedia } from "@render/api/electron";

export const getGameTrailer = ({ gameId, count = 1 }: { gameId: string; count?: number }): Promise<string[]> => {
  return getMedia().getTrailers(gameId, count);
};

export const getGameTrailerQueryOptions = (gameId: string, count: number) => {
  return queryOptions({
    queryKey: ["trailer", gameId],
    queryFn: () => getGameTrailer({ gameId, count }),
  });
};

type UseGameTrailerOptions = {
  gameId: string;
  count?: number;
  queryConfig?: QueryConfig<typeof getGameTrailerQueryOptions>;
};

export const useGameTrailer = ({ gameId, count = 1, queryConfig }: UseGameTrailerOptions) => {
  return useQuery({
    ...getGameTrailerQueryOptions(gameId, count),
    ...queryConfig,
  });
};
