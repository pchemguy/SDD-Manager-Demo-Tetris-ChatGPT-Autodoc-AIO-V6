/** Compose the game, browser rendering and owned animation/input lifetimes. */
import './styles.css';
import {Controller} from './app/controller';
import {renderBoard} from './browser/render';
import {bindInput,type InputBinding} from './browser/input';
import {renderPanels,bindSettings} from './browser/panels';
import {bindFiles} from './browser/files';
import {createBrowserPort,initializeSettings,saveSetting} from './settings/browser';
const canvas=document.querySelector<HTMLCanvasElement>('#board')!;
let input:InputBinding|undefined;
const settingsPort=createBrowserPort();
const initial=initializeSettings(settingsPort);
let settings=initial.settings;
const persistenceStatus=(warnings:string[])=>{document.querySelector('#settings-status')!.textContent=warnings.length?warnings.join(' '):'Settings saved in cookies and URL when selected.';};
persistenceStatus(initial.warnings);
const controller=new Controller((view,results,busy)=>{renderBoard(canvas,view);renderPanels(view,settings,results,busy);if(view?.status!=='playing')input?.reset();});
controller.configure(settings);
const files=bindFiles(controller);
const unbindSettings=bindSettings((key,value)=>{settings={...settings,[key]:value};controller.configure(settings);persistenceStatus(saveSetting(settingsPort,key,value));});
input=bindInput(canvas,document.querySelector<HTMLButtonElement>('#start')!,controller,document.querySelector<HTMLButtonElement>('#pause')!);
let frame=0;
const tick=(now:number)=>{controller.frame(now);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
let suspended=false;
window.addEventListener('pagehide',(event)=>{
 files.cancel();controller.clearResults();cancelAnimationFrame(frame);input?.reset();
 if(event.persisted)suspended=true;
 else {input?.dispose();unbindSettings();files.dispose();}
});
window.addEventListener('pageshow',(event)=>{
 if(event.persisted&&suspended){suspended=false;controller.rebaseClock(performance.now());frame=requestAnimationFrame(tick);}
});
