/** The actual canonical schema is compiled, with calendar validation enabled. */
import {expect,it} from 'vitest';
import {schemaValid} from '../../../src/leaderboard/json';
import {readFileSync} from 'node:fs';
it('publishes exact canonical schema bytes',()=>expect(readFileSync('public/leaderboard.schema.json')).toEqual(readFileSync('docs/dev/spec/LEADERBOARD-SCHEMA.json')));
it('accepts exact versioned records and rejects structure without mutation',()=>{
 const r={id:'stable',score:0,timestamp:'2000-02-29T23:59:59.999Z'};expect(schemaValid({formatVersion:1,results:[r]})).toBe(true);
 for(const bad of [{results:[]},{formatVersion:'1',results:[]},{formatVersion:1,results:[],extra:1},{formatVersion:1,results:[{...r,score:'1'}]},{formatVersion:1,results:[{...r,extra:true}]}]){const before=JSON.stringify(bad);expect(schemaValid(bad)).toBe(false);expect(JSON.stringify(bad)).toBe(before);}
});
it.each(['1900-02-29T00:00:00.000Z','0000-01-01T00:00:00.000Z','2026-04-31T00:00:00.000Z','2026-01-01T24:00:00.000Z'])('custom utc-timestamp rejects %s through actual schema',timestamp=>expect(schemaValid({formatVersion:1,results:[{id:'a',score:0,timestamp}]})).toBe(false));
