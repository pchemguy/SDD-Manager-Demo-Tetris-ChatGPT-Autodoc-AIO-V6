/** Native picker/download lifetimes and controller-owned atomic file transactions. */
import type {Controller} from '../app/controller';
import {checkActive,saveFile,restoreFile,type FilePort,type Codecs,type Format} from '../leaderboard/files';
const canceled=()=>new DOMException('Operation canceled.','AbortError');
export function browserFilePort():FilePort {
 return {
  pick:signal=>new Promise((resolve,reject)=>{
   if(signal.aborted){reject(canceled());return;}
   const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);
   const cleanup=()=>{input.removeEventListener('change',change);input.removeEventListener('cancel',cancel);signal.removeEventListener('abort',abort);input.remove();};
   const abort=()=>{cleanup();reject(canceled());};const cancel=()=>{cleanup();resolve(null);};
   const change=()=>{const file=input.files?.[0];cleanup();resolve(file?{size:file.size,read:s=>readFile(file,s)}:null);};
   input.addEventListener('change',change);input.addEventListener('cancel',cancel);signal.addEventListener('abort',abort,{once:true});
   try{input.click();}catch(error){cleanup();reject(error);}
  }),
  download:async(bytes,name,mime,signal)=>{
   checkActive(signal);const owned=new Uint8Array(bytes.byteLength);owned.set(bytes);
   const url=URL.createObjectURL(new Blob([owned.buffer],{type:mime}));let anchor:HTMLAnchorElement|undefined;
   try{const link=document.createElement('a');anchor=link;link.href=url;link.download=name;link.hidden=true;document.body.append(link);await new Promise<void>((resolve,reject)=>{
    let settled=false;const finish=(error?:unknown)=>{if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',abort);if(error)reject(error);else resolve();};
    const abort=()=>finish(canceled());const timer=setTimeout(()=>finish(),1000);signal.addEventListener('abort',abort,{once:true});
    try{checkActive(signal);link.click();}catch(error){finish(error);}
   });}finally{anchor?.remove();URL.revokeObjectURL(url);}
  },
 };
}
function readFile(file:Blob,signal:AbortSignal):Promise<Uint8Array> {
 return new Promise((resolve,reject)=>{
  if(signal.aborted){reject(canceled());return;}const reader=new FileReader();
  const cleanup=()=>{reader.removeEventListener('load',load);reader.removeEventListener('error',error);reader.removeEventListener('abort',aborted);signal.removeEventListener('abort',abort);};
  const load=()=>{cleanup();if(reader.result instanceof ArrayBuffer)resolve(new Uint8Array(reader.result));else reject(new Error('File read returned no bytes.'));};
  const error=()=>{cleanup();reject(reader.error??new Error('File could not be read.'));};const aborted=()=>{cleanup();reject(canceled());};const abort=()=>{reader.abort();cleanup();reject(canceled());};
  reader.addEventListener('load',load);reader.addEventListener('error',error);reader.addEventListener('abort',aborted);signal.addEventListener('abort',abort,{once:true});
  try{reader.readAsArrayBuffer(file);}catch(e){cleanup();reject(e);}
 });
}
export function bindFiles(controller:Controller,port:FilePort=browserFilePort(),codec?:Codecs):{cancel():void;dispose():void} {
 const save=document.querySelector<HTMLButtonElement>('#save')!,restore=document.querySelector<HTMLButtonElement>('#restore')!,cancelButton=document.querySelector<HTMLButtonElement>('#file-cancel')!,status=document.getElementById('file-status')!;
 let active:AbortController|null=null,disposed=false;
 const cancel=()=>{const operation=active;if(!operation)return;active=null;operation.abort();controller.endFile(performance.now());if(!disposed)status.textContent='Canceled. Results unchanged.';};
 const run=async(kind:'save'|'restore')=>{
  if(disposed||active||!controller.beginFile(performance.now()))return;
  const operation=new AbortController();active=operation;status.textContent=kind==='save'?'Preparing download…':'Choose a JSON file…';
  try{
   if(kind==='save'){const format=(document.querySelector<HTMLSelectElement>('#file-format')!.value as Format);await saveFile(format,controller.results,port,operation.signal,codec);if(active===operation&&!operation.signal.aborted)status.textContent='Download offered. Results unchanged.';}
   else {const candidate=await restoreFile(port,operation.signal,codec);if(active===operation&&!operation.signal.aborted){if(candidate){controller.replaceResults(candidate);status.textContent=`Restored ${candidate.length} results.`;}else status.textContent='No file selected. Results unchanged.';}}
  }catch(error){if(active===operation&&!disposed)status.textContent=operation.signal.aborted?'Canceled. Results unchanged.':'Error: '+(error instanceof Error?error.message:'File operation failed.');}
  finally{if(active===operation){active=null;controller.endFile(performance.now());}}
 };
 const onSave=()=>{void run('save');},onRestore=()=>{void run('restore');};save.addEventListener('click',onSave);restore.addEventListener('click',onRestore);cancelButton.addEventListener('click',cancel);
 return {cancel,dispose:()=>{cancel();disposed=true;save.removeEventListener('click',onSave);restore.removeEventListener('click',onRestore);cancelButton.removeEventListener('click',cancel);}};
}
