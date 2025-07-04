const config = {
  name: "yagl",
  version: "1.0.0",
  directories: {
    output: "dist/electron",
  },
  linux: {
    target: [
      {
        target: ["rpm", "AppImage"],
      },
    ],
  },
  files: ["!temp/**/*", "dist/main/**/*", "dist/preload/**/*", "dist/renderer/**/*"],
};

module.exports = config;
