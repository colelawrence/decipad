module.exports = {
  extends: ['../../libs/eslint-config-decipad/react'],
  ignorePatterns: [
    '!**/*',
    '.eslintrc.js',
    '*.generated.json',
    'vite.config.d.ts',
  ],
  rules: {
    'import/no-extraneous-dependencies': [
      // currently broken for @decipad/* dependencies
      'off',
      // 'error',
      // { packageDir: [__dirname, require('path').resolve(__dirname, '../..')] },
    ],
    '@typescript-eslint/consistent-type-imports': 'off',
  },
};
