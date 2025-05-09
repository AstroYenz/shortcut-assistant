module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.chromeSetup.js', './tests/setup.ts'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    'src/js/**/*.ts',
    'src/react/**/*.tsx',
    'src/react/**/*.ts',
    '!src/react/client/components/ui/**'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@sx/(.*)$': '<rootDir>/src/js/$1',
    '^@/(.*)$': '<rootDir>/src/react/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/?(*.)+(test).(js|ts|tsx)']
}
