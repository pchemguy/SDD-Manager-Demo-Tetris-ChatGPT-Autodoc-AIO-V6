/** A disposable worker initializes only for an explicit SQLite operation. */
import {loadSQLite,encodeSQLite,decodeSQLite,SQLITE_LIMIT} from './sqlite';
import {validateResults} from './validation';
import wasmURL from 'sql.js/dist/sql-wasm.wasm?url';
interface Request {id:number;action:'encode'|'decode';payload:unknown}
const endpoint=self as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage(value:unknown,transfer?:Transferable[]):void};
endpoint.onmessage=async({data})=>{
 if(!Number.isSafeInteger(data?.id))return;
 try{
  if(data.action!=='encode'&&data.action!=='decode')throw new Error('Unsupported SQLite operation.');
  if(data.action==='decode'&&(!(data.payload instanceof Uint8Array)||data.payload.byteLength>SQLITE_LIMIT))throw new Error('Invalid or oversized SQLite input.');
  const records=data.action==='encode'?validateResults(data.payload):null;
  const SQL=await loadSQLite({locateFile:()=>wasmURL});
  if(data.action==='encode'){const result=new Uint8Array(encodeSQLite(SQL,records!));endpoint.postMessage({id:data.id,ok:true,result},[result.buffer]);return;}
  const result=decodeSQLite(SQL,data.payload as Uint8Array);endpoint.postMessage({id:data.id,ok:true,result});
 }catch(error){endpoint.postMessage({id:data.id,ok:false,error:error instanceof Error?error.message:String(error)});}
};
