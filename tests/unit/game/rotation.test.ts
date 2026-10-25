/** Independent normative-table reference tests the actual ordered transformation outcome. */
import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {canPlace,emptyBoard} from '../../../src/game/board';
import {cells,rotationCandidates} from '../../../src/game/geometry';
import type {Kind,Orientation,Piece} from '../../../src/game/types';
const spec=readFileSync(new URL('../../../docs/dev/spec/ROTATION.md',import.meta.url),'utf8');
const orientation:Record<string,Orientation>={'0':0,R:1,'2':2,L:3};
for(const [label,kind] of [['JLSTZ','T'],['I','I']] as const){
 const section=spec.split('## '+label+' kick offsets')[1].split('\n## ')[0];
 for(const row of section.split('\n').filter(r=>/^\| [0R2L]→[0R2L]/.test(r))){
  const transition=row.match(/([0R2L])→([0R2L])/)!,from=orientation[transition[1]],to=orientation[transition[2]];
  const offsets=[...row.matchAll(/\((-?\d+),(-?\d+)\)/g)].map(m=>[Number(m[1]),Number(m[2])]);
  it(label+' '+transition[0]+' selects the first legal kick at walls floor and hidden bounds',()=>{
   let kicked=0;const board=emptyBoard();
   for(let x=-2;x<10;x++)for(let y=-2;y<20;y++){
    const piece:Piece={kind:kind as Kind,orientation:from,x,y};if(!canPlace(board,piece))continue;
    const candidates=offsets.map(([dx,dy])=>({...piece,orientation:to,x:x+dx,y:y+dy}));
    const original=cells(piece);const variants=[board];
    for(const cell of cells(candidates[0]))if(cell.y>=0&&cell.y<20&&cell.x>=0&&cell.x<10&&!original.some(p=>p.x===cell.x&&p.y===cell.y)){
     const stack=emptyBoard();stack[cell.y][cell.x]='Z';variants.push(stack);
    }
    for(const variant of variants){
     expect(rotationCandidates(piece,((to-from+4)%4)===1?1:-1)).toEqual(candidates);
     const expected=candidates.find(p=>canPlace(variant,p))??piece;
     const g=new Game({board:variant,piece,random:()=>0});g.rotate(((to-from+4)%4)===1?1:-1);
     expect(g.snapshot.active).toEqual(expected);
     if(expected.x!==x||expected.y!==y)kicked++;
    }
   }
   expect(kicked).toBeGreaterThan(0);
  });
 }
}
it('rejects stack-blocked kicks atomically and preserves the grounding deadline',()=>{
 const board=emptyBoard();for(const row of board)row.fill('Z');const piece:Piece={kind:'T',orientation:0,x:3,y:5};
 for(const {x,y} of cells(piece))board[y][x]=null;
 const g=new Game({board,piece});g.advance(400);const before=g.snapshot;g.rotate(1);
 expect(g.snapshot.active).toEqual(before.active);expect(g.snapshot.groundedDeadline).toBe(1000);expect(g.snapshot.board).toEqual(before.board);
});
