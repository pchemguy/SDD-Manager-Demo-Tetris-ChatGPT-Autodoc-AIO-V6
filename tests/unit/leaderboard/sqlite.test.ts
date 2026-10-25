/** Genuine SQLite byte exports inspected through an independent database handle. */
import {beforeAll,expect,it} from 'vitest';
import type {SqlJsStatic} from 'sql.js';
import {loadSQLite,encodeSQLite} from '../../../src/leaderboard/sqlite';
import {readFileSync} from 'node:fs';
let SQL:SqlJsStatic;
beforeAll(async()=>{SQL=await loadSQLite({wasmBinary:new Uint8Array(readFileSync('node_modules/sql.js/dist/sql-wasm.wasm')).buffer});});
const record={id:'stable',score:0,timestamp:'2026-01-01T00:00:00.000Z'};
it('exports genuine empty SQLite version1 with exactly the ordinary required table',()=>{
 const bytes=encodeSQLite(SQL,[]);expect(new TextDecoder().decode(bytes.slice(0,16))).toBe('SQLite format 3\0');const db=new SQL.Database(bytes);
 try{expect(db.exec('PRAGMA user_version')[0].values).toEqual([[1]]);expect(db.exec("SELECT name,type FROM sqlite_schema WHERE type!='index'")[0].values).toEqual([['high_scores','table']]);expect(db.exec('SELECT count(*) FROM high_scores')[0].values).toEqual([[0]]);expect(db.exec('PRAGMA table_xinfo(high_scores)')[0].values).toEqual([[0,'id','TEXT',1,null,1,0],[1,'score','INTEGER',1,null,0,0],[2,'timestamp','TEXT',1,null,0,0]]);}finally{db.close();}
});
it('preserves ten stable records, safe integer extremes and calendar boundaries',()=>{
 const records=Array.from({length:10},(_,i)=>({...record,id:i===9?'r'.repeat(64):'r'+i,score:i===9?9007199254740991:i,timestamp:i===0?'0001-01-01T00:00:00.000Z':i===9?'9999-12-31T23:59:59.999Z':record.timestamp}));
 const db=new SQL.Database(encodeSQLite(SQL,records));try{expect(db.exec('SELECT id,score,timestamp FROM high_scores ORDER BY score DESC,timestamp,id COLLATE BINARY')[0].values).toEqual([...records].reverse().map(r=>[r.id,r.score,r.timestamp]));expect(db.exec('SELECT DISTINCT typeof(id),typeof(score),typeof(timestamp) FROM high_scores')[0].values).toEqual([['text','integer','text']]);expect(db.exec('PRAGMA integrity_check')[0].values).toEqual([['ok']]);}finally{db.close();}
});
it('exports the actual integer range/not-null/primary-key constraints',()=>{
 const db=new SQL.Database(encodeSQLite(SQL,[record]));try{
  for(const score of [-1,9007199254740992])expect(()=>db.run('INSERT INTO high_scores VALUES(?,?,?)',['bad',score,record.timestamp])).toThrow();
  expect(()=>db.run('INSERT INTO high_scores VALUES(?,?,?)',[null,0,record.timestamp])).toThrow();expect(()=>db.run('INSERT INTO high_scores VALUES(?,?,?)',[record.id,1,record.timestamp])).toThrow();expect(db.exec('SELECT count(*) FROM high_scores')[0].values).toEqual([[1]]);
 }finally{db.close();}
});
it('rejects invalid and duplicate export data instead of producing a partial file',()=>{
 expect(()=>encodeSQLite(SQL,[{...record,score:-1}])).toThrow();expect(()=>encodeSQLite(SQL,[record,record])).toThrow();
});
it('closes the database and frees its statement if a bound insert fails',()=>{
 let closed=0,freed=0;
 class FailingDatabase extends SQL.Database {
  override prepare(sql:string){const statement=super.prepare(sql);if(sql.startsWith('INSERT')){const free=statement.free.bind(statement);statement.run=()=>{throw new Error('insert failed');};statement.free=()=>{freed++;return free();};}return statement;}
  override close(){closed++;super.close();}
 }
 expect(()=>encodeSQLite({...SQL,Database:FailingDatabase},[record])).toThrow('insert failed');expect(closed).toBe(1);expect(freed).toBe(1);
});
