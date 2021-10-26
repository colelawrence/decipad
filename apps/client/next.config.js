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
          ...rules,
          {
            test: /\.(gif|jpg|png)$/,
            type: 'asset/resource',
          },
        ],
      },
    };
  },
};

module.exports = withNx(nextConfig);
