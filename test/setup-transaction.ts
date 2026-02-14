import { beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import {
  setupTestDatabase,
  cleanupTestDatabase,
  setupTestTransaction,
  rollbackTestTransaction,
  getTestPrismaClient,
  verifyTestDatabaseSchema,
} from "./utils/database";
import { seedTestData } from "./fixtures/seed";
import { setupMocks, resetMocks } from "./utils/mocks";

// Global test database setup (once per test suite)
beforeAll(async () => {
  // Setup mocks for external dependencies
  setupMocks();

  // Database is already set up by global setup - just get the client
  const prisma = getTestPrismaClient();

  // Verify schema integrity (quick check since migrations are done)
  const schemaValid = await verifyTestDatabaseSchema();
  if (!schemaValid) {
    throw new Error("Test database schema verification failed");
  }

  // Seed essential data (statuses, etc.)
  await seedTestData();
}, 10000); // Reduced timeout since no migrations

// Per-test isolation using transactions
beforeEach(async () => {
  // Reset mocks to clean state
  resetMocks();

  // Setup transaction-based test isolation
  await setupTestTransaction();
}, 10000); // 10 second timeout for transaction setup

afterEach(async () => {
  // Rollback transaction (undoes all test changes)
  await rollbackTestTransaction();
}, 5000);

// Global cleanup
afterAll(async () => {
  // Only disconnect the client - global teardown handles file cleanup
  const prisma = getTestPrismaClient();
  if (prisma) {
    await prisma.$disconnect();
  }
});
