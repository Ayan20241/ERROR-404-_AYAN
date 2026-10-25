import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3101',
    trace: 'retain-on-failure',
    launchOptions: {
      args: [
        '--enable-unsafe-swiftshader',
        '--use-gl=angle',
        '--use-angle=swiftshader',
      ],
    },
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3101',
    url: 'http://127.0.0.1:3101/api/health',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'playwright-public-test-key',
      NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3101',
      NEXT_PUBLIC_MAP_STYLE_URL:
        'https://tiles.openfreemap.org/styles/liberty',
    },
  },
});
