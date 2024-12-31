import {calculateNextVersion, generateNotes, prepare} from '../src/index';
import {PluginContext} from '../src/types';

describe('Versioning Utilities', () => {
  it('calculates next version for a new month', () => {
    const result = calculateNextVersion('2024.11.3');
    expect(result).toMatch(/^2024\.12\.0$/);
  });

  it('increments minor version for the same month', () => {
    const result = calculateNextVersion('2024.12.3');
    expect(result).toBe('2024.12.4');
  });

  it('handles invalid last version gracefully', () => {
    const result = calculateNextVersion('invalid.version');
    expect(result).toMatch(/^\d{4}\.\d{2}\.0$/);
  });
});

describe('Plugin Functions', () => {
  const mockLogger = {log: jest.fn(), error: jest.fn()};
  const mockContext: PluginContext = {
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
      type: 'prerelease',
      channel: '',
      gitTag: '',
      gitHead: '',
      name: ''
    },
    logger: mockLogger
  };

  it('prepare sets next version correctly', async () => {
    await prepare({context: mockContext});
    expect(mockContext.nextRelease.version).toMatch(/^2024\.12\.\d+$/);
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/CalVer calculated/));
  });

  it('generateNotes returns release notes', async () => {
    const notes = await generateNotes({context: mockContext});
    expect(notes).toBe('Release notes');
  });
});
