/** Real cookie, reload and history behavior; injected failures are explicitly modeled. */
import {test,expect} from '@playwright/test';
const cases=[['ghost','show','hide'],['hardDrop','on','off'],['next','on','off'],['hardDropLock','follow','immediate'],['lock','interval','failed-down'],['hold','on','off']] as const;
for(const [key,defaultValue,alternate] of cases)test(`${key}: explicit defaults, changed value and omitted reload`,async({page,context})=>{
 await context.addCookies([{name:`tetris_${key}`,value:alternate,url:'http://127.0.0.1:4173/'}]);
 await page.goto(`/?foreign=keep&${key}=${defaultValue}#anchor`);const select=page.locator(`#setting-${key}`);
 await expect(select).toHaveValue(defaultValue);expect((await context.cookies()).find(c=>c.name===`tetris_${key}`)?.value).toBe(defaultValue);
 const length=await page.evaluate(()=>{history.replaceState({retained:17},'');return history.length;});
 await select.selectOption(alternate);const url=new URL(page.url());expect(url.searchParams.getAll(key)).toEqual([alternate]);expect(url.searchParams.get('foreign')).toBe('keep');expect(url.hash).toBe('#anchor');
 expect(await page.evaluate(()=>history.state)).toEqual({retained:17});expect(await page.evaluate(()=>history.length)).toBe(length);
 const cookies=(await context.cookies()).filter(c=>c.name.startsWith('tetris_'));expect(cookies).toHaveLength(1);expect(cookies[0]).toMatchObject({value:alternate,path:'/',sameSite:'Lax',secure:false});expect(cookies[0].expires).toBeGreaterThan(Date.now()/1000);
 await page.goto('/?foreign=omitted#again');await expect(select).toHaveValue(alternate);await page.reload();await expect(select).toHaveValue(alternate);expect(new URL(page.url()).searchParams.has(key)).toBe(false);
});
test('mixed valid invalid duplicate and omitted keys resolve independently',async({page,context})=>{
 await context.addCookies(cases.map(([key,,value])=>({name:`tetris_${key}`,value,url:'http://127.0.0.1:4173/'})));
 await page.goto('/?ghost=dynamic&hardDrop=on&next=BAD&hold=on&hold=on&unknown=x#keep');
 for(const [key,value] of Object.entries({ghost:'dynamic',hardDrop:'on',next:'off',hardDropLock:'immediate',lock:'failed-down',hold:'off'}))await expect(page.locator(`#setting-${key}`)).toHaveValue(value);
 await page.locator('#setting-hold').selectOption('on');const url=new URL(page.url());expect(url.searchParams.getAll('hold')).toEqual(['on']);expect(url.searchParams.get('next')).toBe('BAD');expect(url.searchParams.get('unknown')).toBe('x');expect(url.hash).toBe('#keep');
});
test('modeled cookie failure preserves live selection and independent URL writes',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(document,'cookie',{get:()=>'',set:()=>{throw new Error('blocked');}}));
 await page.goto('/?hold=off');await expect(page.locator('#setting-hold')).toHaveValue('off');await expect(page.locator('#settings-status')).toContainText('Cookies are unavailable');
 await page.locator('#setting-ghost').selectOption('hide');expect(new URL(page.url()).searchParams.get('ghost')).toBe('hide');await page.reload();await expect(page.locator('#setting-ghost')).toHaveValue('hide');await page.locator('#start').click();await expect(page.locator('#pause')).toBeEnabled();
});
test('modeled history failure preserves cookie selection across reload',async({page,context})=>{
 await page.addInitScript(()=>{History.prototype.replaceState=()=>{throw new Error('blocked');};});await page.goto('/');
 await page.locator('#setting-hold').selectOption('off');await expect(page.locator('#settings-status')).toContainText('URL could not be updated');expect(new URL(page.url()).searchParams.has('hold')).toBe(false);expect((await context.cookies()).find(c=>c.name==='tetris_hold')?.value).toBe('off');
 await page.reload();await expect(page.locator('#setting-hold')).toHaveValue('off');await page.locator('#start').click();await expect(page.locator('#pause')).toBeEnabled();
});
