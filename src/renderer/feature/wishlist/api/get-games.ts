import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getWishlist } from "@render/api/electron";
import { IGame } from "@main/externalApi/internetGameDatabase/types";

export const getGames = ({ search }: { search: string }): Promise<IGame[]> => {
  const retuls = getWishlist().search(search);
  return retuls;
};

export const getGamesQueryOptions = (search: string) => {
  return queryOptions({
    queryKey: ["searchGames", search],
    queryFn: () => getGames({ search }),
  });
};

type UseGamesOptions = {
  search: string;
  queryConfig?: QueryConfig<typeof getGamesQueryOptions>;
};

export const useSearchGames = ({ search, queryConfig }: UseGamesOptions) => {
  return useQuery({
    ...getGamesQueryOptions(search),
    ...queryConfig,
  });
};
