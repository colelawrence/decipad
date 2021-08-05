module.exports = {
  stories: [],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
      },
    },
    'storybook-dark-mode',
  ],
  typescript: {
    reactDocgen: false,
  },
  previewHead: (head) =>
    head.replace('<base target="_parent"', '<base target="_self"'),
};
