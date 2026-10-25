/** Native interaction and Canvas checks through the actual application server. */
import {test,expect} from '@playwright/test';
test('starts the loop and responds to native keyboard movement',async({page},info)=>{
 await page.goto('/');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await expect(page.locator('#status')).toHaveText('READY');await page.getByRole('button',{name:/Start game/}).click();
 await expect(page.locator('#status')).toHaveText('PLAYING');const canvas=page.locator('canvas');await expect(canvas).toBeFocused();
 const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.keyboard.press('ArrowLeft');
 await expect.poll(async()=>await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())!==before).toBe(true);
 await page.screenshot({path:info.outputPath('playable-loop.png')});expect(errors).toEqual([]);
});
test('renders actual colored blocks and has a usable desktop board',async({page})=>{
 await page.goto('/');await page.keyboard.press('Enter');await expect(page.locator('#status')).toHaveText('PLAYING');
 const result=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>{const data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let colored=0;for(let i=0;i<data.length;i+=4)if(data[i]>60||data[i+1]>65||data[i+2]>75)colored++;return {colored,width:c.width,height:c.height};});
 expect(result.colored).toBeGreaterThan(400);expect(result.width).toBe(280);expect(result.height).toBe(560);
});
test('restores input after the modeled persisted-page lifecycle',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Start game/}).click();
 await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
 const canvas=page.locator('canvas');const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await page.keyboard.press('ArrowRight');await expect.poll(async()=>await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())!==before).toBe(true);
 const afterInput=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 await expect.poll(async()=>await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())!==afterInput,{timeout:2500}).toBe(true);
});
test('falls on the real clock and responds to native rotation',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.getByRole('button',{name:/Start game/}).click();
 const canvas=page.locator('canvas');const top=()=>canvas.evaluate((c:HTMLCanvasElement)=>{
  const data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(data[i]>60||data[i+1]>65||data[i+2]>75)return Math.floor(y/28);}return -1;
 });
 const initial=await top();await expect.poll(top,{timeout:2500}).toBeGreaterThan(initial);
 const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.keyboard.press('ArrowUp');
 await expect.poll(async()=>await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())!==before).toBe(true);
});
test('remains interactive after browser navigation away and Back',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:/Start game/}).click();await page.goto('/?other=1');await page.goBack();
 if(await page.locator('#status').textContent()==='READY')await page.getByRole('button',{name:/Start game/}).click();
 await page.locator('canvas').focus();const before=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.keyboard.press('ArrowLeft');
 await expect.poll(async()=>await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL())!==before).toBe(true);
});
test('shows stats and pauses resumes loses and restarts through real controls',async({page})=>{
 await page.clock.install();await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.getByRole('button',{name:/Start game/}).click();
 await expect(page.locator('#score')).toHaveText('0');await page.keyboard.press('ArrowDown');await expect(page.locator('#score')).toHaveText('1');
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.locator('#status')).toHaveText('PAUSED');
 const paused=await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL());await page.clock.fastForward(60000);await page.keyboard.press('ArrowRight');
 expect(await page.locator('canvas').evaluate((c:HTMLCanvasElement)=>c.toDataURL())===paused).toBe(true);
 await page.getByRole('button',{name:'Resume',exact:true}).click();await expect(page.locator('#status')).toHaveText('PLAYING');
 await page.clock.fastForward(240000);await expect(page.locator('#status')).toHaveText('GAME OVER');
 await page.getByRole('button',{name:/Restart/}).click();await expect(page.locator('#score')).toHaveText('0');await expect(page.locator('#level')).toHaveText('1');await expect(page.locator('#lines')).toHaveText('0');
});
test('clears and scores a line with deterministic pieces and native keys',async({page})=>{
 await page.clock.install();await page.addInitScript(()=>{const draws=[0,0,3/7];Math.random=()=>draws.shift()??0;});await page.goto('/');await page.getByRole('button',{name:/Start game/}).click();
 const descend=async()=>{for(let i=0;i<20;i++)await page.keyboard.press('ArrowDown');await page.clock.fastForward(1000);};
 for(let i=0;i<3;i++)await page.keyboard.press('ArrowLeft');await descend();
 await page.keyboard.press('ArrowRight');await descend();
 for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');await descend();
 await expect(page.locator('#lines')).toHaveText('1');expect(Number(await page.locator('#score').textContent())).toBeGreaterThanOrEqual(100);
});
test('gates Enter and handles one-shot pause keys without losing the run',async({page})=>{
 await page.clock.install();await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');await page.keyboard.press('Enter');await page.keyboard.press('ArrowDown');
 await page.keyboard.press('Enter');await expect(page.locator('#score')).toHaveText('1');
 await page.keyboard.down('p');await expect(page.locator('#status')).toHaveText('PAUSED');await page.keyboard.down('p');await expect(page.locator('#status')).toHaveText('PAUSED');await page.keyboard.up('p');
 await page.keyboard.press('Enter');await expect(page.locator('#status')).toHaveText('PAUSED');await expect(page.locator('#score')).toHaveText('1');
 await page.keyboard.press('Escape');await expect(page.locator('#status')).toHaveText('PLAYING');await page.clock.fastForward(240000);await expect(page.locator('#status')).toHaveText('GAME OVER');
 await page.keyboard.press('Enter');await expect(page.locator('#status')).toHaveText('PLAYING');await expect(page.locator('#score')).toHaveText('0');
});
