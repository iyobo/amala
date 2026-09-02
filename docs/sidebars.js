/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'Guides',
      items: ['security', 'troubleshooting', 'upcoming-features'],
    },
    {
      type: 'category',
      label: 'API reference',
      items: [
        'api-spec/bootstrap-controllers',
        'api-spec/decorators',
      ],
    },
  ],
};

export default sidebars;
