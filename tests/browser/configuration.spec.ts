/** Native controls retain source state and capture policies only at piece spawn. */
import {test,expect} from '@playwright/test';
async function frozen(page:import('@playwright/test').Page){
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));await page.addInitScript(()=>{Math.random=()=>0;});await page.goto('/');
}
test('six live controls preserve queue/hold and defer changed lock policies',async({page})=>{
 await frozen(page);await page.keyboard.press('Enter');
 const select=(label:string,value:string)=>page.getByLabel(label,{exact:true}).selectOption(value);
 const focus=()=>page.locator('#board').focus();
 const pixel=()=>page.locator('#board').evaluate((c:HTMLCanvasElement)=>[...c.getContext('2d')!.getImageData(3*28+14,19*28+14,1,1).data].slice(0,3));
 await select('Ghost visibility','hide');expect(await pixel()).toEqual([10,19,32]);await select('Ghost visibility','show');expect((await pixel())[1]).toBeGreaterThan(20);
 await select('Hard drop','off');await select('Next-piece preview','off');await select('Hold piece','off');await expect(page.locator('#next')).toHaveText('OFF');await expect(page.locator('#held')).toHaveText('OFF');
 await focus();await page.keyboard.press('Space');await page.keyboard.press('c');await expect(page.locator('#score')).toHaveText('0');
 await select('Next-piece preview','on');await expect(page.locator('#next')).toHaveText('Z');await select('Hold piece','on');await focus();await page.keyboard.press('c');await expect(page.locator('#held')).toHaveText('I');await expect(page.locator('#next')).toHaveText('T');
 await select('Hold piece','off');await select('Hold piece','on');await focus();await page.keyboard.press('c');await expect(page.locator('#held')).toHaveText('I');await expect(page.locator('#hold-state')).toHaveText('USED');
 await select('Hard drop','on');await select('Hard-drop locking','immediate');await select('General locking','failed-down');await focus();await page.keyboard.press('Space');await expect(page.locator('#next')).toHaveText('T');
 await page.clock.runFor(1016);await expect(page.locator('#next')).toHaveText('S');await page.keyboard.press('Space');await expect(page.locator('#next')).toHaveText('O');
});
test('ready selections govern the initial failed-down piece',async({page})=>{
 await frozen(page);await page.getByLabel('General locking',{exact:true}).selectOption('failed-down');await page.getByRole('button',{name:/Start game/}).click();
 await page.keyboard.press('Space');await expect(page.locator('#next')).toHaveText('Z');await page.keyboard.press('ArrowDown');await expect(page.locator('#next')).toHaveText('T');await expect(page.locator('#score')).toHaveText('38');
});
