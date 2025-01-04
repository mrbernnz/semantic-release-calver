import SemanticReleaseError from '@semantic-release/error';
import {Signale} from 'signale';
import {generateNotes, prepare} from '../src/index';
import {GenerateNotesContext, PluginConfig, PrepareContext} from '../src/types';

type Context = GenerateNotesContext | PrepareContext;

describe('Calver Plugin', () => {
  let mockLogger: jest.Mocked<Signale<'error' | 'success' | 'warn' | 'log'>>;
  let mockPluginConfig: PluginConfig;
  let mockContext: Context;

  beforeEach(() => {
    mockLogger = {
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
    mockPluginConfig = {};
    mockContext = {
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
  });

  describe('generateNotes function', () => {
    it('should return release notes', async () => {
      const notes = await generateNotes(mockPluginConfig, mockContext);
      expect(notes).toBe('Release notes');
    });
  });

  describe('prepare function', () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    describe('with a valid version', () => {
      it('should sets next version correctly', async () => {
        await prepare(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}.\\d+$`);

        expect(mockContext.nextRelease.version).toMatch(re);
        expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/CalVer calculated/));
      });

      it('should increment minor version for the same month', async () => {
        mockContext.lastRelease.version = `${year}.${month}.3`;

        await prepare(mockPluginConfig, mockContext);

        expect(mockContext.nextRelease.version).toBe(`${year}.${month}.4`);
      });

      it('should reset minor version for a new month', async () => {
        mockContext.lastRelease.version = '2024.11.3';

        await prepare(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}.0`);

        expect(mockContext.nextRelease.version).toMatch(re);
      });

      it('should convert semver version', async () => {
        mockContext.lastRelease.version = '1.2.3';

        await prepare(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}.\\d+$`);

        expect(mockContext.nextRelease.version).toMatch(re);
        expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/CalVer calculated/));
      });

      it('should gracefully handle an undefined version', async () => {
        // @ts-expect-error Testing invalid input type
        mockContext.lastRelease.version = undefined;

        await prepare(mockPluginConfig, mockContext);
        const re = new RegExp(`${year}\.${month}.\\d+$`);

        expect(mockContext.nextRelease.version).toMatch(re);
        expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/CalVer calculated/));
      });
    });

    describe('with an invalid version', () => {
      test.each`
        version                     | errorName                 | errorMessage
        ${'random-string'}          | ${'SemanticReleaseError'} | ${'Invalid Version Format'}
        ${'random.invalid.version'} | ${'SemanticReleaseError'} | ${'Invalid Version Format'}
        ${'2024.11'}                | ${'SemanticReleaseError'} | ${'Invalid CalVer Format'}
        ${'24.11'}                  | ${'SemanticReleaseError'} | ${'Invalid Version Format'}
      `(
        'should throw $errorName for version "$version"',
        async ({version, errorName, errorMessage}) => {
          mockContext.lastRelease.version = version;
          const error = new SemanticReleaseError(errorMessage);

          await expect(prepare(mockPluginConfig, mockContext)).rejects.toThrow({
            name: errorName,
            message: errorMessage
          });
          expect(mockLogger.error).toHaveBeenCalledWith('Error calculating next version:', error);
        }
      );
    });
  });
});
