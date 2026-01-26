import { upsertEmulator } from "./emulator";
import { upsertEmulatorOption } from "./emulatorOption";
import { upsertMediaType } from "./mediaType";
import { upsertRankingTag } from "./rankingTag";

export async function upsertConstants() {
  await upsertMediaType();
  await upsertEmulator();
  await upsertEmulatorOption();
  await upsertRankingTag();
}
