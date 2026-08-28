import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 1000_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',

  use: {
    baseURL: 'https://test-v2-panel.lyxa.ai',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    permissions: ['notifications'],
  },

  projects: [
    // 1) Logs in once and saves the session to .auth/admin.json
    {
      name: 'setup',
      testDir: './src/consoles/admin',
      testMatch: /auth\.setup\.ts/,
      use: { launchOptions: { slowMo: 800 } }, // 800ms pause before every action
    },

    // 2) All tests reuse that authenticated session
    {
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',
        launchOptions: { slowMo: 800 }, // 800ms before every action in the tests
      },
      
      dependencies: ['setup'],
    },
  ],
});