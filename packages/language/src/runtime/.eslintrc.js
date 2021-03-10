module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'standard-with-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    node: true,
    jest: true,
    browser: true
  },
  rules: {
    'promise/always-return': 0,

    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/prefer-optional-chain': 0,

    '@typescript-eslint/no-unused-vars': [
      1,
      { vars: 'all', args: 'all', varsIgnorePattern: '^jsx$' }
    ],

    '@typescript-eslint/explicit-module-boundary-types': 0,

    '@typescript-eslint/explicit-function-return-type': 0,

    // conflicts with the custom render function
    '@typescript-eslint/no-unsafe-assignment': 0,

    // conflicts with the custom render function
    '@typescript-eslint/no-unsafe-call': 0,

    // react-testing-library can test without expect
    'jest/expect-expect': 0,

    '@typescript-eslint/no-unsafe-member-access': 0,

    // Functions that return void OR something else, need a bare return to make TS happy.
    'no-useless-return': 0,

    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/no-dynamic-delete': 0,
    '@typescript-eslint/no-unsafe-return': 0
  },
  ignorePatterns: ['**/*.js']
}
