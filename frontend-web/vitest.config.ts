import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        fileParallelism: false,
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