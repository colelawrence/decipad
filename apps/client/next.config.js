// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = withNx(config);
