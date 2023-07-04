const path = require('path');
const { EnvironmentPlugin, ProvidePlugin } = require('webpack');
const webpack = require('webpack');

const frontendDefaultConfigureWebpack = require('../webpack-config/webpackConfig');

const excludePlugins = ['GenerateSW'];

const shouldIncludePlugin = (plugin) => {
  const pluginName = plugin.constructor?.name;

  return !excludePlugins.includes(pluginName);
};

const configureWebpack = (_config) => {
  const config = frontendDefaultConfigureWebpack({
    configureSentry: false,
    configureServiceWorker: false,
  })(_config);
  config.entry = path.resolve(path.join(__dirname, 'src/index.ts'));
  config.output = {
    ...config.output,
    libraryTarget: 'commonjs',
    compareBeforeEmit: true,
    clean: false,
    filename: 'index.js',
    path:
      process.env.BUILD_PATH ??
      path.join(
        __dirname,
        '..',
        '..',
        'apps',
        'backend',
        'src',
        'http',
        'get-n-000notebookid'
      ),
  };

  config.target = 'node';
  config.node = false;
  config.resolve.fallback = {
    ...config.resolve.fallback,
    canvas: false,
    bufferutil: false, // needed by ws, not used
    'utf-8-validate': false,
    'google-gax': false,
    '@google-cloud/common': false,
  };

  config.module = {
    ...config.module,
    //   parser: {
    //     ...config.module?.parser,
    //     javascript: {
    //       ...config.module?.parser?.javascript,
    //       dynamicImportMode: 'eager',
    //     },
    //   },
    rules: [...config.module.rules, { test: /\.html$/, use: 'raw-loader' }],
  };

  config.resolve.alias = {
    ...config.resolve.alias,
    'react-datepicker/dist/react-datepicker.css': false,
    '@excalidraw/excalidraw': false,
    '@decipad_org/safejs': false,
  };

  config.plugins = config.plugins.filter(shouldIncludePlugin);

  // config.mode = 'development';
  // config.optimization = {};

  // console.log(config);
  // config.stats = 'none';

  config.cache = {
    ...config.cache,
    name: 'server-side-rendering',
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
  };

  return config;
};

module.exports = {
  webpack: {
    configure: configureWebpack,
  },
  eslint: { enable: false },
  typescript: { enableTypeChecking: false },
  devServer: {
    port: 2999,
    devMiddleware: {
      writeToDisk: true,
    },
    open: false,
  },
};
