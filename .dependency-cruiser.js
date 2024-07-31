// TODO: fix problematic dependencies in these libraries:
const problematic = [
  'language',
  'language-types',
  'parse',
  'computer',
  'editor-components',
  'ui',
  'frontend',
];

module.exports = {
  // TODO: Urgently uncomment this as we have 264 dependencies cruised all over the project
  forbidden: [
    {
      name: 'no-circular',
      comment: 'This dependency is part of a circular relationship',
      severity: 'error',
      from: {
        pathNot: problematic,
      },
      to: {
        pathNot: problematic,
        circular: true,
      },
    },
    {
      name: 'warn-circular-problematic',
      comment: 'This dependency is part of a circular relationship',
      severity: process.env.CI ? 'ignore' : 'warn',
      from: {
        path: problematic,
      },
      to: {
        path: problematic,
        circular: true,
      },
    },
  ],
  options: {
    exclude: {
      path: 'node_modules',
    },
    tsConfig: {},
  },
};
