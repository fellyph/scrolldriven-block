const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Handle both array and object configs
const config = Array.isArray(defaultConfig) ? defaultConfig[0] : defaultConfig;

module.exports = {
  ...config,
  entry: {
    index: path.resolve(process.cwd(), 'src', 'index.js'),
    'progress-block/index': path.resolve(process.cwd(), 'src/progress-block', 'index.js'),
  },
};
