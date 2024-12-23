module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js', './tests/setup.ts'],
  collectCoverageFrom: ['.old_src/js/**/*.js', '.old_src/js/**/*.ts', '!.old_src/js/coverage/**'],
  moduleNameMapper: {
    '^@sx/(.*)$': '<rootDir>/.old_src/js/$1'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  roots: ['<rootDir>/.old_src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).(js|ts)']
}
