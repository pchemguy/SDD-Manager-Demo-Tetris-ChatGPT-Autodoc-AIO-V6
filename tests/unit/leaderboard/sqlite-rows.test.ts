/** Storage classes are independent of JavaScript numeric values and declarations. */
import {beforeAll,expect,it,vi} from 'vitest';
import type {SqlJsStatic} from 'sql.js';
import {loadSQLite,decodeSQLite,withValidatedSQLite} from '../../../src/leaderboard/sqlite';
import {decodeJSON} from '../../../src/leaderboard/json';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
let SQL:SqlJsStatic;
const bytes=(name:string)=>new Uint8Array(readFileSync('.cache/sqlite-row-fixtures/'+name+'.sqlite'));
beforeAll(async()=>{execFileSync('python',['tests/fixtures/generate-sqlite.py','.cache/sqlite-row-fixtures'],{timeout:10000});SQL=await loadSQLite({wasmBinary:new Uint8Array(readFileSync('node_modules/sql.js/dist/sql-wasm.wasm')).buffer});});
it('ranks genuine unsorted rows identically to JSON and preserves ten safe records',()=>{
 const timestamp='2026-01-01T00:00:00.000Z';const input=[{id:'a',score:0,timestamp},{id:'Z',score:0,timestamp},{id:'A',score:1,timestamp}];expect(decodeSQLite(SQL,bytes('rows-unsorted'))).toEqual(decodeJSON(new TextEncoder().encode(JSON.stringify({formatVersion:1,results:input}))));const ten=decodeSQLite(SQL,bytes('rows-ten'));expect(ten).toHaveLength(10);expect(ten[0]).toEqual({id:'9',score:9007199254740991,timestamp});expect(ten[9].timestamp).toBe('0001-01-01T00:00:00.000Z');expect(decodeSQLite(SQL,bytes('valid-empty'))).toEqual([]);
});
it('distinguishes actual REAL1.0 from INTEGER1 although both become JS integer1',()=>{
 for(const [name,type] of [['real-one','real'],['rows-integer-one','integer']] as const){const db=new SQL.Database(bytes(name));try{expect(db.exec('SELECT typeof(score),score FROM high_scores')[0].values).toEqual([[type,1]]);expect(db.exec('PRAGMA integrity_check')[0].values).toEqual([['ok']]);}finally{db.close();}}
 expect(()=>decodeSQLite(SQL,bytes('real-one'))).toThrow(/storage class/);expect(decodeSQLite(SQL,bytes('rows-integer-one'))[0].score).toBe(1);expect(()=>decodeSQLite(SQL,bytes('real-fraction'))).toThrow(/storage class/);
});
it.each(['unsafe-integer','negative-score','fractional-score','text-score','blob-id','blob-timestamp','invalid-id','unicode-id','long-id','invalid-calendar','year-zero','offset-time','eleven-rows','duplicate-ids'])('rejects entire actual %s file',name=>expect(()=>decodeSQLite(SQL,bytes(name))).toThrow());
it('rejects excess bytes before constructing a database and reads no more than eleven rows',()=>{
 const create=vi.fn(()=>{throw new Error('constructor must not run');});expect(()=>withValidatedSQLite({...SQL,Database:create as unknown as SqlJsStatic['Database']},new Uint8Array(1048577),()=>[])).toThrow(/1048576-byte/);expect(create).not.toHaveBeenCalled();
 let stepped=0;class CountedDatabase extends SQL.Database {override prepare(sql:string){const statement=super.prepare(sql);if(sql.startsWith('SELECT id,score,timestamp')){const step=statement.step.bind(statement);statement.step=()=>{const row=step();if(row)stepped++;return row;};}return statement;}}
 expect(()=>decodeSQLite({...SQL,Database:CountedDatabase},bytes('many-rows'))).toThrow();expect(stepped).toBe(11);
});
