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
