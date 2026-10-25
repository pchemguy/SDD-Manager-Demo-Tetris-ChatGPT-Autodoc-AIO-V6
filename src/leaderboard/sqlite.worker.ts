/** A disposable worker initializes only for an explicit SQLite operation. */
import {loadSQLite} from './sqlite';
import wasmURL from 'sql.js/dist/sql-wasm.wasm?url';
interface Request {id:number;action:'encode'|'decode';payload:unknown}
const endpoint=self as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage(value:unknown,transfer?:Transferable[]):void};
endpoint.onmessage=async({data})=>{
 if(!Number.isSafeInteger(data?.id))return;
 try{
  await loadSQLite({locateFile:()=>wasmURL});
  // Encoding and import validation are the following bounded tasks, not UI capabilities yet.
  throw new Error('SQLite '+data.action+' is not available yet.');
 }catch(error){endpoint.postMessage({id:data.id,ok:false,error:error instanceof Error?error.message:String(error)});}
};
