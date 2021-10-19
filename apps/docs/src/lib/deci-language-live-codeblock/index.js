const path = require('path');
const { validateThemeConfig } = require('./validateThemeConfig');

function theme() {
  return {
    name: 'docusaurus-theme-live-codeblock',

    getThemePath() {
      return path.resolve(__dirname, './theme');
    },

    configureWebpack() {
      return {
        resolve: {
          alias: {
            stream: 'stream-browserify',
            process: 'browserify-process',
            '@decipad/utils': path.resolve(
              __dirname,
              '../../../../../libs/utils/src'
            ),
            '@decipad/language': path.resolve(
              __dirname,
              '../../../../../libs/language/src'
            ),
            '@decipad/ui': path.resolve(
              __dirname,
              '../../../../../libs/ui/src'
            ),
          },
        },
      };
    },
  };
}

module.exports = theme;

theme.validateThemeConfig = validateThemeConfig;
