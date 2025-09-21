import { RouteWishlist } from "@common/constant";
import * as WishlistController from "./wishlist.controller";
import { withHandler } from "@main/middleware/withHandler";

withHandler(RouteWishlist.SEARCH, async (_event, query: string) => {
  return await WishlistController.search(query);
});

withHandler(RouteWishlist.ADD, async (_event, externalId: number) => {
  return await WishlistController.add(externalId);
});

withHandler(RouteWishlist.REMOVE, async (_event, externalId: number) => {
  return await WishlistController.remove(externalId);
});

withHandler(RouteWishlist.GET, async (_event) => {
  return await WishlistController.get();
});
