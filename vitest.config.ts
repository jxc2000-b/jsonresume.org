import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{js,ts,tsx}', 'lib/ats/**/*.test.js'],
    exclude: ['node_modules/**', 'packages/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['app/src/**/*.{js,ts,tsx}'],
      exclude: [
        'node_modules/**',
        'packages/**',
        'coverage/**',
        '**/*.config.*',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app/src'),
      '@lib': path.resolve(__dirname, 'lib'),
    },
  },
});
