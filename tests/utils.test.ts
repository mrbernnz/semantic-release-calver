import {VersionManager} from '../src/utils';

describe('CalVer Plugin Utils', () => {
  const versionManager = new VersionManager('YYYY.0M.MICRO');

  describe('isValidVersion', () => {
    it.each`
      version                    | expected
      ${''}                      | ${false}
      ${'random.version.string'} | ${false}
      ${'2025.02'}               | ${false}
      ${'2025.02_02.a'}          | ${false}
      ${'9999.02.1'}             | ${false}
      ${'2025.2.1'}              | ${false}
      ${'2025.02.1'}             | ${true}
      ${'2025.02.01'}            | ${false}
      ${'2025.02.10'}            | ${true}
      ${'2025.02.100'}           | ${true}
      ${'2025.02.9999'}          | ${true}
      ${'2025.02.10000'}         | ${false}
      ${'2025.02_1'}             | ${false}
      ${'2025.02_01'}            | ${true}
      ${'2025.02_10'}            | ${true}
      ${'2025.02_100'}           | ${true}
      ${'2025.02_9999'}          | ${true}
      ${'2025.02_10000'}         | ${false}
    `('should validate "$version" as "$expected"', async ({version, expected}) => {
      expect(versionManager.isValidVersion(version)).toEqual(expected);
    });
  });

  describe('determineFormat', () => {
    const formattedDate = versionManager['getFormattedDate']();

    it.each`
      formattedDate    | lastMinor | versionFormat      | expected
      ${formattedDate} | ${2}      | ${'YYYY.0M.MICRO'} | ${`${formattedDate}.3`}
      ${formattedDate} | ${9}      | ${'YYYY.0M.MICRO'} | ${`${formattedDate}.10`}
      ${formattedDate} | ${2}      | ${'YYYY.0M_MICRO'} | ${`${formattedDate}_03`}
      ${formattedDate} | ${9}      | ${'YYYY.0M_MICRO'} | ${`${formattedDate}_10`}
    `(
      'should give next version based on $versionFormat',
      ({formattedDate, lastMinor, versionFormat, expected}) => {
        expect(
          versionManager['determineFormat']({formattedDate, lastMinor, versionFormat})
        ).toBe(expected);
      }
    );
  });

  describe('getVersionSegments', () => {
    it.each`
      version         | expected
      ${''}           | ${[]}
      ${'2025.02.11'} | ${['2025', '02', '11']}
      ${'2025.02_11'} | ${['2025', '02', '11']}
    `('should convert version into correct number of segments', ({version, expected}) => {
      expect(versionManager['getVersionSegments'](version)).toEqual(expected);
    });
  });
});
