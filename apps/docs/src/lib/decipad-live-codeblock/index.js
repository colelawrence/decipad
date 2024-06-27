const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

export default function theme() {
  return {
    name: 'decipad-live-codeblock',

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, './theme');
    },

    configureWebpack() {
      return {
        resolve: {
          plugins: [new TsconfigPathsPlugin()],
          alias: {
            stream: 'stream-browserify',
            process: 'process/browser',
            '@decipad/remote-computer': '@decipad/computer',
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
      };
    },
  };
}
