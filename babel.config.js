module.exports = {
  presets: [
    require.resolve('@babel/preset-typescript'),
    require.resolve('@babel/preset-env'),
  ],
  plugins: [
    require.resolve('@babel/plugin-transform-runtime'),
    // required until using actual workspace packages instead of path definitions
    require.resolve('babel-plugin-tsconfig-paths'),
  ],
  babelrcRoots: ['libs/*', 'apps/*'],
};
