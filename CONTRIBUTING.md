# Contributing to Amala

Thank you for helping improve Amala. Small, focused pull requests are easiest to review.

## Development setup

The framework requires Node.js 18 or newer. Clone the repository, then install the locked dependencies:

```bash
npm ci
```

Run the framework checks:

```bash
npm test
npm run build
```

The documentation site uses Node.js 20 or newer:

```bash
cd docs
npm ci
npm run build
```

Use `npm start` from `docs/` for local documentation development.

## Pull requests

- Explain the user-visible problem and the chosen behavior.
- Add or update tests for runtime changes.
- Update the public documentation when behavior, defaults, or types change.
- Include generated `dist/` output when source changes affect the published package.
- Keep unrelated formatting and dependency upgrades out of the change.
- Confirm that both framework and documentation builds complete before requesting review.

## Releases

Every release starts with a pull request that updates `package.json`, `package-lock.json`, and `CHANGELOG.md`. Use semantic versioning consistently:

- Patch for backward-compatible bug and security fixes.
- Minor for backward-compatible features.
- Major for breaking API, runtime, or support-policy changes.

After the version pull request is merged, check out its exact merge commit and run:

```bash
npm ci
npm run release:publish
```

Verify the published version from the npm registry before creating and pushing its annotated Git tag. Never create a release commit or version tag before npm confirms the package was published.

## Security reports

Do not disclose suspected vulnerabilities in a public issue or pull request. Follow [SECURITY.md](SECURITY.md) instead.
