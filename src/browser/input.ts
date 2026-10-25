/** Focused native input owns repeat timers and resets them at lifecycle boundaries. */
import type {Command,Controller} from '../app/controller';
export interface InputBinding {reset():void;dispose():void}
export function bindInput(canvas:HTMLCanvasElement,start:HTMLButtonElement,controller:Controller,pause:HTMLButtonElement):InputBinding {
 const keys:Record<string,Command>={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'cw',KeyX:'cw',KeyZ:'ccw',Space:'drop',KeyC:'hold',ShiftLeft:'hold',ShiftRight:'hold'};
 const pressed=new Set<string>();let horizontal:string|null=null;
 let horizontalTimer:ReturnType<typeof setTimeout>|undefined;
 let downTimer:ReturnType<typeof setTimeout>|undefined;
 const clearHorizontal=()=>{if(horizontalTimer!==undefined)clearTimeout(horizontalTimer);horizontalTimer=undefined;};
 const clearDown=()=>{if(downTimer!==undefined)clearTimeout(downTimer);downTimer=undefined;};
 const reset=()=>{pressed.clear();horizontal=null;clearHorizontal();clearDown();};
 const playable=()=>document.activeElement===canvas&&controller.view?.status==='playing';
 const repeat=(axis:'horizontal'|'down')=>{
  const code=axis==='down'?'ArrowDown':horizontal;
  if(!code||!pressed.has(code)||!playable()){reset();return;}
  controller.command(keys[code],performance.now());
  if(!playable()){reset();return;}
  if(axis==='down')downTimer=setTimeout(()=>repeat(axis),50);
  else horizontalTimer=setTimeout(()=>repeat(axis),50);
 };
 const syncVisibility=()=>{reset();controller.setPaused('hidden',document.hidden,performance.now());};
 const blur=()=>{reset();controller.setPaused('blur',true,performance.now());};
 const focus=()=>controller.setPaused('blur',false,performance.now());
 const begin=()=>{reset();controller.start(performance.now());canvas.focus();};
 const toggle=()=>{reset();controller.togglePause(performance.now());canvas.focus();};
 const keydown=(event:KeyboardEvent)=>{
  const owns=document.activeElement===canvas;
  if(event.code==='Enter'&&(owns||document.activeElement===document.body)){
   if(!event.repeat&&(!controller.view||controller.view.status==='game-over')){event.preventDefault();begin();}return;
  }
  if(!owns)return;
  if(event.code==='KeyP'||event.code==='Escape'){event.preventDefault();if(!event.repeat)toggle();return;}
  const command=keys[event.code];if(!command)return;
  event.preventDefault();if(event.repeat||pressed.has(event.code)||!playable())return;
  if(event.code==='ArrowDown'){
   pressed.add(event.code);controller.command(command,performance.now());clearDown();downTimer=setTimeout(()=>repeat('down'),150);
  }else if(event.code==='ArrowLeft'||event.code==='ArrowRight'){
   pressed.add(event.code);horizontal=event.code;clearHorizontal();controller.command(command,performance.now());horizontalTimer=setTimeout(()=>repeat('horizontal'),150);
  }else controller.command(command,performance.now());
 };
 const keyup=(event:KeyboardEvent)=>{
  pressed.delete(event.code);
  if(event.code==='ArrowDown')clearDown();
  if(event.code===horizontal){
   clearHorizontal();const other=event.code==='ArrowLeft'?'ArrowRight':'ArrowLeft';horizontal=pressed.has(other)?other:null;
   if(horizontal)horizontalTimer=setTimeout(()=>repeat('horizontal'),150);
  }
 };
 const focusCanvas=()=>canvas.focus();
 start.addEventListener('click',begin);pause.addEventListener('click',toggle);canvas.addEventListener('click',focusCanvas);canvas.addEventListener('blur',reset);
 document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);document.addEventListener('visibilitychange',syncVisibility);
 window.addEventListener('blur',blur);window.addEventListener('focus',focus);
 controller.setPaused('hidden',document.hidden,performance.now());controller.setPaused('blur',!document.hasFocus(),performance.now());
 return {reset,dispose(){reset();start.removeEventListener('click',begin);pause.removeEventListener('click',toggle);canvas.removeEventListener('click',focusCanvas);canvas.removeEventListener('blur',reset);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);document.removeEventListener('visibilitychange',syncVisibility);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);}};
}
