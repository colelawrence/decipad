const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = () =>
  new GenerateSW({
    inlineWorkboxRuntime: true,
    clientsClaim: true,
    skipWaiting: true,
    chunks: [
      'app-with-meta',
      'workspaces',
      'workspace',
      'notebooks',
      'workspace-topbar',
      'sidebar',
      'notebook-list',
      'create-workspace-modal',
      'edit-workspace-modal',
      'notebook-topbar',
      'notebook-editor-icon',
      'notebook-editor',
    ],
    dontCacheBustURLsMatching: /\/static\/js\/[^.]+\.[^.]+\.chunk\.(js|css)$/,
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 20_000_000,
  });
