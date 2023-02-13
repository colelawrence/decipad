const lightCodeTheme = require('prism-react-renderer/themes/github').default;
const darkCodeTheme = require('prism-react-renderer/themes/dracula').default;

const plugins = [
  [
    './plugins/blog-plugin.js',
    {
      showReadingTime: false,
      routeBasePath: '/releases',
      blogSidebarCount: 'ALL',
      postsPerPage: 5,
      blogTitle: 'Decipad Releases',
      blogSidebarTitle: 'Recent Releases',
      blogDescription: 'Decipad Releases',
      /* editUrl: 'https://github.com/decipad/documentation/edit/main', */
    },
  ],
];

// Reverse the sidebar items ordering (including nested category items)
function removeAcceptanceTests(items) {
  return items.filter((item) => {
    return (
      item.type === 'category' ||
      (item.type === 'doc' && !/\.acceptance/.test(item.id))
    );
  });
}

if (
  typeof process !== 'undefined' &&
  process.env.REACT_APP_ANALYTICS_WRITE_KEY
) {
  plugins.push([
    'docusaurus-plugin-segment',
    {
      apiKey: process.env.REACT_APP_ANALYTICS_WRITE_KEY,
    },
  ]);
}

const algoliaConfig = require('./algolia.config');
const baseName = require('./base.config');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Decipad',
  tagline: 'Make sense of numbers',
  url: baseName(),
  baseUrl: '/docs/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: '/img/favicon.png',
  organizationName: 'decipad', // Usually your GitHub org/user name.
  projectName: 'decipad', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          breadcrumbs: false,
          /* editUrl: 'https://github.com/decipad/documentation/edit/main', */
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            return removeAcceptanceTests(sidebarItems);
          },
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: ['./src/lib/deci-language-live-codeblock'],

  plugins: plugins,
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
        // switchConfig: {
        //   darkIcon: ' ',
        //   lightIcon: ' ',
        // },
      },
      navbar: {
        title: 'Decipad',
        logo: {
          alt: 'Decipad',
          src: '/img/deci-logo-brand.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'quick-start/get-started-with-decipad',
            position: 'left',
            label: 'Getting started',
          },
          {
            to: 'videos',
            position: 'left',
            label: 'Videos',
          },
          {
            type: 'doc',
            docId: 'gallery',
            position: 'left',
            label: 'Templates',
          },
          {
            to: 'help',
            position: 'left',
            label: 'Support',
          },
          {
            to: 'releases',
            position: 'left',
            label: 'Releases',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/quick-start/get-started-with-decipad',
              },
              {
                label: 'Create a Notebook',
                to: '/docs/quick-start/notebooks',
              },
              {
                label: 'Create a Table',
                to: '/docs/quick-start/tables',
              },
            ],
          },
          {
            title: 'Help & Support',
            items: [
              {
                label: 'Contact Support',
                href: 'mailto:support@decipad.com',
              },
            ],
          },
          {
            title: 'Community',
            items: [
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
                label: 'Blog',
                href: 'https://decipad.com/blog',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: algoliaConfig(),
    }),
};

// eslint-disable-next-line no-console
console.log('algolia config:', config.themeConfig.algolia);

module.exports = config;
