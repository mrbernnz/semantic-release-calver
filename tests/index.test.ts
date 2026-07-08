import SemanticReleaseError from '@semantic-release/error';
import {generateNotes, verifyRelease} from '../src/index';
import {GenerateNotesContext, Logger, PluginConfig, VerifyReleaseContext} from '../src/types';

type Context = GenerateNotesContext | VerifyReleaseContext;

describe('Calver Plugin', () => {
  let mockLogger: jest.Mocked<Logger>;
  let mockPluginConfig: PluginConfig;
  let mockContext: Context;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn()
    };
    mockPluginConfig = {
      versionFormat: 'YYYY.0M.MICRO'
    };
    mockContext = {
      options: {
        tagFormat: 'v${version}'
      },
      lastRelease: {
        version: '2024.12.3'
      },
      nextRelease: {
        notes: 'Release notes',
        version: '',
        gitTag: '',
        name: ''
      },
      logger: mockLogger
    };
  });

  describe('generateNotes function', () => {
    it('should return release notes', async () => {
      const notes = await generateNotes(mockPluginConfig, mockContext);
      expect(notes).toBe('Release notes');
    });
  });

  describe('verifyRelease function', () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    describe('with default version format', () => {
      it('should sets next version correctly', async () => {
        await verifyRelease(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}([_.]\\d+)?$`);

        expect(mockContext.nextRelease.version).toMatch(re);
        expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/CalVer calculated/));
      });

      it('should increment minor version for the same month', async () => {
        mockContext.lastRelease.version = `${year}.${month}.3`;

        await verifyRelease(mockPluginConfig, mockContext);

        expect(mockContext.nextRelease.version).toBe(`${year}.${month}.4`);
      });

      it('should reset minor version for a new month', async () => {
        mockContext.lastRelease.version = '2024.11.3';

        await verifyRelease(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}.\\d{1}`);

        expect(mockContext.nextRelease.version).toMatch(re);
      });

      it('should overwrite a SemVer default version set by semantic-release core (dry-run regression)', async () => {
        mockContext.nextRelease.version = '1.0.0';
        mockContext.nextRelease.gitTag = 'v1.0.0';
        mockContext.nextRelease.name = 'v1.0.0';

        await verifyRelease(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}([_.]\\d+)?$`);

        expect(mockContext.nextRelease.version).not.toBe('1.0.0');
        expect(mockContext.nextRelease.version).toMatch(re);
      });

      it('should re-derive gitTag and name from the CalVer version', async () => {
        mockContext.nextRelease.version = '1.0.0';
        mockContext.nextRelease.gitTag = 'v1.0.0';
        mockContext.nextRelease.name = 'v1.0.0';

        await verifyRelease(mockPluginConfig, mockContext);

        expect(mockContext.nextRelease.gitTag).toBe(`v${mockContext.nextRelease.version}`);
        expect(mockContext.nextRelease.name).toBe(`v${mockContext.nextRelease.version}`);
        expect(mockContext.nextRelease.gitTag).not.toBe('v1.0.0');
        expect(mockContext.nextRelease.name).not.toBe('v1.0.0');
      });

      it('should respect a custom tagFormat', async () => {
        mockContext.options.tagFormat = 'release-${version}';
        mockContext.nextRelease.version = '1.0.0';
        mockContext.nextRelease.gitTag = 'v1.0.0';
        mockContext.nextRelease.name = 'v1.0.0';

        await verifyRelease(mockPluginConfig, mockContext);

        expect(mockContext.nextRelease.gitTag).toBe(`release-${mockContext.nextRelease.version}`);
        expect(mockContext.nextRelease.name).toBe(`release-${mockContext.nextRelease.version}`);
      });

      it('should convert semver version', async () => {
        mockContext.lastRelease.version = '1.2.3';

        await verifyRelease(mockPluginConfig, mockContext);

        const re = new RegExp(`${year}\.${month}([._]\\d+)?$`);

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

          await expect(verifyRelease(mockPluginConfig, mockContext)).rejects.toThrow({
            name: errorName,
            message: errorMessage
          });
          expect(mockLogger.error).toHaveBeenCalledWith('Error calculating next version:', error);
        }
      );
    });
  });
});
