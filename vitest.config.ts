/** Run pure contracts separately from the browser acceptance suites. */
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts'] } });
