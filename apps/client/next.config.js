// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

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
  webpack({ module: { rules, ...module }, ...config }) {
    return {
      ...config,
      module: {
        ...module,
        rules: [
          ...rules,
          {
            test: /\.(gif|jpg|png)$/,
            use: [
              {
                loader: require.resolve('file-loader'),
                options: {
                  publicPath: '/_next/static/',
                  outputPath: 'static/',
                },
              },
            ],
          },
        ],
      },
    };
  },
};

module.exports = withNx(nextConfig);
