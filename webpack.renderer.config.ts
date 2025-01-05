import type { Configuration } from 'webpack';
import path from 'path'

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'), // Adjust this to your source directory
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
