# Amala documentation site

This Docusaurus site builds the public documentation at [amalajs.com](https://www.amalajs.com).

## Local development

Use Node.js 20 or newer and install the locked dependencies:

```bash
npm ci
npm start
```

The development server reloads as documentation and site components change.

## Production build

```bash
npm run build
npm run serve
```

`npm run build` validates links and generates the static site in `build/`. Changes merged to `master` are built and published to the `gh-pages` branch by `.github/workflows/docs.yml`.
