const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = () => {
  const options = {
    inlineWorkboxRuntime: true,
    clientsClaim: true,
    skipWaiting: true,
    chunks: [
      'app-with-meta',
      'workspaces',
      'workspace',
      'workspace-topbar',
      'sidebar',
      'notebook-editor-icon',
      'notebook-editor',
      'onboarding',
    ],
    dontCacheBustURLsMatching: /\/static\/js\/[^.]+\.[^.]+\.chunk\.(js|css)$/,
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 20_000_000,
    runtimeCaching: [
      {
        urlPattern: ({ request }) =>
          ['script', 'font', 'image', 'manifest', 'style', 'worker'].includes(
            request.destination
          ),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'immutable-assets-cache',
          expiration: {
            maxAgeSeconds: 60 * 70 * 24 * 30, // 1 month
          },
          matchOptions: {
            ignoreVary: true,
          },
        },
      },
      {
        urlPattern: ({ url }) =>
          url.pathname.startsWith('/api') ||
          url.pathname.startsWith('/graphql'),
        handler: 'NetworkOnly',
      },
    ],
    importScriptsViaChunks: [
      'app-with-meta',
      'workspaces',
      'workspace',
      'workspace-topbar',
      'sidebar',
      'notebook-editor-icon',
      'notebook-editor',
      'onboarding',
    ],
    swDest: 'service-worker.js',
  };

  return new GenerateSW(options);
};
