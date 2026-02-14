import { join } from "path";
import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";

// Use consistent test database
const TEST_DATABASE_URL = "file:./test.db";

/**
 * Global setup runs once before all tests.
 * This is where we run the expensive database migrations.
 */
export async function setup() {
  console.log("Starting global test setup...");

  // Clean up any existing test databases
  const testDbPath = join(process.cwd(), "test.db");
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
    console.log("Cleaned up existing test database");
  }

  const schemaPath = join(process.cwd(), "prisma/schema.prisma");

  try {
    // Set environment for test database
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = TEST_DATABASE_URL;

    console.log("Running database migrations (this happens only once)...");

    // Run migrations with timeout
    execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
      stdio: process.env.DEBUG_TESTS ? "inherit" : "pipe",
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      timeout: 45000, // 45 second timeout for migrations
    });

    // Generate client for test database with timeout
    execSync(`npx prisma generate --schema=${schemaPath}`, {
      stdio: process.env.DEBUG_TESTS ? "inherit" : "pipe",
      timeout: 30000, // 30 second timeout
    });

    // Restore original URL
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    } else {
      delete process.env.DATABASE_URL;
    }

    console.log("Global test setup completed successfully!");
  } catch (error) {
    console.error("Error in global test setup:", error);
    throw error;
  }
}

/**
 * Global teardown runs once after all tests.
 */
export async function teardown() {
  console.log("Running global test teardown...");

  // Clean up test database
  const testDbPath = join(process.cwd(), "test.db");
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
    console.log("Cleaned up test database");
  }

  console.log("Global test teardown completed!");
}
