import { Game } from "@prisma/client";
import * as GameQueries from "../dal/game"
import { Storefront } from "../constant";
import { mainApp, metadataManager } from "..";
import  log  from "electron-log/main";
import { IMAGE_TYPE } from "../../common/constant";

export const createOrUpdateGame = async (data:Partial<Game>, store:Storefront) => {
  const game = await GameQueries.createOrUpdateExternal(data, store)

  if(!game){
    throw new Error("invalid game")
  }

  await metadataManager.downloadMissing(game)
  //if(game.updatedAt.getTime() === game.createdAt.getTime()){
  //  log.info(`${game.name} - ${game.id} - ${game?.storefront?.name} was added`);
  //  await metadataManager.downloadImage(
  //    IMAGE_TYPE.COVER,
  //    game,
  //    `https://shared.cloudflare.steamstatic.com//store_item_assets/steam/apps/${game.externalId}/library_600x900.jpg`,
  //    "jpg",
  //  );

  }
  //download 1 cover, logo, and background
  //download achievements
  //download music
  
  mainApp.sendToRenderer("add-new-game", {
    ...game,
  });
};
export const preLaunch = async () => {
  //track process
  //create a temporary session in db
  //show banner in react
};
export const postLaunch = async () => {
  //stop process
  //add session to db
  //delete temporary session
  //update playtime
  //update achivevements
  //update last play date
  //hide banner in react
};

export const downloadAchievements = () =>{
  
}
