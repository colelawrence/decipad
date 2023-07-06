const defaultIndexName = 'docs.dev.decipad.com';

const configs = {
  'docs.dev.decipad.com': {
    appId: 'TV8XZ0RFSZ',
    // Public API key: it is safe to commit it
    apiKey: 'db6e12842f8c0c9dded465872fe17d54',
    indexName: 'docs.dev.decipad.com',
    contextualSearch: false,
    exclusionPatterns: [
      '**/releases',
      '**/releases/**',
      '**/releases**',
      '**/releases**/**',
      '**/blog',
      '**/blog/**',
      '**/blog**',
      '**/blog**/**',
    ],
  },
  'docs.alpha.decipad.com': {
    appId: 'TV8XZ0RFSZ',
    // Public API key: it is safe to commit it
    apiKey: 'db6e12842f8c0c9dded465872fe17d54',
    indexName: 'docs.app.decipad.com',
    contextualSearch: false,
    exclusionPatterns: [
      '**/releases',
      '**/releases/**',
      '**/releases**',
      '**/releases**/**',
      '**/blog',
      '**/blog/**',
      '**/blog**',
      '**/blog**/**',
    ],
    insights: true,
  },
};

module.exports = function algoliaConfig() {
  const algoliaIndexName =
    (typeof window !== 'undefined' &&
      `docs.${window?.location?.hostname || 'dev.decipad.com'}`) ||
    defaultIndexName;
  return configs[algoliaIndexName] || configs[defaultIndexName];
};
