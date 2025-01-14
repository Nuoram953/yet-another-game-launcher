import type { Configuration } from "webpack";
import path from "path";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      logger: "webpack-infrastructure",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            "node_modules/.prisma/client/libquery_engine-*.node",
          ),
          to: path.resolve(__dirname, ".webpack/renderer"),
        },
        {
          from: path.resolve(__dirname, "locale"),
          to: path.resolve(__dirname, ".webpack/renderer/locales"),
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer"), // Adjust this to your source directory
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
