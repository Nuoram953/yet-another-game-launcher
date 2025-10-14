import { prisma } from "..";
import { citron } from "./emulator/citron";
import { dolphin } from "./emulator/dophin";
import { ryujinx } from "./emulator/ryujinx";

export async function upsertEmulator() {
  const emulators = [dolphin, citron, ryujinx];

  for (const emulator of emulators) {
    await prisma.emulator.upsert({
      where: { id: emulator.id },
      update: { name: emulator.name },
      create: emulator,
    });
  }

  await prisma.emulator.deleteMany({
    where: {
      id: { notIn: emulators.map((emulator) => emulator.id) },
    },
  });
}
