module.exports = {
  presets: [
    '@nrwl/web/babel',
    [
      require.resolve('@babel/preset-react'),
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
  ],
};
