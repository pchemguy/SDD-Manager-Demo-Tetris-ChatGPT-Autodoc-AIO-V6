/** Completed games reach the native panel; no score or completion test hooks. */
import {test,expect} from '@playwright/test';
test('eleven real zero-score completions retain ten, restart retains and reload clears',async({page},info)=>{
 test.setTimeout(30000);await page.clock.install({time:new Date('2026-01-01T00:00:00.000Z')});await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/?ghost=hide');
 for(let i=0;i<11;i++){
  await page.locator('#start').click();await page.clock.fastForward(240000);await expect(page.locator('#status')).toHaveText('GAME OVER');await expect(page.locator('#results tr')).toHaveCount(Math.min(i+1,10));
 }
 await page.locator('.leaderboard-card').screenshot({path:info.outputPath('top-ten.png')});
 const rows=page.locator('#results tr');expect(await rows.locator('td:nth-child(2)').allTextContents()).toEqual(Array(10).fill('0'));
 const ids=await rows.evaluateAll(nodes=>nodes.map(n=>(n as HTMLElement).dataset.resultId));expect(new Set(ids).size).toBe(10);await expect(page.getByRole('columnheader',{name:'Completed (UTC)'})).toBeVisible();
 await page.locator('#start').click();await expect(rows).toHaveCount(10);await page.reload();await expect(rows).toHaveCount(0);await expect(page.locator('#leaderboard-empty')).toBeVisible();await expect(page.locator('#setting-ghost')).toHaveValue('hide');
});
test('abandoned runs are excluded and completed score orders ahead of zero',async({page})=>{
 await page.clock.install({time:new Date('2026-01-01T00:00:00.000Z')});await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.locator('#start').click();await page.keyboard.press('ArrowDown');await page.locator('#start').click();await expect(page.locator('#results tr')).toHaveCount(0);
 await page.clock.fastForward(240000);await expect(page.locator('#results tr')).toHaveCount(1);await page.locator('#start').click();await page.keyboard.press('ArrowDown');await page.clock.fastForward(240000);const rows=page.locator('#results tr');await expect(rows).toHaveCount(2);expect(await rows.locator('td:nth-child(2)').allTextContents()).toEqual(['1','0']);expect(await rows.locator('time').first().getAttribute('datetime')).toMatch(/^2026-01-01T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));await expect(rows).toHaveCount(0);
});
