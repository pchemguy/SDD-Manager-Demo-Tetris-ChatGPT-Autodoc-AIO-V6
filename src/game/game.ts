/** Serial browser-independent classic movement and logical-time state. */
import { canPlace, clearLines, emptyBoard } from './board';
import { cells,rotationCandidates } from './geometry';
import { PieceSource } from './source';
import type { Board, Piece } from './types';
export interface GameOptions { random?: () => number; board?: Board; piece?: Piece; lines?:number; score?:number;gameId?:string }
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
  private readonly source:PieceSource;
  constructor(options:GameOptions={}) {
    this.gameId=options.gameId??'game';
    for(const value of [options.lines??0,options.score??0]) if(!Number.isSafeInteger(value)||value<0)throw new RangeError('Counters must be safe nonnegative integers');
    this.lines=options.lines??0;this.score=options.score??0;
    this.board=(options.board??emptyBoard()).map(row=>[...row]);
    this.source=new PieceSource(options.random);
    this.active=options.piece?{...options.piece}:this.spawnPiece();
    if(!canPlace(this.board,this.active)) this.endGame();
    this.nextGravity=this.interval;
    this.refreshGrounding();
  }
  private spawnPiece():Piece {return {kind:this.source.next(),orientation:0,x:3,y:-1};}
  private get level():number {return Math.floor(this.lines/10)+1;}
  private get interval():number {return Math.max(70,1000*Math.pow(.8,this.level-1));}
  private addScore(points:number):void {this.score=Math.min(Number.MAX_SAFE_INTEGER,this.score+points);}
  private endGame():void {
    if(this.status==='game-over')return;
    this.status='game-over';this.groundedDeadline=null;
    this.events.push({type:'game-over',gameId:this.gameId,score:this.score,lines:this.lines,level:this.level});
  }
  /** A detached snapshot prevents renderers from mutating the domain. */
  get snapshot() { return {board:this.board.map(row=>[...row]),active:{...this.active},status:this.status,time:this.time,groundedDeadline:this.groundedDeadline,score:this.score,lines:this.lines,level:this.level}; }
  private refreshGrounding():void {
    if(this.status!=='playing') {this.groundedDeadline=null;return;}
    if(canPlace(this.board,{...this.active,y:this.active.y+1})) this.groundedDeadline=null;
    else if(this.groundedDeadline===null) this.groundedDeadline=this.time+this.interval;
  }
  private lock():void {
    if(!canPlace(this.board,this.active) || cells(this.active).some(p=>p.y<0)) {
      this.endGame();return;
    }
    for(const {x,y} of cells(this.active)) this.board[y][x]=this.active.kind;
    const compacted=clearLines(this.board);this.addScore([0,100,300,500,800][compacted.cleared]*this.level);
    this.board=compacted.board;this.lines=Math.min(Number.MAX_SAFE_INTEGER,this.lines+compacted.cleared);
    this.active=this.spawnPiece();this.groundedDeadline=null;this.nextGravity=this.time+this.interval;
    if(!canPlace(this.board,this.active)) this.endGame();
    this.refreshGrounding();
  }
  /** Advance absolute logical game time; deadlines take priority at exact ties. */
  advance(to:number):void {
    if(!Number.isFinite(to) || to<this.time) throw new RangeError('Game time must be finite and monotonic');
    while(this.status==='playing') {
      const due=Math.min(this.nextGravity,this.groundedDeadline??Infinity);
      if(due>to) break;
      this.time=due;
      if(this.groundedDeadline!==null && this.groundedDeadline<=this.nextGravity) {this.lock();continue;}
      this.tryTransform({...this.active,y:this.active.y+1});
      this.nextGravity=this.time+this.interval;
    }
    this.time=to;
  }
  private tryTransform(candidate:Piece):boolean {
    if(this.status!=='playing' || !canPlace(this.board,candidate)) return false;
    this.active=candidate;this.refreshGrounding();return true;
  }
  move(dx:-1|1):void {this.tryTransform({...this.active,x:this.active.x+dx});}
  rotate(direction:-1|1):void {
    for(const candidate of rotationCandidates(this.active,direction))if(this.tryTransform(candidate))break;
  }
  down():void {if(this.tryTransform({...this.active,y:this.active.y+1})){this.nextGravity=this.time+this.interval;this.addScore(1);}}
}
