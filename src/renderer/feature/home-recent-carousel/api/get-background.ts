import { useQuery, queryOptions } from "@tanstack/react-query";
import { QueryConfig } from "@render/lib/react-query";
import { getMedia } from "@render/api/electron";

export const getBackground = ({ id, count }): Promise<string[]> => {
  return getMedia().getBackgrounds(id, count);
};

export const getBackgroundQueryOptions = (id: string, count: number) => {
  return queryOptions({
    queryKey: ["backgrounds", id, count],
    queryFn: () => getBackground({ id, count }),
  });
};

type UseBackgroundOptions = {
  id: string;
  count?: number;
  queryConfig?: QueryConfig<typeof getBackgroundQueryOptions>;
};

export const useBackground = ({ id, count = 10, queryConfig }: UseBackgroundOptions) => {
  return useQuery({
    ...getBackgroundQueryOptions(id, count),
  });
};
