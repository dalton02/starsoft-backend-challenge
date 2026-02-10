import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!@paralleldrive/cuid2|uuid)/'],
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.res.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^repo/(.*)$': '<rootDir>/repo/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^core/(.*)$': '<rootDir>/core/$1',
    '^uuid$': require.resolve('uuid'),
  },
  setupFiles: ['dotenv/config'],
};

export default config;
