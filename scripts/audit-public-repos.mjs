#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const configPath = resolve(rootDir, 'repo-health/repos.json');
const reportPath = resolve(rootDir, 'repo-health/REPORT.md');

const config = JSON.parse(readFileSync(configPath, 'utf8'));

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function assertGhReady() {
  try {
    run('gh', ['--version']);
  } catch {
    throw new Error('gh CLI is missing. Install gh and authenticate before running repo-health audit.');
  }

  try {
    run('gh', ['auth', 'status']);
  } catch (error) {
    const stderr = error.stderr?.toString?.() || '';
    throw new Error(`gh CLI is not authenticated. Run gh auth login.\n${stderr}`.trim());
  }
}

function ghApiGet(path) {
  // GET only. No gh api PATCH/POST/PUT/DELETE in this audit.
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return run('gh', ['api', '-X', 'GET', path, '-H', 'Accept: application/vnd.github+json']);
    } catch (error) {
      lastError = error;
      const stderr = error.stderr?.toString?.() || '';
      if (!/timeout|timed out|connection reset|temporarily unavailable/i.test(stderr)) break;
    }
  }
  throw lastError;
}

function getJson(path) {
  return JSON.parse(ghApiGet(path));
}

function tryGetJson(path) {
  try {
    return { ok: true, data: getJson(path) };
  } catch (error) {
    const stderr = error.stderr?.toString?.() || '';
    const statusMatch = stderr.match(/HTTP\s+(\d{3})/i);
    return {
      ok: false,
      status: statusMatch?.[1] || 'unknown',
      message: firstLine(stderr || error.message || 'unknown error'),
    };
  }
}

function existsByGet(path) {
  const result = tryGetJson(path);
  if (result.ok) return { state: 'yes' };
  if (result.status === '404') return { state: 'no' };
  return { state: 'unknown', note: result.message };
}

function firstLine(value) {
  return String(value).split('\n').map((line) => line.trim()).find(Boolean) || '';
}

function repoPath(target, suffix = '') {
  return `/repos/${target.owner}/${target.name}${suffix}`;
}

function auditProfile(target) {
  const user = getJson(`/users/${target.owner}`);
  return {
    kind: 'profile',
    owner: target.owner,
    classification: target.classification,
    notes: target.notes,
    url: user.html_url,
    displayName: user.name || '',
    publicRepos: user.public_repos,
    publicGists: user.public_gists,
    updatedAt: user.updated_at,
  };
}

function auditRepo(target) {
  const repo = getJson(repoPath(target));
  if (repo.private) {
    throw new Error(`${target.owner}/${target.name} is private. Refusing to audit private repositories.`);
  }

  const branch = repo.default_branch;
  const readme = existsByGet(repoPath(target, '/readme'));
  const license = repo.license ? { state: 'yes' } : existsByGet(repoPath(target, '/license'));
  const workflows = tryGetJson(repoPath(target, '/actions/workflows'));
  const dependabotYml = existsByGet(repoPath(target, '/contents/.github/dependabot.yml'));
  const dependabotYaml = dependabotYml.state === 'yes'
    ? dependabotYml
    : existsByGet(repoPath(target, '/contents/.github/dependabot.yaml'));
  const protection = branch
    ? existsByGet(repoPath(target, `/branches/${encodeURIComponent(branch)}/protection`))
    : { state: 'unknown', note: 'no default branch' };

  return {
    kind: 'repo',
    owner: target.owner,
    name: target.name,
    fullName: repo.full_name,
    classification: target.classification,
    notes: target.notes,
    url: repo.html_url,
    description: repo.description || '',
    homepageUrl: repo.homepage || '',
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    primaryLanguage: repo.language || '',
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    defaultBranch: branch || '',
    archived: Boolean(repo.archived),
    visibility: repo.visibility || 'public',
    basics: {
      readme: readme.state,
      license: license.state,
      workflows: workflows.ok ? (workflows.data.total_count > 0 ? 'yes' : 'no') : 'unknown',
      workflowCount: workflows.ok ? workflows.data.total_count : null,
      dependabot: dependabotYaml.state,
      branchProtection: protection.state,
    },
    notesFromAudit: [
      workflows.ok ? '' : `workflows unknown: ${workflows.message}`,
      dependabotYaml.note ? `dependabot unknown: ${dependabotYaml.note}` : '',
      protection.note ? `branch protection unknown: ${protection.note}` : '',
    ].filter(Boolean),
  };
}

function auditTarget(target) {
  if (target.kind === 'profile') return auditProfile(target);
  if (target.kind === 'repo') return auditRepo(target);
  throw new Error(`Unsupported target kind: ${target.kind}`);
}

function missingBasics(audit) {
  if (audit.kind !== 'repo') return [];
  const labels = {
    readme: 'README',
    license: 'license',
    workflows: 'workflows',
    dependabot: 'Dependabot',
    branchProtection: 'branch protection',
  };
  return Object.entries(audit.basics)
    .filter(([key]) => key !== 'workflowCount')
    .filter(([, value]) => value !== 'yes')
    .map(([key, value]) => `${labels[key]} (${value})`);
}

function boolWord(value) {
  if (value === 'yes') return 'yes';
  if (value === 'no') return 'no';
  return 'unknown';
}

function listOrDash(items) {
  return items?.length ? items.join(', ') : '—';
}

function line(label, value) {
  return `- ${label}: ${value || '—'}`;
}

function renderReport(audits) {
  const profile = audits.find((item) => item.kind === 'profile');
  const repos = audits.filter((item) => item.kind === 'repo');
  const missingRows = repos
    .map((repo) => ({ repo, missing: missingBasics(repo) }))
    .filter((row) => row.missing.length > 0)
    .sort((a, b) => b.missing.length - a.missing.length || a.repo.fullName.localeCompare(b.repo.fullName));

  const lines = [];
  lines.push('# Repo health report');
  lines.push('');
  lines.push('Generated by `pnpm repo-health:audit` from live public GitHub metadata. No private repos queried. No remote changes made.');
  lines.push('');
  lines.push('Safety: no private/work/customer/Hermes/session/family/health leakage; no real lead/customer/person data; no unsupported production claims.');
  lines.push('');

  if (profile) {
    lines.push('## Profile');
    lines.push('');
    lines.push(line('Owner', profile.owner));
    lines.push(line('URL', profile.url));
    lines.push(line('Display name', profile.displayName));
    lines.push(line('Classification', profile.classification));
    lines.push(line('Notes', profile.notes));
    lines.push(line('Public repos', profile.publicRepos));
    lines.push(line('Public gists', profile.publicGists));
    lines.push(line('Updated', profile.updatedAt));
    lines.push('');
  }

  lines.push('## Top missing basics');
  lines.push('');
  if (missingRows.length === 0) {
    lines.push('- No missing basics found.');
  } else {
    for (const { repo, missing } of missingRows) {
      lines.push(`- ${repo.fullName}: ${missing.join(', ')}`);
    }
  }
  lines.push('');

  lines.push('## Repo cards');
  lines.push('');
  for (const repo of repos) {
    lines.push(`### ${repo.fullName}`);
    lines.push('');
    lines.push(line('Classification', repo.classification));
    lines.push(line('Notes', repo.notes));
    lines.push(line('URL', repo.url));
    lines.push(line('Description', repo.description));
    lines.push(line('Homepage', repo.homepageUrl));
    lines.push(line('Topics', listOrDash(repo.topics)));
    lines.push(line('Primary language', repo.primaryLanguage));
    lines.push(line('Default branch', repo.defaultBranch));
    lines.push(line('Updated', repo.updatedAt));
    lines.push(line('Pushed', repo.pushedAt));
    lines.push(line('Archived', repo.archived ? 'yes' : 'no'));
    lines.push(line('README', boolWord(repo.basics.readme)));
    lines.push(line('License', boolWord(repo.basics.license)));
    lines.push(line('Workflows', `${boolWord(repo.basics.workflows)}${repo.basics.workflowCount === null ? '' : ` (${repo.basics.workflowCount})`}`));
    lines.push(line('Dependabot', boolWord(repo.basics.dependabot)));
    lines.push(line('Branch protection', boolWord(repo.basics.branchProtection)));
    if (repo.notesFromAudit.length > 0) {
      lines.push(line('Audit notes', repo.notesFromAudit.join('; ')));
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

assertGhReady();
const audits = config.targets.map(auditTarget);
writeFileSync(reportPath, renderReport(audits));
console.log(`Wrote ${reportPath}`);
