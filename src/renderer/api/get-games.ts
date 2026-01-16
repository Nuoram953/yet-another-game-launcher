import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getLibrary } from "@render/api/electron";
import { GameWithRelations } from "@common/types";

export const getGames = (): Promise<GameWithRelations[]> => {
  return getLibrary().getGames();
};

export const getGamesQueryOptions = () => {
  return queryOptions({
    queryKey: ["games"],
    queryFn: () => getGames(),
  });
};

type UseGamesOptions = {
  queryConfig?: QueryConfig<typeof getGamesQueryOptions>;
};

export const useGames = ({ queryConfig }: UseGamesOptions) => {
  return useQuery({
    ...getGamesQueryOptions(),
    ...queryConfig,
  });
};
