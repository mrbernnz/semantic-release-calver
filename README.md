# @mrbernnz/semantic-release-calver

A plugin for semantic-release that supports Calendar Versioning ([CalVer](https://calver.org)) for automated release management. CalVer uses date-based versioning, making it ideal for projects with frequent releases.

## Features

- 📅 CalVer Support: Adheres to the Calendar Versioning format (e.g., YYYY.MM.MINOR).
- 🔧 Flexible Configuration: Customize versioning patterns to fit your project needs.
- ✅ Integration Ready: Works seamlessly with semantic-release workflows.
- ⚙️ TypeScript Support: Fully typed for better developer experience.
- 🔒 Secure and Reliable: Built with best practices for automated release pipelines.

## Installation

Install the package via npm or yarn:

```sh
# Using npm
npm install @mrbernnz/semantic-release-calver --save-dev

# Using yarn
yarn add @mrbernnz/semantic-release-calver --dev
```

## Usage

### Basic Setup

To use semantic-release-calver, add it as the **first plugin** in your semantic-release configuration file (e.g., `.releaserc.json` or `release.config.js`) to override the default SemVer versioning:

```js
module.exports = {
  branches: ['main'],
  plugins: [
    '@mrbernnz/semantic-release-calver',
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/git',
    '@semantic-release/npm',
    '@semantic-release/github'
  ]
};
```

### Example Release Workflow

With the configuration above, semantic-release-calver will:

1. Generate a version in the specified CalVer format (default: `YYYY.0M.MICRO`).
2. Override the default SemVer versioning behavior.
3. Automatically create and publish releases using semantic-release.

### Custom Version Format

You can customize the CalVer format by passing options to the plugin in your config:

```js
module.exports = {
  plugins: [
    [
      '@mrbernnz/semantic-release-calver',
      { versionFormat: 'YYYY.0M_MICRO' } // or 'YYYY.0M.MICRO'
    ],
    // other plugins...
  ]
};
```

## API Reference

@mrbernnz/semantic-release-calver plugin

### Returns

A string representing the calculated version (e.g., `2024.01.0`).

Example:

```js
const calverPlugin = require('@mrbernnz/semantic-release-calver');

const version = calverPlugin.calculateNextVersion({
  lastVersion: '2023.12.2'
});

console.log(version); // Outputs: '2024.01.0'
```

## Integration Examples

### GitHub Actions

Here’s an example workflow to use semantic-release-calver in a GitHub Actions pipeline:

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          GIT_FETCH_EXTRA_ARGS: '--prune --tags'
        run: npx semantic-release
```

## Troubleshooting Guide

### Common Issues

1. **Plugin Not Executing:**  
   - Verify that the plugin is correctly configured as the first plugin in your semantic-release config.

2. **Authentication Errors:**  
   - Ensure you’ve set the necessary environment variables (`GITHUB_TOKEN`, `NPM_TOKEN`) in your CI environment.

3. **Tag Conflicts:**  
   - If you see errors about tags already existing, try deleting the conflicting tag on the remote or use `GIT_FETCH_EXTRA_ARGS` as shown above.

## Contributing

Contributions are welcome to semantic-release-calver! Please follow these steps:

1. Fork the repository and clone it locally.
2. Create a feature branch:

```sh
git checkout -b feature/my-feature
```

3. Commit your changes:

```sh
git commit -m "Add my feature"
```

4. Push to your fork and submit a pull request.

## License

This project is licensed under the MIT License.
