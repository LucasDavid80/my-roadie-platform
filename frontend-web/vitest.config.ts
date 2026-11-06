import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        pool: 'threads',
        fileParallelism: false,
        exclude: ['**/node_modules/**', '**/tests/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov', 'clover'],
            reportsDirectory: './coverage/vitest',
            // sem isso, arquivos que nenhum teste importa ficam fora do relatório
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/test/**',
                'src/**/*.d.ts',
                'src/**/*.test.{ts,tsx}',
                'src/**/*.spec.{ts,tsx}',
                'src/**/layout.tsx',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});