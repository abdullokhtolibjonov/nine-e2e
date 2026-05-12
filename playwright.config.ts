import { defineConfig, devices } from '@playwright/test';
import { getLocalSecretsIfExists } from '@helpers/getAwsParameters';

export default (async () => {
  const secrets = await getLocalSecretsIfExists();

  return defineConfig({
    testDir: './tests',
    globalSetup: './global-setup.ts',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 4 : 3,
    timeout: 30_000,

    expect: {
      timeout: 10_000,
    },

    reporter: [
      ['list'],
      ['html'],
      ['junit', { outputFile: 'reports/junit/results.xml' }],
    ],

    use: {
      baseURL: secrets.BASE_URL,
      headless: false,
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      actionTimeout: 10_000,
      navigationTimeout: 30_000,
    },

    projects: [
      // Main E2E suite
      {
        name: 'chromium-e2e',
        use: {
          ...devices['Desktop Chrome'],
          storageState: '.auth/admin.json',
        },
        testMatch: 'tests/e2e/**/*.spec.ts',
      },
      // API tests — no browser needed
      {
        name: 'api',
        use: { ...devices['Desktop Chrome'] },
        testMatch: 'tests/api/**/*.spec.ts',
      },
      // Smoke — no auth dependency, fast feedback
      {
        name: 'smoke',
        use: { ...devices['Desktop Chrome'] },
        testMatch: 'tests/smoke/**/*.spec.ts',
      },
    ],
  });
})();
