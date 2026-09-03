// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Amala',
  tagline: 'Typed Koa APIs with decorators, validation, versioning, and OpenAPI support.',
  favicon: 'img/favicon.ico',
  url: 'https://www.amalajs.com',
  baseUrl: '/',
  organizationName: 'iyobo',
  projectName: 'amala',
  onBrokenLinks: 'throw',
  trailingSlash: false,
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/iyobo/amala/edit/master/docs/',
          lastVersion: 'current',
          versions: {
            current: {
              label: '13.x',
              banner: 'none',
            },
            '12.0': {
              label: '12.x',
              banner: 'unmaintained',
            },
            '11.0': {
              label: '11.x',
              banner: 'unmaintained',
            },
          },
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/logo.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Amala',
        logo: {
          alt: 'Amala logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'doc',
            docId: 'api-spec/bootstrap-controllers',
            label: 'API reference',
            position: 'left',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/iyobo/amala',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {label: 'Get started', to: '/docs/getting-started'},
              {label: 'Configuration', to: '/docs/api-spec/bootstrap-controllers'},
              {label: 'Decorators', to: '/docs/api-spec/decorators'},
              {label: 'Security', to: '/docs/security'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'GitHub', href: 'https://github.com/iyobo/amala'},
              {label: 'Issues', href: 'https://github.com/iyobo/amala/issues'},
              {label: 'Security policy', href: 'https://github.com/iyobo/amala/security/policy'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Amala contributors. Released under the MIT License.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash'],
      },
    }),
};

export default config;
