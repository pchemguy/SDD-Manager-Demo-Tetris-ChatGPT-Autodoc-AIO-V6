/** Pure SQLite runtime boundary; the browser worker supplies its local WASM URL. */
import initSqlJs from 'sql.js';
import type {SqlJsConfig,SqlJsStatic} from 'sql.js';
export function loadSQLite(config?:SqlJsConfig):Promise<SqlJsStatic> {return initSqlJs(config);}
