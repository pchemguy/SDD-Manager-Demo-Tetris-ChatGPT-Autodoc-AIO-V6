/** Readable HTML statistics and lifecycle controls mirror the domain snapshot. */
import {cells,COLORS} from '../game/geometry';
import type {Kind} from '../game/types';
import type {View} from '../app/controller';
export function renderPanels(view:View):void {
 const set=(id:string,value:string)=>{const node=document.getElementById(id)!;if(node.textContent!==value)node.textContent=value;};
 set('next',view?.next??'—');
 drawPreview('next-preview',view?.next??null);
 set('held',view?.held??'EMPTY');drawPreview('hold-preview',view?.held??null);
 set('hold-state',!view?'—':view.penetrator?'LOCKED':view.holdUsed?'USED':'AVAILABLE');
 set('bonus-count',String(view?.bonuses??0));set('bonus-symbols','⚡'.repeat(view?.bonuses??0));
 set('penetrator-state',view?.penetrator?'ACTIVE':view?.bonuses?'ACTIVATE':'EARN 4 LINES');
 const score=String(view?.score??0);set('score',score);set('level',String(view?.level??1));set('lines',String(view?.lines??0));
 (document.getElementById('score') as HTMLElement).style.fontSize=score.length>10?'20px':'34px';
 set('status',view?view.status.toUpperCase().replace('-',' '):'READY');
 const start=document.querySelector<HTMLButtonElement>('#start')!;
 start.firstChild!.textContent=view?'Restart ':'Start game ';
 const pause=document.querySelector<HTMLButtonElement>('#pause')!;pause.disabled=!view||view.status==='game-over';pause.textContent=view?.status==='paused'?'Resume':'Pause';
}

/** Small fixed-frame previews are pure presentations of domain-selected kinds. */
function drawPreview(id:string,kind:Kind|null):void {
 const preview=document.getElementById(id) as HTMLCanvasElement;
 if(preview.dataset.kind===(kind??''))return;
 preview.dataset.kind=kind??'';const ctx=preview.getContext('2d')!;ctx.clearRect(0,0,112,56);
 if(kind)for(const {x,y} of cells({kind,orientation:0,x:0,y:0})){
  ctx.fillStyle=COLORS[kind];ctx.fillRect(29+x*14,15+y*14,12,12);
 }
}
