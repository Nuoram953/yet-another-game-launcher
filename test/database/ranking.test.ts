import { describe, it, expect, beforeEach } from "vitest";
import { getTransactionPrismaClient } from "../utils/database";
import { TestDataFactory, createTestGames, createTestRankingWithGames } from "../fixtures/seed";
import type { Game, Ranking } from "@prisma/client";

describe("Database - Ranking Operations", () => {
  let testPrisma: any;

  beforeEach(() => {
    testPrisma = getTransactionPrismaClient();
    TestDataFactory.reset();
  });

  describe("Ranking CRUD Operations", () => {
    it("should create a ranking with valid data", async () => {
      const rankingData = TestDataFactory.createRanking({
        name: "Best RPGs 2024",
        description: "My favorite RPG games",
        maxItems: 15,
      });

      const ranking = await testPrisma.ranking.create({
        data: rankingData,
      });

      expect(ranking).toBeDefined();
      expect(ranking.name).toBe("Best RPGs 2024");
      expect(ranking.maxItems).toBe(15);
      expect(ranking.isPinned).toBe(false);
    });

    it("should read ranking with related data", async () => {
      const { ranking } = await createTestRankingWithGames(
        {
          name: "Action Games",
        },
        3,
      );

      const fullRanking = await testPrisma.ranking.findUnique({
        where: { id: ranking.id },
        include: {
          games: {
            include: {
              game: true,
            },
            orderBy: { rank: "asc" },
          },
          rankingStatus: true,
        },
      });

      expect(fullRanking).toBeDefined();
      expect(fullRanking.games).toHaveLength(3);
      expect(fullRanking.games[0].rank).toBe(1);
      expect(fullRanking.games[1].rank).toBe(2);
      expect(fullRanking.games[2].rank).toBe(3);
      expect(fullRanking.rankingStatus.name).toBe("Active");
    });

    it("should update ranking properties", async () => {
      const { ranking } = await createTestRankingWithGames();

      const updatedRanking = await testPrisma.ranking.update({
        where: { id: ranking.id },
        data: {
          name: "Updated Ranking Name",
          isPinned: true,
          maxItems: 20,
        },
      });

      expect(updatedRanking.name).toBe("Updated Ranking Name");
      expect(updatedRanking.isPinned).toBe(true);
      expect(updatedRanking.maxItems).toBe(20);
    });

    it("should delete ranking and cascade delete games", async () => {
      const { ranking } = await createTestRankingWithGames({}, 3);

      // Verify games are associated
      const gamesBefore = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });
      expect(gamesBefore).toHaveLength(3);

      // Delete ranking
      await testPrisma.ranking.delete({
        where: { id: ranking.id },
      });

      // Verify cascade deletion
      const gamesAfter = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });
      expect(gamesAfter).toHaveLength(0);
    });
  });

  describe("Game-Ranking Associations", () => {
    it("should add games to ranking with correct ranks", async () => {
      const games = await createTestGames(4);
      const ranking = await testPrisma.ranking.create({
        data: TestDataFactory.createRanking({ name: "Test Ranking" }),
      });

      // Add games with specific ranks
      const ranks = [1, 3, 2, 4];
      for (let i = 0; i < games.length; i++) {
        await testPrisma.rankingGame.create({
          data: {
            rankingId: ranking.id,
            gameId: games[i].id,
            rank: ranks[i],
          },
        });
      }

      const rankingGames = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
        orderBy: { rank: "asc" },
        include: { game: true },
      });

      expect(rankingGames).toHaveLength(4);
      expect(rankingGames[0].rank).toBe(1);
      expect(rankingGames[1].rank).toBe(2);
      expect(rankingGames[2].rank).toBe(3);
      expect(rankingGames[3].rank).toBe(4);
    });

    it("should prevent duplicate game-ranking associations", async () => {
      const { ranking, games } = await createTestRankingWithGames({}, 1);

      // Try to add the same game again
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

    it("should update game rank within ranking", async () => {
      const { ranking, games } = await createTestRankingWithGames({}, 3);

      // Update rank of first game
      await testPrisma.rankingGame.update({
        where: {
          rankingId_gameId: {
            rankingId: ranking.id,
            gameId: games[0].id,
          },
        },
        data: { rank: 3 },
      });

      const updatedRankingGame = await testPrisma.rankingGame.findUnique({
        where: {
          rankingId_gameId: {
            rankingId: ranking.id,
            gameId: games[0].id,
          },
        },
      });

      expect(updatedRankingGame?.rank).toBe(3);
    });

    it("should remove game from ranking", async () => {
      const { ranking, games } = await createTestRankingWithGames({}, 3);

      // Remove middle game
      await testPrisma.rankingGame.delete({
        where: {
          rankingId_gameId: {
            rankingId: ranking.id,
            gameId: games[1].id,
          },
        },
      });

      const remainingGames = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });

      expect(remainingGames).toHaveLength(2);
      expect(remainingGames.find((rg) => rg.gameId === games[1].id)).toBeUndefined();
    });
  });

  describe("Complex Queries", () => {
    it("should find rankings containing specific games", async () => {
      const games = await createTestGames(5);

      // Create multiple rankings with overlapping games
      const { ranking: ranking1 } = await createTestRankingWithGames({ name: "RPGs" }, 0);
      const { ranking: ranking2 } = await createTestRankingWithGames({ name: "Action" }, 0);

      // Add specific games to rankings
      await testPrisma.rankingGame.create({
        data: { rankingId: ranking1.id, gameId: games[0].id, rank: 1 },
      });
      await testPrisma.rankingGame.create({
        data: { rankingId: ranking1.id, gameId: games[1].id, rank: 2 },
      });
      await testPrisma.rankingGame.create({
        data: { rankingId: ranking2.id, gameId: games[0].id, rank: 1 },
      });

      // Find rankings containing games[0]
      const rankings = await testPrisma.ranking.findMany({
        where: {
          games: {
            some: {
              gameId: games[0].id,
            },
          },
        },
        include: {
          games: true,
        },
      });

      expect(rankings).toHaveLength(2);
      expect(rankings.map((r) => r.name)).toContain("RPGs");
      expect(rankings.map((r) => r.name)).toContain("Action");
    });

    it("should get top games across all rankings", async () => {
      // Create multiple rankings
      const games = await createTestGames(5);
      const { ranking: ranking1 } = await createTestRankingWithGames({ name: "RPGs" }, 0);
      const { ranking: ranking2 } = await createTestRankingWithGames({ name: "Action" }, 0);

      // Add games with different ranks
      await testPrisma.rankingGame.createMany({
        data: [
          { rankingId: ranking1.id, gameId: games[0].id, rank: 1 },
          { rankingId: ranking1.id, gameId: games[1].id, rank: 2 },
          { rankingId: ranking2.id, gameId: games[0].id, rank: 1 }, // games[0] appears twice
          { rankingId: ranking2.id, gameId: games[2].id, rank: 2 },
        ],
      });

      // Find games that appear in multiple rankings
      const topGames = await testPrisma.game.findMany({
        where: {
          rankings: {
            some: {},
          },
        },
        include: {
          rankings: {
            include: {
              ranking: true,
            },
          },
        },
        orderBy: {
          rankings: {
            _count: "desc",
          },
        },
      });

      expect(topGames.length).toBeGreaterThan(0);
      // games[0] should be first as it appears in 2 rankings
      expect(topGames[0].id).toBe(games[0].id);
    });

    it("should calculate ranking statistics", async () => {
      const { ranking } = await createTestRankingWithGames({ name: "Test Stats" }, 5);

      // Get comprehensive ranking stats
      const stats = await testPrisma.ranking.findUnique({
        where: { id: ranking.id },
        include: {
          games: {
            include: {
              game: {
                include: {
                  gameStatus: true,
                },
              },
            },
          },
          _count: {
            select: {
              games: true,
            },
          },
        },
      });

      expect(stats).toBeDefined();
      expect(stats!._count.games).toBe(5);
      expect(stats!.games).toHaveLength(5);

      // All games should be installed (based on test data factory)
      const installedGames = stats!.games.filter((rg) => rg.game.gameStatus.name === "Installed");
      expect(installedGames).toHaveLength(5);
    });
  });

  describe("Data Integrity", () => {
    it("should maintain referential integrity on game deletion", async () => {
      const { ranking, games } = await createTestRankingWithGames({}, 3);

      // Delete a game (should cascade delete rankingGame)
      await testPrisma.game.delete({
        where: { id: games[1].id },
      });

      const remainingRankingGames = await testPrisma.rankingGame.findMany({
        where: { rankingId: ranking.id },
      });

      expect(remainingRankingGames).toHaveLength(2);
      expect(remainingRankingGames.find((rg) => rg.gameId === games[1].id)).toBeUndefined();
    });

    it("should enforce unique constraints", async () => {
      const { ranking, games } = await createTestRankingWithGames({}, 1);

      // Try to create duplicate ranking-game association
      await expect(
        testPrisma.rankingGame.create({
          data: {
            rankingId: ranking.id,
            gameId: games[0].id,
            rank: 10,
          },
        }),
      ).rejects.toThrow();
    });
  });
});
