// eslint-disable-next-line import/no-extraneous-dependencies
const lightCodeTheme = require('prism-react-renderer/themes/github').default;
// eslint-disable-next-line import/no-extraneous-dependencies
const darkCodeTheme = require('prism-react-renderer/themes/dracula').default;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Decipad',
  tagline: 'Make sense of numbers',
  url: 'https://decipad.com',
  baseUrl: '/docs/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/deci-logo-brand.png',
  organizationName: 'decipad', // Usually your GitHub org/user name.
  projectName: 'decipad', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/decipad/decipad/edit/main/apps/docs',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/decipad/decipad/edit/main/apps/docs',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: ['./src/lib/deci-language-live-codeblock'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Decipad',
        logo: {
          alt: 'Decipad',
          src: '/img/deci-logo-brand.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'examples/start',
            position: 'left',
            label: 'Examples',
          },
          {
            type: 'doc',
            docId: 'language/start',
            position: 'left',
            label: 'Technical Docs',
          },
          { to: '/blog', label: 'Articles', position: 'left' },
          {
            href: 'https://github.com/decipad/docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Examples',
                to: '/docs/docs/examples',
              },
              {
                label: 'Technical Docs',
                to: '/docs/docs/language',
              },
              {
                label: 'Help Articles',
                to: '/docs/blog',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/deci',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/HwDMqwbGmc',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/decipad',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Articles',
                to: '/docs/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/decipad/docs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} N1N, Ltd.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
