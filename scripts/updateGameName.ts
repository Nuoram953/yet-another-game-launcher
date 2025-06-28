import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL = `file:path/to/your/database.sqlite`;

const prisma = new PrismaClient();

const sanitizeGameName = async (name: string) => {
  return name.replace(/[^a-zA-Z0-9\s\(\)\[\]:.,!?'"<>\-]/g, "");
};

async function updateNames() {
  const games = await prisma.game.findMany();
  console.log(`Found ${games.length} games to update`);

  for (const game of games) {
    const newName = await sanitizeGameName(game.name);
    console.log(`Updating name from ${game.name} to ${newName}`);

    await prisma.game.update({
      where: { id: game.id },
      data: { name: newName },
    });
  }

  console.log("Names updated successfully");
}

console.log("Starting to update game names...");

updateNames()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
