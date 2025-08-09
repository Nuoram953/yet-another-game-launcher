import { useQuery, queryOptions, useQueryClient, useMutation } from "@tanstack/react-query";

import { MutationConfig, QueryConfig } from "@render/lib/react-query";
import { getWishlist } from "@render/api/electron";
import { getWishlistItems, getWishlistQueryOptions } from "./get-wishlist";

export const postWishlistItem = ({ externalId }: { externalId: number }): Promise<void> => {
  return getWishlist().add(externalId);
};

export const postWishlistItemQueryOptions = (externalId: number) => {
  return queryOptions({
    queryKey: ["wishlistItem", externalId],
    queryFn: () => postWishlistItem({ externalId }),
  });
};

type UseWishlistItemOptions = {
  externalId: number;
  mutationConfig?: MutationConfig<typeof postWishlistItem>;
};

export const useAddWishlistItem = ({ mutationConfig }: UseWishlistItemOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getWishlistQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: postWishlistItem,
  });
};
