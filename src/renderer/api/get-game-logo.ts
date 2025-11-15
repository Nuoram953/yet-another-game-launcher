import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getMedia } from "@render/api/electron";

export const getGameLogo = ({ gameId, count = 1 }: { gameId: string; count?: number }): Promise<string[]> => {
  return getMedia().getLogos(gameId, count);
};

export const getGameLogoQueryOptions = (gameId: string, count: number) => {
  return queryOptions({
    queryKey: ["logo", gameId],
    queryFn: () => getGameLogo({ gameId, count }),
  });
};

type UseGameLogoOptions = {
  gameId: string;
  count?: number;
  queryConfig?: QueryConfig<typeof getGameLogoQueryOptions>;
};

export const useGameLogo = ({ gameId, count = 1, queryConfig }: UseGameLogoOptions) => {
  return useQuery({
    ...getGameLogoQueryOptions(gameId, count),
    ...queryConfig,
  });
};
