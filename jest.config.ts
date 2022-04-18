import type { Config } from '@jest/types';
//   testEnvironment: 'node',
//   moduleFileExtensions: ["ts", "js"],
//   roots: ['<rootDir>/src'],
//   collectCoverageFrom: [
//     "src/**/*.ts",
//     "!**/node_modules/**"
//   ],

const config: Config.InitialOptions = {
  testEnvironment: 'node',
  moduleFileExtensions: ["ts", "js"],
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};

export default config;
