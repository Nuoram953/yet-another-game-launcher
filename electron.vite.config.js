/**
 * electron.vite.config.js
 * Configuration for electron-vite
 */
const { defineConfig } = require("electron-vite");
const { resolve } = require("path");

module.exports = defineConfig({
  main: {
    // Main process build configuration
    build: {
      outDir: "dist/main",
    },
    resolve: {
      alias: {
        "@main": resolve(__dirname, "src/main"),
        "@common": resolve(__dirname, "src/common"),
      },
    },
  },
  preload: {
    // Preload scripts build configuration
    build: {
      outDir: "dist/preload",
    },
    resolve: {
      alias: {
        "@common": resolve(__dirname, "src/common"),
      },
    },
  },
  renderer: {
    // Renderer process build configuration
    build: {
      outDir: "dist/renderer",
    },
    publicDir: resolve(__dirname, "public"),
    resolve: {
      alias: {
        "@render": resolve(__dirname, "src/renderer"),
        "@common": resolve(__dirname, "src/common"),
      },
    },
    plugins: [],
    server: {
      port: 5173,
    },
  },
  build: {
    // Enable more verbose logging during build
    minify: true,
    sourcemap: true,
    reportCompressedSize: true,
  },
  logLevel: "info", // Use 'info' for more verbose logs
  plugins: [],
});
