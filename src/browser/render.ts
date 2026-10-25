/** Canvas presentation consumes snapshots and never recomputes movement rules. */
import type {View} from '../app/controller';
import {cells,COLORS} from '../game/geometry';
const CELL=28;
export function renderBoard(canvas:HTMLCanvasElement,view:View):void {
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable');
 ctx.fillStyle='#0a1320';ctx.fillRect(0,0,280,560);
 ctx.strokeStyle='#172433';ctx.lineWidth=.5;
 for(let x=0;x<=10;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,560);ctx.stroke();}
 for(let y=0;y<=20;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(280,y*CELL);ctx.stroke();}
 const block=(x:number,y:number,color:string)=>{
  if(y<0)return;
  ctx.fillStyle=color;ctx.fillRect(x*CELL+1.5,y*CELL+1.5,CELL-3,CELL-3);
  ctx.fillStyle='#ffffff26';ctx.fillRect(x*CELL+3,y*CELL+3,CELL-6,2);
 };
 if(view){
  for(let y=0;y<20;y++)for(let x=0;x<10;x++){
   const kind=view.board[y][x];if(kind)block(x,y,COLORS[kind]);
  }
  const color=view.penetrator?'#ffffff':COLORS[view.active.kind];
  if(view.ghost){
   ctx.fillStyle=color+'22';ctx.strokeStyle=color;ctx.lineWidth=1;
   for(const {x,y} of cells(view.ghost)){
    ctx.fillRect(x*CELL+2,y*CELL+2,CELL-4,CELL-4);
    ctx.strokeRect(x*CELL+2.5,y*CELL+2.5,CELL-5,CELL-5);
   }
  }
  for(const {x,y} of cells(view.active))block(x,y,color);
 }else{
  ctx.fillStyle='#8fa6b1';ctx.textAlign='center';ctx.font='12px system-ui';ctx.fillText('PRESS ENTER TO START',140,280);
 }
 if(view&&view.status!=='playing'){
  ctx.fillStyle='#07101dcc';ctx.fillRect(0,0,280,560);ctx.fillStyle='#dcece5';ctx.textAlign='center';ctx.font='700 22px system-ui';ctx.fillText(view.status==='paused'?'PAUSED':'GAME OVER',140,265);
  ctx.fillStyle='#91aaac';ctx.font='11px system-ui';ctx.fillText(view.status==='paused'?'P OR ESC TO RESUME':'ENTER TO RESTART',140,291);
 }
}
