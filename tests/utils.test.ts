import {invalidVersion} from '../src/utils';

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
});
