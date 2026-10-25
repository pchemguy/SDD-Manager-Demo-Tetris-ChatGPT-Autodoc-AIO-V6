/** Readable HTML statistics and lifecycle controls mirror the domain snapshot. */
import type {View} from '../app/controller';
export function renderPanels(view:View):void {
 const set=(id:string,value:string)=>{const node=document.getElementById(id)!;if(node.textContent!==value)node.textContent=value;};
 const score=String(view?.score??0);set('score',score);set('level',String(view?.level??1));set('lines',String(view?.lines??0));
 (document.getElementById('score') as HTMLElement).style.fontSize=score.length>10?'20px':'34px';
 set('status',view?view.status.toUpperCase().replace('-',' '):'READY');
 const start=document.querySelector<HTMLButtonElement>('#start')!;
 start.firstChild!.textContent=view?'Restart ':'Start game ';
 const pause=document.querySelector<HTMLButtonElement>('#pause')!;pause.disabled=!view||view.status==='game-over';pause.textContent=view?.status==='paused'?'Resume':'Pause';
}
