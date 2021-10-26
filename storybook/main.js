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
};
