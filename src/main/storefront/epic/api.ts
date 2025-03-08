import { Game } from "@prisma/client";
import { spawn } from "child_process";
import { Storefront } from "../../../main/constant";
import { createOrUpdateGame } from "../../../main/service/game";

export class Epic {
  async initialize(): Promise<void> {
    await this.getOwnedGames();
  }
  async getOwnedGames() {
    return new Promise((resolve, reject) => {
      const legendary = spawn("legendary", ["list", "--json"]);

      let stdout = "";
      let stderr = "";

      legendary.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      legendary.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      legendary.on("close", (code) => {
        if (code !== 0) {
          console.error(`Process exited with code ${code}`);
          console.error(`stderr: ${stderr}`);
          reject(new Error(`Process exited with code ${code}`));
          return;
        }

        try {
          const jsonOutput = JSON.parse(stdout);
          for (const entry of jsonOutput) {
            const data: Partial<Game> = {
              externalId: entry.metadata.namespace,
              name: entry.app_title,
              storefrontId: Storefront.EPIC,
              gameStatusId: entry.playtime_forever > 0 ? 2 : 1,
              isInstalled: false,
            };

            createOrUpdateGame(data, Storefront.EPIC);
          }
          resolve(jsonOutput);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          reject(e);
        }
      });

      legendary.on("error", (err) => {
        console.error("Failed to start subprocess:", err);
        reject(err);
      });
    });
  }
}
