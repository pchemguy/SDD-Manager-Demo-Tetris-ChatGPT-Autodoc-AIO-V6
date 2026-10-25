/** Serial browser-independent classic movement and logical-time state. */
import { canPlace, emptyBoard } from './board';
import { cells } from './geometry';
import { PieceSource } from './source';
import type { Board, Piece, Orientation } from './types';
export interface GameOptions { random?: () => number; board?: Board; piece?: Piece }
export class Game {
  private board:Board;
  private active:Piece;
  private status:'playing'|'game-over'='playing';
  private time=0;
  private nextGravity=1000;
  private groundedDeadline:number|null=null;
  private readonly source:PieceSource;
  constructor(options:GameOptions={}) {
    this.board=(options.board??emptyBoard()).map(row=>[...row]);
    this.source=new PieceSource(options.random);
    this.active=options.piece?{...options.piece}:this.spawnPiece();
    if(!canPlace(this.board,this.active)) this.status='game-over';
    this.refreshGrounding();
  }
  private spawnPiece():Piece {return {kind:this.source.next(),orientation:0,x:3,y:-1};}
  /** A detached snapshot prevents renderers from mutating the domain. */
  get snapshot() { return {board:this.board.map(row=>[...row]),active:{...this.active},status:this.status,time:this.time,groundedDeadline:this.groundedDeadline}; }
  private refreshGrounding():void {
    if(this.status!=='playing') {this.groundedDeadline=null;return;}
    if(canPlace(this.board,{...this.active,y:this.active.y+1})) this.groundedDeadline=null;
    else if(this.groundedDeadline===null) this.groundedDeadline=this.time+1000;
  }
  private lock():void {
    if(!canPlace(this.board,this.active) || cells(this.active).some(p=>p.y<0)) {
      this.status='game-over';this.groundedDeadline=null;return;
    }
    for(const {x,y} of cells(this.active)) this.board[y][x]=this.active.kind;
    this.active=this.spawnPiece();this.groundedDeadline=null;this.nextGravity=this.time+1000;
    if(!canPlace(this.board,this.active)) this.status='game-over';
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
      this.nextGravity=this.time+1000;
    }
    this.time=to;
  }
  private tryTransform(candidate:Piece):boolean {
    if(this.status!=='playing' || !canPlace(this.board,candidate)) return false;
    this.active=candidate;this.refreshGrounding();return true;
  }
  move(dx:-1|1):void {this.tryTransform({...this.active,x:this.active.x+dx});}
  rotate(direction:-1|1):void {
    this.tryTransform({...this.active,orientation:((this.active.orientation+direction+4)%4) as Orientation});
  }
  down():void {if(this.tryTransform({...this.active,y:this.active.y+1})) this.nextGravity=this.time+1000;}
}
