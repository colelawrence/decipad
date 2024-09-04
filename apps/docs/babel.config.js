module.exports = {
  presets: [
    require.resolve('@docusaurus/core/lib/babel/preset'),
    [
      require.resolve('@babel/preset-react'),
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
  ],
  sourceType: 'unambiguous',
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
