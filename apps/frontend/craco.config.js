const open = require('open');
const configureWebpack = require('./configureWebpack');

const shouldOpen = !process.env.DECI_E2E;
let devServer;
if (shouldOpen) {
  devServer = {
    open: {
      target: [
        'http://localhost:3000/api/auth/8VZFow-238xbFlfKJewgmPLdwIqEPhQvpb7voaWmeI',
      ],
      app: {
        name: open.apps.chrome,
      },
    },
  };
} else {
  devServer = {
    open: false,
  };
}

devServer.proxy = {
  '/api': {
    target: 'http://localhost:3333',
    changeOrigin: true,
  },
  '/graphql': {
    target: 'http://localhost:3333',
    changeOrigin: true,
  },
};

module.exports = {
  webpack: {
    configure: configureWebpack,
  },
  eslint: { enable: false },
  typescript: { enableTypeChecking: false },
  devServer,
};
