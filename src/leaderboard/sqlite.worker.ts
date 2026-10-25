/** A disposable worker initializes only for an explicit SQLite operation. */
import {loadSQLite,encodeSQLite} from './sqlite';
import {validateResults} from './validation';
import wasmURL from 'sql.js/dist/sql-wasm.wasm?url';
interface Request {id:number;action:'encode'|'decode';payload:unknown}
const endpoint=self as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage(value:unknown,transfer?:Transferable[]):void};
endpoint.onmessage=async({data})=>{
 if(!Number.isSafeInteger(data?.id))return;
 try{
  const SQL=await loadSQLite({locateFile:()=>wasmURL});
  if(data.action==='encode'){const result=new Uint8Array(encodeSQLite(SQL,validateResults(data.payload)));endpoint.postMessage({id:data.id,ok:true,result},[result.buffer]);return;}
  throw new Error('SQLite restore is not available yet.');
 }catch(error){endpoint.postMessage({id:data.id,ok:false,error:error instanceof Error?error.message:String(error)});}
};
