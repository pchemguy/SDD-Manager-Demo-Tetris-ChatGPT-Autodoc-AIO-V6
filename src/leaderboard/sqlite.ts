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
