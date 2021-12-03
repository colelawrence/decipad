var webpack = require('webpack');

module.exports = {
  stories: [],
  core: {
    builder: 'webpack5',
  },
  typescript: {
    reactDocgen: false,
  },
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
      },
    },
    'storybook-dark-mode',
  ],
  previewHead: (head) =>
    head.replace('<base target="_parent"', '<base target="_self"'),
  webpackFinal: async (config) => {
    config.module.rules = [
      {
        oneOf: [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          ...config.module.rules,
        ],
      },
    ];

    // Fallback for node APIs used in dependencies such as csv-parse.
    config.resolve.fallback = {
      stream: require.resolve('stream-browserify'),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );

    return config;
  },
};
