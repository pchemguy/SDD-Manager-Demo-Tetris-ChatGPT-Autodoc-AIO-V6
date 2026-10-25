/** Serial browser-independent gameplay and logical-time state. */
import { canPlace, clearLines, emptyBoard } from './board';
import { cells,rotationCandidates } from './geometry';
import { PieceSource } from './source';
import { landing } from './landing';
import type { Board, Piece, Kind } from './types';
import {DEFAULTS,type Settings} from '../settings/definitions';
export interface GameOptions { random?: () => number; board?: Board; piece?: Piece; lines?:number; score?:number;gameId?:string;bonuses?:number;settings?:Settings }
export interface GameOverEvent {type:'game-over';gameId:string;score:number;lines:number;level:number}
export class Game {
  private readonly gameId:string;
  private readonly events:GameOverEvent[]=[];
  /** Completion is queued once and consumed independently of rendering frequency. */
  drainEvents():GameOverEvent[] {return this.events.splice(0);}
  private board:Board;
  private active:Piece;
  private status:'playing'|'game-over'='playing';
  private time=0;
  private nextGravity=1000;
  private groundedDeadline:number|null=null;
  private score=0;
  private lines=0;
  private held:Kind|null=null;
  private holdUsed=false;
  private penetrator=false;
  private bonuses=0;
  private settings:Settings={...DEFAULTS};
  private locking:Pick<Settings,'lock'|'hardDropLock'>={lock:DEFAULTS.lock,hardDropLock:DEFAULTS.hardDropLock};
  private readonly source:PieceSource;
  constructor(options:GameOptions={}) {
    this.gameId=options.gameId??'game';
    for(const value of [options.lines??0,options.score??0]) if(!Number.isSafeInteger(value)||value<0)throw new RangeError('Counters must be safe nonnegative integers');
    this.lines=options.lines??0;this.score=options.score??0;
    this.bonuses=options.bonuses??0;
    if(!Number.isInteger(this.bonuses)||this.bonuses<0||this.bonuses>3)throw new RangeError('Bonuses must be an integer from zero to three');
    this.settings={...(options.settings??DEFAULTS)};
    this.board=(options.board??emptyBoard()).map(row=>[...row]);
    this.source=new PieceSource(options.random);
    this.active=options.piece?{...options.piece}:this.spawnPiece();
    this.startPieceTiming();
  }
  private spawnPiece(kind:Kind=this.source.next()):Piece {return {kind,orientation:0,x:3,y:-1};}
  /** All replacement paths establish fresh spawn clocks and collision checks. */
  private startPieceTiming():void {
    this.locking={lock:this.settings.lock,hardDropLock:this.settings.hardDropLock};
    this.groundedDeadline=null;this.nextGravity=this.time+this.interval;
    if(!canPlace(this.board,this.active))this.endGame();
    this.refreshGrounding();
  }
  private get level():number {return Math.floor(this.lines/10)+1;}
  private get interval():number {return Math.max(70,1000*Math.pow(.8,this.level-1));}
  private addScore(points:number):void {this.score=Math.min(Number.MAX_SAFE_INTEGER,this.score+points);}
  private endGame():void {
    if(this.status==='game-over')return;
    this.status='game-over';this.groundedDeadline=null;this.penetrator=false;
    this.events.push({type:'game-over',gameId:this.gameId,score:this.score,lines:this.lines,level:this.level});
  }
  /** A detached snapshot prevents renderers from mutating the domain. */
  get snapshot() { return {settings:{...this.settings},locking:{...this.locking},penetrator:this.penetrator,bonuses:this.bonuses,held:this.held,holdUsed:this.holdUsed,ghost:this.project(),next:this.source.peek(),board:this.board.map(row=>[...row]),active:{...this.active},status:this.status,time:this.time,groundedDeadline:this.groundedDeadline,score:this.score,lines:this.lines,level:this.level}; }
  /** One projection selection is shared by all ordinary/penetrator consumers. */
  private project(piece:Piece=this.active):Piece|null {
    return landing(this.board,piece,this.penetrator?'penetrator':'ordinary');
  }
  private refreshGrounding():void {
    if(this.status!=='playing'||this.locking.lock==='failed-down') {this.groundedDeadline=null;return;}
    const target=this.project();
    if((target&&target.y>this.active.y)||(!target&&!this.penetrator&&canPlace(this.board,{...this.active,y:this.active.y+1}))) this.groundedDeadline=null;
    else if(this.groundedDeadline===null) this.groundedDeadline=this.time+this.interval;
  }
  private lock():void {
    if(!canPlace(this.board,this.active) || cells(this.active).some(p=>p.y<0)) {
      this.endGame();return;
    }
    for(const {x,y} of cells(this.active)) this.board[y][x]=this.active.kind;
    this.penetrator=false;
    const compacted=clearLines(this.board);this.addScore([0,100,300,500,800][compacted.cleared]*this.level);
    if(compacted.cleared===4)this.bonuses=Math.min(3,this.bonuses+1);
    this.board=compacted.board;this.lines=Math.min(Number.MAX_SAFE_INTEGER,this.lines+compacted.cleared);
    this.holdUsed=false;this.active=this.spawnPiece();this.startPieceTiming();
  }
  /** Advance absolute logical game time; deadlines take priority at exact ties. */
  advance(to:number):void {
    if(!Number.isFinite(to) || to<this.time) throw new RangeError('Game time must be finite and monotonic');
    while(this.status==='playing') {
      const due=Math.min(this.nextGravity,this.groundedDeadline??Infinity);
      if(due>to) break;
      this.time=due;
      if(this.groundedDeadline!==null && this.groundedDeadline<=this.nextGravity) {this.lock();continue;}
      this.descend();
      this.nextGravity=this.time+this.interval;
    }
    this.time=to;
  }
  private tryTransform(candidate:Piece):boolean {
    if(this.status!=='playing' || !(this.penetrator?this.project(candidate)!==null:canPlace(this.board,candidate))) return false;
    this.active=candidate;this.refreshGrounding();return true;
  }
  /** Failed-down locks only after an actual descent attempt, never a lateral rejection. */
  private descend():boolean {
    if(this.tryTransform({...this.active,y:this.active.y+1}))return true;
    if(this.status==='playing'&&this.locking.lock==='failed-down'&&(!this.penetrator||this.project()?.y===this.active.y))this.lock();
    return false;
  }
  /** Selection changes do not advance time or reinterpret an active piece's policies. */
  configure(settings:Settings):void {this.settings={...settings};}
  move(dx:-1|1):void {this.tryTransform({...this.active,x:this.active.x+dx});}
  rotate(direction:-1|1):void {
    for(const candidate of rotationCandidates(this.active,direction))if(this.tryTransform(candidate))break;
  }
  /** Spend only after viability succeeds; normal games earn funding via line clears. */
  activatePenetrator():boolean {
    if(this.status!=='playing'||this.penetrator||this.bonuses===0||!landing(this.board,this.active,'penetrator'))return false;
    this.bonuses--;this.penetrator=true;this.refreshGrounding();return true;
  }
  /** Empty hold consumes next; a nonempty exchange never touches the queue. */
  hold():void {
    if(this.status!=='playing'||this.settings.hold==='off'||this.holdUsed||this.penetrator)return;
    const replacement=this.held??this.source.next();this.held=this.active.kind;
    this.active=this.spawnPiece(replacement);this.holdUsed=true;this.startPieceTiming();
  }
  /** Availability is live; the hard-drop/general lock choices are captured at spawn. */
  hardDrop():void {
    if(this.status!=='playing'||this.settings.hardDrop==='off')return;
    const target=this.project();if(!target)return;
    const distance=target.y-this.active.y;
    if(distance>0){
      if(!this.tryTransform(target))return;
      this.nextGravity=this.time+this.interval;this.addScore(2*distance);
    }
    if(this.locking.hardDropLock==='immediate')this.lock();
  }
  down():void {if(this.descend()){this.nextGravity=this.time+this.interval;this.addScore(1);}}
}
