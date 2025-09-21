import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MutationConfig } from "@render/lib/react-query";

import { getWishlistQueryOptions } from "./get-wishlist";
import { getWishlist } from "@render/api/electron";

export const deleteWishlistItem = ({ externalId }: { externalId: number }) => {
  return getWishlist().remove(externalId);
};

type UseDeleteWishlistItemOptions = {
  externalId: number;
  mutationConfig?: MutationConfig<typeof deleteWishlistItem>;
};

export const useDeleteWishlistItem = ({ mutationConfig }: UseDeleteWishlistItemOptions) => {
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
    mutationFn: deleteWishlistItem,
  });
};
