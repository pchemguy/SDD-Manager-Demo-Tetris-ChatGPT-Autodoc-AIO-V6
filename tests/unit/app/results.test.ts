/** Completion identity and session lifetime belong to the application owner. */
import {expect,it,vi} from 'vitest';
import {Controller} from '../../../src/app/controller';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
const timestamp='2026-01-02T03:04:05.006Z';
function lost(score=0){const board=emptyBoard();board[0][4]='J';return new Game({board,score,random:()=>0});}
it('records zero and nonzero completions once across repeated frames and commands',()=>{
 const ids=['first','second'];const onCompleted=vi.fn();let score=0;const c=new Controller(()=>{},()=>lost(score),onCompleted,{id:()=>ids.shift()!,timestamp:()=>timestamp});
 c.start(0);for(let i=0;i<5;i++){c.frame(1000+i);c.command('drop',1000+i);}expect(c.results).toEqual([{id:'first',score:0,timestamp}]);expect(onCompleted).toHaveBeenCalledTimes(1);
 score=100;c.start(2000);expect(c.results).toEqual([{id:'second',score:100,timestamp},{id:'first',score:0,timestamp}]);expect(onCompleted).toHaveBeenCalledTimes(2);
});
it('does not record abandoned runs and retains history across restarts',()=>{
 let ended=false;const c=new Controller(()=>{},()=>ended?lost():new Game(),()=>{},{id:()=> 'completed',timestamp:()=>timestamp});c.start(0);c.start(100);expect(c.results).toEqual([]);ended=true;c.start(200);ended=false;c.start(300);expect(c.results).toEqual([{id:'completed',score:0,timestamp}]);
});
it('generates completion IDs absent from restored records and detaches snapshots',()=>{
 const ids=['restored','fresh'];const c=new Controller(()=>{},()=>lost(),()=>{},{id:()=>ids.shift()!,timestamp:()=>timestamp});c.replaceResults([{id:'restored',score:50,timestamp}]);c.start(0);expect(c.results.map(r=>r.id)).toEqual(['restored','fresh']);const snapshot=c.results;snapshot[0].score=999;expect(c.results[0].score).toBe(50);c.clearResults();expect(c.results).toEqual([]);
});
it('default completion identity is a UUID and timestamp is UTC',()=>{
 const c=new Controller(()=>{},()=>lost());c.start(0);expect(c.results[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);expect(c.results[0].timestamp).toMatch(/Z$/);
});
