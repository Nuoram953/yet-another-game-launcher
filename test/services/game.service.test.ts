import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { setupMocks, resetMocks, mockQueries, mockMediaService } from "../utils/enhanced-mocks";
import { LaunchType } from "../../src/common/types";
import { ErrorMessage } from "../../src/common/error";

// Mock the LaunchGameCommand - create the mock function inside the factory
vi.mock("../../src/main/game/commands/launch", () => ({
  LaunchGameCommand: vi.fn(),
}));

// Mock other command classes
vi.mock("../../src/main/game/commands/refresh", () => ({
  RefreshGameCommand: vi.fn(),
}));
vi.mock("../../src/main/game/commands/install", () => ({
  InstallGameCommand: vi.fn(),
}));
vi.mock("../../src/main/game/commands/uninstall", () => ({
  UninstallGameCommand: vi.fn(),
}));
vi.mock("../../src/main/game/commands/kill", () => ({
  KillGameCommand: vi.fn(),
}));

import * as GameService from "../../src/main/game/game.service";
import { LaunchGameCommand } from "../../src/main/game/commands/launch";
import { RefreshGameCommand } from "../../src/main/game/commands/refresh";
import { InstallGameCommand } from "../../src/main/game/commands/install";
import { UninstallGameCommand } from "../../src/main/game/commands/uninstall";
import { KillGameCommand } from "../../src/main/game/commands/kill";

// Get the mock functions after import
const mockLaunchGameCommand = LaunchGameCommand as Mock;
const mockRefreshGameCommand = RefreshGameCommand as Mock;
const mockInstallGameCommand = InstallGameCommand as Mock;
const mockUninstallGameCommand = UninstallGameCommand as Mock;
const mockKillGameCommand = KillGameCommand as Mock;

describe("Service - Game Service", () => {
  beforeEach(() => {
    setupMocks();
    resetMocks();
    vi.clearAllMocks();
  });

  describe("launch", () => {
    const mockGame = {
      id: "test-game-id",
      name: "Test Game",
      gameStatusId: 1,
      storefrontId: 1,
      location: "/test/game/path",
      // Add other required game properties
    };

    beforeEach(() => {
      mockQueries.Game.getGameById.mockResolvedValue(mockGame);
    });

    it("should launch a game with STOREFRONT launch type", async () => {
      const gameId = "test-game-id";
      const launchId = 1;
      const launchType = LaunchType.STOREFRONT;

      await GameService.launch(gameId, launchId, launchType);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockLaunchGameCommand).toHaveBeenCalledWith(mockGame, launchId, launchType);
    });

    it("should launch a game with APP launch type", async () => {
      const gameId = "test-game-id";
      const launchId = 2;
      const launchType = LaunchType.APP;

      await GameService.launch(gameId, launchId, launchType);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockLaunchGameCommand).toHaveBeenCalledWith(mockGame, launchId, launchType);
    });

    it("should launch a game with EMULATOR launch type", async () => {
      const gameId = "test-game-id";
      const launchId = 3;
      const launchType = LaunchType.EMULATOR;

      await GameService.launch(gameId, launchId, launchType);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockLaunchGameCommand).toHaveBeenCalledWith(mockGame, launchId, launchType);
    });

    it("should throw error when game is not found", async () => {
      mockQueries.Game.getGameById.mockResolvedValue(null);

      await expect(GameService.launch("non-existent-game", 1, LaunchType.STOREFRONT)).rejects.toThrow(
        ErrorMessage.NOT_FOUND,
      );

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("non-existent-game");
      expect(mockLaunchGameCommand).not.toHaveBeenCalled();
    });

    it("should handle launch with zero launchId", async () => {
      const gameId = "test-game-id";
      const launchId = 0;
      const launchType = LaunchType.STOREFRONT;

      await GameService.launch(gameId, launchId, launchType);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockLaunchGameCommand).toHaveBeenCalledWith(mockGame, launchId, launchType);
    });

    it("should handle launch with negative launchId", async () => {
      const gameId = "test-game-id";
      const launchId = -1;
      const launchType = LaunchType.APP;

      await GameService.launch(gameId, launchId, launchType);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockLaunchGameCommand).toHaveBeenCalledWith(mockGame, launchId, launchType);
    });

    it("should handle database query errors", async () => {
      const dbError = new Error("Database connection failed");
      mockQueries.Game.getGameById.mockRejectedValue(dbError);

      await expect(GameService.launch("test-game-id", 1, LaunchType.STOREFRONT)).rejects.toThrow(
        "Database connection failed",
      );

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
      expect(mockLaunchGameCommand).not.toHaveBeenCalled();
    });

    it("should pass the exact game object returned from database", async () => {
      const specificGame = {
        id: "specific-game",
        name: "Specific Test Game",
        gameStatusId: 2,
        storefrontId: 3,
        location: "/specific/path",
        isInstalled: true,
        isFavorite: false,
      };

      mockQueries.Game.getGameById.mockResolvedValue(specificGame);

      await GameService.launch("specific-game", 5, LaunchType.EMULATOR);

      expect(mockLaunchGameCommand).toHaveBeenCalledWith(specificGame, 5, LaunchType.EMULATOR);
    });

    it("should handle all valid LaunchType enum values", async () => {
      // Test each LaunchType enum value
      const launchTypes = [LaunchType.STOREFRONT, LaunchType.APP, LaunchType.EMULATOR];

      for (let i = 0; i < launchTypes.length; i++) {
        const launchType = launchTypes[i];
        await GameService.launch("test-game-id", i + 1, launchType);

        expect(mockLaunchGameCommand).toHaveBeenNthCalledWith(i + 1, mockGame, i + 1, launchType);
      }

      expect(mockLaunchGameCommand).toHaveBeenCalledTimes(3);
    });

    it("should handle launch command initialization errors gracefully", async () => {
      const launchError = new Error("Launch command failed to initialize");
      mockLaunchGameCommand.mockImplementation(() => {
        throw launchError;
      });

      await expect(GameService.launch("test-game-id", 1, LaunchType.STOREFRONT)).rejects.toThrow(
        "Launch command failed to initialize",
      );

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
      expect(mockLaunchGameCommand).toHaveBeenCalledWith(mockGame, 1, LaunchType.STOREFRONT);

      // Reset mock after test
      mockLaunchGameCommand.mockReset();
    });

    it("should work with games that have null/undefined optional properties", async () => {
      // Reset the mock to default behavior
      mockLaunchGameCommand.mockReset().mockImplementation(() => {});

      const minimalGame = {
        id: "minimal-game",
        name: "Minimal Game",
        gameStatusId: 1,
        storefrontId: null,
        location: null,
        isInstalled: false,
      };

      mockQueries.Game.getGameById.mockResolvedValue(minimalGame);

      await GameService.launch("minimal-game", 1, LaunchType.APP);

      expect(mockLaunchGameCommand).toHaveBeenCalledWith(minimalGame, 1, LaunchType.APP);
    });
  });

  describe("setStatus", () => {
    const mockGame = {
      id: "test-game-id",
      name: "Test Game",
      gameStatusId: 1,
    };

    const mockStatus = {
      id: 2,
      name: "Installed",
    };

    beforeEach(() => {
      mockQueries.Game.getGameById.mockResolvedValue(mockGame);
      mockQueries.GameStatus.findById.mockResolvedValue(mockStatus);
      mockQueries.Game.update.mockResolvedValue(undefined);
    });

    it("should update game status successfully", async () => {
      await GameService.setStatus("test-game-id", 2);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
      expect(mockQueries.GameStatus.findById).toHaveBeenCalledWith(2);
      expect(mockQueries.Game.update).toHaveBeenCalledWith("test-game-id", { gameStatusId: 2 });
    });

    it("should throw error when game is not found", async () => {
      mockQueries.Game.getGameById.mockResolvedValue(null);

      await expect(GameService.setStatus("non-existent-game", 2)).rejects.toThrow(ErrorMessage.NOT_FOUND);

      expect(mockQueries.GameStatus.findById).not.toHaveBeenCalled();
      expect(mockQueries.Game.update).not.toHaveBeenCalled();
    });

    it("should throw error when status is not found", async () => {
      mockQueries.GameStatus.findById.mockResolvedValue(null);

      await expect(GameService.setStatus("test-game-id", 999)).rejects.toThrow(ErrorMessage.NOT_FOUND);

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
      expect(mockQueries.GameStatus.findById).toHaveBeenCalledWith(999);
      expect(mockQueries.Game.update).not.toHaveBeenCalled();
    });

    it("should handle database errors during status lookup", async () => {
      const dbError = new Error("Status lookup failed");
      mockQueries.GameStatus.findById.mockRejectedValue(dbError);

      await expect(GameService.setStatus("test-game-id", 2)).rejects.toThrow("Status lookup failed");

      expect(mockQueries.Game.update).not.toHaveBeenCalled();
    });

    it("should handle database errors during update", async () => {
      const updateError = new Error("Update failed");
      mockQueries.Game.update.mockRejectedValue(updateError);

      await expect(GameService.setStatus("test-game-id", 2)).rejects.toThrow("Update failed");

      expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
      expect(mockQueries.GameStatus.findById).toHaveBeenCalledWith(2);
      expect(mockQueries.Game.update).toHaveBeenCalledWith("test-game-id", { gameStatusId: 2 });
    });

    it("should handle zero status ID", async () => {
      const zeroStatus = { id: 0, name: "Unknown" };
      mockQueries.GameStatus.findById.mockResolvedValue(zeroStatus);

      await GameService.setStatus("test-game-id", 0);

      expect(mockQueries.GameStatus.findById).toHaveBeenCalledWith(0);
      expect(mockQueries.Game.update).toHaveBeenCalledWith("test-game-id", { gameStatusId: 0 });
    });

    it("should handle negative status ID", async () => {
      mockQueries.GameStatus.findById.mockResolvedValue(null);

      await expect(GameService.setStatus("test-game-id", -1)).rejects.toThrow(ErrorMessage.NOT_FOUND);

      expect(mockQueries.GameStatus.findById).toHaveBeenCalledWith(-1);
    });
  });

  describe("other service functions", () => {
    // Mock command implementations
    const mockRefreshCommandInstance = { runAll: vi.fn() };
    const mockInstallCommandInstance = { install: vi.fn() };
    const mockUninstallCommandInstance = { uninstall: vi.fn() };
    const mockKillCommandInstance = { kill: vi.fn() };

    beforeEach(() => {
      // Set up command constructors to return mock instances
      mockRefreshGameCommand.mockImplementation(() => mockRefreshCommandInstance);
      mockInstallGameCommand.mockImplementation(() => mockInstallCommandInstance);
      mockUninstallGameCommand.mockImplementation(() => mockUninstallCommandInstance);
      mockKillGameCommand.mockImplementation(() => mockKillCommandInstance);
    });

    const mockGame = {
      id: "test-game-id",
      name: "Test Game",
      gameStatusId: 1,
    };

    beforeEach(() => {
      mockQueries.Game.getGameById.mockResolvedValue(mockGame);
    });

    describe("refresh", () => {
      it("should refresh game successfully", async () => {
        await GameService.refresh("test-game-id");

        expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
        expect(mockRefreshCommandInstance.runAll).toHaveBeenCalled();
      });

      it("should throw error when game not found", async () => {
        mockQueries.Game.getGameById.mockResolvedValue(null);

        await expect(GameService.refresh("non-existent")).rejects.toThrow(ErrorMessage.NOT_FOUND);
      });
    });

    describe("install", () => {
      it("should install game successfully", async () => {
        await GameService.install("test-game-id");

        expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
        expect(mockInstallCommandInstance.install).toHaveBeenCalled();
      });

      it("should throw error when game not found", async () => {
        mockQueries.Game.getGameById.mockResolvedValue(null);

        await expect(GameService.install("non-existent")).rejects.toThrow(ErrorMessage.NOT_FOUND);
      });
    });

    describe("uninstall", () => {
      it("should uninstall game successfully", async () => {
        await GameService.uninstall("test-game-id");

        expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
        expect(mockUninstallCommandInstance.uninstall).toHaveBeenCalled();
      });

      it("should throw error when game not found", async () => {
        mockQueries.Game.getGameById.mockResolvedValue(null);

        await expect(GameService.uninstall("non-existent")).rejects.toThrow(ErrorMessage.NOT_FOUND);
      });
    });

    describe("kill", () => {
      it("should kill game successfully", async () => {
        await GameService.kill("test-game-id", 1, LaunchType.STOREFRONT);

        expect(mockQueries.Game.getGameById).toHaveBeenCalledWith("test-game-id");
        expect(mockKillCommandInstance.kill).toHaveBeenCalled();
      });

      it("should throw error when game not found", async () => {
        mockQueries.Game.getGameById.mockResolvedValue(null);

        await expect(GameService.kill("non-existent", 1, LaunchType.STOREFRONT)).rejects.toThrow(
          ErrorMessage.NOT_FOUND,
        );
      });
    });
  });
});
