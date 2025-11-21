const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// If defaultConfig is an array, modify the first config
if (Array.isArray(defaultConfig)) {
  module.exports = [
    {
      ...defaultConfig[0],
      entry: {
        index: './src/index.js',
        'progress-block/index': './src/progress-block/index.js',
      },
    },
    ...defaultConfig.slice(1),
  ];
} else {
  module.exports = {
    ...defaultConfig,
    entry: {
      index: './src/index.js',
      'progress-block/index': './src/progress-block/index.js',
    },
  };
}
