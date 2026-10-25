/** Native modern controls through the real app and production renderer. */
import {test,expect} from '@playwright/test';
test('next preview follows source consumption and a native I wall kick succeeds',async({page})=>{
 await page.clock.install();await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.keyboard.press('Enter');
 await expect(page.locator('#next')).toHaveText('Z');
 await page.keyboard.press('ArrowUp');for(let i=0;i<7;i++)await page.keyboard.press('ArrowLeft');await page.keyboard.press('z');
 const columns=await page.locator('#board').evaluate((c:HTMLCanvasElement)=>{
  const ctx=c.getContext('2d')!;const out=[];for(let x=0;x<10;x++){const d=ctx.getImageData(x*28+14,14,1,1).data;if(d[1]>100)out.push(x);}return out;
 });expect(columns).toEqual([0,1,2,3]);
 for(let i=0;i<20;i++)await page.keyboard.press('ArrowDown');await page.clock.fastForward(1000);
 await expect(page.locator('#next')).toHaveText('T');
});
test('ghost previews floor and stack drops and held Space never drops the next piece',async({page},info)=>{
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
 await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.keyboard.press('Enter');
 const pixel=(x:number,y:number)=>page.locator('#board').evaluate((c:HTMLCanvasElement,p:{x:number;y:number})=>[...c.getContext('2d')!.getImageData(p.x*28+14,p.y*28+14,1,1).data],{x,y});
 const ghost=await pixel(3,19);expect(ghost[1]).toBeGreaterThan(20);expect(ghost[1]).toBeLessThan(150);
 await page.screenshot({path:info.outputPath('ghost-floor.png')});
 await page.keyboard.down('Space');await expect(page.locator('#score')).toHaveText('38');expect((await pixel(3,19))[1]).toBe(217);
 await page.clock.runFor(999);await expect(page.locator('#next')).toHaveText('Z');
 await page.clock.runFor(17);await expect(page.locator('#next')).toHaveText('T');await page.keyboard.down('Space');await expect(page.locator('#score')).toHaveText('38');await page.keyboard.up('Space');
 const stackGhost=await pixel(4,18);expect(stackGhost[0]).toBeLessThan(150);
 await page.keyboard.press('Space');await expect(page.locator('#score')).toHaveText('74');expect((await pixel(4,18))[0]).toBe(250);
});
