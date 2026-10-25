/** Bounded codecs return candidates; this service never owns session mutation. */
import {encodeJSON,decodeJSON,JSON_LIMIT} from './json';
import {validateResults,type Result} from './validation';
export type Format='json';
export interface SelectedFile {size:number;read(signal:AbortSignal):Promise<Uint8Array>}
export interface FilePort {pick(signal:AbortSignal):Promise<SelectedFile|null>;download(bytes:Uint8Array,name:string,mime:string,signal:AbortSignal):Promise<void>}
export interface Codecs {encode(format:Format,results:readonly Result[],signal:AbortSignal):Promise<Uint8Array>;decode(bytes:Uint8Array,signal:AbortSignal):Promise<Result[]>}
export const codecs:Codecs={encode:async(_format,results)=>encodeJSON(results),decode:async bytes=>decodeJSON(bytes)};
export function checkActive(signal:AbortSignal):void {if(signal.aborted)throw new DOMException('Operation canceled.','AbortError');}
/** One deadline includes codec initialization; abort is propagated to owned work. */
export function bounded<T>(work:(signal:AbortSignal)=>Promise<T>,parent:AbortSignal):Promise<T> {
 if(parent.aborted)return Promise.reject(new DOMException('Operation canceled.','AbortError'));
 const child=new AbortController();
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finish=(error:unknown,value?:T)=>{if(settled)return;settled=true;clearTimeout(timer);parent.removeEventListener('abort',abort);if(error)reject(error);else resolve(value as T);};
  const abort=()=>{child.abort();finish(new DOMException('Operation canceled.','AbortError'));};
  const timer=setTimeout(()=>{child.abort();finish(new Error('File operation timed out after 10000 ms.'));},10000);
  parent.addEventListener('abort',abort,{once:true});
  Promise.resolve().then(()=>{checkActive(child.signal);return work(child.signal);}).then(value=>finish(null,value),error=>finish(error));
 });
}
export async function saveFile(format:Format,results:readonly Result[],port:FilePort,signal:AbortSignal,codec:Codecs=codecs):Promise<void> {
 const snapshot=validateResults(results);
 await bounded(async child=>{const bytes=await codec.encode(format,snapshot,child);checkActive(child);await port.download(bytes,'tetris-scores.json','application/json',child);checkActive(child);},signal);
}
export async function restoreFile(port:FilePort,signal:AbortSignal,codec:Codecs=codecs):Promise<Result[]|null> {
 const file=await port.pick(signal);checkActive(signal);if(!file)return null;
 if(!Number.isSafeInteger(file.size)||file.size<0||file.size>JSON_LIMIT)throw new Error('JSON file exceeds the 65536-byte limit.');
 const bytes=await file.read(signal);checkActive(signal);
 return bounded(child=>codec.decode(bytes,child),signal);
}
