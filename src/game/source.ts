/** Injectable independent piece source for the classic baseline. */
import { KINDS, type Kind } from './types';
export class PieceSource {
  constructor(private readonly random: () => number = Math.random) {}
  next(): Kind { const n=this.random(); if(n<0 || n>=1 || !Number.isFinite(n)) throw new RangeError('Entropy must be in [0,1)'); return KINDS[Math.floor(n*7)]; }
}
