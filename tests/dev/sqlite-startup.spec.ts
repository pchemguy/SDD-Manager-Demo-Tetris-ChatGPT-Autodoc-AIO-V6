/** Catch optimizer reloads that interrupt the first lazy SQLite operation. */
import {test,expect,type Download,type Page} from '@playwright/test';
import {createServer,type ViteDevServer} from 'vite';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,cpSync,symlinkSync} from 'node:fs';
import {resolve,join} from 'node:path';
import initSqlJs from 'sql.js';

const record={id:'cold-start-record',score:123,timestamp:'2026-10-25T12:00:00.000Z'};
async function upload(page:Page,buffer:Buffer,name:string){
 const choice=page.waitForEvent('filechooser');await page.locator('#restore').click();
 await(await choice).setFiles({name,mimeType:'application/octet-stream',buffer});
}
async function bytes(download:Download){
 const stream=await download.createReadStream(),chunks:Buffer[]=[];
 for await(const chunk of stream!)chunks.push(Buffer.from(chunk));return Buffer.concat(chunks);
}
for(const linked of [false,true])test.describe(linked?'linked layout with filesystem worker HTML fallback':'ordinary project',()=>{
 let server:ViteDevServer|undefined,cache:string,origin:string;
 test.beforeEach(async({page})=>{
  const source=resolve('.');mkdirSync('.cache',{recursive:true});cache=mkdtempSync(join(resolve('.cache'),'dev-startup-'));
  let root=source;
  if(linked){
   root=join(cache,'project');mkdirSync(root);
   cpSync('src',join(root,'src'),{recursive:true});cpSync('public',join(root,'public'),{recursive:true});
   cpSync('index.html',join(root,'index.html'));cpSync('package.json',join(root,'package.json'));
   rmSync(join(root,'src/leaderboard'),{recursive:true});
   const kind=process.platform==='win32'?'junction':'dir';
   symlinkSync(join(source,'src/leaderboard'),join(root,'src/leaderboard'),kind);
   symlinkSync(join(source,'node_modules'),join(root,'node_modules'),kind);
   // Reproduce the user's transport failure, retaining the real Vite transform,
   // worker, imports and WASM at the independently confirmed project route.
   await page.route('**/*',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path.startsWith('/@fs/')&&path.endsWith('/sqlite.worker.ts'))return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Application fallback</title>'});
    return route.continue();
   });
  }
  server=await createServer({root,configFile:join(source,'vite.config.ts'),cacheDir:join(cache,'optimizer'),server:{host:'127.0.0.1',port:0,strictPort:false,fs:{allow:[source,root]}}});
  await server.listen();origin=server.resolvedUrls!.local[0];
 });
 test.afterEach(async()=>{try{await server?.close();}finally{server=undefined;rmSync(cache,{recursive:true,force:true});}});
 for(const action of ['save','restore'] as const)test(`first SQLite ${action} works with an empty dependency cache without reloading`,async({page})=>{
 test.setTimeout(30000);
 const wasm:string[]=[];page.on('request',request=>{if(new URL(request.url()).pathname.endsWith('.wasm'))wasm.push(request.url());});
 await page.goto(origin);
 await upload(page,Buffer.from(JSON.stringify({formatVersion:1,results:[record]})),'initial.json');
 await expect(page.locator('#results tr')).toHaveCount(1);
 const navigations:string[]=[];page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations.push(frame.url());});
 expect(wasm).toEqual([]);
 if(action==='save'){
  await page.getByLabel('Save format',{exact:true}).selectOption('sqlite');
  let download:Download|undefined;page.on('download',value=>{download=value;});
  await page.locator('#save').click();
  await expect(page.locator('#file-status')).toContainText('Download offered');
  await expect.poll(()=>download).toBeTruthy();
  const SQL=await initSqlJs({wasmBinary:new Uint8Array(readFileSync('node_modules/sql.js/dist/sql-wasm.wasm')).buffer});
  const db=new SQL.Database(await bytes(download!));
  try{expect(db.exec('SELECT id,score,timestamp FROM high_scores')[0].values).toEqual([[record.id,123,record.timestamp]]);}finally{db.close();}
 }else{
  const SQL=await initSqlJs({wasmBinary:new Uint8Array(readFileSync('node_modules/sql.js/dist/sql-wasm.wasm')).buffer});
  const db=new SQL.Database();let fixture:Buffer;
  try{
   db.run('PRAGMA user_version=1; CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER NOT NULL,timestamp TEXT NOT NULL)');
   db.run('INSERT INTO high_scores VALUES(?,?,?)',[record.id,456,record.timestamp]);fixture=Buffer.from(db.export());
  }finally{db.close();}
  await upload(page,fixture,'first.sqlite');
  await expect(page.locator('#file-status')).toContainText('Restored 1');
 }
 expect(navigations).toEqual([]);expect(wasm.length).toBeGreaterThan(0);
 expect(wasm.every(url=>new URL(url).origin===new URL(origin).origin)).toBe(true);
 await expect.poll(()=>page.workers().length).toBe(0);
 await page.getByLabel('Save format',{exact:true}).selectOption('json');
 const offered=page.waitForEvent('download');await page.locator('#save').click();
 expect(JSON.parse((await bytes(await offered)).toString()).results).toEqual([{...record,score:action==='save'?123:456}]);
});
});
