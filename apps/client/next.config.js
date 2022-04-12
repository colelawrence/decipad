// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
  future: {
    webpack5: true,
  },
  webpack({ module: { rules, ...module }, ...config }) {
    return {
      ...config,
      module: {
        ...module,
        rules: [
          {
            oneOf: [
              {
                resourceQuery: /raw/,
                type: 'asset/source',
              },
              {
                test: /\.(gif|jpg|png|svg|woff|woff2|otf)$/,
                type: 'asset/resource',
                generator: {
                  filename: 'static/chunks/[hash]-[name][ext]',
                },
              },
              ...rules,
            ],
          },
        ],
      },
    };
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  org: 'deci',

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(
  withNx(nextConfig),
  sentryWebpackPluginOptions
);
