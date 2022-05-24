const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

function theme() {
  return {
    name: 'docusaurus-theme-live-codeblock',

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },

    configureWebpack() {
      return {
        resolve: {
          plugins: [new TsconfigPathsPlugin()],
          alias: {
            stream: 'stream-browserify',
            process: 'process/browser',
          },
        },
        module: {
          rules: [
            {
              resourceQuery: /raw/,
              type: 'asset/source',
            },
          ],
        },
        mergeStrategy: { 'module.rules': 'prepend' },
      };
    },
  };
}

module.exports = theme;
