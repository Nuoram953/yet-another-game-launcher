import _ from "lodash";
import { GameStatus, Storefront } from "../constant";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { getStorefrontById } from "./storefront";
import { getGameStatusById } from "./game_status";
import axios from "axios";
import fs from "fs";
import { app } from "electron";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { mainApp } from "..";
import { IGame } from "src/common/types";
import log from "electron-log/main";

export async function insertMissing(games: IGame[], storefront: Storefront) {
  const store = await getStorefrontById(storefront);
  if (_.isNull(store)) {
    throw new Error("Invalid storefront");
  }

  for (const item of games) {
    let game = await AppDataSource.getRepository(Game).findOneBy({
      storefront: store,
      external_id: item.id,
    });

    if (!game) {
      const status = await getGameStatusById(item.status);
      if (_.isNull(status)) {
        throw new Error("Invalid status");
      }

      game = AppDataSource.getRepository(Game).create({
        storefront: store,
        name: item.name,
        external_id: item.id,
        game_status: status,
        time_played: item.timePlayed,
      });
      await AppDataSource.getRepository(Game).save(game);
      const folder = await createFolderInUserData(game!.id);
      await downloadImage(
        `https://shared.cloudflare.steamstatic.com//store_item_assets/steam/apps/${game?.external_id}/library_600x900.jpg`,
        folder + "/cover_1.jpg",
      );

      log.info(`${game.name} - ${game.id} - ${store.name} was added`);

      mainApp.sendToRenderer("add-new-game", {
        id: game.id,
        name: game.name,
        timePlayed: game.time_played,
        status: game.game_status.name,
      });
    }
  }
}

export async function getAllGames() {
  const games = await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .innerJoinAndSelect("game.game_status", "game_status")
    .innerJoinAndSelect("game.storefront", "storefront")
    .getMany();
  return games;
}

export async function getGameById(id: string) {
  const game = await AppDataSource.getRepository(Game)
    .createQueryBuilder("game")
    .innerJoinAndSelect("game.game_status", "game_status")
    .innerJoinAndSelect("game.storefront", "storefront")
    .where("id=gameId", { gameId: id })
    .getOne();
  return game;
}

async function downloadImage(url: string, destination: string): Promise<void> {
  try {
    const response = await axios.get<Buffer>(url, {
      responseType: "arraybuffer", // Ensure the response is treated as binary data
    });

    fs.writeFileSync(destination, response.data);
    console.log(`Image saved to ${destination}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${(error as Error).message}`);
    }
  }
}
async function createFolderInUserData(folderName: string) {
  // Get the userData path
  const userDataPath = app.getPath("userData");

  // Define the full path for the new folder
  const folderPath = path.join(userDataPath, folderName);

  // Check if the folder exists, if not, create it
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder "${folderName}" created at ${folderPath}`);
  } else {
    console.log(`Folder "${folderName}" already exists at ${folderPath}`);
  }

  return folderPath;
}
