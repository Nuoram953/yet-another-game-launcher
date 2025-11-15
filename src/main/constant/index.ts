import { upsertEmulator } from "./emulator";
import { upsertEmulatorOption } from "./emulatorOption";
import { upsertMediaType } from "./mediaType";

export async function upsertConstants() {
  await upsertMediaType();
  await upsertEmulator();
  await upsertEmulatorOption();
}
