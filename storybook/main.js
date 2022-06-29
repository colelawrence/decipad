/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-var */
/* eslint-disable no-param-reassign */
var webpack = require('webpack');

module.exports = {
  stories: [],
  core: {
    builder: 'webpack5',
  },
  features: {
    storyStoreV7: true,
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
    '@storybook/addon-a11y',
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
          ...(config.module?.rules ?? []),
        ],
      },
    ];

    // Fallback for node APIs used in dependencies such as csv-parse.
    config.resolve.fallback = {
      ...config.resolve?.fallback,
      stream: require.resolve('stream-browserify'),
    };
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    // Avoid hitting payload size limit if served via Lambda
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        chunks: 'all',
        maxSize: 1024 * 1024,
      },
    };

    return config;
  },
};
