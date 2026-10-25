/** Real UTF-8 JSON round trips preserve values and apply canonical ranking. */
import {expect,it} from 'vitest';
import {encodeJSON,decodeJSON} from '../../../src/leaderboard/json';
const bytes=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value));
const record={id:'stable',score:0,timestamp:'2026-01-01T00:00:00.000Z'};
it('round trips empty versioned UTF-8 data',()=>{const data=encodeJSON([]);expect(JSON.parse(new TextDecoder().decode(data))).toEqual({formatVersion:1,results:[]});expect(decodeJSON(data)).toEqual([]);});
it('round trips ten records including safe limits and timestamp boundaries',()=>{
 const records=Array.from({length:10},(_,i)=>({...record,id:'id'+i,score:i===9?Number.MAX_SAFE_INTEGER:i,timestamp:i===0?'0001-01-01T00:00:00.000Z':i===9?'9999-12-31T23:59:59.999Z':record.timestamp}));
 const decoded=decodeJSON(encodeJSON(records));expect(decoded).toEqual([...records].reverse());expect(records[0].id).toBe('id0');
});
it('accepts unsorted input and preserves stable fields with independent output',()=>{
 const input=[{...record,id:'a'},{...record,id:'Z'},{...record,id:'A',score:1}];const decoded=decodeJSON(bytes({formatVersion:1,results:input}));expect(decoded.map(r=>r.id)).toEqual(['A','Z','a']);expect(decoded.find(r=>r.id==='Z')).toEqual(input[1]);decoded[0].score=99;expect(input[2].score).toBe(1);
});
it('rejects malformed input and invalid exports instead of inventing data',()=>{
 for(const data of [new Uint8Array([0xc3,0x28]),new TextEncoder().encode('{bad'),bytes({formatVersion:2,results:[]})])expect(()=>decodeJSON(data)).toThrow();expect(()=>encodeJSON([{...record,score:-1}])).toThrow();
});
