/** Isolated compatible managed browsers; opt-in Firefox override is trusted-local-only. */
import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH??=resolve('.cache/playwright');
export default defineConfig({
 testDir:'tests/browser',timeout:15000,globalTimeout:300000,workers:1,
 use:{baseURL:'http://127.0.0.1:4173',headless:true,viewport:{width:1100,height:820},actionTimeout:7000,screenshot:'only-on-failure'},
 projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'firefox',use:{browserName:'firefox',launchOptions:process.env.TETRIS_FIREFOX_NO_CONTENT_SANDBOX==='1'?{env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}}:{}}}],
 webServer:{command:process.env.TETRIS_PACKAGE_TEST==='1'?'python -m http.server 4173 --bind 127.0.0.1 --directory .cache/package-test':'npm run dev -- --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:20000},
});
