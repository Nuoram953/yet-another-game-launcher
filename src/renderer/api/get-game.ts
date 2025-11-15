import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getLibrary } from "@render/api/electron";
import { GameWithRelations } from "@common/types";

export const getGame = ({ gameId }: { gameId: string }): Promise<GameWithRelations> => {
  return getLibrary().getGame(gameId);
};

export const getGameQueryOptions = (gameId: string) => {
  return queryOptions({
    queryKey: [gameId],
    queryFn: () => getGame({ gameId }),
  });
};

type UseGameOptions = {
  gameId: string;
  queryConfig?: QueryConfig<typeof getGameQueryOptions>;
};

export const useGame = ({ gameId, queryConfig }: UseGameOptions) => {
  return useQuery({
    ...getGameQueryOptions(gameId),
    ...queryConfig,
  });
};
