import { beforeEach, afterAll, beforeAll } from "vitest";
import { setupTestDatabase, cleanupTestDatabase, getTestPrismaClient } from "./utils/database";
import { seedTestData } from "./fixtures/seed";
import { setupMocks, resetMocks } from "./utils/mocks";

beforeAll(async () => {
  setupMocks();

  await setupTestDatabase();

  await seedTestData();
});

beforeEach(async () => {
  resetMocks();

  const prisma = getTestPrismaClient();

  await prisma.rankingTagMap.deleteMany();
  await prisma.rankingGame.deleteMany();
  await prisma.ranking.deleteMany();
});

afterAll(async () => {
  await cleanupTestDatabase();
});
