/** Separate startup checks own fresh Vite caches; never reuse a warm application server. */
import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testDir:'tests/dev',webServer:undefined,outputDir:'test-results/dev-startup'});
