const config = {
  directories: {
    output: "dist/electron",
  },
  publish: null,
  npmRebuild: false,
  files: ["dist/main/**/*", "dist/preload/**/*", "dist/render/**/*"],
};

module.exports = config;
