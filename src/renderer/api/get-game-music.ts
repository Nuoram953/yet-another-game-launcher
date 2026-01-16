import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getMedia } from "@render/api/electron";

export const getGameMusic = ({ gameId, count = 1 }: { gameId: string; count?: number }): Promise<string[]> => {
  return getMedia().getMusics(gameId, count);
};

export const getGameMusicQueryOptions = (gameId: string, count: number) => {
  return queryOptions({
    queryKey: ["music", gameId],
    queryFn: () => getGameMusic({ gameId, count }),
  });
};

type UseGameMusicOptions = {
  gameId: string;
  count?: number;
  queryConfig?: QueryConfig<typeof getGameMusicQueryOptions>;
};

export const useGameMusic = ({ gameId, count = 1, queryConfig }: UseGameMusicOptions) => {
  return useQuery({
    ...getGameMusicQueryOptions(gameId, count),
    ...queryConfig,
  });
};
