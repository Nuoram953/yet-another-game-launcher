import { Emulator } from "@common/constant";
import { prisma } from "..";
import { dolphinOptions } from "./emulator/dophin";
import { citronOptions } from "./emulator/citron";
import { ryujinxOptions } from "./emulator/ryujinx";

export async function upsertEmulatorOption() {
  const options = [...dolphinOptions, ...citronOptions, ...ryujinxOptions];

  for (const option of options) {
    await prisma.emulatorOption.upsert({
      where: {
        emulatorId_name: {
          emulatorId: option.emulatorId,
          name: option.name,
        },
      },
      update: {
        name: option.name,
        short: option.short,
        long: option.long,
        description: option.description,
        defautlValue: option.defaultValue,
      },
      create: {
        name: option.name,
        emulatorId: option.emulatorId,
        short: option.short,
        long: option.long,
        description: option.description,
        defautlValue: option.defaultValue,
      },
    });
  }

  await prisma.emulatorOption.deleteMany({
    where: {
      OR: [
        {
          emulatorId: Emulator.DOLPHIN,
          name: { notIn: dolphinOptions.map((option) => option.name) },
        },
        {
          emulatorId: Emulator.CITRON,
          name: { notIn: citronOptions.map((option) => option.name) },
        },
        {
          emulatorId: Emulator.RYUJINX,
          name: { notIn: ryujinxOptions.map((option) => option.name) },
        },
      ],
    },
  });
}
