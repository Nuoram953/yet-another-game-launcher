import { ErrorMessage } from "@common/error";
import * as WishlistService from "./wishlist.service";
import * as InternetGameDatabase from "@main/externalApi/internetGameDatabase/service";
import _ from "lodash";

export const search = async (query: string) => {
  if (_.isNil(query)) {
    throw new Error(ErrorMessage.INVALID_BODY);
  }

  return await WishlistService.search(query);
};

export const add = async (externalId: number) => {
  if (_.isNil(externalId)) {
    throw new Error(ErrorMessage.INVALID_BODY);
  }

  const game = await InternetGameDatabase.getById(externalId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.NOT_FOUND);
  }

  return await WishlistService.add(externalId);
};

export const remove = async (externalId: number) => {
  if (_.isNil(externalId)) {
    throw new Error(ErrorMessage.INVALID_BODY);
  }

  const game = await InternetGameDatabase.getById(externalId);
  if (_.isNil(game)) {
    throw new Error(ErrorMessage.NOT_FOUND);
  }

  return await WishlistService.remove(externalId);
};

export const get = async () => {
  return await WishlistService.get();
};
