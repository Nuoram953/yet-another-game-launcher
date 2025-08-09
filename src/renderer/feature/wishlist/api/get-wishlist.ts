import { useQuery, queryOptions } from "@tanstack/react-query";

import { QueryConfig } from "@render/lib/react-query";
import { getWishlist } from "@render/api/electron";
import { IGame } from "@main/externalApi/internetGameDatabase/types";

export const getWishlistItems = (): Promise<IGame[]> => {
  return getWishlist().get();
};

export const getWishlistQueryOptions = () => {
  return queryOptions({
    queryKey: ["wishlist"],
    queryFn: () => getWishlistItems(),
  });
};

type UseWishlistOptions = {
  queryConfig?: QueryConfig<typeof getWishlistQueryOptions>;
};

export const useWishlist = () => {
  return useQuery({
    ...getWishlistQueryOptions(),
  });
};
