/** Translate focused native keys into controller commands; repetition is added separately. */
import type {Command,Controller} from '../app/controller';
export function bindInput(canvas:HTMLCanvasElement,start:HTMLButtonElement,controller:Controller):()=>void {
 const begin=()=>{controller.start(performance.now());canvas.focus();};
 const keys:Record<string,Command>={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'cw',KeyX:'cw',KeyZ:'ccw'};
 const listener=(e:KeyboardEvent)=>{
  if(e.code==='Enter'&&(document.activeElement===document.body||document.activeElement===canvas)){e.preventDefault();begin();return;}
  if(document.activeElement!==canvas||!keys[e.code]||e.repeat)return;
  e.preventDefault();controller.command(keys[e.code],performance.now());
 };
 const focus=()=>canvas.focus();start.addEventListener('click',begin);canvas.addEventListener('click',focus);document.addEventListener('keydown',listener);
 return ()=>{start.removeEventListener('click',begin);canvas.removeEventListener('click',focus);document.removeEventListener('keydown',listener);};
}
