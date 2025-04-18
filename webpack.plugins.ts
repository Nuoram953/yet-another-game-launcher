import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

export const plugins = [
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
        to: path.resolve(__dirname, ".webpack/locale"),
      },
    ],
  }),
];
