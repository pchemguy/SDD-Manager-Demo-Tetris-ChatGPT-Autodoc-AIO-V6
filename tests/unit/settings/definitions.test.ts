/** External serialization tokens and defaults follow the accepted configuration table. */
import {expect,it} from 'vitest';
import {DEFAULTS,OPTIONS,KEYS,isSettingValue} from '../../../src/settings/definitions';
it('defines exactly the six settings and sensible defaults',()=>{
 expect(KEYS).toEqual(['ghost','hardDrop','next','hardDropLock','lock','hold']);
 expect(DEFAULTS).toEqual({ghost:'show',hardDrop:'on',next:'on',hardDropLock:'follow',lock:'interval',hold:'on'});
 for(const key of KEYS)for(const value of OPTIONS[key])expect(isSettingValue(key,value)).toBe(true);
});
it('does not trim coerce or accept case variants',()=>{
 for(const value of ['SHOW',' show','show ',true,1,null,undefined])expect(isSettingValue('ghost',value)).toBe(false);
 expect(isSettingValue('lock','failed-down')).toBe(true);expect(isSettingValue('hardDropLock','immediate')).toBe(true);
});
