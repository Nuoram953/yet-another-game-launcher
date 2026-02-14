import { PrismaClient } from "@prisma/client";
import { join } from "path";

export const TEST_DATABASE_URL = "file:./test.db";

let testPrisma: PrismaClient | undefined;
let transactionPrisma: any | undefined;

export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: TEST_DATABASE_URL,
        },
      },
      log: process.env.DEBUG_TESTS ? ["info", "warn", "error"] : [],
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
 * Each test runs in a transaction that gets rolled back after completion.
 * This provides perfect test isolation without the overhead of recreating the database.
 */
export async function setupTestTransaction(): Promise<void> {
  const prisma = getTestPrismaClient();

  // Start a transaction that will be used for the test
  return new Promise((resolve, reject) => {
    prisma
      .$transaction(
        async (tx) => {
          transactionPrisma = tx;
          resolve();

          // Keep the transaction open until rollback is called
          return new Promise((_, txReject) => {
            // Store the reject function to call it during rollback
            (transactionPrisma as any)._rollback = txReject;
          });
        },
        {
          maxWait: 10000, // Maximum time to wait for a transaction slot
          timeout: 30000, // Maximum time the transaction can run
        },
      )
      .catch((error) => {
        // Expected behavior when transaction is rolled back
        if (error.message?.includes("Transaction rollback") || error.code === "P2028") {
          // This is normal - transaction was rolled back
          return;
        }
        console.error("Unexpected transaction error:", error);
      });
  });
}

/**
 * Rolls back the current test transaction.
 * This effectively undoes all database changes made during the test.
 */
export async function rollbackTestTransaction(): Promise<void> {
  if (transactionPrisma && (transactionPrisma as any)._rollback) {
    // Trigger the transaction rollback
    (transactionPrisma as any)._rollback(new Error("Transaction rollback"));
  }
  transactionPrisma = undefined;
}

/**
 * Legacy method - use transaction-based testing instead for better performance
 * @deprecated Use setupTestTransaction/rollbackTestTransaction instead
 */
export async function resetTestDatabase(): Promise<void> {
  const prisma = getTestPrismaClient();

  // Delete in reverse dependency order to avoid foreign key constraints
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

  // Clean up reference tables
  await prisma.tag.deleteMany();
  await prisma.franchise.deleteMany();
  await prisma.company.deleteMany();
  await prisma.engine.deleteMany();
  await prisma.externalReview.deleteMany();

  // Keep these as they're needed for basic functionality
  // await prisma.gameStatus.deleteMany();
  // await prisma.storefront.deleteMany();
  // await prisma.rankingTag.deleteMany();
  // await prisma.rankingStatus.deleteMany();
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
