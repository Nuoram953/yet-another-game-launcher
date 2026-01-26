import path from "path";
import { MEDIA_TYPE } from "../../../common/constant";

export const getPreferredFile = (file: string, allFiles: string[], mediaType: MEDIA_TYPE): string => {
  if (mediaType !== MEDIA_TYPE.MUSIC) return file;

  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const normalized = `${base}_normalized${ext}`;

  return allFiles.includes(normalized) ? normalized : file;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const removeDuplicatesAndFill = (
  paths: string[],
  availableFiles: string[],
  dir: string,
  getPreferredFn: (file: string) => string,
  requestedCount: number,
  createFileUriFn: (dir: string, fileName: string) => string,
): string[] => {
  const uniquePaths = Array.from(new Set(paths));

  if (uniquePaths.length >= requestedCount) {
    return uniquePaths.slice(0, requestedCount);
  }

  const usedFiles = new Set(uniquePaths.map((uri) => path.basename(uri.replace("file://", ""))));

  const additionalFiles = availableFiles.filter((file) => {
    const preferredFile = getPreferredFn(file);
    return !usedFiles.has(preferredFile);
  });

  const shuffledAdditional = shuffleArray(additionalFiles);
  const neededCount = requestedCount - uniquePaths.length;

  for (let i = 0; i < Math.min(neededCount, shuffledAdditional.length); i++) {
    const file = shuffledAdditional[i];
    uniquePaths.push(createFileUriFn(dir, getPreferredFn(file)));
  }

  return uniquePaths;
};

export const filterOriginalFiles = (files: string[]): string[] => {
  return files.filter((f) => !f.toLowerCase().includes("normalized"));
};
