var path = require('path');

var BASE_URL = process.env.LHCI_SERVER_BASE_URL;
var url = function (url) {
  return BASE_URL + url;
};

var urlsToScan = ['/', '/playground'];

module.exports = {
  ci: {
    collect: {
      url: urlsToScan.map(url),
      startServerCommand: 'echo ready && cat -n', // lolserver
      puppeteerScript: path.join(
        '.',
        'scripts',
        'puppeteer-populate-playground.js'
      ),
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
    },
  },
};
