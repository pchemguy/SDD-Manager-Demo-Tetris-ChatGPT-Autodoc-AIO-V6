/** Readable HTML statistics and lifecycle controls mirror the domain snapshot. */
import {cells,COLORS} from '../game/geometry';
import type {Kind} from '../game/types';
import type {View} from '../app/controller';
import type {Result} from '../leaderboard/validation';
const resultCache=new WeakMap<HTMLElement,string>();
import {DEFAULTS,KEYS,isSettingValue,type Settings,type SettingKey} from '../settings/definitions';
export function renderPanels(view:View,settings:Readonly<Settings>=view?.settings??DEFAULTS,results:readonly Result[]=[],busy=false):void {
 for(const id of ['save','restore','file-format'])(document.getElementById(id) as HTMLButtonElement|HTMLSelectElement).disabled=busy;
 document.getElementById('file-cancel')!.hidden=!busy;
 renderResults(results);
 const set=(id:string,value:string)=>{const node=document.getElementById(id)!;if(node.textContent!==value)node.textContent=value;};
 for(const key of KEYS){const select=document.getElementById('setting-'+key) as HTMLSelectElement;if(select.value!==settings[key])select.value=settings[key];}
 set('next',settings.next==='off'?'OFF':view?.next??'—');
 drawPreview('next-preview',settings.next==='on'?view?.next??null:null);
 document.getElementById('next-preview')!.hidden=settings.next==='off';
 set('held',settings.hold==='off'?'OFF':view?.held??'EMPTY');drawPreview('hold-preview',settings.hold==='on'?view?.held??null:null);
 document.getElementById('hold-preview')!.hidden=settings.hold==='off';
 set('hold-state',settings.hold==='off'?'OFF':!view?'—':view.penetrator?'LOCKED':view.holdUsed?'USED':'AVAILABLE');
 set('bonus-count',String(view?.bonuses??0));set('bonus-symbols','⚡'.repeat(view?.bonuses??0));
 set('penetrator-state',view?.penetrator?'ACTIVE':view?.bonuses?'ACTIVATE':'EARN 4 LINES');
 const score=String(view?.score??0);set('score',score);set('level',String(view?.level??1));set('lines',String(view?.lines??0));
 (document.getElementById('score') as HTMLElement).style.fontSize=score.length>10?'20px':'34px';
 set('status',view?view.status.toUpperCase().replace('-',' '):'READY');
 const start=document.querySelector<HTMLButtonElement>('#start')!;
 start.disabled=busy;start.firstChild!.textContent=view?'Restart ':'Start game ';
 const pause=document.querySelector<HTMLButtonElement>('#pause')!;pause.disabled=busy||!view||view.status==='game-over';pause.textContent=view?.status==='paused'?'Resume':'Pause';
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

/** Native controls own their keyboard behavior; only exact known tokens reach the model. */
export function bindSettings(onChange:<K extends SettingKey>(key:K,value:Settings[K])=>void):()=>void {
 const root=document.getElementById('configuration')!;
 const change=(event:Event)=>{
  const select=event.target;if(!(select instanceof HTMLSelectElement))return;
  const key=select.dataset.setting as SettingKey;
  if(!KEYS.some(known=>known===key)||!isSettingValue(key,select.value))return;
  onChange(key,select.value);
 };
 root.addEventListener('change',change);return()=>root.removeEventListener('change',change);
}

/** Render text only and update rows only when the detached collection changes. */
function renderResults(results:readonly Result[]):void {
 const root=document.getElementById('results')!;const key=JSON.stringify(results);if(resultCache.get(root)===key)return;
 const rows=results.map((result,index)=>{const row=document.createElement('tr');row.dataset.resultId=result.id;
  for(const value of [String(index+1),String(result.score)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
  const cell=document.createElement('td'),time=document.createElement('time');time.dateTime=result.timestamp;time.textContent=result.timestamp.replace('T',' ');cell.append(time);row.append(cell);return row;
 });root.replaceChildren(...rows);document.getElementById('leaderboard-empty')!.hidden=results.length>0;resultCache.set(root,key);
}
