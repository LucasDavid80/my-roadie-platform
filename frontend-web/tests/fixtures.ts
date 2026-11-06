import { test as base, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export const test = base.extend<{ autoCoverage: void }>({
    autoCoverage: [
        async ({ page, browserName }, use, testInfo) => {
            const enabled = !!process.env.E2E_COVERAGE && browserName === 'chromium';

            if (enabled) {
                await page.coverage.startJSCoverage({ resetOnNavigation: false });
            }

            await use();

            if (enabled) {
                const coverage = await page.coverage.stopJSCoverage();
                await addCoverageReport(coverage, testInfo);
            }
        },
        { auto: true },
    ],
});

export { expect };