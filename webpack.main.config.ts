import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import path from 'path'

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    //alias: {
    //  '@': path.resolve(__dirname, './src/renderer'), // Adjust this to your source directory
    //},
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
