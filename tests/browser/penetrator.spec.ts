/** Earn funding naturally, then penetrate a bridge using the real game and keys. */
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const replay=JSON.parse(readFileSync('tests/fixtures/penetrator-replay.json','utf8')) as {draws:number[];well:{kind:string;orientation:number;x:number;y:number}[];dispose:string[]};
test('earns spends and locks a white penetrator below an occupied bridge',async({page},info)=>{
 test.setTimeout(30000);
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
 await page.addInitScript(draws=>{let index=0;Math.random=()=>draws[index++]??0;},replay.draws);await page.goto('/');await page.keyboard.press('Enter');
 await expect(page.locator('#bonus-count')).toHaveText('0');await expect(page.locator('#bonus-symbols')).toHaveText('');await page.keyboard.press('b');await expect(page.locator('#bonus-count')).toHaveText('0');
 const place=async(orientation:number,x:number)=>{
  if(orientation===3)await page.keyboard.press('z');else for(let n=0;n<orientation;n++)await page.keyboard.press('ArrowUp');
  for(let n=0;n<Math.abs(x-3);n++)await page.keyboard.press(x<3?'ArrowLeft':'ArrowRight');
  await page.keyboard.press('Space');await page.clock.runFor(1016);
 };
 await page.keyboard.press('c');for(const p of replay.well)await place(p.orientation,p.x);
 await page.keyboard.press('c');await place(1,7);
 await expect(page.locator('#lines')).toHaveText('4');await expect(page.locator('#bonus-count')).toHaveText('1');await expect(page.locator('#bonus-symbols')).toHaveText('⚡');
 for(const kind of replay.dispose)await place(0,7);
 await place(0,3);await place(0,3);
 await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');
 const pixel=(x:number,y:number)=>page.locator('#board').evaluate((c:HTMLCanvasElement,p:{x:number;y:number})=>[...c.getContext('2d')!.getImageData(p.x*28+14,p.y*28+14,1,1).data].slice(0,3),{x,y});
 expect(await pixel(2,0)).toEqual([245,214,92]);expect(await pixel(3,17)).toEqual([50,217,230]);
 const held=await page.locator('#held').textContent(),next=await page.locator('#next').textContent();
 await page.keyboard.press('b');await page.keyboard.press('ArrowDown');await expect(page.locator('#bonus-count')).toHaveText('0');await expect(page.locator('#bonus-symbols')).toHaveText('');await expect(page.locator('#penetrator-state')).toHaveText('ACTIVE');
 for(const [x,y] of [[2,0],[3,0],[2,1],[3,1]])expect(await pixel(x,y)).toEqual([255,255,255]);
 expect((await pixel(2,19))[0]).toBeGreaterThan(20);await page.keyboard.press('c');await expect(page.locator('#held')).toHaveText(held!);await expect(page.locator('#next')).toHaveText(next!);await expect(page.locator('#hold-state')).toHaveText('LOCKED');
 await page.screenshot({path:info.outputPath('white-penetrator.png')});
 await page.keyboard.press('Space');for(const [x,y] of [[2,18],[3,18],[2,19],[3,19]])expect(await pixel(x,y)).toEqual([255,255,255]);expect(await pixel(3,17)).toEqual([50,217,230]);
 await page.clock.runFor(1016);expect(await pixel(3,17)).toEqual([50,217,230]);expect(await pixel(3,19)).toEqual([245,214,92]);await expect(page.locator('#lines')).toHaveText('4');await expect(page.locator('#bonus-count')).toHaveText('0');
});
