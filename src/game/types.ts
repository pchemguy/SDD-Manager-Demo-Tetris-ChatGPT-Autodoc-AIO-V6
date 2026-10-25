/** Immutable geometry values and the visible settled-board representation. */
export const KINDS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] as const;
export type Kind = typeof KINDS[number];
export type Orientation = 0 | 1 | 2 | 3;
export interface Point { x: number; y: number }
export interface Piece extends Point { kind: Kind; orientation: Orientation }
export type Board = (Kind | null)[][];
export const WIDTH = 10;
export const HEIGHT = 20;
