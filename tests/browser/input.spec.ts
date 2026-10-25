/** Native keys with a frozen controllable browser clock verify application repeat timing. */
import {test,expect,type Page} from '@playwright/test';
const leftColumn=(page:Page)=>page.locator('canvas').evaluate((c:HTMLCanvasElement)=>{
 const p=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
 for(let x=0;x<c.width;x++)for(let y=0;y<c.height;y++){const i=(y*c.width+x)*4;if(p[i]>60||p[i+1]>65||p[i+2]>75)return Math.floor(x/28);}return -1;
});
test.beforeEach(async({page})=>{
 await page.clock.install({time:0});await page.clock.pauseAt(1000);await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.keyboard.press('Enter');
});
test('repeats after 150 ms then every 50 ms and stops on release',async({page})=>{
 await page.keyboard.down('ArrowLeft');expect(await leftColumn(page)).toBe(2);
 await page.clock.runFor(149);expect(await leftColumn(page)).toBe(2);await page.clock.runFor(1);expect(await leftColumn(page)).toBe(1);
 await page.clock.runFor(50);expect(await leftColumn(page)).toBe(0);await page.keyboard.up('ArrowLeft');await page.clock.runFor(200);expect(await leftColumn(page)).toBe(0);
});
test('uses the latest horizontal direction and a fresh delay after releasing it',async({page})=>{
 await page.keyboard.down('ArrowLeft');await page.keyboard.down('ArrowRight');expect(await leftColumn(page)).toBe(3);
 await page.clock.runFor(150);expect(await leftColumn(page)).toBe(4);await page.keyboard.up('ArrowRight');await page.clock.runFor(149);expect(await leftColumn(page)).toBe(4);
 await page.clock.runFor(1);expect(await leftColumn(page)).toBe(3);await page.keyboard.up('ArrowLeft');
});
test('clears held Down across pause and requires a new press',async({page})=>{
 await page.keyboard.down('ArrowDown');await page.clock.runFor(150);await expect(page.locator('#score')).toHaveText('2');
 await page.keyboard.press('p');await page.clock.runFor(500);await expect(page.locator('#score')).toHaveText('2');await page.keyboard.press('Escape');await page.clock.runFor(300);await expect(page.locator('#score')).toHaveText('2');
 await page.keyboard.up('ArrowDown');await page.keyboard.press('ArrowDown');await expect(page.locator('#score')).toHaveText('3');
});
test('composes modeled window blur with user pause and resets held input',async({page})=>{
 await page.keyboard.down('ArrowDown');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('#status')).toHaveText('PAUSED');
 await page.clock.runFor(300);await expect(page.locator('#score')).toHaveText('1');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.locator('#status')).toHaveText('PLAYING');
 await page.clock.runFor(200);await expect(page.locator('#score')).toHaveText('1');await page.keyboard.up('ArrowDown');
 await page.keyboard.press('p');await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});await expect(page.locator('#status')).toHaveText('PAUSED');
});
test('does not steal native control keys and resets repeats on canvas blur',async({page})=>{
 await page.keyboard.down('ArrowDown');await page.getByRole('button',{name:/Restart/}).focus();await page.clock.runFor(300);await expect(page.locator('#score')).toHaveText('1');
 await page.keyboard.up('ArrowDown');await page.keyboard.press('ArrowDown');await expect(page.locator('#score')).toHaveText('1');
 await page.locator('canvas').focus();await page.keyboard.press('ArrowDown');await expect(page.locator('#score')).toHaveText('2');
});
test('uses modeled visibility state without clearing a user pause',async({page})=>{
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#status')).toHaveText('PAUSED');
 await page.clock.runFor(1000);await page.evaluate(()=>{delete (document as unknown as Record<string,unknown>).hidden;document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#status')).toHaveText('PLAYING');
 await page.keyboard.press('p');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));delete (document as unknown as Record<string,unknown>).hidden;document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#status')).toHaveText('PAUSED');
});
