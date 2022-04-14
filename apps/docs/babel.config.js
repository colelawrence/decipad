module.exports = {
  presets: [
    '@nrwl/web/babel',
    [
      require.resolve('@babel/preset-react'),
      { runtime: 'automatic', importSource: '@emotion/react' },
    ],
    require.resolve('@docusaurus/core/lib/babel/preset'),
  ],
  plugins: [require.resolve('@emotion/babel-plugin')],
};
