module.exports = {
  presets: ['@nrwl/web/babel', require.resolve('@babel/preset-react')],
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
