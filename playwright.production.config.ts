import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: '.',
  testMatch: ['tests/*.spec.ts', 'deployment-tests/*.spec.ts'],
  use: { ...baseConfig.use, baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npm start',
    env: { PORT: '4173', NODE_ENV: 'production' },
    url: 'http://localhost:4173/health',
    reuseExistingServer: false,
  },
});
