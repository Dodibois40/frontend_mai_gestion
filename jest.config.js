module.exports = {
  projects: [
    // Configuration pour les tests backend (NestJS)
    {
      displayName: 'Backend',
      testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      collectCoverageFrom: [
        'backend/src/**/*.js',
        '!backend/src/**/*.d.ts',
        '!backend/src/**/*.interface.ts',
        '!backend/src/**/*.enum.ts',
        '!backend/src/main.ts',
      ],
      coverageDirectory: 'coverage/backend',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleFileExtensions: ['js', 'json'],
      rootDir: '.',
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
      testTimeout: 30000,
      verbose: true,
    },
    
    // Configuration pour les tests frontend (React)
    {
      displayName: 'Frontend',
      testMatch: ['<rootDir>/tests/frontend/**/*.test.{js,jsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: [
        '@testing-library/jest-dom',
        '<rootDir>/tests/frontend-setup.js'
      ],
      collectCoverageFrom: [
        'frontend/src/**/*.{js,jsx}',
        '!frontend/src/**/*.d.ts',
        '!frontend/src/main.jsx',
        '!frontend/src/vite-env.d.ts',
      ],
      coverageDirectory: 'coverage/frontend',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleFileExtensions: ['js', 'jsx', 'json'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/frontend/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': 'jest-transform-stub',
      },
      testTimeout: 10000,
      verbose: true,
    }
  ],
  
  // Configuration globale
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Patterns à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
  ],
  
  // Extensions de fichiers à transformer
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Variables d'environnement pour les tests
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  
  // Nettoyage automatique des mocks
  clearMocks: true,
  restoreMocks: true,
  
  // Rapport de couverture
  collectCoverageFrom: [
    'frontend/src/**/*.{js,jsx}',
    'backend/src/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
}; 