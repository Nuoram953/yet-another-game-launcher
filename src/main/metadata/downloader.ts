import axios from "axios";
import fs from "fs";
import _ from "lodash";
import { Game } from "@prisma/client";
import { MEDIA_TYPE } from "../../common/constant";
import { getNumberOfFiles } from "./service";
import { getOrCreateImageDirectory } from "./paths";
import logger from "@main/logger";

export const downloadImage = async (
  type: MEDIA_TYPE,
  game: Game,
  url: string,
  extension?: string,
  customName?: string,
): Promise<void> => {
  const folderPath = getOrCreateImageDirectory(type, game.id);
  const countFiles = getNumberOfFiles(folderPath);
  const extensionFromFile = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/)?.[1];
  const fileName = !_.isNil(customName)
    ? `/${customName.replace(/\.[^/.]+$/, "")}.${extension}`
    : `/${type}_${countFiles + 1}.${extension ? extension : extensionFromFile}`;
  const destination = folderPath + fileName;

  if (fs.existsSync(destination)) {
    return;
  }

  if (countFiles >= 15) {
    logger.debug(`${game.name} (${game.id}) has ${countFiles} ${type} and the max was ${15}. Skipping`);
    return;
  }

  const response = await axios.get<Buffer>(url, {
    responseType: "arraybuffer",
  });

  fs.writeFileSync(destination, response.data);
  logger.info(`Image saved to ${destination}`);
};
