module.exports = {
  extends: ['../../libs/eslint-config-decipad/react'],
  ignorePatterns: ['!**/*', '.eslintrc.js'],
  rules: {
    'import/no-extraneous-dependencies': [
      // currently broken for @decipad/* dependencies
      'off',
      // 'error',
      // { packageDir: [__dirname, require('path').resolve(__dirname, '../..')] },
    ],
  },
};
