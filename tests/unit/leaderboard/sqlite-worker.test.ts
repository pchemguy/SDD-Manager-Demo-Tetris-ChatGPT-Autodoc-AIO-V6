/** Worker protocol and ownership checks plus real local WASM initialization. */
import {afterEach,expect,it,vi} from 'vitest';
import {sqliteOperation,bounded,codecs,type SQLiteWorker} from '../../../src/leaderboard/files';
import {loadSQLite} from '../../../src/leaderboard/sqlite';
import {readFileSync} from 'node:fs';
class FakeWorker extends EventTarget implements SQLiteWorker {
 sent:{id:number;action:string;payload:unknown}|undefined;
 postMessage=vi.fn((message:unknown)=>{this.sent=message as typeof this.sent;});
 terminate=vi.fn();
 reply(data:unknown){this.dispatchEvent(new MessageEvent('message',{data}));}
}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
it('initializes the pinned local WASM asynchronously and closes a real database',async()=>{
 const SQL=await loadSQLite({wasmBinary:new Uint8Array(readFileSync('node_modules/sql.js/dist/sql-wasm.wasm')).buffer});const db=new SQL.Database();try{expect(db.exec('SELECT sqlite_version(), 1+1')[0].values[0]).toEqual([expect.stringMatching(/^3\./),2]);}finally{db.close();}
});
it('matches operation identity, ignores stale replies and terminates on valid completion',async()=>{
 const worker=new FakeWorker(),abort=new AbortController();const result=sqliteOperation('encode',[],abort.signal,()=>worker);expect(worker.sent?.action).toBe('encode');worker.reply({id:worker.sent!.id+1,ok:true,result:new Uint8Array([9])});expect(worker.terminate).not.toHaveBeenCalled();worker.reply({id:worker.sent!.id,ok:true,result:new Uint8Array([1,2])});expect(await result).toEqual(new Uint8Array([1,2]));expect(worker.terminate).toHaveBeenCalledTimes(1);abort.abort();worker.reply({id:worker.sent!.id,ok:false,error:'late'});expect(worker.terminate).toHaveBeenCalledTimes(1);
});
it('reported initialization errors are visible and terminate ownership',async()=>{
 const worker=new FakeWorker();const result=sqliteOperation('encode',[],new AbortController().signal,()=>worker);worker.reply({id:worker.sent!.id,ok:false,error:'WASM unavailable'});await expect(result).rejects.toThrow('WASM unavailable');expect(worker.terminate).toHaveBeenCalledTimes(1);
});
it.each(['error','messageerror'])('worker %s releases resources',async type=>{
 const worker=new FakeWorker();const result=sqliteOperation('encode',[],new AbortController().signal,()=>worker);worker.dispatchEvent(Object.assign(new Event(type),{message:'worker failed'}));await expect(result).rejects.toThrow();expect(worker.terminate).toHaveBeenCalledTimes(1);
});
it('abort before creation does no work; abort during processing terminates exactly once',async()=>{
 const abort=new AbortController(),create=vi.fn(()=>new FakeWorker());abort.abort();await expect(sqliteOperation('encode',[],abort.signal,create)).rejects.toThrow(/canceled/);expect(create).not.toHaveBeenCalled();const active=new AbortController(),worker=new FakeWorker(),result=sqliteOperation('encode',[],active.signal,()=>worker);active.abort();await expect(result).rejects.toThrow(/canceled/);expect(worker.terminate).toHaveBeenCalledTimes(1);
});
it('worker construction/post/reply failures reject without a leaked worker',async()=>{
 await expect(sqliteOperation('encode',[],new AbortController().signal,()=>{throw new Error('creation');})).rejects.toThrow('creation');
 const worker=new FakeWorker();worker.postMessage.mockImplementation(()=>{throw new Error('post');});await expect(sqliteOperation('encode',[],new AbortController().signal,()=>worker)).rejects.toThrow('post');expect(worker.terminate).toHaveBeenCalledTimes(1);
 const malformed=new FakeWorker(),result=sqliteOperation('encode',[],new AbortController().signal,()=>malformed);malformed.reply({id:malformed.sent!.id,ok:true,result:'wrong'});await expect(result).rejects.toThrow(/reply/);expect(malformed.terminate).toHaveBeenCalledTimes(1);
});
it('the existing whole-operation deadline terminates a pending SQLite worker',async()=>{
 vi.useFakeTimers();const worker=new FakeWorker();const outcome=bounded(signal=>sqliteOperation('encode',[],signal,()=>worker),new AbortController().signal).catch(e=>e);await Promise.resolve();await vi.advanceTimersByTimeAsync(10000);expect((await outcome).message).toMatch(/10000 ms/);expect(worker.terminate).toHaveBeenCalledTimes(1);expect(vi.getTimerCount()).toBe(0);
});

it('content dispatch uses an owned SQLite input copy and JSON stays worker-independent',async()=>{
 const workers:FakeWorker[]=[];vi.stubGlobal('Worker',class extends FakeWorker {constructor(){super();workers.push(this);}});
 const input=new TextEncoder().encode('SQLite format 3\0');const result=codecs.decode(input,new AbortController().signal);expect(workers).toHaveLength(1);const worker=workers[0];expect(worker.sent?.action).toBe('decode');expect(worker.sent?.payload).not.toBe(input);expect(input.byteLength).toBe(16);worker.reply({id:worker.sent!.id,ok:true,result:[]});expect(await result).toEqual([]);expect(await codecs.decode(new TextEncoder().encode('{"formatVersion":1,"results":[]}'),new AbortController().signal)).toEqual([]);expect(workers).toHaveLength(1);
});
