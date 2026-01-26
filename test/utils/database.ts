import { PrismaClient } from "@prisma/client";
import { join } from "path";

export const TEST_DATABASE_URL = "file:./test.db";

let testPrisma: PrismaClient | undefined;

export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
    });
  }
  return testPrisma;
}

export async function setupTestDatabase(): Promise<PrismaClient> {
  const prisma = getTestPrismaClient();

  const { execSync } = await import("child_process");
  const schemaPath = join(process.cwd(), "prisma/schema.prisma");

  try {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    execSync(`npx prisma migrate deploy --schema=${schemaPath}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error running test database migrations:", error);
    throw error;
  }

  return prisma;
}

export async function cleanupTestDatabase(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = undefined;
  }

  const { unlinkSync, existsSync } = await import("fs");
  const testDbPath = join(process.cwd(), "test.db");
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
}

export async function resetTestDatabase(): Promise<void> {
  const prisma = getTestPrismaClient();

  await prisma.rankingTagMap.deleteMany();
  await prisma.rankingGame.deleteMany();
  await prisma.ranking.deleteMany();
  await prisma.rankingTag.deleteMany();
  await prisma.rankingStatus.deleteMany();
  await prisma.gameTag.deleteMany();
  await prisma.gameFranchise.deleteMany();
  await prisma.gameDeveloper.deleteMany();
  await prisma.gamePublisher.deleteMany();
  await prisma.gameReview.deleteMany();
  await prisma.gameStatusHistory.deleteMany();
  await prisma.game.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.franchise.deleteMany();
  await prisma.company.deleteMany();
  await prisma.gameStatus.deleteMany();
  await prisma.storefront.deleteMany();
}
