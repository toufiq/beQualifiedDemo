import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  retries: 3,
  fullyParallel: false,
  reporter: [
    ['line'],
    ['html', { open: 'never' }],
    ['allure-playwright']
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  }
};

export default config;
