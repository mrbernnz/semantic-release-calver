/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'babel-jest'
  }
};
