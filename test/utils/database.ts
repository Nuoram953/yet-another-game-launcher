import { PrismaClient } from "@prisma/client";
import { join } from "path";

// Use consistent test database URL
export const TEST_DATABASE_URL = process.env.DATABASE_URL || "file:./test.db";

let testPrisma: PrismaClient | undefined;
let transactionPrisma: any | undefined;

export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url:
            TEST_DATABASE_URL +
            (TEST_DATABASE_URL.includes("?") ? "&" : "?") +
            "connection_limit=1&pool_timeout=20&socket_timeout=60",
        },
      },
      log: process.env.DEBUG_TESTS ? ["warn", "error"] : ["error"],
    });
  }
  return testPrisma;
}

/**
 * Gets a Prisma client that runs within a transaction context.
 * This is perfect for test isolation - each test gets rolled back automatically.
 */
export function getTransactionPrismaClient(): any {
  if (!transactionPrisma) {
    throw new Error("Transaction client not initialized. Call setupTestTransaction() first.");
  }
  return transactionPrisma;
}

export async function setupTestDatabase(): Promise<PrismaClient> {
  const prisma = getTestPrismaClient();

  const { execSync } = await import("child_process");
  const schemaPath = join(process.cwd(), "prisma/schema.prisma");

  try {
    // Set environment for test database
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = TEST_DATABASE_URL;

    // Run migrations
    execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
      stdio: process.env.DEBUG_TESTS ? "inherit" : "pipe",
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    });

    // Restore original URL
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }

    // Generate client for test database
    execSync(`npx prisma generate --schema=${schemaPath}`, {
      stdio: process.env.DEBUG_TESTS ? "inherit" : "pipe",
    });
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }

  return prisma;
}

export async function cleanupTestDatabase(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = undefined;
  }

  transactionPrisma = undefined;

  const { unlinkSync, existsSync } = await import("fs");
  const testDbPath = join(process.cwd(), "test.db");
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }
}

/**
 * Sets up a transaction-based test environment.
 * Simplified version that's faster and more reliable.
 */
export async function setupTestTransaction(): Promise<void> {
  // For now, just use regular client - transactions were causing deadlocks
  // We'll rely on fast cleanup instead
  const prisma = getTestPrismaClient();
  await prisma.$connect();
}

/**
 * Rolls back the current test transaction.
 * Simplified to just clean up test data quickly.
 */
export async function rollbackTestTransaction(): Promise<void> {
  // Quick cleanup of test data instead of transaction rollback
  await resetTestDatabase();
}

/**
 * Fast database reset - only deletes test data, keeps essential data
 */
export async function resetTestDatabase(): Promise<void> {
  const prisma = getTestPrismaClient();

  try {
    // Use raw SQL for faster bulk deletes
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    // Delete test data only (preserve system data)
    await prisma.$executeRaw`DELETE FROM RankingTagMap;`;
    await prisma.$executeRaw`DELETE FROM RankingGame;`;
    await prisma.$executeRaw`DELETE FROM Ranking WHERE id > 0;`;
    await prisma.$executeRaw`DELETE FROM GameActivity;`;
    await prisma.$executeRaw`DELETE FROM GameAchievement;`;
    await prisma.$executeRaw`DELETE FROM GameReviewThoughts;`;
    await prisma.$executeRaw`DELETE FROM GameReview;`;
    await prisma.$executeRaw`DELETE FROM GameExternalReviewMap;`;
    await prisma.$executeRaw`DELETE FROM GameTag;`;
    await prisma.$executeRaw`DELETE FROM GameFranchise;`;
    await prisma.$executeRaw`DELETE FROM GameDeveloper;`;
    await prisma.$executeRaw`DELETE FROM GamePublisher;`;
    await prisma.$executeRaw`DELETE FROM GameEngine;`;
    await prisma.$executeRaw`DELETE FROM GameStatusHistory;`;
    await prisma.$executeRaw`DELETE FROM GamePlatform;`;
    await prisma.$executeRaw`DELETE FROM GameLaunchStorefront;`;
    await prisma.$executeRaw`DELETE FROM GameLaunchApp;`;
    await prisma.$executeRaw`DELETE FROM GameLaunchEmulation;`;
    await prisma.$executeRaw`DELETE FROM MediaDefault;`;
    await prisma.$executeRaw`DELETE FROM DownloadHistory;`;
    await prisma.$executeRaw`DELETE FROM GameConfigGamescope;`;
    await prisma.$executeRaw`DELETE FROM Game;`;

    // Clean up reference tables but keep system ones
    await prisma.$executeRaw`DELETE FROM Tag;`;
    await prisma.$executeRaw`DELETE FROM Franchise;`;
    await prisma.$executeRaw`DELETE FROM Company;`;
    await prisma.$executeRaw`DELETE FROM Engine;`;
    await prisma.$executeRaw`DELETE FROM ExternalReview;`;

    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  } catch (error) {
    console.warn("Fast cleanup failed, falling back to slow method:", error);

    // Fallback to individual deletes
    await prisma.rankingTagMap.deleteMany();
    await prisma.rankingGame.deleteMany();
    await prisma.ranking.deleteMany();
    await prisma.gameActivity.deleteMany();
    await prisma.gameAchievement.deleteMany();
    await prisma.gameReviewThoughts.deleteMany();
    await prisma.gameReview.deleteMany();
    await prisma.gameExternalReviewMap.deleteMany();
    await prisma.gameTag.deleteMany();
    await prisma.gameFranchise.deleteMany();
    await prisma.gameDeveloper.deleteMany();
    await prisma.gamePublisher.deleteMany();
    await prisma.gameEngine.deleteMany();
    await prisma.gameStatusHistory.deleteMany();
    await prisma.gamePlatform.deleteMany();
    await prisma.gameLaunchStorefront.deleteMany();
    await prisma.gameLaunchApp.deleteMany();
    await prisma.gameLaunchEmulation.deleteMany();
    await prisma.mediaDefault.deleteMany();
    await prisma.downloadHistory.deleteMany();
    await prisma.gameConfigGamescope.deleteMany();
    await prisma.game.deleteMany();

    await prisma.tag.deleteMany();
    await prisma.franchise.deleteMany();
    await prisma.company.deleteMany();
    await prisma.engine.deleteMany();
    await prisma.externalReview.deleteMany();
  }
}

/**
 * Verifies the test database schema matches expectations
 */
export async function verifyTestDatabaseSchema(): Promise<boolean> {
  const prisma = getTestPrismaClient();

  try {
    // Test basic table access
    await prisma.gameStatus.findFirst();
    await prisma.ranking.findFirst();
    await prisma.game.findFirst();

    return true;
  } catch (error) {
    console.error("Test database schema verification failed:", error);
    return false;
  }
}

/**
 * Gets comprehensive database statistics for debugging
 */
export async function getTestDatabaseStats(): Promise<Record<string, number>> {
  const prisma = getTestPrismaClient();

  const stats: Record<string, number> = {};

  try {
    stats.games = await prisma.game.count();
    stats.rankings = await prisma.ranking.count();
    stats.rankingGames = await prisma.rankingGame.count();
    stats.gameStatus = await prisma.gameStatus.count();
    stats.rankingStatus = await prisma.rankingStatus.count();
    stats.rankingTags = await prisma.rankingTag.count();
    stats.companies = await prisma.company.count();
    stats.tags = await prisma.tag.count();
    stats.franchises = await prisma.franchise.count();
    stats.engines = await prisma.engine.count();
  } catch (error) {
    console.error("Error getting database stats:", error);
  }

  return stats;
}
