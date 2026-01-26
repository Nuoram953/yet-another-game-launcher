import { vi } from "vitest";
import { getTestPrismaClient } from "./database";

export function setupDatabaseMocking() {
  const testPrisma = getTestPrismaClient();

  vi.mock("../index", () => ({
    prisma: testPrisma,
  }));

  vi.mock("../dal/ranking", async () => {
    const actual = await vi.importActual("../dal/ranking");
    return {
      ...actual,
    };
  });

  vi.mock("../dal/rankingGame", async () => {
    const actual = await vi.importActual("../dal/rankingGame");
    return {
      ...actual,
    };
  });

  vi.mock("../dal/game", async () => {
    const actual = await vi.importActual("../dal/game");
    return {
      ...actual,
    };
  });
}
