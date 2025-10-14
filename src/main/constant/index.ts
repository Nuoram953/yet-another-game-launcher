import { upsertEmulator } from "./emulator";
import { upsertEmulatorOption } from "./emulatorOption";

export async function upsertConstants() {
  await upsertEmulator();
  await upsertEmulatorOption();
}
