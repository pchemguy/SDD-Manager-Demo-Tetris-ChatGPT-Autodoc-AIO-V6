/** Bounded codecs return candidates; this service never owns session mutation. */
import {encodeJSON,decodeJSON,JSON_LIMIT} from './json';
import {validateResults,type Result} from './validation';
export type Format='json'|'sqlite';
function isSQLite(bytes:Uint8Array):boolean {const header='SQLite format 3\0';return bytes.length>=16&&[...header].every((char,i)=>bytes[i]===char.charCodeAt(0));}
export interface SelectedFile {size:number;read(signal:AbortSignal,start?:number,end?:number):Promise<Uint8Array>}
export interface FilePort {pick(signal:AbortSignal):Promise<SelectedFile|null>;download(bytes:Uint8Array,name:string,mime:string,signal:AbortSignal):Promise<void>}
export interface Codecs {encode(format:Format,results:readonly Result[],signal:AbortSignal):Promise<Uint8Array>;decode(bytes:Uint8Array,signal:AbortSignal):Promise<Result[]>}
export const codecs:Codecs={encode:async(format,results,signal)=>format==='sqlite'?sqliteOperation('encode',results,signal):encodeJSON(results),decode:async(bytes,signal)=>isSQLite(bytes)?sqliteOperation('decode',bytes,signal):decodeJSON(bytes)};
export function checkActive(signal:AbortSignal):void {if(signal.aborted)throw new DOMException('Operation canceled.','AbortError');}
/** One deadline includes codec initialization; abort is propagated to owned work. */
export function bounded<T>(work:(signal:AbortSignal)=>Promise<T>,parent:AbortSignal):Promise<T> {
 if(parent.aborted)return Promise.reject(new DOMException('Operation canceled.','AbortError'));
 const child=new AbortController();
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finish=(success:boolean,value:unknown)=>{if(settled)return;settled=true;clearTimeout(timer);parent.removeEventListener('abort',abort);if(success)resolve(value as T);else reject(value);};
  const abort=()=>{child.abort();finish(false,new DOMException('Operation canceled.','AbortError'));};
  const timer=setTimeout(()=>{child.abort();finish(false,new Error('File operation timed out after 10000 ms.'));},10000);
  parent.addEventListener('abort',abort,{once:true});
  Promise.resolve().then(()=>{checkActive(child.signal);return work(child.signal);}).then(value=>finish(true,value),error=>finish(false,error));
 });
}
export async function saveFile(format:Format,results:readonly Result[],port:FilePort,signal:AbortSignal,codec:Codecs=codecs):Promise<void> {
 const snapshot=validateResults(results);
 await bounded(async child=>{const bytes=await codec.encode(format,snapshot,child);checkActive(child);await port.download(bytes,format==='sqlite'?'tetris-scores.sqlite':'tetris-scores.json',format==='sqlite'?'application/vnd.sqlite3':'application/json',child);checkActive(child);},signal);
}
export async function restoreFile(port:FilePort,signal:AbortSignal,codec:Codecs=codecs):Promise<Result[]|null> {
 checkActive(signal);const file=await port.pick(signal);checkActive(signal);if(!file)return null;
 if(!Number.isSafeInteger(file.size)||file.size<0)throw new Error('Invalid file size.');
 if(file.size>1048576)throw new Error('File exceeds the 1048576-byte limit.');
 const headSize=Math.min(16,file.size),head=await file.read(signal,0,headSize);checkActive(signal);
 if(head.byteLength!==headSize)throw new Error('File read returned an unexpected number of bytes.');
 const limit=isSQLite(head)?1048576:JSON_LIMIT;
 if(file.size>limit)throw new Error('JSON file exceeds the 65536-byte limit.');
 const bytes=new Uint8Array(file.size);bytes.set(head);
 if(file.size>headSize){const tail=await file.read(signal,headSize,file.size);checkActive(signal);if(tail.byteLength!==file.size-headSize)throw new Error('File read returned an unexpected number of bytes.');bytes.set(tail,headSize);}

 return bounded(child=>codec.decode(bytes,child),signal);
}

/** Narrow lifetime port: one disposable worker per operation, under bounded(). */
export interface SQLiteWorker {
 postMessage(message:unknown,transfer?:Transferable[]):void;
 addEventListener(type:string,listener:EventListener):void;
 removeEventListener(type:string,listener:EventListener):void;
 terminate():void;
}
let operationID=0;
export function sqliteOperation(action:'encode',payload:readonly Result[],signal:AbortSignal,create?:()=>SQLiteWorker):Promise<Uint8Array>;
export function sqliteOperation(action:'decode',payload:Uint8Array,signal:AbortSignal,create?:()=>SQLiteWorker):Promise<Result[]>;
export function sqliteOperation(action:'encode'|'decode',payload:readonly Result[]|Uint8Array,signal:AbortSignal,create:()=>SQLiteWorker=()=>new Worker(new URL('./sqlite.worker.ts',import.meta.url),{type:'module'})):Promise<Uint8Array|Result[]> {
 if(signal.aborted)return Promise.reject(new DOMException('Operation canceled.','AbortError'));
 return new Promise((resolve,reject)=>{
  const worker=create(),id=++operationID;let settled=false;
  const finish=(success:boolean,value:unknown)=>{
   if(settled)return;settled=true;signal.removeEventListener('abort',abort);
   worker.removeEventListener('message',message);worker.removeEventListener('error',error);worker.removeEventListener('messageerror',error);worker.terminate();
   if(success)resolve(value as Uint8Array|Result[]);else reject(value);
  };
  const abort=()=>finish(false,new DOMException('Operation canceled.','AbortError'));
  const error=(event:Event)=>finish(false,new Error((event as ErrorEvent).message||'SQLite worker failed to communicate.'));
  const message=(event:Event)=>{
   const reply=(event as MessageEvent).data;if(!reply||reply.id!==id)return;
   try{
    if(reply.ok===false)throw new Error(typeof reply.error==='string'?reply.error:'SQLite operation failed.');
    if(reply.ok!==true||(action==='encode'&&!(reply.result instanceof Uint8Array)))throw new Error('Invalid SQLite worker reply.');
    finish(true,action==='encode'?reply.result:validateResults(reply.result));
   }catch(e){finish(false,e);}
  };
  signal.addEventListener('abort',abort,{once:true});worker.addEventListener('message',message);worker.addEventListener('error',error);worker.addEventListener('messageerror',error);
  try{
   checkActive(signal);
   if(payload instanceof Uint8Array){const owned=new Uint8Array(payload);worker.postMessage({id,action,payload:owned},[owned.buffer]);}
   else worker.postMessage({id,action,payload});
  }catch(e){finish(false,e);}
 });
}
