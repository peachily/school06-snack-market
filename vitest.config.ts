import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['apps/web/vite.config.ts', 'packages/game-core/vitest.config.ts'],
  },
});
