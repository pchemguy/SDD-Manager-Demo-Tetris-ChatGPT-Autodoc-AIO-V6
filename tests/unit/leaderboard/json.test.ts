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

it.each([
 ['missing fields',{formatVersion:1,results:[{id:'a',score:0}]}],
 ['extra record field',{formatVersion:1,results:[{...record,extra:0}]}],
 ['extra root field',{formatVersion:1,results:[],extra:0}],
 ['wrong version',{formatVersion:99,results:[]}],
 ['string score',{formatVersion:1,results:[{...record,score:'0'}]}],
 ['null score',{formatVersion:1,results:[{...record,score:null}]}],
 ['negative score',{formatVersion:1,results:[{...record,score:-1}]}],
 ['fraction score',{formatVersion:1,results:[{...record,score:.5}]}],
 ['unsafe score',{formatVersion:1,results:[{...record,score:9007199254740992}]}],
 ['invalid date',{formatVersion:1,results:[{...record,timestamp:'1900-02-29T00:00:00.000Z'}]}],
 ['offset timestamp',{formatVersion:1,results:[{...record,timestamp:'2026-01-01T00:00:00.000+00:00'}]}],
 ['duplicate IDs',{formatVersion:1,results:[record,{...record,score:2}]}],
 ['eleventh row',{formatVersion:1,results:Array.from({length:11},(_,i)=>({...record,id:'r'+i}))}],
 ['linefeed ID',{formatVersion:1,results:[{...record,id:'abc\n'}]}],
 ['carriage return ID',{formatVersion:1,results:[{...record,id:'abc\r'}]}],
 ['Unicode ID',{formatVersion:1,results:[{...record,id:'aé'}]}],
])('rejects the entire %s file',(_name,value)=>expect(()=>decodeJSON(bytes(value))).toThrow());
it('accepts exactly the byte bound and rejects the next byte before UTF-8 parsing',()=>{
 const text=JSON.stringify({formatVersion:1,results:[]});const exact=new TextEncoder().encode(text.padEnd(65536,' '));expect(decodeJSON(exact)).toEqual([]);const excess=new Uint8Array(65537);excess.set(exact);excess[65536]=255;expect(()=>decodeJSON(excess)).toThrow(/65536-byte/);
});
it.each([[0xff],[0xc0,0xaf],[0xe2,0x82],[0xed,0xa0,0x80]])('rejects malformed UTF-8 sequence %s',(...values)=>expect(()=>decodeJSON(new Uint8Array(values))).toThrow(/UTF-8/));
it('uses standard JSON duplicate-property semantics and independent ASCII ties',()=>{
 expect(decodeJSON(new TextEncoder().encode('{"formatVersion":2,"formatVersion":1,"results":[]}'))).toEqual([]);
 const result=decodeJSON(bytes({formatVersion:1,results:[{...record,id:'a'},{...record,id:'Z'},{...record,id:'A'}]}));expect(result.map(r=>r.id)).toEqual(['A','Z','a']);
});
