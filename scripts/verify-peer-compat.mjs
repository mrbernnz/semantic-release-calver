#!/usr/bin/env node
/**
 * Peer-compatibility integration check.
 *
 * Exercises the REAL, installed `semantic-release` package (whichever version
 * is currently in node_modules — the peer_compat CI matrix overrides it per
 * run) against a throwaway git fixture repo, invoking the actual compiled
 * plugin (dist/index.js) the way a real consumer's `.releaserc` would.
 *
 * Not a jest test: jest (babel-jest transform, CJS package.json) cannot
 * dynamically import semantic-release, which is pure ESM. Node's native
 * dynamic import() handles it directly.
 *
 * No network access, no publish/push: dryRun: true, a local file:// repo URL,
 * and no @semantic-release/github|npm|git in the plugin list.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const REPO_ROOT = path.resolve(__dirname, '..');
const PLUGIN_ENTRY = path.join(REPO_ROOT, 'dist', 'index.js');

if (!existsSync(PLUGIN_ENTRY)) {
  console.error(`[verify-peer-compat] ${PLUGIN_ENTRY} does not exist. Run "npm run build" first.`);
  process.exit(1);
}

const { default: semanticRelease } = await import('semantic-release');
const { version: srVersion } = require('semantic-release/package.json');

function git(cwd, args) {
  execFileSync('git', args, { cwd, stdio: 'pipe' });
}

function createFixtureRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), 'semantic-release-calver-it-'));
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['config', 'user.email', 'ci@example.com']);
  git(dir, ['config', 'user.name', 'CI']);
  git(dir, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'fixture-repo', version: '1.0.0' }, null, 2));
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'chore: initial commit']);
  git(dir, ['tag', '-a', 'v1.0.0', '-m', 'v1.0.0']);
  writeFileSync(path.join(dir, 'FEATURE.md'), '# a feature\n');
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'feat: add a new feature']);
  return dir;
}

// Strip credential-shaped env vars: prevents semantic-release from building
// an authenticated remote URL, and prevents any accidental real network call
// even if repositoryUrl were ever misconfigured.
const DROP_ENV_KEYS = [
  'GH_TOKEN', 'GITHUB_TOKEN', 'GITEA_TOKEN', 'GITLAB_TOKEN', 'GL_TOKEN',
  'BITBUCKET_TOKEN', 'BB_TOKEN', 'NPM_TOKEN', 'CI_JOB_TOKEN', 'NODE_AUTH_TOKEN'
];
const sanitizedEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !DROP_ENV_KEYS.includes(key))
);

const fixtureRepo = createFixtureRepo();
let exitCode = 0;

try {
  console.log(`[verify-peer-compat] semantic-release ${srVersion}, fixture: ${fixtureRepo}`);

  const result = await semanticRelease(
    {
      dryRun: true,
      noCi: true,
      branches: ['main'],
      tagFormat: 'v${version}',
      repositoryUrl: `file://${fixtureRepo}`,
      plugins: ['@semantic-release/commit-analyzer', PLUGIN_ENTRY]
    },
    {
      cwd: fixtureRepo,
      env: sanitizedEnv,
      stdout: process.stdout,
      stderr: process.stderr
    }
  );

  if (!result) {
    console.error('[verify-peer-compat] FAIL: semantic-release returned false (no release computed).');
    exitCode = 1;
  } else {
    const { version } = result.nextRelease;
    const calverShaped = /^\d{4}\.\d{2}[._]\d+$/.test(version);
    const semverShaped = /^\d+\.\d+\.\d+$/.test(version);
    console.log(`[verify-peer-compat] lastRelease: ${result.lastRelease.version}, nextRelease: ${version}`);

    if (calverShaped) {
      console.log('[verify-peer-compat] PASS: verifyRelease overrode the version with CalVer.');
    } else if (semverShaped) {
      console.error(
        `[verify-peer-compat] FAIL (known bug, see PRO-54 follow-up): semantic-release ignored the plugin's ` +
        `CalVer override and returned its own computed SemVer "${version}" instead. This is the confirmed, ` +
        `pre-existing verifyRelease-mutation-is-discarded bug, not a regression.`
      );
      exitCode = 1;
    } else {
      console.error(`[verify-peer-compat] FAIL: got an unexpected, non-SemVer non-CalVer version "${version}".`);
      exitCode = 1;
    }
  }
} finally {
  rmSync(fixtureRepo, { recursive: true, force: true });
}

process.exit(exitCode);
