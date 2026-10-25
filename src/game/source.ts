/** Fisher–Yates seven-bag source with a non-consuming next-piece queue. */
import { KINDS, type Kind } from './types';
export class PieceSource {
  private bag:Kind[]=[];
  constructor(private readonly random: () => number = Math.random) {}
  private fill():void {
    if(this.bag.length)return;
    const bag=[...KINDS];
    for(let i=bag.length-1;i>0;i--){
      const n=this.random();
      if(n<0||n>=1||!Number.isFinite(n))throw new RangeError('Entropy must be in [0,1)');
      const j=Math.floor(n*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];
    }
    this.bag=bag;
  }
  peek():Kind {this.fill();return this.bag[this.bag.length-1];}
  next():Kind {this.fill();const kind=this.bag.pop()!;this.fill();return kind;}
}
