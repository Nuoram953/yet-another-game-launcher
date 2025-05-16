import { Storefront } from "../../../common/constant";

export const getCategory = (store: Storefront) => {
  let category = -1;
  switch (store) {
    case Storefront.STEAM:
      category = 1;
      break;
    case Storefront.EPIC:
      category = 26;
  }

  return category;
};
