const config = {
  name: "your-app",
  version: "1.0.0",
  directories: {
    output: "dist/electron",
  },
  linux: {
    target: [
      {
        target: ["rpm"],
      },
    ],
  },
  files: ["!temp/**/*", "dist/main/**/*", "dist/preload/**/*", "dist/renderer/**/*"],
};

module.exports = config;
