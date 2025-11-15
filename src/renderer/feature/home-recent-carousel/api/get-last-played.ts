import { useQuery, queryOptions } from "@tanstack/react-query";
import { QueryConfig } from "@render/lib/react-query";
import { IGame } from "@main/externalApi/internetGameDatabase/types";
import { getLibrary } from "@render/api/electron";
import { GameWithRelations } from "@common/types";

export const getLastPlayedItems = ({ count }): Promise<GameWithRelations[]> => {
  return getLibrary().getLastPlayed(count);
};

export const getLastPlayedQueryOptions = (count: number) => {
  return queryOptions({
    queryKey: ["lastPlayed", count],
    queryFn: () => getLastPlayedItems({ count }),
  });
};

type UseLastPlayedOptions = {
  count: number;
  queryConfig?: QueryConfig<typeof getLastPlayedQueryOptions>;
};

export const useLastPlayed = ({ count, queryConfig }: UseLastPlayedOptions) => {
  return useQuery({
    ...getLastPlayedQueryOptions(count),
  });
};
