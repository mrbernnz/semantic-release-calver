import {Signale} from 'signale';
import {generateNotes, prepare} from '../src/index';
import {GenerateNotesContext, PrepareContext} from '../src/types';

type Context = GenerateNotesContext | PrepareContext;

describe('Calver Plugin', () => {
  const mockLogger: jest.Mocked<Signale<'error' | 'success' | 'warn' | 'log'>> = {
    log: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    config: jest.fn().mockReturnThis(),
    scope: jest.fn().mockReturnThis(),
    unscope: jest.fn().mockReturnThis(),
    time: jest.fn(),
    timeEnd: jest.fn(),
    start: jest.fn(),
    pause: jest.fn(),
    complete: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    note: jest.fn(),
    debug: jest.fn(),
    await: jest.fn(),
    star: jest.fn(),
    watch: jest.fn(),
    pending: jest.fn(),
    disable: jest.fn(),
    enable: jest.fn(),
    isEnabled: jest.fn(),
    addSecrets: jest.fn(),
    clearSecrets: jest.fn(),
    fav: jest.fn()
  };
  const mockPluginConfig = {};
  const mockContext: Context = {
    lastRelease: {
      version: '2024.12.3',
      gitTag: '',
      channels: [],
      gitHead: '',
      name: ''
    },
    nextRelease: {
      notes: 'Release notes',
      version: '',
      type: 'minor',
      channel: '',
      gitTag: '',
      gitHead: '',
      name: ''
    },
    logger: mockLogger,
    commits: [],
    releases: [],
    env: {},
    envCi: {
      isCi: true,
      commit: '',
      branch: 'main'
    },
    branch: {name: ''},
    branches: [],
    stdout: process.stdout,
    stderr: process.stderr
  };

  describe('when executing the generate notes function', () => {
    it('generateNotes returns release notes', async () => {
      const notes = await generateNotes(mockPluginConfig, mockContext);
      expect(notes).toBe('Release notes');
    });
  });

  describe('when executing the prepare function', () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    it('increments minor version for the same month', async () => {
      mockContext.lastRelease.version = `${year}.${month}.3`;

      await prepare(mockPluginConfig, mockContext);

      expect(mockContext.nextRelease.version).toBe(`${year}.${month}.4`);
    });

    it('calculates next version for a new month', async () => {
      mockContext.lastRelease.version = '2024.11.3';

      await prepare(mockPluginConfig, mockContext);

      const re = new RegExp(`${year}\.${month}.0`);

      expect(mockContext.nextRelease.version).toMatch(re);
    });

    it('handles invalid last version gracefully', async () => {
      mockContext.lastRelease.version = 'invalid.version';

      await prepare(mockPluginConfig, mockContext);

      expect(mockContext.nextRelease.version).toMatch(/^\d{4}\.\d{2}\.0$/);
    });

    it('prepare sets next version correctly', async () => {
      await prepare(mockPluginConfig, mockContext);

      const re = new RegExp(`${year}\.${month}.\\d+$`);

      expect(mockContext.nextRelease.version).toMatch(re);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/CalVer calculated/));
    });
  });
});
