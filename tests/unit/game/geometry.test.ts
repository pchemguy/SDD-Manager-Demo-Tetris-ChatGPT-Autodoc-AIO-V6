import { expect, it } from 'vitest';
import { cells } from '../../../src/game/geometry';
import { canPlace, emptyBoard } from '../../../src/game/board';
import { KINDS, type Piece } from '../../../src/game/types';
const piece = (kind: Piece['kind'] = 'I', x = 3, y = -1, orientation: Piece['orientation'] = 0): Piece => ({kind,x,y,orientation});
it('places the four I spawn cells on visible row zero', () => {
  expect(cells(piece())).toEqual([{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0}]);
});
it('rotates T clockwise about the local center', () => {
  expect(cells(piece('T',0,0,1))).toEqual([{x:2,y:1},{x:1,y:0},{x:1,y:1},{x:1,y:2}]);
});
it('keeps O occupied cells invariant in every orientation', () => {
  const expected=[{x:1,y:0},{x:2,y:0},{x:1,y:1},{x:2,y:1}];
  for(const orientation of [0,1,2,3] as const) expect(cells(piece('O',0,0,orientation))).toEqual(expected);
});
it('allocates independent rows and accepts each kind at spawn', () => {
  const board=emptyBoard(); expect(board).toHaveLength(20); expect(board[0]).toHaveLength(10);
  board[19][0]='Z'; expect(board[18][0]).toBeNull();
  for(const kind of KINDS) expect(canPlace(board,piece(kind))).toBe(true);
});
it('rejects wall floor hidden-bound and occupied collisions', () => {
  const board=emptyBoard(); board[0][3]='T';
  expect(canPlace(board,piece())).toBe(false);
  expect(canPlace(emptyBoard(),piece('I',-1,0))).toBe(false);
  expect(canPlace(emptyBoard(),piece('I',0,19))).toBe(false);
  expect(canPlace(emptyBoard(),piece('T',0,-3))).toBe(false);
});
