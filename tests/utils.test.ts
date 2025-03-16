import {format} from 'date-fns';
import {determineFormat, getVersionSegments, invalidVersion} from '../src/utils';

describe('CalVer Plugin Utils', () => {
  describe('isInvalidVersion', () => {
    it.each`
      version                    | expected
      ${''}                      | ${true}
      ${'random.version.string'} | ${true}
      ${'2025.02'}               | ${true}
      ${'2025.02_02.a'}          | ${true}
      ${'9999.02.1'}             | ${true}
      ${'2025.2.1'}              | ${true}
      ${'2025.02.1'}             | ${false}
      ${'2025.02.01'}            | ${true}
      ${'2025.02.10'}            | ${false}
      ${'2025.02.100'}           | ${false}
      ${'2025.02.9999'}          | ${false}
      ${'2025.02.10000'}         | ${true}
      ${'2025.02_1'}             | ${true}
      ${'2025.02_01'}            | ${false}
      ${'2025.02_10'}            | ${false}
      ${'2025.02_100'}           | ${false}
      ${'2025.02_9999'}          | ${false}
      ${'2025.02_10000'}         | ${true}
    `('should validate "$version" as "$expected"', async ({version, expected}) => {
      expect(invalidVersion(version)).toEqual(expected);
    });
  });

  describe('determineFormat', () => {
    const formattedDate = format(new Date(), 'yyyy.MM');

    it.each`
      formattedDate    | lastMinor | versionFormat      | expected
      ${formattedDate} | ${2}      | ${'YYYY.0M.MICRO'} | ${`${formattedDate}.3`}
      ${formattedDate} | ${9}      | ${'YYYY.0M.MICRO'} | ${`${formattedDate}.10`}
      ${formattedDate} | ${2}      | ${'YYYY.0M_MICRO'} | ${`${formattedDate}_03`}
      ${formattedDate} | ${9}      | ${'YYYY.0M_MICRO'} | ${`${formattedDate}_10`}
    `(
      'should give next version based on $versionFormat',
      ({formattedDate, lastMinor, versionFormat, expected}) => {
        expect(determineFormat({formattedDate, lastMinor, versionFormat})).toBe(expected);
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
      expect(getVersionSegments(version)).toEqual(expected);
    });
  });
});
