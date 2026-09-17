// @ts-check
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4173/', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/server.mjs', port: 4173, reuseExistingServer: true, timeout: 10_000 },
  projects: [
    { name: 'phone-360', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 780 } } },
    { name: 'phone-390', use: { ...devices['iPhone 14'], defaultBrowserType: 'chromium', browserName: 'chromium' } },
    { name: 'phone-412', use: { ...devices['Pixel 7'] } },
    { name: 'tablet-768', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true } },
    { name: 'laptop-1024', use: { browserName: 'chromium', viewport: { width: 1024, height: 768 } } },
    { name: 'desktop-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
});
