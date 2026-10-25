/** Routes logical time and browser commands to a single game owner. */
import {Game,type GameOverEvent} from '../game/game';
import {DEFAULTS,type Settings} from '../settings/definitions';
import {Leaderboard} from '../leaderboard/store';
import type {Result} from '../leaderboard/validation';
export interface ResultPorts {id():string;timestamp():string}
/** getRandomValues also supports HTTP deployments without randomUUID. */
function uuid():string {const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=[...b].map(v=>v.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
export type View=(Omit<Game['snapshot'],'status'>&{status:'playing'|'paused'|'game-over'})|null;
export type Command='left'|'right'|'down'|'cw'|'ccw'|'drop'|'hold'|'penetrator';
export class Controller {
  private readonly leaderboard=new Leaderboard();
  get results():Result[]{return this.leaderboard.results;}
  replaceResults(value:unknown):void {this.leaderboard.replace(value);this.publish();}
  clearResults():void {this.leaderboard.clear();this.publish();}
  private publish():void {this.render(this.view,this.results,this.fileBusy);}
  private fileBusy=false;
  get busy():boolean{return this.fileBusy;}
  beginFile(now:number):boolean {if(this.fileBusy)return false;this.fileBusy=true;this.setPaused('file',true,now);return true;}
  endFile(now:number):void {if(!this.fileBusy)return;this.fileBusy=false;this.setPaused('file',false,now);}
  private game:Game|null=null;
  private last=0;
  private logical=0;
  private instance=0;
  private completed=false;
  private settings:Settings={...DEFAULTS};
  private readonly pauses=new Set<'user'|'hidden'|'blur'|'file'>();
  constructor(private readonly render:(view:View,results:Result[],busy:boolean)=>void,private readonly create:(id:string,settings:Settings)=>Game=(id,settings)=>new Game({gameId:id,settings}),private readonly onCompleted:(event:GameOverEvent)=>void=()=>{},private readonly resultPorts:ResultPorts={id:uuid,timestamp:()=>new Date().toISOString()}) {render(null,this.results,false);}
  get view():View {
    if(!this.game)return null;
    const snapshot=this.game.snapshot;
    return {...snapshot,status:snapshot.status==='playing'&&this.pauses.size?'paused':snapshot.status};
  }
  start(now:number):void {
    if(this.fileBusy)return;
    if(this.game)this.frame(now);
    this.game=this.create(`game-${++this.instance}`,{...this.settings});this.completed=false;
    this.pauses.delete('user');this.last=now;this.logical=0;this.consumeEvents();this.publish();
  }
  /** Retain ready/restart configuration and update live availability without clock work. */
  configure(settings:Settings):void {
    this.settings={...settings};this.game?.configure(this.settings);this.publish();
  }
  setPaused(reason:'user'|'hidden'|'blur'|'file',paused:boolean,now:number):void {
    this.frame(now);
    if(paused)this.pauses.add(reason);else this.pauses.delete(reason);
    this.rebaseClock(now);this.publish();
  }
  togglePause(now:number):void {if(this.game)this.setPaused('user',!this.pauses.has('user'),now);}
  private consumeEvents():void {
    for(const event of this.game?.drainEvents()??[])if(!this.completed){
      let id=this.resultPorts.id();let attempts=0;while(this.leaderboard.has(id)){if(++attempts>32)throw new Error('Unable to generate a unique completion ID.');id=this.resultPorts.id();}
      this.leaderboard.add({id,score:event.score,timestamp:this.resultPorts.timestamp()});this.completed=true;this.onCompleted(event);
    }
  }
  /** Restoring a suspended document must exclude its inactive wall time. */
  rebaseClock(now:number):void {this.last=Math.max(this.last,now);}
  frame(now:number):void {
    if(!this.game)return;
    const elapsed=Math.max(0,now-this.last);this.last=Math.max(this.last,now);
    if(!this.pauses.size){this.logical+=elapsed;this.game.advance(this.logical);}
    this.consumeEvents();this.publish();
  }
  command(command:Command,now:number):void {
    if(!this.game)return;
    this.frame(now);
    if(this.pauses.size)return;
    if(command==='left')this.game.move(-1);
    if(command==='right')this.game.move(1);
    if(command==='down')this.game.down();
    if(command==='cw')this.game.rotate(1);
    if(command==='ccw')this.game.rotate(-1);
    if(command==='drop')this.game.hardDrop();
    if(command==='hold')this.game.hold();
    if(command==='penetrator')this.game.activatePenetrator();
    this.consumeEvents();this.publish();
  }
}
