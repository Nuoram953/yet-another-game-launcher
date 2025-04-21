import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { plugins } from "./webpack.plugins";
import WebpackShellPluginNext from "webpack-shell-plugin-next";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/index.ts",
  // Put your normal webpack config below here
  module: {
    rules,
  },

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src/main"), // Adjust this to your source directory
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node",
          ),
          to: path.resolve(__dirname, ".webpack/main"),
        },
        {
          from: path.resolve(__dirname, "locale"),
          to: path.resolve(__dirname, ".webpack/main/locale"),
        },
      ],
    }),

    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          'echo "Post-build step executed!"',
          `chmod +x ${path.resolve(__dirname, ".webpack/main/native_modules/bin/yt-dlp")}`,
        ],
        blocking: false,
        parallel: true,
      },
    }),
  ],
};
