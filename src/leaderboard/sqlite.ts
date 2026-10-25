/** Pure SQLite runtime boundary; the browser worker supplies its local WASM URL. */
import initSqlJs from 'sql.js';
import type {SqlJsConfig,SqlJsStatic} from 'sql.js';
export function loadSQLite(config?:SqlJsConfig):Promise<SqlJsStatic> {return initSqlJs(config);}

import {rank,validateResults,type Result} from './validation';
/** Fresh creation is separate from import; only fixed SQL and bound values execute. */
export function encodeSQLite(SQL:SqlJsStatic,values:readonly Result[]):Uint8Array {
 const results=rank(validateResults(values));const db=new SQL.Database();
 try{
  db.run('PRAGMA user_version=1; CREATE TABLE high_scores (id TEXT NOT NULL PRIMARY KEY, score INTEGER NOT NULL CHECK (score >= 0 AND score <= 9007199254740991), timestamp TEXT NOT NULL);');
  const insert=db.prepare('INSERT INTO high_scores(id,score,timestamp) VALUES(?,?,?)');
  try{for(const result of results)insert.run([result.id,result.score,result.timestamp]);}finally{insert.free();}
  return db.export();
 }finally{db.close();}
}

import type {Database} from 'sql.js';
export const SQLITE_LIMIT=1048576;
const HEADER='SQLite format 3\0';
function scalar(db:Database,sql:string){const rows=db.exec(sql);if(rows.length!==1||rows[0].values.length!==1||rows[0].values[0].length!==1)throw new Error('Invalid SQLite metadata.');return rows[0].values[0][0];}
/** Synchronous read scope owns the disposable handle and inspects every column. */
export function withValidatedSQLite<T>(SQL:SqlJsStatic,bytes:Uint8Array,read:(db:Database)=>T):T {
 if(bytes.byteLength>SQLITE_LIMIT)throw new Error('SQLite file exceeds the 1048576-byte limit.');
 if(bytes.length<16||[...HEADER].some((char,i)=>bytes[i]!==char.charCodeAt(0)))throw new Error('Invalid SQLite 3 file header.');
 const db=new SQL.Database(bytes);
 try{
  db.run('PRAGMA trusted_schema=OFF; PRAGMA query_only=ON;');
  if(scalar(db,'PRAGMA trusted_schema')!==0||scalar(db,'PRAGMA query_only')!==1)throw new Error('SQLite read protections are unavailable.');
  if(scalar(db,'PRAGMA user_version')!==1)throw new Error('Unsupported SQLite format version.');
  if(scalar(db,'PRAGMA integrity_check')!=='ok')throw new Error('SQLite integrity check failed.');
  const objects=db.exec('SELECT type,name,tbl_name,sql FROM sqlite_schema')[0]?.values??[];
  const tables=objects.filter(row=>row[0]==='table');
  if(tables.length!==1||tables[0][1]!=='high_scores')throw new Error('Expected exactly one high_scores table.');
  for(const row of objects){
   if(row[0]==='table'&&row[1]==='high_scores')continue;
   if(row[0]==='index'&&row[1]==='sqlite_autoindex_high_scores_1'&&row[2]==='high_scores'&&row[3]===null)continue;
   throw new Error('Unexpected SQLite schema object.');
  }
  const table=(db.exec('PRAGMA table_list')[0]?.values??[]).find(row=>row[0]==='main'&&row[1]==='high_scores');
  if(!table||table[2]!=='table'||table[3]!==3)throw new Error('Expected an ordinary three-column table.');
  const columns=db.exec('PRAGMA table_xinfo(high_scores)')[0]?.values??[];
  const names=['id','score','timestamp'],types=['TEXT','INTEGER','TEXT'];
  if(columns.length!==3||columns.some((column,i)=>column[0]!==i||column[1]!==names[i]||typeof column[2]!=='string'||column[2].toUpperCase()!==types[i]||column[3]!==1||column[5]!== (i===0?1:0)||column[6]!==0))throw new Error('Invalid high_scores column schema.');
  const indexes=db.exec('PRAGMA index_list(high_scores)')[0]?.values??[];
  if(indexes.length!==1||indexes[0][1]!=='sqlite_autoindex_high_scores_1'||indexes[0][2]!==1||indexes[0][3]!=='pk'||indexes[0][4]!==0)throw new Error('Unexpected high_scores index.');
  return read(db);
 }catch(error){throw new Error('Invalid SQLite database: '+(error instanceof Error?error.message:String(error)));}
 finally{db.close();}
}
