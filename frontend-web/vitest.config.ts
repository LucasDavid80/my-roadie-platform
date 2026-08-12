import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        // Run in jsdom with single fork pool to avoid worker startup timeouts during coverage
        environment: 'jsdom',
        pool: 'forks',
        singleFork: true,
        globals: true,
        setupFiles: './src/test/setup.ts',
        exclude: ['**/node_modules/**', '**/tests/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'clover'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});