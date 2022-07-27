/* eslint-disable no-param-reassign */
const path = require('path');
const { ProvidePlugin } = require('webpack');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  webpack: {
    configure: (config) => {
      // Remove guard against importing modules outside of \`src\`.
      // Needed for workspace projects.
      config.resolve.plugins = config.resolve.plugins.filter(
        (plugin) => !(plugin instanceof ModuleScopePlugin)
      );
      // Add support for importing workspace projects.
      config.resolve.plugins.push(
        new TsConfigPathsPlugin({
          configFile: path.resolve(__dirname, 'tsconfig.json'),
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          mainFields: ['module', 'main'],
        })
      );

      // Configure babel-loader to handle workspace projects as well.
      const babelRule = config.module.rules[1].oneOf.find((r) => {
        if (r.loader && r.loader.includes('babel')) {
          return r;
        }
      });
      if (!babelRule) throw new Error('Cannot find CRA babel config to modify');
      babelRule.exclude = /node_modules/;
      if (babelRule.include) {
        delete babelRule.include;
      } else {
        throw new Error('CRA babel config no longer seems to use include');
      }
      babelRule.options.configFile = true;
      babelRule.options.babelrc = true;
      babelRule.options.rootMode = 'upward';
      babelRule.options.presets = babelRule.options.presets.filter(
        // We have our own React Babel config
        (preset) => !(preset[0] ?? preset).includes('babel-preset-react-app')
      );

      // Polyfill node core modules
      config.plugins.push(
        new ProvidePlugin({
          process: 'process',
          Buffer: ['buffer', 'Buffer'],
        })
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
      };

      // ignore source map warnings
      // https://github.com/facebook/create-react-app/discussions/11767
      config.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];

      // workaround while react-dnd@^15 is still in our transitive dependency tree
      // https://github.com/react-dnd/react-dnd/issues/3433#issuecomment-1102144912
      config.resolve.alias = {
        'react/jsx-runtime.js': 'react/jsx-runtime',
        'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
      };

      return config;
    },
  },
  devServer: {
    open: [
      'http://localhost:3000/api/auth/8VZFow-238xbFlfKJewgmPLdwIqEPhQvpb7voaWmeI',
    ],
  },
};
