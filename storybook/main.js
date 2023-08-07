/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-var */
/* eslint-disable no-param-reassign */
var webpack = require('webpack');
const path = require('path');

module.exports = {
  stories: [],
  features: {
    storyStoreV7: true,
    previewMdx2: true,
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
    config.resolve.alias['@decipad/number'] = path.resolve(
      __dirname,
      '../libs/number/src/index.ts'
    );

    config.resolve.alias['@decipad/frontend-config'] = path.resolve(
      __dirname,
      '../libs/frontend-config/src/index.ts'
    );

    config.resolve.alias['@decipad/editor-types'] = path.resolve(
      __dirname,
      '../libs/editor-types/src/index.ts'
    );

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
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};
