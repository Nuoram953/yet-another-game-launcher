import { prisma } from "..";

export async function upsertRankingTag() {
  const rankingTags = [
    { id: 1, name: "yearly" },
    { id: 2, name: "complete" },
    { id: 3, name: "series" },
  ];

  for (const tag of rankingTags) {
    await prisma.rankingTag.upsert({
      where: { id: tag.id },
      update: { ...tag },
      create: tag,
    });
  }

  await prisma.emulator.deleteMany({
    where: {
      id: { notIn: rankingTags.map((tag) => tag.id) },
    },
  });
}
