import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import {
  setupHandlerTesting,
  invokeHandler,
  isHandlerRegistered,
  resetHandlers,
} from "../../../../test/utils/handler-testing";
import { ErrorMessage } from "@common/error";
import { RouteRanking } from "@common/constant";

vi.mock("../ranking.service", () => ({
  getRankings: vi.fn(),
  getRanking: vi.fn(),
  createRanking: vi.fn(),
  deleteRanking: vi.fn(),
  addGameRanking: vi.fn(),
  removeGameRanking: vi.fn(),
  updateGameOrder: vi.fn(),
}));

vi.mock("../../logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

let RankingService: any;

describe("Ranking Handlers (IPC Endpoints)", () => {
  beforeAll(async () => {
    setupHandlerTesting();

    RankingService = await import("../ranking.service");

    await import("../ranking.handler");
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Handler Registration", () => {
    it("should register all ranking handlers", () => {
      expect(isHandlerRegistered(RouteRanking.GET_RANKINGS)).toBe(true);
      expect(isHandlerRegistered(RouteRanking.GET_RANKING)).toBe(true);
      expect(isHandlerRegistered(RouteRanking.CREATE)).toBe(true);
      expect(isHandlerRegistered(RouteRanking.DELETE)).toBe(true);
      expect(isHandlerRegistered(RouteRanking.ADD_GAME_FROM_RANKING)).toBe(true);
      expect(isHandlerRegistered(RouteRanking.REMOVE_GAME_FROM_RANKING)).toBe(true);
      expect(isHandlerRegistered(RouteRanking.UPDATE_GAME_ORDER)).toBe(true);
    });
  });

  describe("GET_RANKINGS Handler", () => {
    it("should handle get rankings request successfully", async () => {
      const mockRankings = [
        { id: 1, name: "Top Games", games: [], tags: [], creationDate: "January 1, 2024" },
        { id: 2, name: "Favorites", games: [], tags: [], creationDate: "January 2, 2024" },
      ];

      vi.mocked(RankingService.getRankings).mockResolvedValue(mockRankings);

      const result = await invokeHandler(RouteRanking.GET_RANKINGS);

      expect(RankingService.getRankings).toHaveBeenCalledOnce();
      expect(result).toEqual(mockRankings);
    });

    it("should propagate service layer errors", async () => {
      const error = new Error("Database connection failed");
      vi.mocked(RankingService.getRankings).mockRejectedValue(error);

      await expect(invokeHandler(RouteRanking.GET_RANKINGS)).rejects.toThrow("Database connection failed");
    });
  });

  describe("GET_RANKING Handler", () => {
    it("should handle get single ranking request successfully", async () => {
      const mockRanking = {
        id: 1,
        name: "Top Games",
        description: "My favorite games",
        games: [{ id: "game1", name: "Game 1", cover: ["cover1.jpg"] }],
        tags: ["favorites"],
        creationDate: "January 1, 2024",
      };

      vi.mocked(RankingService.getRanking).mockResolvedValue(mockRanking);

      const result = await invokeHandler(RouteRanking.GET_RANKING, 1);

      expect(RankingService.getRanking).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRanking);
    });

    it("should handle invalid ranking ID", async () => {
      await expect(invokeHandler(RouteRanking.GET_RANKING, "invalid")).rejects.toThrow(ErrorMessage.INVALID_BODY);
    });

    it("should handle not found ranking", async () => {
      vi.mocked(RankingService.getRanking).mockResolvedValue(null);

      await expect(invokeHandler(RouteRanking.GET_RANKING, 999)).rejects.toThrow("Entity not found");
    });

    it("should handle missing ranking ID", async () => {
      await expect(invokeHandler(RouteRanking.GET_RANKING)).rejects.toThrow(ErrorMessage.INVALID_BODY);
    });
  });

  describe("CREATE Handler", () => {
    it("should handle create ranking request successfully", async () => {
      const rankingData = {
        name: "New Ranking",
        description: "A new ranking",
      };

      const mockCreatedRanking = {
        id: 3,
        ...rankingData,
        isPinned: false,
        maxItems: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        rankingStatusId: 1,
      };

      vi.mocked(RankingService.createRanking).mockResolvedValue(mockCreatedRanking);

      const result = await invokeHandler(RouteRanking.CREATE, rankingData);

      expect(RankingService.createRanking).toHaveBeenCalledWith(rankingData);
      expect(result).toEqual(mockCreatedRanking);
    });

    it("should validate required fields", async () => {
      const invalidData = { name: "Test" };

      await expect(invokeHandler(RouteRanking.CREATE, invalidData)).rejects.toThrow(ErrorMessage.INVALID_BODY);
      expect(RankingService.createRanking).not.toHaveBeenCalled();
    });

    it("should reject empty name", async () => {
      const invalidData = { name: "", description: "Test" };

      await expect(invokeHandler(RouteRanking.CREATE, invalidData)).rejects.toThrow(ErrorMessage.INVALID_BODY);
    });

    it("should reject non-string fields", async () => {
      const invalidData = { name: 123, description: "Test" };

      await expect(invokeHandler(RouteRanking.CREATE, invalidData)).rejects.toThrow(ErrorMessage.INVALID_BODY);
    });
  });

  describe("DELETE Handler", () => {
    it("should handle delete ranking request successfully", async () => {
      vi.mocked(RankingService.deleteRanking).mockResolvedValue(undefined);

      const result = await invokeHandler(RouteRanking.DELETE, 1);

      expect(RankingService.deleteRanking).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should validate ranking ID", async () => {
      await expect(invokeHandler(RouteRanking.DELETE, "invalid")).rejects.toThrow(ErrorMessage.INVALID_BODY);
      expect(RankingService.deleteRanking).not.toHaveBeenCalled();
    });

    it("should handle service layer errors", async () => {
      const error = new Error("Ranking not found");
      vi.mocked(RankingService.deleteRanking).mockRejectedValue(error);

      await expect(invokeHandler(RouteRanking.DELETE, 1)).rejects.toThrow("Ranking not found");
    });
  });

  describe("ADD_GAME_FROM_RANKING Handler", () => {
    it("should handle add game to ranking request successfully", async () => {
      const requestData = {
        rankingId: 1,
        gameId: "game123",
      };

      const mockResult = {
        id: 10,
        rankingId: 1,
        gameId: "game123",
        rank: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(RankingService.addGameRanking).mockResolvedValue(mockResult);

      const result = await invokeHandler(RouteRanking.ADD_GAME_FROM_RANKING, requestData);

      expect(RankingService.addGameRanking).toHaveBeenCalledWith(requestData);
      expect(result).toEqual(mockResult);
    });

    it("should validate request data structure", async () => {
      const invalidData = { rankingId: 1 };

      await expect(invokeHandler(RouteRanking.ADD_GAME_FROM_RANKING, invalidData)).rejects.toThrow(
        ErrorMessage.INVALID_BODY,
      );
    });

    it("should validate data types", async () => {
      const invalidData = { rankingId: "invalid", gameId: "game123" };

      await expect(invokeHandler(RouteRanking.ADD_GAME_FROM_RANKING, invalidData)).rejects.toThrow(
        ErrorMessage.INVALID_BODY,
      );
    });
  });

  describe("REMOVE_GAME_FROM_RANKING Handler", () => {
    it("should handle remove game from ranking request successfully", async () => {
      const requestData = {
        rankingId: 1,
        gameId: "game123",
      };

      vi.mocked(RankingService.removeGameRanking).mockResolvedValue(undefined);

      const result = await invokeHandler(RouteRanking.REMOVE_GAME_FROM_RANKING, requestData);

      expect(RankingService.removeGameRanking).toHaveBeenCalledWith(requestData);
      expect(result).toBeUndefined();
    });

    it("should validate request data", async () => {
      const invalidData = { gameId: "game123" };

      await expect(invokeHandler(RouteRanking.REMOVE_GAME_FROM_RANKING, invalidData)).rejects.toThrow(
        ErrorMessage.INVALID_BODY,
      );
    });
  });

  describe("UPDATE_GAME_ORDER Handler", () => {
    it("should handle update game order request successfully", async () => {
      const requestData = {
        rankingId: 1,
        gameOrders: [
          { gameId: "game1", rank: 2 },
          { gameId: "game2", rank: 1 },
        ],
      };

      const mockResult = [
        { id: 1, rankingId: 1, gameId: "game1", rank: 2 },
        { id: 2, rankingId: 1, gameId: "game2", rank: 1 },
      ];

      vi.mocked(RankingService.updateGameOrder).mockResolvedValue(mockResult);

      const result = await invokeHandler(RouteRanking.UPDATE_GAME_ORDER, requestData);

      expect(RankingService.updateGameOrder).toHaveBeenCalledWith(requestData);
      expect(result).toEqual(mockResult);
    });

    it("should validate game orders array structure", async () => {
      const invalidData = {
        rankingId: 1,
        gameOrders: [{ gameId: "game1" }],
      };

      await expect(invokeHandler(RouteRanking.UPDATE_GAME_ORDER, invalidData)).rejects.toThrow(
        ErrorMessage.INVALID_BODY,
      );
    });

    it("should handle empty game orders array", async () => {
      const requestData = {
        rankingId: 1,
        gameOrders: [],
      };

      const mockResult: any[] = [];
      vi.mocked(RankingService.updateGameOrder).mockResolvedValue(mockResult);

      const result = await invokeHandler(RouteRanking.UPDATE_GAME_ORDER, requestData);

      expect(result).toEqual([]);
    });

    it("should validate ranking ID type", async () => {
      const invalidData = {
        rankingId: "invalid",
        gameOrders: [{ gameId: "game1", rank: 1 }],
      };

      await expect(invokeHandler(RouteRanking.UPDATE_GAME_ORDER, invalidData)).rejects.toThrow(
        ErrorMessage.INVALID_BODY,
      );
    });
  });

  describe("Error Handling", () => {
    it("should propagate validation errors", async () => {
      const invalidData = { invalid: "data" };

      await expect(invokeHandler(RouteRanking.CREATE, invalidData)).rejects.toThrow(ErrorMessage.INVALID_BODY);
    });

    it("should propagate service layer errors with proper context", async () => {
      const serviceError = new Error("Database constraint violation");
      vi.mocked(RankingService.createRanking).mockRejectedValue(serviceError);

      const validData = { name: "Test", description: "Test" };

      await expect(invokeHandler(RouteRanking.CREATE, validData)).rejects.toThrow("Database constraint violation");
    });

    it("should handle unexpected service responses", async () => {
      vi.mocked(RankingService.getRanking).mockResolvedValue(undefined as any);

      await expect(invokeHandler(RouteRanking.GET_RANKING, 1)).rejects.toThrow("Entity not found");
    });
  });

  describe("Handler Performance", () => {
    it("should handle concurrent requests", async () => {
      const mockRankings = [{ id: 1, name: "Test" }];
      vi.mocked(RankingService.getRankings).mockResolvedValue(mockRankings as any);

      const promises = Array.from({ length: 10 }, () => invokeHandler(RouteRanking.GET_RANKINGS));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(RankingService.getRankings).toHaveBeenCalledTimes(10);
      results.forEach((result) => {
        expect(result).toEqual(mockRankings);
      });
    });

    it("should handle large game order updates", async () => {
      const largeGameOrders = Array.from({ length: 100 }, (_, i) => ({
        gameId: `game${i}`,
        rank: i + 1,
      }));

      const requestData = {
        rankingId: 1,
        gameOrders: largeGameOrders,
      };

      vi.mocked(RankingService.updateGameOrder).mockResolvedValue([]);

      const result = await invokeHandler(RouteRanking.UPDATE_GAME_ORDER, requestData);

      expect(RankingService.updateGameOrder).toHaveBeenCalledWith(requestData);
      expect(result).toEqual([]);
    });
  });
});
