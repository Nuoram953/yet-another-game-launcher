import { Storefront } from "../../../common/constant";

export const getPlatform = async (storefrontId: number) => {
  let platform = "";
  switch (storefrontId) {
    case Storefront.STEAM:
      platform = "steam";
      break;
    case Storefront.EPIC:
      platform = "egs";
      break;
    default:
      throw new Error("Invalid storefront");
  }

  return platform;
};
