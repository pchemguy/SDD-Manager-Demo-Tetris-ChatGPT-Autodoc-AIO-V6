/** Routes logical time and browser commands to a single game owner. */
import {Game,type GameOverEvent} from '../game/game';
export type View=(Omit<Game['snapshot'],'status'>&{status:'playing'|'paused'|'game-over'})|null;
export type Command='left'|'right'|'down'|'cw'|'ccw'|'drop'|'hold';
export class Controller {
  private game:Game|null=null;
  private last=0;
  private logical=0;
  private instance=0;
  private completed=false;
  private readonly pauses=new Set<'user'|'hidden'|'blur'>();
  constructor(private readonly render:(view:View)=>void,private readonly create:(id:string)=>Game=(id)=>new Game({gameId:id}),private readonly onCompleted:(event:GameOverEvent)=>void=()=>{}) {render(null);}
  get view():View {
    if(!this.game)return null;
    const snapshot=this.game.snapshot;
    return {...snapshot,status:snapshot.status==='playing'&&this.pauses.size?'paused':snapshot.status};
  }
  start(now:number):void {
    if(this.game)this.frame(now);
    this.game=this.create(`game-${++this.instance}`);this.completed=false;
    this.pauses.delete('user');this.last=now;this.logical=0;this.consumeEvents();this.render(this.view);
  }
  setPaused(reason:'user'|'hidden'|'blur',paused:boolean,now:number):void {
    this.frame(now);
    if(paused)this.pauses.add(reason);else this.pauses.delete(reason);
    this.rebaseClock(now);this.render(this.view);
  }
  togglePause(now:number):void {if(this.game)this.setPaused('user',!this.pauses.has('user'),now);}
  private consumeEvents():void {
    for(const event of this.game?.drainEvents()??[])if(!this.completed){this.completed=true;this.onCompleted(event);}
  }
  /** Restoring a suspended document must exclude its inactive wall time. */
  rebaseClock(now:number):void {this.last=Math.max(this.last,now);}
  frame(now:number):void {
    if(!this.game)return;
    const elapsed=Math.max(0,now-this.last);this.last=Math.max(this.last,now);
    if(!this.pauses.size){this.logical+=elapsed;this.game.advance(this.logical);}
    this.consumeEvents();this.render(this.view);
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
    this.consumeEvents();this.render(this.view);
  }
}
