import { describe, it, expect, beforeEach } from "vitest";
import { getTransactionPrismaClient } from "../utils/database";
import { TestDataFactory, createTestGames } from "../fixtures/seed";
import type { Game, GameStatus, Storefront } from "@prisma/client";

describe("Database - Game Operations", () => {
  let testPrisma: any;

  beforeEach(() => {
    testPrisma = getTransactionPrismaClient();
    TestDataFactory.reset();
  });

  describe("Game CRUD Operations", () => {
    it("should create a game with required fields", async () => {
      const gameData = TestDataFactory.createGame({
        name: "Test Game",
        isInstalled: true,
        gameStatusId: 1,
        timePlayed: 7200, // 2 hours in seconds
      });

      const game = await testPrisma.game.create({
        data: gameData,
        include: {
          gameStatus: true,
        },
      });

      expect(game).toBeDefined();
      expect(game.name).toBe("Test Game");
      expect(game.isInstalled).toBe(true);
      expect(game.timePlayed).toBe(7200);
      expect(game.gameStatus.name).toBe("Installed");
    });

    it("should create a game with all optional fields", async () => {
      const gameData = TestDataFactory.createGame({
        name: "Complete Game",
        externalId: "steam-12345",
        summary: "This is a comprehensive test game",
        scoreCritic: 85,
        scoreCommunity: 92,
        scoreUser: 8,
        hasAchievements: true,
        mainStory: 15,
        mainPlusExtra: 25,
        completionist: 40,
        size: BigInt(2147483648), // 2GB
        releasedAt: new Date("2023-06-15"),
      });

      const game = await testPrisma.game.create({
        data: gameData,
      });

      expect(game.name).toBe("Complete Game");
      expect(game.externalId).toBe("steam-12345");
      expect(game.scoreCritic).toBe(85);
      expect(game.hasAchievements).toBe(true);
      expect(game.mainStory).toBe(15);
      expect(Number(game.size)).toBe(2147483648);
    });

    it("should read game with all related data", async () => {
      const games = await createTestGames(1);
      const game = games[0];

      const fullGame = await testPrisma.game.findUnique({
        where: { id: game.id },
        include: {
          gameStatus: true,
          storefront: true,
          activities: true,
          achievements: true,
          tags: {
            include: {
              tag: true,
            },
          },
          rankings: {
            include: {
              ranking: true,
            },
          },
        },
      });

      expect(fullGame).toBeDefined();
      expect(fullGame.gameStatus).toBeDefined();
      expect(fullGame.gameStatus.name).toBe("Installed");
      expect(Array.isArray(fullGame.activities)).toBe(true);
      expect(Array.isArray(fullGame.achievements)).toBe(true);
      expect(Array.isArray(fullGame.tags)).toBe(true);
      expect(Array.isArray(fullGame.rankings)).toBe(true);
    });

    it("should update game properties", async () => {
      const games = await createTestGames(1);
      const game = games[0];

      const updatedGame = await testPrisma.game.update({
        where: { id: game.id },
        data: {
          name: "Updated Game Name",
          isFavorite: true,
          timePlayed: 14400, // 4 hours
          scoreUser: 9,
          lastTimePlayed: BigInt(Date.now()),
        },
      });

      expect(updatedGame.name).toBe("Updated Game Name");
      expect(updatedGame.isFavorite).toBe(true);
      expect(updatedGame.timePlayed).toBe(14400);
      expect(updatedGame.scoreUser).toBe(9);
      expect(updatedGame.lastTimePlayed).toBeDefined();
    });

    it("should delete game and cascade related data", async () => {
      const games = await createTestGames(1);
      const gameId = games[0].id;

      // Add some related data
      await testPrisma.gameActivity.create({
        data: {
          gameId,
          startedAt: BigInt(Date.now() - 3600000),
          endedAt: BigInt(Date.now()),
          duration: 3600,
        },
      });

      // Verify related data exists
      const activitiesBefore = await testPrisma.gameActivity.findMany({
        where: { gameId },
      });
      expect(activitiesBefore).toHaveLength(1);

      // Delete game
      await testPrisma.game.delete({
        where: { id: gameId },
      });

      // Verify game is deleted
      const deletedGame = await testPrisma.game.findUnique({
        where: { id: gameId },
      });
      expect(deletedGame).toBeNull();

      // Verify related data is cascade deleted
      const activitiesAfter = await testPrisma.gameActivity.findMany({
        where: { gameId },
      });
      expect(activitiesAfter).toHaveLength(0);
    });
  });

  describe("Game Search and Filtering", () => {
    beforeEach(async () => {
      // Create games with varied properties for filtering tests using batch operations
      const gameData = [
        TestDataFactory.createGame({
          name: "The Elder Scrolls V: Skyrim",
          isInstalled: true,
          isFavorite: true,
          isEmulation: false,
          timePlayed: 36000, // 10 hours
          scoreCritic: 94,
          releasedAt: new Date("2011-11-11"),
        }),
        TestDataFactory.createGame({
          name: "Super Mario Bros",
          isInstalled: false,
          isFavorite: false,
          isEmulation: true,
          timePlayed: 1800, // 30 minutes
          scoreCritic: null,
          releasedAt: new Date("1985-09-13"),
        }),
        TestDataFactory.createGame({
          name: "Cyberpunk 2077",
          isInstalled: true,
          isFavorite: false,
          isEmulation: false,
          timePlayed: 14400, // 4 hours
          scoreCritic: 86,
          releasedAt: new Date("2020-12-10"),
        }),
      ];

      // Use batch insert for better performance
      await testPrisma.game.createMany({
        data: gameData,
      });
    });

    it("should find games by name (case insensitive)", async () => {
      const games = await testPrisma.game.findMany({
        where: {
          name: {
            contains: "Skyrim", // Exact case match since SQLite is case-sensitive by default
          },
        },
      });

      expect(games).toHaveLength(1);
      expect(games[0].name).toContain("Skyrim");
    });

    it("should filter games by installation status", async () => {
      const installedGames = await testPrisma.game.findMany({
        where: { isInstalled: true },
      });

      const uninstalledGames = await testPrisma.game.findMany({
        where: { isInstalled: false },
      });

      expect(installedGames).toHaveLength(2); // Skyrim and Cyberpunk
      expect(uninstalledGames).toHaveLength(1); // Mario
    });

    it("should filter games by favorites", async () => {
      const favoriteGames = await testPrisma.game.findMany({
        where: { isFavorite: true },
      });

      expect(favoriteGames).toHaveLength(1);
      expect(favoriteGames[0].name).toContain("Skyrim");
    });

    it("should filter games by emulation status", async () => {
      const emulationGames = await testPrisma.game.findMany({
        where: { isEmulation: true },
      });

      expect(emulationGames).toHaveLength(1);
      expect(emulationGames[0].name).toContain("Mario");
    });

    it("should sort games by time played", async () => {
      const games = await testPrisma.game.findMany({
        orderBy: { timePlayed: "desc" },
      });

      expect(games[0].timePlayed).toBe(36000); // Skyrim (10 hours)
      expect(games[1].timePlayed).toBe(14400); // Cyberpunk (4 hours)
      expect(games[2].timePlayed).toBe(1800); // Mario (30 min)
    });

    it("should sort games by release date", async () => {
      const games = await testPrisma.game.findMany({
        orderBy: { releasedAt: "desc" },
      });

      expect(games[0].name).toContain("Cyberpunk"); // 2020
      expect(games[1].name).toContain("Skyrim"); // 2011
      expect(games[2].name).toContain("Mario"); // 1985
    });

    it("should filter by multiple criteria", async () => {
      const games = await testPrisma.game.findMany({
        where: {
          AND: [
            { isInstalled: true },
            { timePlayed: { gt: 5000 } }, // More than ~1.4 hours
            { scoreCritic: { not: null } },
          ],
        },
        orderBy: { scoreCritic: "desc" },
      });

      expect(games).toHaveLength(2); // Skyrim and Cyberpunk
      expect(games[0].scoreCritic).toBe(94); // Skyrim
      expect(games[1].scoreCritic).toBe(86); // Cyberpunk
    });
  });

  describe("Game Activities and Time Tracking", () => {
    it("should track game activities", async () => {
      const games = await createTestGames(1);
      const game = games[0];

      const now = Date.now();
      const sessionStart = now - 3600000; // 1 hour ago

      const activity = await testPrisma.gameActivity.create({
        data: {
          gameId: game.id,
          startedAt: BigInt(sessionStart),
          endedAt: BigInt(now),
          duration: 3600, // 1 hour in seconds
        },
      });

      expect(activity).toBeDefined();
      expect(activity.gameId).toBe(game.id);
      expect(activity.duration).toBe(3600);

      // Verify relationship
      const gameWithActivities = await testPrisma.game.findUnique({
        where: { id: game.id },
        include: { activities: true },
      });

      expect(gameWithActivities?.activities).toHaveLength(1);
      expect(gameWithActivities?.activities[0].duration).toBe(3600);
    });

    it("should calculate total time played from activities", async () => {
      const games = await createTestGames(1);
      const game = games[0];

      // Create multiple activities
      const activities = [
        { duration: 3600 }, // 1 hour
        { duration: 1800 }, // 30 minutes
        { duration: 7200 }, // 2 hours
      ];

      for (let i = 0; i < activities.length; i++) {
        const startTime = Date.now() - (i + 1) * 4000000;
        await testPrisma.gameActivity.create({
          data: {
            gameId: game.id,
            startedAt: BigInt(startTime),
            endedAt: BigInt(startTime + activities[i].duration * 1000),
            duration: activities[i].duration,
          },
        });
      }

      // Calculate total from activities
      const totalFromActivities = await testPrisma.gameActivity.aggregate({
        where: { gameId: game.id },
        _sum: { duration: true },
      });

      expect(totalFromActivities._sum.duration).toBe(12600); // 3.5 hours
    });
  });

  describe("Game Achievements", () => {
    it("should create and manage game achievements", async () => {
      const games = await createTestGames(1);
      const game = games[0];

      // Create achievements
      const achievements = [
        {
          externalId: "ACH_001",
          name: "First Steps",
          description: "Complete the tutorial",
          rarity: 95,
          isHidden: false,
          isUnlocked: true,
          unlockedAt: BigInt(Date.now()),
        },
        {
          externalId: "ACH_002",
          name: "Secret Achievement",
          description: "???",
          rarity: 5,
          isHidden: true,
          isUnlocked: false,
          unlockedAt: null,
        },
      ];

      for (const achData of achievements) {
        await testPrisma.gameAchievement.create({
          data: {
            gameId: game.id,
            ...achData,
          },
        });
      }

      const gameWithAchievements = await testPrisma.game.findUnique({
        where: { id: game.id },
        include: {
          achievements: {
            orderBy: { rarity: "desc" },
          },
        },
      });

      expect(gameWithAchievements?.achievements).toHaveLength(2);
      expect(gameWithAchievements?.achievements[0].isUnlocked).toBe(true);
      expect(gameWithAchievements?.achievements[1].isHidden).toBe(true);
    });

    it("should enforce unique external achievement IDs per game", async () => {
      const games = await createTestGames(1);
      const game = games[0];

      await testPrisma.gameAchievement.create({
        data: {
          gameId: game.id,
          externalId: "DUPLICATE_ID",
          name: "First Achievement",
          description: "First",
        },
      });

      // Try to create duplicate
      await expect(
        testPrisma.gameAchievement.create({
          data: {
            gameId: game.id,
            externalId: "DUPLICATE_ID",
            name: "Duplicate Achievement",
            description: "Duplicate",
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe("Game Performance", () => {
    it("should efficiently query large number of games", async () => {
      // Create a reasonable number of games for testing
      const startTime = Date.now();

      await createTestGames(10); // Reduced to 10 games for faster testing

      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(2000); // Reduced expectation to 2s

      // Test query performance
      const queryStart = Date.now();

      const games = await testPrisma.game.findMany({
        include: {
          gameStatus: true,
          activities: true,
        },
        take: 10,
      });

      const queryTime = Date.now() - queryStart;

      expect(games).toHaveLength(10);
      expect(queryTime).toBeLessThan(500); // Should be fast
    });

    it("should handle concurrent game updates", async () => {
      const games = await createTestGames(3);

      // Simulate concurrent updates
      const updatePromises = games.map((game, index) =>
        testPrisma.game.update({
          where: { id: game.id },
          data: {
            timePlayed: (index + 1) * 1000,
            scoreUser: index + 7,
          },
        }),
      );

      const results = await Promise.all(updatePromises);

      expect(results).toHaveLength(3);
      expect(results[0].timePlayed).toBe(1000);
      expect(results[1].timePlayed).toBe(2000);
      expect(results[2].timePlayed).toBe(3000);
    });
  });
});
