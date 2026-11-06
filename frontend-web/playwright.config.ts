import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${PORT}`;
const WITH_COVERAGE = !!process.env.E2E_COVERAGE;

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    timeout: 60000,
    reporter: WITH_COVERAGE
        ? [
            ['list'],
            [
                'monocart-reporter',
                {
                    name: 'E2E Coverage',
                    outputFile: './coverage/e2e/report.html',
                    coverage: {
                        outputDir: './coverage/e2e',
                        reports: ['html', 'lcov', 'console-summary'],
                        entryFilter: (entry: { url: string }) =>
                            entry.url.includes('/_next/static/'),
                        sourceFilter: (sourcePath: string) =>
                            sourcePath.includes('src/') &&
                            !sourcePath.includes('node_modules'),
                    },
                },
            ],
        ]
        : 'list',
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