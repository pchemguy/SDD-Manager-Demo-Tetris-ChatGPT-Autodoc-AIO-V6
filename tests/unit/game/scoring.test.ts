/** Hand-built rows verify simultaneous compaction and pre-clear level awards. */
import {expect,it} from 'vitest';
import {clearLines,emptyBoard} from '../../../src/game/board';
import {Game} from '../../../src/game/game';
const fourRows=()=>{const b=emptyBoard();for(let y=16;y<20;y++)for(let x=0;x<10;x++)if(x!==4)b[y][x]='Z';return b;};
it('compacts multiple complete rows together without mutating input',()=>{
 const b=emptyBoard();b[18].fill('T');b[19].fill('O');b[17][2]='J';const result=clearLines(b);
 expect(result.cleared).toBe(2);expect(result.board[19][2]).toBe('J');expect(result.board[0].every(x=>x===null)).toBe(true);expect(b[18][0]).toBe('T');
});
it('awards a four-line clear at the old level then speeds the next piece',()=>{
 const g=new Game({board:fourRows(),piece:{kind:'I',orientation:1,x:2,y:16},lines:8,random:()=>0});g.advance(1000);
 expect(g.snapshot.score).toBe(800);expect(g.snapshot.lines).toBe(12);expect(g.snapshot.level).toBe(2);expect(g.snapshot.board.every(row=>row.every(x=>x===null))).toBe(true);
 g.advance(1799);expect(g.snapshot.active.y).toBe(-1);g.advance(1800);expect(g.snapshot.active.y).toBe(0);
});
it('scores successful soft-drop rows only and saturates safely',()=>{
 const g=new Game({piece:{kind:'O',orientation:0,x:3,y:17},score:Number.MAX_SAFE_INTEGER-1});g.down();expect(g.snapshot.score).toBe(Number.MAX_SAFE_INTEGER);g.down();expect(g.snapshot.score).toBe(Number.MAX_SAFE_INTEGER);
});
it('gives no line points for a lock without a clear',()=>{
 const g=new Game({piece:{kind:'O',orientation:0,x:3,y:18}});g.advance(1000);expect(g.snapshot.score).toBe(0);expect(g.snapshot.lines).toBe(0);
});
it.each([[1,100],[2,300],[3,500],[4,800]])('scores %i simultaneous lines at the pre-clear level', (count,points)=>{
 const b=emptyBoard();for(let y=20-count;y<20;y++)for(let x=0;x<10;x++)if(x!==4)b[y][x]='Z';
 const g=new Game({board:b,piece:{kind:'I',orientation:1,x:2,y:16},lines:10});g.advance(800);
 expect(g.snapshot.score).toBe(points*2);expect(g.snapshot.lines).toBe(10+count);
});
