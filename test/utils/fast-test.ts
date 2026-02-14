import { getTestPrismaClient } from "./database";

/**
 * Fast test utilities with timeout handling and retry logic
 */

export class FastTest {
  private static prisma = getTestPrismaClient();

  /**
   * Execute database operation with timeout and retry
   */
  static async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number = 10000, retries: number = 2): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs),
          ),
        ]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === retries) {
          throw lastError;
        }

        // Check if it's a retryable error
        if (
          lastError.message.includes("timeout") ||
          lastError.message.includes("P1008") ||
          lastError.message.includes("database failed to respond")
        ) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));

          // Try to reconnect
          try {
            await this.prisma.$disconnect();
            await this.prisma.$connect();
          } catch (connectError) {
            console.warn(`Reconnect failed on attempt ${attempt + 1}:`, connectError);
          }
        } else {
          throw lastError;
        }
      }
    }

    throw lastError || new Error("Operation failed after all attempts");
  }

  /**
   * Fast cleanup that only removes test data
   */
  static async quickCleanup(): Promise<void> {
    try {
      await this.withTimeout(async () => {
        // Use parallel deletes for speed
        await Promise.all([
          this.prisma.rankingTagMap.deleteMany(),
          this.prisma.rankingGame.deleteMany(),
          this.prisma.gameActivity.deleteMany(),
          this.prisma.gameAchievement.deleteMany(),
          this.prisma.gameReview.deleteMany(),
        ]);

        await Promise.all([
          this.prisma.ranking.deleteMany(),
          this.prisma.game.deleteMany(),
          this.prisma.tag.deleteMany(),
          this.prisma.company.deleteMany(),
        ]);
      });
    } catch (error) {
      console.warn("Quick cleanup failed:", error);
      // Don't throw - let tests continue
    }
  }

  /**
   * Create test data with better performance
   */
  static async createTestGame(data: Partial<any> = {}): Promise<any> {
    return this.withTimeout(() =>
      this.prisma.game.create({
        data: {
          name: `Test Game ${Date.now()}`,
          gameStatusId: 1,
          ...data,
        },
      }),
    );
  }

  /**
   * Create multiple test games efficiently
   */
  static async createTestGames(count: number, baseData: Partial<any> = {}): Promise<any[]> {
    const games = Array.from({ length: count }, (_, i) => ({
      name: `Test Game ${Date.now()}-${i}`,
      gameStatusId: 1,
      ...baseData,
    }));

    return this.withTimeout(async () => {
      const results = await Promise.all(games.map((game) => this.prisma.game.create({ data: game })));
      return results;
    });
  }

  /**
   * Create test ranking efficiently
   */
  static async createTestRanking(data: Partial<any> = {}): Promise<any> {
    return this.withTimeout(() =>
      this.prisma.ranking.create({
        data: {
          name: `Test Ranking ${Date.now()}`,
          rankingStatusId: 1,
          ...data,
        },
      }),
    );
  }
}

export const fastTest = FastTest;
