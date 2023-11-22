const baseConfig = require('../../tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    '../../libs/editor-components/src/**/*.{ts,tsx}',
    '../../libs/ui/src/**/*.{ts,tsx}',
  ],
};
