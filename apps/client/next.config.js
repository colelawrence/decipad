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
                test: /\.(gif|jpg|png)$/,
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

module.exports = withNx(nextConfig);
