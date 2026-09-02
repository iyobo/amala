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

## Security reports

Do not disclose suspected vulnerabilities in a public issue or pull request. Follow [SECURITY.md](SECURITY.md) instead.
