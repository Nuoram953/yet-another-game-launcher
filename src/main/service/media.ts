import _ from "lodash";
import { IMAGE_TYPE } from "../../common/constant";
import queries from "../dal/dal";
import { app } from "electron";
import path from "path";
import fs from "fs";
import { ErrorMessage } from "../../common/error";

export const getMediaByType = async (
  type: IMAGE_TYPE,
  gameId: string,
  count?: number,
) => {
  const game = await queries.Game.getGameById(gameId);

  if (_.isNil(game)) {
    throw new Error(ErrorMessage.INVALID_GAME);
  }

  const paths = [];
  const directory = path.join(app.getPath("userData"), game.id, type);

  const files = fs.readdirSync(directory);

  if (_.isUndefined(count)) {
    for (const file of files) {
      paths.push(`file://${path.join(directory, file)}`);
    }
  } else {
    const slicedFiles = files.slice(0, count);
    for (const file of slicedFiles) {
      paths.push(`file://${path.join(directory, file)}`);
    }
  }

  return paths;
};

export const getRecentlyPlayedBackgrounds = async (count:number) =>{
  const paths = [];

  const games = await queries.Game.getGames(count);
  for (const game of games) {
    const backgrounds = await getMediaByType(IMAGE_TYPE.BACKGROUND, game.id, 1)
    paths.push(backgrounds[0])
  }

}
