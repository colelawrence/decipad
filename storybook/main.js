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
    return config;
  },
};
