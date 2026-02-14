import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import {
  setupTestDatabase,
  cleanupTestDatabase,
  getTestPrismaClient,
  verifyTestDatabaseSchema,
  getTestDatabaseStats,
} from "../utils/database";
import { setupMocks, resetMocks } from "../utils/enhanced-mocks";
import { seedTestData, TestDataFactory, createTestGames } from "../fixtures/seed";

// Import the actual services for integration testing
import * as RankingService from "../../src/main/ranking/ranking.service";
// Note: We'll mock the DAL queries in the test setup instead of importing directly

describe("Integration - Ranking Workflow", () => {
  let testPrisma: any;

  beforeAll(async () => {
    setupMocks();
    await setupTestDatabase();

    const schemaValid = await verifyTestDatabaseSchema();
    if (!schemaValid) {
      throw new Error("Test database schema verification failed");
    }

    await seedTestData();
    testPrisma = getTestPrismaClient();
  }, 30000);

  beforeEach(async () => {
    resetMocks();
    TestDataFactory.reset();

    // Clean up test-specific data while preserving seed data
    await testPrisma.rankingTagMap.deleteMany();
    await testPrisma.rankingGame.deleteMany();
    await testPrisma.ranking.deleteMany();
    await testPrisma.gameActivity.deleteMany();
    await testPrisma.gameAchievement.deleteMany();
    await testPrisma.game.deleteMany();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("Complete Ranking Lifecycle", () => {
    it("should create, populate, and manage a ranking end-to-end", async () => {
      // Step 1: Create test games
      const gameData = [
        {
          name: "The Elder Scrolls V: Skyrim",
          scoreCritic: 94,
          timePlayed: 36000, // 10 hours
        },
        {
          name: "The Witcher 3: Wild Hunt",
          scoreCritic: 93,
          timePlayed: 45000, // 12.5 hours
        },
        {
          name: "Fallout: New Vegas",
          scoreCritic: 84,
          timePlayed: 28800, // 8 hours
        },
      ];

      const games: any[] = [];
      for (const data of gameData) {
        const game = await testPrisma.game.create({
          data: TestDataFactory.createGame(data),
        });
        games.push(game);
      }

      expect(games).toHaveLength(3);

      // Step 2: Create a ranking using the service
      const newRanking: any = await RankingService.createRanking({
        name: "Best RPGs 2023",
        description: "My favorite RPG games of the year",
      });

      expect(newRanking).toBeDefined();
      expect(newRanking.name).toBe("Best RPGs 2023");

      // Step 3: Add games to the ranking
      for (const game of games) {
        await RankingService.addGameRanking({
          rankingId: newRanking.id,
          gameId: game.id,
        });
      }

      // Step 4: Verify games were added with correct ranks
      const rankingWithGames = await testPrisma.ranking.findUnique({
        where: { id: newRanking.id },
        include: {
          games: {
            include: { game: true },
            orderBy: { rank: "asc" },
          },
        },
      });

      expect(rankingWithGames.games).toHaveLength(3);
      expect(rankingWithGames.games[0].rank).toBe(1);
      expect(rankingWithGames.games[1].rank).toBe(2);
      expect(rankingWithGames.games[2].rank).toBe(3);

      // Step 5: Reorder games (Witcher 3 to #1, Skyrim to #2, Fallout to #3)
      await RankingService.updateGameOrder({
        rankingId: newRanking.id,
        gameOrders: [
          { gameId: games[1].id, rank: 1 }, // Witcher 3
          { gameId: games[0].id, rank: 2 }, // Skyrim
          { gameId: games[2].id, rank: 3 }, // Fallout
        ],
      });

      // Step 6: Verify the new order
      const reorderedRanking = await testPrisma.ranking.findUnique({
        where: { id: newRanking.id },
        include: {
          games: {
            include: { game: true },
            orderBy: { rank: "asc" },
          },
        },
      });

      expect(reorderedRanking.games[0].game.name).toBe("The Witcher 3: Wild Hunt");
      expect(reorderedRanking.games[1].game.name).toBe("The Elder Scrolls V: Skyrim");
      expect(reorderedRanking.games[2].game.name).toBe("Fallout: New Vegas");

      // Step 7: Remove a game from the ranking
      await RankingService.removeGameRanking({
        rankingId: newRanking.id,
        gameId: games[2].id, // Remove Fallout
      });

      // Step 8: Verify game was removed
      const finalRanking = await testPrisma.ranking.findUnique({
        where: { id: newRanking.id },
        include: {
          games: {
            include: { game: true },
          },
        },
      });

      expect(finalRanking.games).toHaveLength(2);
      expect(finalRanking.games.find((rg) => rg.gameId === games[2].id)).toBeUndefined();

      // Step 9: Get the ranking through the service (tests full formatting)
      const serviceRanking = await RankingService.getRanking(newRanking.id);

      expect(serviceRanking).toMatchObject({
        id: newRanking.id,
        name: "Best RPGs 2023",
        description: "My favorite RPG games of the year",
      });
      expect(serviceRanking.games).toHaveLength(2);
      expect(serviceRanking.creationDate).toMatch(/\w+ \d{1,2}, \d{4}/); // Date format check

      // Step 10: Clean up by deleting the ranking
      await RankingService.deleteRanking(newRanking.id);

      // Verify ranking and associated games are deleted
      const deletedRanking = await testPrisma.ranking.findUnique({
        where: { id: newRanking.id },
      });
      expect(deletedRanking).toBeNull();

      const orphanedRankingGames = await testPrisma.rankingGame.findMany({
        where: { rankingId: newRanking.id },
      });
      expect(orphanedRankingGames).toHaveLength(0);
    });

    it("should handle multiple rankings with overlapping games", async () => {
      // Create shared games
      const games = await createTestGames(4);

      // Create multiple rankings
      const rankings: any[] = [
        await RankingService.createRanking({
          name: "RPG Rankings",
          description: "Role-playing games",
        }),
        await RankingService.createRanking({
          name: "Action Rankings",
          description: "Action-packed games",
        }),
      ];

      // Add games to first ranking
      await RankingService.addGameRanking({
        rankingId: rankings[0].id,
        gameId: games[0].id,
      });
      await RankingService.addGameRanking({
        rankingId: rankings[0].id,
        gameId: games[1].id,
      });

      // Add overlapping games to second ranking
      await RankingService.addGameRanking({
        rankingId: rankings[1].id,
        gameId: games[0].id, // Overlapping game
      });
      await RankingService.addGameRanking({
        rankingId: rankings[1].id,
        gameId: games[2].id,
      });

      // Get all rankings
      const allRankings = await RankingService.getRankings();

      expect(allRankings).toHaveLength(2);
      expect(allRankings[0].games).toHaveLength(2);
      expect(allRankings[1].games).toHaveLength(2);

      // Verify game appears in both rankings
      const sharedGameInRanking1 = allRankings[0].games.find((g) => g.id === games[0].id);
      const sharedGameInRanking2 = allRankings[1].games.find((g) => g.id === games[0].id);

      expect(sharedGameInRanking1).toBeDefined();
      expect(sharedGameInRanking2).toBeDefined();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle invalid ranking operations gracefully", async () => {
      // Try to get non-existent ranking
      await expect(RankingService.getRanking(99999)).rejects.toThrow("NOT_FOUND");

      // Try to add non-existent game to ranking
      const ranking: any = await RankingService.createRanking({
        name: "Test Ranking",
        description: "Test",
      });

      await expect(
        RankingService.addGameRanking({
          rankingId: ranking.id,
          gameId: "nonexistent-game-id",
        }),
      ).rejects.toThrow("NOT_FOUND");

      // Try to add game to non-existent ranking
      const games = await createTestGames(1);

      await expect(
        RankingService.addGameRanking({
          rankingId: 99999,
          gameId: games[0].id,
        }),
      ).rejects.toThrow("NOT_FOUND");
    });

    it("should maintain data integrity during concurrent operations", async () => {
      const games = await createTestGames(3);
      const ranking: any = await RankingService.createRanking({
        name: "Concurrent Test Ranking",
        description: "Testing concurrent operations",
      });

      // Attempt concurrent additions
      const addPromises = games.map((game) =>
        RankingService.addGameRanking({
          rankingId: ranking.id,
          gameId: game.id,
        }),
      );

      const results = await Promise.all(addPromises);
      expect(results).toHaveLength(3);

      // Verify all games were added
      const finalRanking = await testPrisma.ranking.findUnique({
        where: { id: ranking.id },
        include: { games: true },
      });

      expect(finalRanking.games).toHaveLength(3);

      // Verify unique ranks
      const ranks = finalRanking.games.map((rg) => rg.rank);
      const uniqueRanks = [...new Set(ranks)];
      expect(uniqueRanks).toHaveLength(3);
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large rankings efficiently", async () => {
      const startTime = Date.now();

      // Create a moderate number of games
      const games = await createTestGames(25);
      const ranking: any = await RankingService.createRanking({
        name: "Large Ranking Test",
        description: "Performance test with many games",
      });

      // Add all games to ranking
      for (const game of games) {
        await RankingService.addGameRanking({
          rankingId: ranking.id,
          gameId: game.id,
        });
      }

      const setupTime = Date.now() - startTime;
      expect(setupTime).toBeLessThan(10000); // Should complete in under 10 seconds

      // Test retrieval performance
      const retrievalStart = Date.now();
      const retrievedRanking = await RankingService.getRanking(ranking.id);
      const retrievalTime = Date.now() - retrievalStart;

      expect(retrievedRanking.games).toHaveLength(25);
      expect(retrievalTime).toBeLessThan(2000); // Should retrieve in under 2 seconds
    });

    it("should provide accurate database statistics", async () => {
      // Create some test data
      await createTestGames(5);
      const ranking: any = await RankingService.createRanking({
        name: "Stats Test",
        description: "For testing database statistics",
      });

      const stats = await getTestDatabaseStats();

      expect(stats.games).toBe(5);
      expect(stats.rankings).toBe(1);
      expect(stats.gameStatus).toBeGreaterThan(0); // Should have seeded data
      expect(stats.rankingStatus).toBeGreaterThan(0); // Should have seeded data
    });
  });
});
