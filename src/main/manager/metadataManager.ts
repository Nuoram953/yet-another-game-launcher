import axios from "axios";
import fs from "fs";
import { IMAGE_TYPE } from "../../common/constant";
import { app } from "electron";
import log from "electron-log";
import _ from "lodash";
import { Game } from "@prisma/client";

class MetadataManager {
  private userPath: string;

  constructor() {
    this.userPath = app.getPath("userData");
  }

  async downloadMissing(game:Game){

  }

  async getImageDirectoryPath(type: IMAGE_TYPE, game: Game) {
    return `${this.userPath}/${game.id}/${type}`;
  }

  async getOrCreateImageDirectory(type: IMAGE_TYPE, game: Game) {
    const folderPath = await this.getImageDirectoryPath(type, game);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {recursive:true});
      log.info(`Created directory ${folderPath}`);
    }

    return folderPath
  }

  async getNumberOfFiles(path:string){
    const items = fs.readdirSync(path)

    if(_.isNil(items)){
      return 0
    }
    return items.length
  }

  async downloadImage(
    type: IMAGE_TYPE,
    game: Game,
    url: string,
    extension:string
  ): Promise<void> {
    try {
      const response = await axios.get<Buffer>(url, {
        responseType: "arraybuffer",
      });

      const folderPath = await this.getOrCreateImageDirectory(type, game)
      const countFiles = await this.getNumberOfFiles(folderPath)
      const fileName = `/${type}_${countFiles+1}.${extension}`
      const destination = folderPath+fileName
      fs.writeFileSync(destination, response.data);
      log.info(`Image saved to ${destination}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Axios error: ${error.message}`);
      } else {
        console.error(`Unexpected error: ${(error as Error).message}`);
      }
    }
  }
}

export default MetadataManager
