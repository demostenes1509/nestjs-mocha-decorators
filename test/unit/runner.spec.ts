import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { expect } from 'expect';

interface MochaReport {
  passes: Array<{ fullTitle: string }>;
  failures: Array<{ fullTitle: string }>;
}

const root = join(__dirname, '..', '..');

// Runs the fixture on its own mocha process, like a real project would do
const runFixture = (
  env: NodeJS.ProcessEnv = {},
): { status: number | null; report: MochaReport } => {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [
      join(root, 'node_modules', 'mocha', 'bin', 'mocha.js'),
      '--delay',
      '--exit',
      '--require',
      'ts-node/register',
      '--reporter',
      'json',
      join('test', 'fixtures', 'runner.entrypoint.ts'),
    ],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, SUITETORUN: '', TESTTORUN: '', ...env },
    },
  );
  try {
    return { status, report: JSON.parse(stdout) };
  } catch {
    throw new Error(`Fixture did not report JSON:\n${stdout}\n${stderr}`);
  }
};

const titles = (tests: Array<{ fullTitle: string }>): string[] =>
  tests.map((test) => test.fullTitle).sort();

describe('running tests', function () {
  this.timeout(60000);

  it('runs every registered suite and fails the process on a failed test', () => {
    const { status, report } = runFixture();

    expect(status).toBe(1);
    expect(titles(report.failures)).toEqual(['Other fails']);
    expect(titles(report.passes)).toEqual([
      'Child inherited',
      'Child overridden',
      'Child own',
      'First homonym inherited',
      'First homonym overridden',
      'First homonym own',
      'Other passes',
      'Second homonym second only',
    ]);
  });

  it('runs a single suite with SUITETORUN', () => {
    const { status, report } = runFixture({ SUITETORUN: 'Child' });

    expect(status).toBe(0);
    expect(titles(report.passes)).toEqual([
      'Child inherited',
      'Child overridden',
      'Child own',
    ]);
  });

  it('runs a single test with TESTTORUN', () => {
    const { status, report } = runFixture({ TESTTORUN: 'second only' });

    expect(status).toBe(0);
    expect(titles(report.passes)).toEqual(['Second homonym second only']);
  });
});
