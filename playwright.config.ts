import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    ...(process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"]
      ? {
          launchOptions: {
            executablePath: process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"],
          },
        }
      : {}),
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node scripts/preview-server.mjs",
    port: 4173,
    reuseExistingServer: !process.env["CI"],
  },
  projects: [
    {
      name: "phone",
      use: {
        ...devices["iPhone 13"],
        deviceScaleFactor: 1,
        defaultBrowserType: "chromium",
      },
    },
    {
      name: "small-phone",
      use: {
        viewport: { width: 320, height: 740 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
      },
    },
  ],
});
