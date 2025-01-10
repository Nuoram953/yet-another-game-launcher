import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { plugins } from "./webpack.plugins";

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
  plugins:[
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(
          __dirname,
          "node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node",
        ),
        to: path.resolve(__dirname, ".webpack/main"),
      },
    ],
  }),
  ]
};
