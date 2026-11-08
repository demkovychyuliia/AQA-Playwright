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

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: getEnv('BASE_URL'),

    httpCredentials: {
      username: getEnv('BASIC_AUTH_USERNAME'),
      password: getEnv('BASIC_AUTH_PASSWORD'),
    },

    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    {
      name: 'chromium',
      testIgnore: [/auth\.setup\.ts/, /garage-auth\.spec\.ts/],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'chromium-auth',
      testMatch: /garage-auth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      testIgnore: [/auth\.setup\.ts/, /garage-auth\.spec\.ts/],
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      testIgnore: [/auth\.setup\.ts/, /garage-auth\.spec\.ts/],
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});
