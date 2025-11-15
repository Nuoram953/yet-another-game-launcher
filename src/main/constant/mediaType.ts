import { prisma } from "..";

export async function upsertMediaType() {
  const mediaTypes = [
    { id: 1, name: "cover" },
    { id: 2, name: "background" },
    { id: 3, name: "logo" },
    { id: 4, name: "icon" },
    { id: 5, name: "trailer" },
    { id: 6, name: "achievement" },
    { id: 7, name: "screenshot" },
    { id: 8, name: "music" },
  ];

  for (const mediaType of mediaTypes) {
    await prisma.mediaType.upsert({
      where: { id: mediaType.id },
      update: { ...mediaType },
      create: mediaType,
    });
  }

  await prisma.emulator.deleteMany({
    where: {
      id: { notIn: mediaTypes.map((mediaType) => mediaType.id) },
    },
  });
}
