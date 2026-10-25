/** Routes logical time and browser commands to a single game owner. */
import {Game} from '../game/game';
export type View=Game['snapshot']|null;
export type Command='left'|'right'|'down'|'cw'|'ccw';
export class Controller {
  private game:Game|null=null;
  private last=0;
  private logical=0;
  constructor(private readonly render:(view:View)=>void,private readonly create:()=>Game=()=>new Game()) {render(null);}
  get view():View {return this.game?.snapshot??null;}
  start(now:number):void {this.game=this.create();this.last=now;this.logical=0;this.render(this.view);}
  /** Restoring a suspended document must exclude its inactive wall time. */
  rebaseClock(now:number):void {this.last=Math.max(this.last,now);}
  frame(now:number):void {
    if(!this.game)return;
    this.logical+=Math.max(0,now-this.last);this.last=Math.max(this.last,now);
    this.game.advance(this.logical);this.render(this.view);
  }
  command(command:Command,now:number):void {
    if(!this.game)return;
    this.frame(now);
    if(command==='left')this.game.move(-1);
    if(command==='right')this.game.move(1);
    if(command==='down')this.game.down();
    if(command==='cw')this.game.rotate(1);
    if(command==='ccw')this.game.rotate(-1);
    this.render(this.view);
  }
}
