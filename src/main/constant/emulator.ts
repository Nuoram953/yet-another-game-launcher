import { prisma } from "..";
import { citron } from "./emulator/citron";
import { dolphin } from "./emulator/dophin";
import { ryujinx } from "./emulator/ryujinx";
import { shadps4 } from "./emulator/shadps4";
import { eden } from "./emulator/eden";

export async function upsertEmulator() {
  const emulators = [dolphin, citron, ryujinx, shadps4, eden];

  for (const emulator of emulators) {
    await prisma.emulator.upsert({
      where: { id: emulator.id },
      update: { ...emulator },
      create: emulator,
    });
  }

  await prisma.emulator.deleteMany({
    where: {
      id: { notIn: emulators.map((emulator) => emulator.id) },
    },
  });
}
