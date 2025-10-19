import { Emulator } from "@common/constant";
import { prisma } from "..";
import { dolphinOptions } from "./emulator/dophin";
import { citronOptions } from "./emulator/citron";
import { ryujinxOptions } from "./emulator/ryujinx";
import { shadps4Options } from "./emulator/shadps4";

export async function upsertEmulatorOption() {
  const options = [...dolphinOptions, ...citronOptions, ...ryujinxOptions, ...shadps4Options];

  for (const option of options) {
    await prisma.emulatorOption.upsert({
      where: {
        emulatorId_name: {
          emulatorId: option.emulatorId,
          name: option.name,
        },
      },
      update: {
        ...option,
      },
      create: {
        ...option,
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
        {
          emulatorId: Emulator.SHADPS4,
          name: { notIn: shadps4Options.map((option) => option.name) },
        },
      ],
    },
  });
}
