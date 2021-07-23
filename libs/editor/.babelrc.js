module.exports = {
  presets: [
    '@nrwl/web/babel',
    [
      require.resolve('@babel/preset-react'),
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
  ],
  plugins: [
    [
      require.resolve('@babel/plugin-proposal-private-methods'),
      { loose: true },
    ],
    [
      require.resolve('@babel/plugin-proposal-private-property-in-object'),
      { loose: true },
    ],
  ],
};
