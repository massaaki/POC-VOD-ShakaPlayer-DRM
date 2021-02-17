module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/next/'],
  testMatch: ['**/test.ts(x)?'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/ui/**/*.ts(x)?',
    '!**/*.test.ts',
    '!**/stories.tsx'
  ],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.ts'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^.+\\.(css|scss|sass)$': '<rootDir>/.jest/styleMock.ts'
  }
}
