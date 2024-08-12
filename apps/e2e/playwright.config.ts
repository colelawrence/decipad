import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export const STORAGE_STATE = path.join(__dirname, './utils/src/user.json');
export const STORAGE_STATE2 = path.join(__dirname, './utils/src/user2.json');

export const STORAGE_STATE_PRODUCTION = path.join(
  __dirname,
  './utils/src/user_production.json'
);

export const STORAGE_STATE_STAGING = path.join(
  __dirname,
  './utils/src/user_staging.json'
);

const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 100_000,

  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 30_000,
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixels: 1000,
      maxDiffPixelRatio: 0.2,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  workers: '80%',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'blob' : 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 60_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? undefined : 'retain-on-failure',
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000/',
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup_localhost',
      testMatch: '**/**/login-localhost.setup.ts',
      testDir: './utils/src',
    },
    {
      name: 'setup_production',
      testMatch: '**/**/login-production.setup.ts',
      testDir: './utils/src',
    },
    {
      name: 'setup_staging',
      testMatch: '**/**/login-staging.setup.ts',
      testDir: './utils/src',
    },
    {
      name: 'regression',
      dependencies: ['setup_production'],
      testDir: './tests/regression',
      testMatch: '**/**/*.regression.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PRODUCTION,
        trace: 'retain-on-failure',
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
    },
    {
      name: 'staging',
      dependencies: ['setup_staging'],
      testDir: './tests/staging',
      testMatch: '**/**/*.staging.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_STAGING,
        trace: 'retain-on-failure',
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
    },
    {
      name: 'smoke',
      dependencies: ['setup_localhost'],
      testDir: './tests/smoke',
      testMatch: '**/**/*.smoke.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        trace: 'retain-on-failure',
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
      timeout: 200000,
    },
    {
      name: 'chromium',
      dependencies: ['setup_localhost'],
      testMatch: '**/*.spec.ts',
      testIgnore: '**/**/*.smoke.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        trace: 'retain-on-failure',
        contextOptions: {
          // chromium-specific permissions
          permissions: ['clipboard-read', 'clipboard-write'],
        },
      },
    },
  ],
};

export default config;
