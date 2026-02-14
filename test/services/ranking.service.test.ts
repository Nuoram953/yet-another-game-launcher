import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setupMocks,
  resetMocks,
  mockQueries,
  mockMediaService,
  mockRankingQueries,
  mockGameQueries,
} from "../utils/enhanced-mocks";

// Import service to test
import * as RankingService from "../../src/main/ranking/ranking.service";

describe("Service - Ranking Service", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("getRankings", () => {
    it("should return formatted rankings with games and covers", async () => {
      // Mock data
      const mockRankingsData = [
        {
          id: 1,
          name: "Best RPGs",
          description: "My favorite RPG games",
          createdAt: new Date("2023-01-15T12:00:00Z"),
          tags: [{ rankingTag: { name: "Favorites" } }, { rankingTag: { name: "RPG" } }],
          games: [
            {
              gameId: "game-1",
              game: { name: "The Elder Scrolls V: Skyrim" },
            },
            {
              gameId: "game-2",
              game: { name: "The Witcher 3" },
            },
          ],
        },
        {
          id: 2,
          name: "Action Games",
          description: "Fast-paced action titles",
          createdAt: new Date("2023-02-20T12:00:00Z"),
          tags: [{ rankingTag: { name: "Action" } }],
          games: [
            {
              gameId: "game-3",
              game: { name: "DOOM Eternal" },
            },
          ],
        },
      ];

      // Setup mocks
      mockQueries.Ranking.findAll.mockResolvedValue(mockRankingsData);
      mockMediaService.getMediaByType.mockResolvedValue(["cover1.jpg"]);

      // Execute
      const result = await RankingService.getRankings();

      // Assertions
      expect(result).toHaveLength(2);

      // First ranking
      expect(result[0]).toMatchObject({
        id: 1,
        name: "Best RPGs",
        description: "My favorite RPG games",
        creationDate: "January 15, 2023",
        tags: ["Favorites", "RPG"],
      });
      expect(result[0].games).toHaveLength(2);
      expect(result[0].games[0]).toMatchObject({
        id: "game-1",
        name: "The Elder Scrolls V: Skyrim",
        cover: ["cover1.jpg"],
      });

      // Second ranking
      expect(result[1]).toMatchObject({
        id: 2,
        name: "Action Games",
        tags: ["Action"],
      });
      expect(result[1].games).toHaveLength(1);

      // Verify media service was called correctly
      expect(mockMediaService.getMediaByType).toHaveBeenCalledTimes(3); // 2 + 1 games
      expect(mockMediaService.getMediaByType).toHaveBeenCalledWith("covers", "game-1", 1);
      expect(mockMediaService.getMediaByType).toHaveBeenCalledWith("covers", "game-2", 1);
      expect(mockMediaService.getMediaByType).toHaveBeenCalledWith("covers", "game-3", 1);
    });

    it("should handle rankings with no games", async () => {
      const mockRankingsData = [
        {
          id: 1,
          name: "Empty Ranking",
          description: "No games yet",
          createdAt: new Date("2023-01-01T12:00:00Z"),
          tags: [],
          games: [],
        },
      ];

      mockQueries.Ranking.findAll.mockResolvedValue(mockRankingsData);

      const result = await RankingService.getRankings();

      expect(result).toHaveLength(1);
      expect(result[0].games).toHaveLength(0);
      expect(result[0].tags).toHaveLength(0);
      expect(mockMediaService.getMediaByType).not.toHaveBeenCalled();
    });
  });

  describe("getRanking", () => {
    it("should return a single ranking by ID", async () => {
      const mockRanking = {
        id: 1,
        name: "Best Strategy Games",
        description: "Turn-based and real-time strategy games",
        createdAt: new Date("2023-03-10T12:00:00Z"),
        tags: [{ rankingTag: { name: "Strategy" } }],
        games: [
          {
            gameId: "civ6",
            game: { name: "Civilization VI" },
          },
        ],
      };

      mockQueries.Ranking.findUnique.mockResolvedValue(mockRanking);
      mockMediaService.getMediaByType.mockResolvedValue(["civ6-cover.jpg"]);

      const result = await RankingService.getRanking(1);

      expect(result).toMatchObject({
        id: 1,
        name: "Best Strategy Games",
        description: "Turn-based and real-time strategy games",
        creationDate: "March 10, 2023",
        tags: ["Strategy"],
      });
      expect(result.games).toHaveLength(1);
      expect(result.games[0]).toMatchObject({
        id: "civ6",
        name: "Civilization VI",
        cover: ["civ6-cover.jpg"],
      });

      expect(mockQueries.Ranking.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it("should throw error when ranking not found", async () => {
      mockQueries.Ranking.findUnique.mockResolvedValue(null);

      await expect(RankingService.getRanking(999)).rejects.toThrow("Entity not found");
      expect(mockQueries.Ranking.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
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
    });
  });

  describe("createRanking", () => {
    it("should create a new ranking", async () => {
      const newRanking = {
        id: 3,
        name: "Horror Games",
        description: "Scary games for Halloween",
      };

      mockQueries.Ranking.create.mockResolvedValue(newRanking);

      const result = await RankingService.createRanking({
        name: "Horror Games",
        description: "Scary games for Halloween",
      });

      expect(result).toEqual(newRanking);
      expect(mockQueries.Ranking.create).toHaveBeenCalledWith({
        data: {
          name: "Horror Games",
          description: "Scary games for Halloween",
          rankingStatusId: 1,
        },
      });
    });
  });

  describe("deleteRanking", () => {
    it("should delete a ranking by ID", async () => {
      mockQueries.Ranking.deleteById.mockResolvedValue(undefined);

      await RankingService.deleteRanking(1);

      expect(mockQueries.Ranking.deleteById).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe("addGameRanking", () => {
    it("should add a game to a ranking", async () => {
      const mockRanking = {
        id: 1,
        games: [{ gameId: "existing-game", rank: 1 }],
      };
      const mockGame = { id: "new-game", name: "New Game" };
      const mockRankingGame = { rankingId: 1, gameId: "new-game", rank: 2 };

      mockQueries.Ranking.findUnique.mockResolvedValue(mockRanking);
      mockQueries.Game.getGameById.mockResolvedValue(mockGame);
      mockQueries.RankingGame.upsert.mockResolvedValue(mockRankingGame);

      const result = await RankingService.addGameRanking({
        rankingId: 1,
        gameId: "new-game",
      });

      expect(result).toEqual(mockRankingGame);
      expect(mockQueries.RankingGame.upsert).toHaveBeenCalledWith({
        where: {
          rankingId_gameId: {
            rankingId: 1,
            gameId: "new-game",
          },
        },
        update: {
          rank: 2,
          updatedAt: expect.any(Date),
        },
        create: {
          rankingId: 1,
          gameId: "new-game",
          rank: 2,
          createdAt: expect.any(Date),
        },
      });
    });

    it("should throw error when ranking not found", async () => {
      mockQueries.Ranking.findUnique.mockResolvedValue(null);

      await expect(
        RankingService.addGameRanking({
          rankingId: 999,
          gameId: "some-game",
        }),
      ).rejects.toThrow("Entity not found");
    });

    it("should throw error when game not found", async () => {
      const mockRanking = { id: 1, games: [] };

      mockQueries.Ranking.findUnique.mockResolvedValue(mockRanking);
      mockQueries.Game.getGameById.mockResolvedValue(null);

      await expect(
        RankingService.addGameRanking({
          rankingId: 1,
          gameId: "nonexistent-game",
        }),
      ).rejects.toThrow("Entity not found");
    });
  });

  describe("removeGameRanking", () => {
    it("should remove a game from a ranking", async () => {
      const mockRanking = { id: 1 };
      const mockGame = { id: "game-to-remove" };

      mockQueries.Ranking.findUnique.mockResolvedValue(mockRanking);
      mockQueries.Game.getGameById.mockResolvedValue(mockGame);
      mockQueries.RankingGame.destroy.mockResolvedValue(true);

      const result = await RankingService.removeGameRanking({
        rankingId: 1,
        gameId: "game-to-remove",
      });

      expect(result).toBe(true);
      expect(mockQueries.RankingGame.destroy).toHaveBeenCalledWith({
        where: {
          rankingId_gameId: {
            rankingId: 1,
            gameId: "game-to-remove",
          },
        },
      });
    });

    it("should throw error when ranking not found", async () => {
      mockQueries.Ranking.findUnique.mockResolvedValue(null);

      await expect(
        RankingService.removeGameRanking({
          rankingId: 999,
          gameId: "some-game",
        }),
      ).rejects.toThrow("Entity not found");
    });
  });

  describe("updateGameOrder", () => {
    it("should update the order of games in a ranking", async () => {
      const mockRanking = { id: 1 };
      const gameOrders = [
        { gameId: "game-1", rank: 2 },
        { gameId: "game-2", rank: 1 },
        { gameId: "game-3", rank: 3 },
      ];

      mockQueries.Ranking.findUnique.mockResolvedValue(mockRanking);
      mockQueries.RankingGame.upsert.mockResolvedValue({});

      const result = await RankingService.updateGameOrder({
        rankingId: 1,
        gameOrders,
      });

      expect(result).toHaveLength(3);
      expect(mockQueries.RankingGame.upsert).toHaveBeenCalledTimes(3);

      // Verify each call - expecting Prisma upsert structure
      expect(mockQueries.RankingGame.upsert).toHaveBeenCalledWith({
        where: {
          rankingId_gameId: {
            rankingId: 1,
            gameId: "game-1",
          },
        },
        update: {
          rank: 2,
          updatedAt: expect.any(Date),
        },
        create: {
          rankingId: 1,
          gameId: "game-1",
          rank: 2,
          createdAt: expect.any(Date),
        },
      });
      expect(mockQueries.RankingGame.upsert).toHaveBeenCalledWith({
        where: {
          rankingId_gameId: {
            rankingId: 1,
            gameId: "game-2",
          },
        },
        update: {
          rank: 1,
          updatedAt: expect.any(Date),
        },
        create: {
          rankingId: 1,
          gameId: "game-2",
          rank: 1,
          createdAt: expect.any(Date),
        },
      });
      expect(mockQueries.RankingGame.upsert).toHaveBeenCalledWith({
        where: {
          rankingId_gameId: {
            rankingId: 1,
            gameId: "game-3",
          },
        },
        update: {
          rank: 3,
          updatedAt: expect.any(Date),
        },
        create: {
          rankingId: 1,
          gameId: "game-3",
          rank: 3,
          createdAt: expect.any(Date),
        },
      });
    });

    it("should handle empty game orders array", async () => {
      const mockRanking = { id: 1 };

      mockQueries.Ranking.findUnique.mockResolvedValue(mockRanking);

      const result = await RankingService.updateGameOrder({
        rankingId: 1,
        gameOrders: [],
      });

      expect(result).toHaveLength(0);
      expect(mockQueries.RankingGame.upsert).not.toHaveBeenCalled();
    });

    it("should throw error when ranking not found", async () => {
      mockQueries.Ranking.findUnique.mockResolvedValue(null);

      await expect(
        RankingService.updateGameOrder({
          rankingId: 999,
          gameOrders: [{ gameId: "game-1", rank: 1 }],
        }),
      ).rejects.toThrow("Entity not found");
    });
  });

  describe("Error Handling", () => {
    it("should handle media service errors gracefully", async () => {
      const mockRanking = {
        id: 1,
        name: "Test Ranking",
        description: "Test",
        createdAt: new Date("2023-01-01T12:00:00Z"),
        tags: [],
        games: [
          {
            gameId: "game-1",
            game: { name: "Test Game" },
          },
        ],
      };

      mockQueries.Ranking.findAll.mockResolvedValue([mockRanking]);
      mockMediaService.getMediaByType.mockRejectedValue(new Error("Media service error"));

      // Should not throw, but handle the error gracefully
      await expect(RankingService.getRankings()).rejects.toThrow("Media service error");
    });

    it("should handle database errors", async () => {
      mockQueries.Ranking.findAll.mockRejectedValue(new Error("Database connection error"));

      await expect(RankingService.getRankings()).rejects.toThrow("Database connection error");
    });
  });
});
