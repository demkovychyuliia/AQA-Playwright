import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { getEnv } from './utils/env';

// Select test environment (qauto by default)
const testEnv = process.env.TEST_ENV || 'qauto';

// Resolve environment configuration file
const envPath = path.resolve(process.cwd(), `.env.${testEnv}`);

// Check whether the environment file exists
if (!fs.existsSync(envPath)) {
  throw new Error(`Configuration file not found: ${envPath}`);
}

// Load environment variables from the selected .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw result.error;
}

// Load authentication credentials
const auth = process.env.CI
  ? {
      username: process.env.BASIC_AUTH_USERNAME,
      password: process.env.BASIC_AUTH_PASSWORD,
    }
  : JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, 'config/auth.json'),
        'utf-8'
      )
    );

if (!auth.username || !auth.password) {
  throw new Error('HTTP Basic Authentication credentials are missing.');
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: 'html',

  /* Shared settings for all projects */
  use: {
    baseURL: getEnv('BASE_URL'),

    httpCredentials: {
      username: auth.username,
      password: auth.password,
    },

    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});