import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrismaClient } from "../../../../test/utils/database";
import { TestDataFactory, createTestGames, createTestRankingWithGames } from "../../../../test/fixtures/seed";

describe("Ranking Database Operations", () => {
  let testPrisma: any;

  beforeEach(() => {
    testPrisma = getTestPrismaClient();
    TestDataFactory.reset();
  });

  describe("Database CRUD operations", () => {
    it("should create and retrieve rankings", async () => {
      const rankingData = TestDataFactory.createRanking({
        name: "Test Ranking",
        description: "Test Description",
      });

      const ranking = await testPrisma.ranking.create({
        data: rankingData,
      });

      expect(ranking).toMatchObject({
        name: "Test Ranking",
        description: "Test Description",
        isPinned: false,
        maxItems: 10,
      });

      const retrieved = await testPrisma.ranking.findUnique({
        where: { id: ranking.id },
        include: {
          games: {
            include: { game: true },
            orderBy: { rank: "asc" },
          },
          tags: {
            include: { rankingTag: true },
          },
        },
      });

      expect(retrieved).toBeTruthy();
      expect(retrieved.name).toBe("Test Ranking");
    });

    it("should create ranking with games", async () => {
      const { ranking, games } = await createTestRankingWithGames({ name: "Ranking with Games" }, 3);

      expect(ranking.id).toBeDefined();
      expect(games).toHaveLength(3);

      const rankingGames = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
        orderBy: { rank: "asc" },
      });

      expect(rankingGames).toHaveLength(3);
      expect(rankingGames[0].rank).toBe(1);
      expect(rankingGames[1].rank).toBe(2);
      expect(rankingGames[2].rank).toBe(3);
    });

    it("should handle game removal from ranking", async () => {
      const { ranking, games } = await createTestRankingWithGames({ name: "Remove Game Test" }, 2);

      await testPrisma.rankingGame.delete({
        where: {
          rankingId_gameId: {
            rankingId: ranking.id,
            gameId: games[0].id,
          },
        },
      });

      const remainingGames = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });

      expect(remainingGames).toHaveLength(1);
      expect(remainingGames[0].gameId).toBe(games[1].id);
    });

    it("should support game ranking updates", async () => {
      const { ranking, games } = await createTestRankingWithGames({ name: "Update Ranking Test" }, 2);

      await testPrisma.rankingGame.upsert({
        where: {
          rankingId_gameId: {
            rankingId: ranking.id,
            gameId: games[0].id,
          },
        },
        update: {
          rank: 5,
        },
        create: {
          rankingId: ranking.id,
          gameId: games[0].id,
          rank: 5,
        },
      });

      const updatedGame = await testPrisma.rankingGame.findUnique({
        where: {
          rankingId_gameId: {
            rankingId: ranking.id,
            gameId: games[0].id,
          },
        },
      });

      expect(updatedGame.rank).toBe(5);
    });

    it("should handle cascade delete when ranking is deleted", async () => {
      const { ranking, games } = await createTestRankingWithGames({ name: "Cascade Delete Test" }, 2);

      const gamesBefore = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });
      expect(gamesBefore).toHaveLength(2);

      await testPrisma.ranking.delete({
        where: { id: ranking.id },
      });

      const gamesAfter = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });
      expect(gamesAfter).toHaveLength(0);
    });

    it("should enforce unique constraint on ranking-game pairs", async () => {
      const { ranking, games } = await createTestRankingWithGames({ name: "Unique Constraint Test" }, 1);

      await expect(
        testPrisma.rankingGame.create({
          data: {
            rankingId: ranking.id,
            gameId: games[0].id,
            rank: 2,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe("Data Factory Tests", () => {
    it("should create test games with proper defaults", async () => {
      const games = await createTestGames(3);

      expect(games).toHaveLength(3);
      expect(games[0].name).toMatch(/Test Game \d+/);
      expect(games[0].isInstalled).toBe(true);
      expect(games[0].gameStatusId).toBe(1);
    });

    it("should reset factory counters", () => {
      TestDataFactory.reset();
      const game1 = TestDataFactory.createGame();
      const game2 = TestDataFactory.createGame();

      expect(game1.id).toMatch(/test-game-\d+-1$/);
      expect(game2.id).toMatch(/test-game-\d+-2$/);
      expect(game1.name).toBe("Test Game 1");
      expect(game2.name).toBe("Test Game 2");
    });

    it("should allow custom overrides", () => {
      const customGame = TestDataFactory.createGame({
        name: "Custom Game Name",
        isInstalled: false,
      });

      expect(customGame.name).toBe("Custom Game Name");
      expect(customGame.isInstalled).toBe(false);
    });
  });

  describe("Test data seeding", () => {
    it("should have seeded essential data", async () => {
      const gameStatus = await testPrisma.gameStatus.findUnique({
        where: { id: 1 },
      });
      expect(gameStatus).toBeTruthy();
      expect(gameStatus.name).toBeDefined();

      const rankingStatus = await testPrisma.rankingStatus.findUnique({
        where: { id: 1 },
      });
      expect(rankingStatus).toBeTruthy();
      expect(rankingStatus.name).toBeDefined();

      const rankingTags = await testPrisma.rankingTag.findMany();
      expect(rankingTags.length).toBeGreaterThanOrEqual(2);
      expect(rankingTags.map((tag) => tag.name)).toContain("Favorites");
    });
  });
});
