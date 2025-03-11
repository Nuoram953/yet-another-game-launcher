import * as ytdlExec from "youtube-dl-exec";
import * as fs from "fs";
import * as path from "path";
import { Game } from "@prisma/client";
import { metadataManager } from "../../index";
import { MEDIA_TYPE } from "../../../common/constant";
import  log  from "electron-log/main";
import { app } from "electron";

const YouTube = require("youtube-sr").default;
const youtubedl = require("youtube-dl-exec");

interface VideoSearchOptions {
  maxResults?: number;
  outputDir?: string;
}

export class YouTubeDownloader {
  static async searchAndDownloadVideos(
    game: Game,
    options: VideoSearchOptions = {},
  ): Promise<void> {
    const { maxResults = 5, outputDir = "./downloads" } = options;

    try {
      const outputDir = await metadataManager.getOrCreateImageDirectory(
        MEDIA_TYPE.TRAILER,
        game,
      );

      if(await metadataManager.getNumberOfFiles(outputDir)>=1){
        log.info(`${game.id} has 1 trailer. Skipping`)
        return
      }

      const name = outputDir + "/trailer";
      const cookiePath = path.join(app.getPath("userData"), "yt-cookies.txt")

      const searchResults = await YouTube.search(
        `${game.name} game ${MEDIA_TYPE.TRAILER}`,
        {
          limit: maxResults,
        },
      );

      await youtubedl(
        `https://www.youtube.com/watch?v=${searchResults[0].id}`,
        {
          output: name,
          verbose: true,
          format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
          noCheckCertificates: true,
          noWarnings: true,
          preferFreeFormats: true,
          cookies: cookiePath,
          addHeader: ["referer:youtube.com", "user-agent:firefox"],
        },
    } catch (error) {
      console.error("Search or download error:", error);
    }
  }
}

/**
 * Sanitize filename to remove invalid characters
 * @param filename Original filename
 * @returns Sanitized filename
 */
function sanitizeFileName(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, "-").trim();
}
