import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,

    // Global setup runs expensive operations once (migrations, etc.)
    globalSetup: "./test/global-setup.ts",

    // Use only transaction-based setup for fast test isolation
    setupFiles: [
      "./test/setup-transaction.ts", // Transaction-based setup for test isolation
    ],

    // Test file patterns
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", "test/**/*.test.ts", "src/main/**/*.test.ts"],
    exclude: [
      "node_modules",
      "dist",
      "build",
      "src/renderer/**/*", // Exclude frontend tests
      "src/preload/**/*", // Exclude preload tests
    ],

    // Coverage configuration optimized for backend
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/main/**/*", "!src/main/**/*.d.ts", "!src/main/**/*.test.ts", "!src/main/**/*.spec.ts"],
      exclude: [
        "src/main/**/*.d.ts",
        "src/main/**/*.test.ts",
        "src/main/**/*.spec.ts",
        "src/main/index.ts", // Entry point
        "src/main/**/types.ts", // Type definitions
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        // Higher thresholds for critical modules
        "src/main/database/**/*": {
          branches: 85,
          functions: 90,
          lines: 85,
          statements: 85,
        },
      },
    },

    // Timeouts optimized for faster tests
    testTimeout: 15000, // Increased for database operations
    hookTimeout: 30000, // Increased for setup/teardown with database
    teardownTimeout: 10000, // Increased for cleanup

    // Reporters
    reporters: process.env.CI ? ["junit", "github-actions"] : ["verbose"],
    outputFile: {
      junit: "./test-results/junit.xml",
    },

    // Pool configuration optimized for database tests
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true, // Use single thread to avoid SQLite contention
        isolate: true, // Isolate test environments
        maxThreads: 1, // Single thread for SQLite
        minThreads: 1,
      },
    },

    // Environment variables for testing
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test.db",
      DEBUG_TESTS: process.env.DEBUG_TESTS || "false",
    },
  },

  resolve: {
    alias: {
      "@main": resolve(__dirname, "src/main"),
      "@common": resolve(__dirname, "src/common"),
      "@preload": resolve(__dirname, "src/preload"),
      "@render": resolve(__dirname, "src/renderer"),
      "@hook": resolve(__dirname, "src/renderer/hooks"),
      "@component": resolve(__dirname, "src/renderer/components"),
      "@test": resolve(__dirname, "test"),
    },
  },

  esbuild: {
    target: "node16",
  },
});
