import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/main/**/*"],
      exclude: ["src/main/**/*.d.ts", "src/main/**/*.test.ts", "src/main/**/*.spec.ts"],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
  },
  resolve: {
    alias: {
      "@main": resolve(__dirname, "src/main"),
      "@common": resolve(__dirname, "src/common"),
      "@preload": resolve(__dirname, "src/preload"),
      "@render": resolve(__dirname, "src/renderer"),
      "@hook": resolve(__dirname, "src/renderer/hooks"),
      "@component": resolve(__dirname, "src/renderer/components"),
    },
  },
  esbuild: {
    target: "node16",
  },
});
