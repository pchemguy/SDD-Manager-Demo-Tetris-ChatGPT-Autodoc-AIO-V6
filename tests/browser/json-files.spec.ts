/** Real picker/download bytes exercise replacement through normal controls. */
import {test,expect} from '@playwright/test';
const results=[{id:'low',score:1,timestamp:'2026-01-01T00:00:00.000Z'},{id:'high',score:9007199254740991,timestamp:'0001-01-01T00:00:00.000Z'}];
async function downloadBytes(download:import('@playwright/test').Download){const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks);}
test('downloads empty JSON and restores/re-exports stable ranked records through native UI',async({page})=>{
 await page.goto('/');let offered=page.waitForEvent('download');await page.getByRole('button',{name:'Save',exact:true}).click();let download=await offered;expect(download.suggestedFilename()).toMatch(/\.json$/);expect(JSON.parse((await downloadBytes(download)).toString())).toEqual({formatVersion:1,results:[]});await expect(page.locator('#file-status')).toContainText('Download offered');
 const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Restore',exact:true}).click();await (await chooser).setFiles({name:'scores.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({formatVersion:1,results}))});await expect(page.locator('#results tr')).toHaveCount(2);await expect(page.locator('#file-status')).toContainText('Restored 2');
 offered=page.waitForEvent('download');await page.getByRole('button',{name:'Save',exact:true}).click();download=await offered;expect(JSON.parse((await downloadBytes(download)).toString())).toEqual({formatVersion:1,results:[results[1],results[0]]});await expect(page.locator('#file-status')).toContainText('Download offered');
});
test('file pause composes with user pause and invalid restore is atomic',async({page})=>{
 await page.clock.install();await page.goto('/');await page.locator('#start').click();await page.getByRole('button',{name:'Pause',exact:true}).click();
 const picker=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Restore',exact:true}).click();await expect(page.locator('#start')).toBeDisabled();await expect(page.getByRole('button',{name:'Save',exact:true})).toBeDisabled();await (await picker).setFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({formatVersion:1,results}))});await expect(page.locator('#file-status')).toContainText('Restored 2');await expect(page.locator('#status')).toHaveText('PAUSED');
 const before=await page.locator('#results').innerHTML();const second=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Restore',exact:true}).click();await (await second).setFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({formatVersion:1,results:[results[0],results[0]]}))});await expect(page.locator('#file-status')).toContainText('Error');expect(await page.locator('#results').innerHTML()).toBe(before);await expect(page.locator('#status')).toHaveText('PAUSED');await expect(page.locator('#start')).toBeEnabled();
});
test('modeled download DOM failure revokes its URL and releases controls',async({page})=>{
 await page.addInitScript(()=>{
  const live=new Set<string>();(window as unknown as {liveDownloads:Set<string>}).liveDownloads=live;
  const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=create(blob);live.add(url);return url;};URL.revokeObjectURL=url=>{live.delete(url);revoke(url);};
  const append=Element.prototype.append;Element.prototype.append=function(...nodes){if(nodes.some(n=>n instanceof HTMLAnchorElement))throw new Error('Download DOM unavailable');append.apply(this,nodes);};
 });
 await page.goto('/');await page.getByRole('button',{name:'Save',exact:true}).click();await expect(page.locator('#file-status')).toContainText('Error');await expect(page.locator('#start')).toBeEnabled();expect(await page.evaluate(()=>(window as unknown as {liveDownloads:Set<string>}).liveDownloads.size)).toBe(0);
});
