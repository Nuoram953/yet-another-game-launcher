import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getMedia } from "@render/api/electron";

export const getGameBackground = ({ gameId, count = 1 }: { gameId: string; count?: number }): Promise<string[]> => {
  return getMedia().getBackgrounds(gameId, count);
};

export const getGameBackgroundQueryOptions = (gameId: string, count: number) => {
  return queryOptions({
    queryKey: ["background", gameId],
    queryFn: () => getGameBackground({ gameId, count }),
  });
};

type UseGameBackgroundOptions = {
  gameId: string;
  count?: number;
  queryConfig?: QueryConfig<typeof getGameBackgroundQueryOptions>;
};

export const useGameBackground = ({ gameId, count = 1, queryConfig }: UseGameBackgroundOptions) => {
  return useQuery({
    ...getGameBackgroundQueryOptions(gameId, count),
    ...queryConfig,
  });
};
