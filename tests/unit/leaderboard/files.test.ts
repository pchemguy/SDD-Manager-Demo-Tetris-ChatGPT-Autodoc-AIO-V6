/** Controlled async boundaries expose cancellation, timeout and stale completion. */
import {afterEach,expect,it,vi} from 'vitest';
import {saveFile,restoreFile,type FilePort,type Codecs} from '../../../src/leaderboard/files';
import {encodeJSON,decodeJSON} from '../../../src/leaderboard/json';
import {Controller} from '../../../src/app/controller';
import {Game} from '../../../src/game/game';
const records=[{id:'stable',score:7,timestamp:'2026-01-01T00:00:00.000Z'}];
function deferred<T>(){let resolve!:(v:T)=>void;const promise=new Promise<T>(r=>{resolve=r;});return {promise,resolve};}
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function environment(){const bytes=encodeJSON(records),read=vi.fn(async()=>bytes),pick=vi.fn<FilePort['pick']>(async()=>({size:bytes.length,read})),download=vi.fn<FilePort['download']>(async()=>{});return {read,pick,download,port:{pick,download} satisfies FilePort};}
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();});
it('captures an immutable save snapshot before asynchronous encoding',async()=>{
 const env=environment(),gate=deferred<void>(),input=records.map(r=>({...r}));const codec:Codecs={encode:async(_format,snapshot)=>{await gate.promise;return encodeJSON(snapshot);},decode:async bytes=>decodeJSON(bytes)};
 const operation=saveFile('json',input,env.port,new AbortController().signal,codec);input[0].score=999;gate.resolve();await operation;expect(decodeJSON(env.download.mock.calls[0][0])).toEqual(records);
});
it('empty picker cancellation performs no read/codec work and installs no deadline',async()=>{
 vi.useFakeTimers();const env=environment();env.pick.mockResolvedValue(null);expect(await restoreFile(env.port,new AbortController().signal)).toBeNull();expect(env.read).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
it('rejects oversized selection before reading any bytes',async()=>{
 const env=environment();env.pick.mockResolvedValue({size:65537,read:env.read});await expect(restoreFile(env.port,new AbortController().signal)).rejects.toThrow(/65536-byte/);expect(env.read).not.toHaveBeenCalled();
});
it('pre-aborted restore never opens a picker',async()=>{
 const env=environment(),abort=new AbortController();abort.abort();await expect(restoreFile(env.port,abort.signal)).rejects.toThrow(/canceled/);expect(env.pick).not.toHaveBeenCalled();
});
it('read and download failures propagate and dispose their deadlines',async()=>{
 vi.useFakeTimers();const env=environment();env.read.mockRejectedValue(new Error('read failed'));await expect(restoreFile(env.port,new AbortController().signal)).rejects.toThrow('read failed');env.download.mockRejectedValue(new Error('download failed'));await expect(saveFile('json',records,env.port,new AbortController().signal)).rejects.toThrow('download failed');expect(vi.getTimerCount()).toBe(0);
});
it('whole save deadline aborts codec initialization and blocks late download',async()=>{
 vi.useFakeTimers();const env=environment(),gate=deferred<Uint8Array>();let child:AbortSignal|undefined;
 const codec:Codecs={encode:async(_f,_r,signal)=>{child=signal;return gate.promise;},decode:async()=>[]};
 const outcome=saveFile('json',records,env.port,new AbortController().signal,codec).catch(e=>e);await flush();expect(child?.aborted).toBe(false);await vi.advanceTimersByTimeAsync(9999);expect(env.download).not.toHaveBeenCalled();await vi.advanceTimersByTimeAsync(1);expect((await outcome).message).toMatch(/10000 ms/);expect(child?.aborted).toBe(true);gate.resolve(encodeJSON(records));await flush();expect(env.download).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
it('abort rejects pending decode, propagates cancellation and ignores late candidates',async()=>{
 vi.useFakeTimers();const env=environment(),gate=deferred<typeof records>(),abort=new AbortController();let child:AbortSignal|undefined;const commit=vi.fn();
 const codec:Codecs={encode:async()=>new Uint8Array(),decode:async(_b,signal)=>{child=signal;return gate.promise;}};
 const outcome=restoreFile(env.port,abort.signal,codec).then(commit).catch(e=>e);await flush();expect(child).toBeDefined();abort.abort();expect((await outcome).name).toBe('AbortError');expect(child?.aborted).toBe(true);gate.resolve(records);await flush();expect(commit).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
});
it('file selection has no codec deadline; decoding deadline starts after bytes arrive',async()=>{
 vi.useFakeTimers();const env=environment(),gate=deferred<Awaited<ReturnType<FilePort['pick']>>>();env.pick.mockImplementation(()=>gate.promise);const operation=restoreFile(env.port,new AbortController().signal);await flush();expect(vi.getTimerCount()).toBe(0);await vi.advanceTimersByTimeAsync(20000);gate.resolve({size:encodeJSON(records).length,read:env.read});expect(await operation).toEqual(records);expect(vi.getTimerCount()).toBe(0);
});
it('controller blocks overlap/restart and removes only the file pause reason',()=>{
 const g=new Game({piece:{kind:'O',orientation:0,x:3,y:18},random:()=>0});const c=new Controller(()=>{},()=>g);c.start(0);c.frame(400);expect(c.beginFile(400)).toBe(true);expect(c.beginFile(500)).toBe(false);c.start(5000);c.command('drop',6000);expect(c.view?.time).toBe(400);expect(c.view?.board[19][4]).toBeNull();c.setPaused('user',true,7000);c.endFile(10000);expect(c.view?.status).toBe('paused');c.togglePause(10000);c.frame(10599);expect(c.view?.board[19][4]).toBeNull();c.frame(10600);expect(c.view?.board[19][4]).toBe('O');expect(c.busy).toBe(false);
});
it('ready file operation blocks start and repeated end is harmless',()=>{
 const c=new Controller(()=>{});c.beginFile(0);c.start(1);expect(c.view).toBeNull();c.endFile(2);c.endFile(3);c.start(4);expect(c.view?.status).toBe('playing');
});
it.each([undefined,null])('preserves rejected codec outcome even when its reason is %s',async reason=>{
 const env=environment();const codec:Codecs={encode:async()=>{throw reason;},decode:async()=>{throw reason;}};await expect(saveFile('json',records,env.port,new AbortController().signal,codec)).rejects.toBe(reason);expect(env.download).not.toHaveBeenCalled();
});
