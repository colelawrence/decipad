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
      'notebooks',
      'workspace-topbar',
      'sidebar',
      'notebook-list',
      'create-workspace-modal',
      'edit-workspace-modal',
      'notebook-topbar',
      'notebook-editor-icon',
      'notebook-editor',
      'static/media/ABCDiatype-BoldItalic.woff',
      'static/media/ABCDiatype-Medium.woff',
      'static/media/ABCDiatype-Bold.woff',
      'static/media/ABCDiatype-RegularItalic.woff',
      'static/media/ABCDiatype-Regular.woff',
      'static/media/ABCDiatypeMono-Regular.woff',
      'static/media/ABCDiatype-BoldItalic.woff2',
      'static/media/ABCDiatype-Medium.woff2',
      'static/media/ABCDiatype-Bold.woff2',
      'static/media/ABCDiatype-RegularItalic.woff2',
      'static/media/ABCDiatype-Regular.woff2',
      'static/media/ABCDiatypeMono-Regular.woff2',
    ],
    dontCacheBustURLsMatching: /\/static\/js\/[^.]+\.[^.]+\.chunk\.(js|css)$/,
    cleanupOutdatedCaches: true,
    maximumFileSizeToCacheInBytes: 20_000_000,
  };
  // eslint-disable-next-line no-console
  console.log('SW options', options);
  return new GenerateSW(options);
};
