/** Compose the game, browser rendering and owned animation/input lifetimes. */
import './styles.css';
import {Controller} from './app/controller';
import {renderBoard} from './browser/render';
import {bindInput} from './browser/input';
import {renderPanels} from './browser/panels';
const canvas=document.querySelector<HTMLCanvasElement>('#board')!;
const controller=new Controller(view=>{renderBoard(canvas,view);renderPanels(view);});
const disposeInput=bindInput(canvas,document.querySelector<HTMLButtonElement>('#start')!,controller,document.querySelector<HTMLButtonElement>('#pause')!);
let frame=0;
const tick=(now:number)=>{controller.frame(now);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
let suspended=false;
window.addEventListener('pagehide',(event)=>{
 cancelAnimationFrame(frame);
 if(event.persisted)suspended=true;
 else disposeInput();
});
window.addEventListener('pageshow',(event)=>{
 if(event.persisted&&suspended){suspended=false;controller.rebaseClock(performance.now());frame=requestAnimationFrame(tick);}
});
