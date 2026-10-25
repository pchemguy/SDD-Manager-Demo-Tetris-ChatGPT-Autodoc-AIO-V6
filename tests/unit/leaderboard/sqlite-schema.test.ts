/** Actual external-schema/corruption fixtures precede any application row callback. */
import {beforeAll,expect,it,vi} from 'vitest';
import type {SqlJsStatic} from 'sql.js';
import {loadSQLite,withValidatedSQLite} from '../../../src/leaderboard/sqlite';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
let SQL:SqlJsStatic;
const bytes=(name:string)=>new Uint8Array(readFileSync('.cache/sqlite-fixtures/'+name+'.sqlite'));
beforeAll(async()=>{execFileSync('python',['tests/fixtures/generate-sqlite.py','.cache/sqlite-fixtures'],{timeout:10000});SQL=await loadSQLite({wasmBinary:new Uint8Array(readFileSync('node_modules/sql.js/dist/sql-wasm.wasm')).buffer});});
it.each(['valid-empty','valid-reformatted','valid-without-rowid'])('accepts ordinary equivalent schema %s with protections before rows',name=>{
 expect(withValidatedSQLite(SQL,bytes(name),db=>{expect(db.exec('PRAGMA trusted_schema')[0].values).toEqual([[0]]);expect(db.exec('PRAGMA query_only')[0].values).toEqual([[1]]);return 'accepted';})).toBe('accepted');
});
it.each(['version-zero','version-two','wrong-table','extra-table','extra-index','extra-unique','extra-view','extra-trigger','reordered','extra-column','generated-virtual','generated-stored','score-real','id-blob','timestamp-numeric','nullable-id','nullable-score','nullable-timestamp','composite-key','wrong-key','virtual-table','empty-file','not-sqlite','truncated','corrupt-btree'])('rejects actual %s before application row processing',name=>{
 const read=vi.fn(()=>[]);expect(()=>withValidatedSQLite(SQL,bytes(name),read)).toThrow();expect(read).not.toHaveBeenCalled();
});
it('closes a validated database when application processing throws',()=>{
 let closed=0;class OwnedDatabase extends SQL.Database {override close(){closed++;super.close();}}
 expect(()=>withValidatedSQLite({...SQL,Database:OwnedDatabase},bytes('valid-empty'),()=>{throw new Error('row read failed');})).toThrow('row read failed');expect(closed).toBe(1);
});
