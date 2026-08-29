import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    timeout: 60000,
    reporter: 'list',
    expect: {
        timeout: 15000,
    },
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});