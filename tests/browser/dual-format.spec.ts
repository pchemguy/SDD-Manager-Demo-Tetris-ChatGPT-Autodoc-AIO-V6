/** Round-trip actual downloads; the static mount exercises real relative URLs. */
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
async function bytes(download:import('@playwright/test').Download){const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks);}
async function upload(page:import('@playwright/test').Page,data:Buffer,name:string){const chooser=page.waitForEvent('filechooser');await page.locator('#restore').click();await (await chooser).setFiles({name,mimeType:'application/octet-stream',buffer:data});}
async function save(page:import('@playwright/test').Page,format:string){await page.getByLabel('Save format',{exact:true}).selectOption(format);const offered=page.waitForEvent('download');await page.locator('#save').click();const data=await bytes(await offered);await expect(page.locator('#file-status')).toContainText('Download offered');return data;}
const timestamp='2026-01-01T00:00:00.000Z';
const ten=Array.from({length:10},(_,i)=>({id:['a','Z','A','b','c','d','e','f','g','max9'][i],score:i===9?9007199254740991:i%3,timestamp:i===9?'9999-12-31T23:59:59.999Z':i===0?'0001-01-01T00:00:00.000Z':timestamp}));
const ranked=['max9','A','d','g','Z','c','f','a','b','e'].map(id=>ten.find(result=>result.id===id)!);
test('JSON to SQLite to JSON preserves empty and ten exact record values',async({page})=>{
 test.setTimeout(40000);await page.goto('/');
 for(const [sample,expected] of [[[],[]],[ten,ranked]]){
  await upload(page,Buffer.from(JSON.stringify({formatVersion:1,results:sample})),'source.json');await expect(page.locator('#file-status')).toContainText('Restored '+sample.length);const database=await save(page,'sqlite');expect(database.subarray(0,16).toString()).toBe('SQLite format 3\0');
  await upload(page,Buffer.from(JSON.stringify({formatVersion:1,results:[{id:'replacement',score:3,timestamp}]})),'different.json');await expect(page.locator('#file-status')).toContainText('Restored 1');
  await upload(page,database,'database-with-json-extension.json');await expect(page.locator('#file-status')).toContainText('Restored '+sample.length);expect(JSON.parse((await save(page,'json')).toString())).toEqual({formatVersion:1,results:expected});await expect.poll(()=>page.workers().length).toBe(0);
 }
});
test('exact static package works under a subdirectory with local worker WASM schema and icon',async({page})=>{
 test.skip(process.env.TETRIS_PACKAGE_TEST!=='1','Requires the extracted static package and its real HTTP prefix mount.');test.setTimeout(30000);
 const requests:string[]=[];page.on('request',request=>{if(request.url().startsWith('http'))requests.push(request.url());});await page.goto('/demo/');const icon=await page.locator('link[rel=icon]').getAttribute('href');const resolved=new URL(icon!,page.url());expect(resolved.pathname.startsWith('/demo/')).toBe(true);expect((await page.request.get(resolved.href)).ok()).toBe(true);
 await upload(page,Buffer.from(JSON.stringify({formatVersion:1,results:ten})),'scores.json');await expect(page.locator('#file-status')).toContainText('Restored 10');const database=await save(page,'sqlite');await upload(page,database,'scores.data');await expect(page.locator('#file-status')).toContainText('Restored 10');expect(JSON.parse((await save(page,'json')).toString()).results).toEqual(ranked);
 const offered=page.waitForEvent('download');await page.getByRole('link',{name:'Download JSON Schema'}).click();expect(await bytes(await offered)).toEqual(readFileSync('docs/dev/spec/LEADERBOARD-SCHEMA.json'));
 expect(requests.some(url=>new URL(url).pathname.endsWith('.wasm'))).toBe(true);expect(requests.some(url=>new URL(url).pathname.includes('sqlite.worker-'))).toBe(true);expect(requests.every(url=>new URL(url).origin===new URL(page.url()).origin&&new URL(url).pathname.startsWith('/demo/'))).toBe(true);await expect.poll(()=>page.workers().length).toBe(0);
});
