module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-react'),
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
  ],
  plugins: [
    [
      require.resolve('@emotion/babel-plugin'),
      {
        sourceMap: true,
        // Always provides friendly classnames (according to `labelFormat`) for debugging purposes.
        autoLabel: 'always',
        labelFormat: '-[filename]--[local]',
        cssPropOptimization: true,
      },
    ],
  ],
};
