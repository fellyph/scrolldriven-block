const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// If defaultConfig is an array, extend each config
if (Array.isArray(defaultConfig)) {
  module.exports = defaultConfig.map((config) => ({
    ...config,
    entry: {
      index: './src/index.js',
      ...(typeof config.entry === 'object' ? config.entry : {}),
    },
  }));
} else {
  module.exports = {
    ...defaultConfig,
    entry: {
      index: './src/index.js',
      ...(typeof defaultConfig.entry === 'object' ? defaultConfig.entry : {}),
    },
  };
}
