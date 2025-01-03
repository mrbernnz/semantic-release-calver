# @mrbernnz/semantic-release-calver

A plugin for semantic-release that supports Calendar Versioning ([CalVer](https://calver.org)) for automated release management. CalVer uses date-based versioning, making it ideal for projects with frequent releases.

## Features

- 📅 CalVer Support: Adheres to the Calendar Versioning format (e.g. YYYY.MM.MINOR).
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

To use semantic-release-calver, configure it as a plugin in your release configuration file (e.g., release.config.js):

```js
module.exports = {
  branches: ['main'],
  plugins:
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/git',
    '@semantic-release/npm',
    '@mrbernnz/semantic-release-calver'

};
```

### Example Release Workflow

With the configuration above, semantic-release-calver will:

1. Generate a version in the specified CalVer format.
2. Automatically create and publish releases using semantic-release.

## API Reference

@mrbernnz/semantic-release-calver plugin

### Returns

A string representing the calculated version (e.g., 2024.01.0).

Example

```js
const calverPlugin = require('@mrbernnz/semantic-release-calver');

const version = calverPlugin.calculateNextVersion({
  lastVersion: '2023.12.2'
});

console.log(version); // Outputs: '2024.01.0'
```

## Integration Examples

GitHub Actions

Here’s an example workflow to use semantic-release-calver in a GitHub Actions pipeline:

```yaml
name: Release

on:
push:
branches: - main

jobs:
release:
runs-on: ubuntu-latest
steps: - name: Checkout repository
uses: actions/checkout@v3 - name: Set up Node.js
uses: actions/setup-node@v3
with:
node-version: 16 - name: Install dependencies
run: npm install - name: Run semantic-release
run: npx semantic-release
env:
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Troubleshooting Guide

### Common Issues

1. Plugin Not Executing:
   - Verify that the plugin is correctly configured in the plugins array of your release.config.js.
2. Authentication Errors:
   - Ensure you’ve set the necessary environment variables (GITHUB_TOKEN, GITLAB_TOKEN, NPM_TOKEN).

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
