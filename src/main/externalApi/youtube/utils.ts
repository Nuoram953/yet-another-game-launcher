const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
import path from "path";
import fs from "fs";

export async function normalizeMp3(inputPath: string, outputPath: string): Promise<void> {
  ffmpeg.setFfmpegPath(ffmpegPath);
  const measurements = await new Promise<any>((resolve, reject) => {
    let jsonBuffer = "";

    ffmpeg(inputPath)
      .audioFilter("loudnorm=I=-23:TP=-2:LRA=11:print_format=json")
      .outputFormat("null")
      .output("-")
      .on("stderr", (line) => {
        jsonBuffer += line;
      })
      .on("end", () => {
        try {
          const jsonMatch = jsonBuffer.match(/\{[\s\S]*\}/); // extract JSON block
          if (!jsonMatch) throw new Error("Could not parse loudnorm JSON output");
          const parsed = JSON.parse(jsonMatch[0]);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", reject)
      .run();
  });

  const filter = [
    "loudnorm=I=-23:TP=-2:LRA=11",
    `measured_I=${measurements.input_i}`,
    `measured_TP=${measurements.input_tp}`,
    `measured_LRA=${measurements.input_lra}`,
    `measured_thresh=${measurements.input_thresh}`,
    `offset=${measurements.target_offset}`,
    "linear=true",
  ].join(":");

  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath).audioFilter(filter).output(outputPath).on("end", resolve).on("error", reject).run();
  });
}

export async function normalizeFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".mp3"));

  for (const file of files) {
    if (file.toLowerCase().includes("normalized")) continue;

    const ext = path.extname(file);
    const baseName = path.basename(file, ext);

    const normalizedName = `${baseName}_normalized${ext}`;
    const normalizedPath = path.join(folderPath, normalizedName);

    if (fs.existsSync(normalizedPath)) {
      console.log(`Skipping ${file} (normalized version exists).`);
      continue;
    }

    const input = path.join(folderPath, file);
    const output = normalizedPath;

    console.log(`Normalizing ${file} → ${output} ...`);
    await normalizeMp3(input, output);
  }

  console.log("All files normalized!");
}
