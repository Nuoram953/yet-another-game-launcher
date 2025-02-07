import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import path from 'path'

export const commonConfig: Configuration = {
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src/common'), // Adjust this to your source directory
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
