/** An extracted-package run must never silently exercise stale built assets. */
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
if(process.env.TETRIS_PACKAGE_TEST==='1')test('served build metadata matches the selected package version and source',async({request})=>{
 const response=await request.get('/BUILD.json');expect(response.ok()).toBe(true);
 const metadata=await response.json();const pkg=JSON.parse(readFileSync('package.json','utf8'));
 const hash=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
 const expected=JSON.parse(readFileSync('.cache/package-test-manifest.json','utf8'));
 expect(metadata).toEqual(expected.metadata);
 for(const [file,digest] of Object.entries(expected.files)){
  const asset=await request.get('/'+file);expect(asset.ok(),file).toBe(true);
  expect(hash(await asset.body()),file).toBe(digest);
 }
 expect(metadata.version).toBe(pkg.version);expect(metadata.source_commit).toBe(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
});
