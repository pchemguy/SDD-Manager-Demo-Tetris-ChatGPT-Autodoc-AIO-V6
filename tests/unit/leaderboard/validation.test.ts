/** Portable record invariants, independent calendar and ASCII ranking fixtures. */
import {expect,it} from 'vitest';
import {validTimestamp,validateResult,validateResults} from '../../../src/leaderboard/validation';
import {Leaderboard} from '../../../src/leaderboard/store';
const record={id:'a',score:0,timestamp:'2026-01-01T00:00:00.000Z'};
it.each(['0001-01-01T00:00:00.000Z','0099-12-31T23:59:59.999Z','0100-01-01T00:00:00.000Z','2000-02-29T00:00:00.000Z','9999-12-31T23:59:59.999Z'])('accepts canonical real UTC %s',s=>expect(validTimestamp(s)).toBe(true));
it.each(['0000-01-01T00:00:00.000Z','1900-02-29T00:00:00.000Z','2026-02-29T00:00:00.000Z','2026-04-31T00:00:00.000Z','2026-01-01T24:00:00.000Z','2026-01-01T00:00:60.000Z','2026-01-01T00:00:00Z','2026-01-01T00:00:00.000+00:00','2026-01-01T00:00:00x000Z',' 2026-01-01T00:00:00.000Z'])('rejects invalid UTC %s',s=>expect(validTimestamp(s)).toBe(false));
it.each([-1,.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,'1',null])('rejects invalid score %s',score=>expect(()=>validateResult({...record,score})).toThrow());
it.each(['','_bad',' space','é','x'.repeat(65)])('rejects invalid ID %s',id=>expect(()=>validateResult({...record,id})).toThrow());
it('requires exact records and unique bounded arrays without mutation',()=>{
 for(const value of [null,[],{}, {...record,extra:1},{...record,timestamp:'bad'}])expect(()=>validateResult(value)).toThrow();
 expect(validateResult({...record,id:'A-._:9',score:Number.MAX_SAFE_INTEGER})).toEqual({...record,id:'A-._:9',score:Number.MAX_SAFE_INTEGER});
 expect(()=>validateResults([record,record])).toThrow();expect(()=>validateResults(Array.from({length:11},(_,i)=>({...record,id:String(i)})))).toThrow();expect(()=>validateResults({})).toThrow();
 const validated=validateResults([record]);validated[0].score=9;expect(record.score).toBe(0);
});
it('ranks score descending then timestamp and ASCII ID ascending, retaining top ten',()=>{
 const store=new Leaderboard();for(let i=0;i<12;i++)store.add({...record,id:'r'+i,score:i});expect(store.results.map(r=>r.score)).toEqual([11,10,9,8,7,6,5,4,3,2]);
 store.replace([{...record,id:'a',score:5},{...record,id:'Z',score:5},{...record,id:'A',score:5},{...record,id:'old',score:5,timestamp:'2025-01-01T00:00:00.000Z'}]);expect(store.results.map(r=>r.id)).toEqual(['old','A','Z','a']);
 const before=store.results;expect(()=>store.replace([record,record])).toThrow();expect(store.results).toEqual(before);expect(()=>store.add({...record,id:'a'})).toThrow();expect(store.results).toEqual(before);
 before[0].score=900;expect(store.results[0].score).toBe(5);store.clear();expect(store.results).toEqual([]);
});
