/** Every setting resolves independently; only valid explicit URL values schedule writes. */
import {expect,it} from 'vitest';
import {DEFAULTS,KEYS,type Settings} from '../../../src/settings/definitions';
import {resolveSettings,cookieValue} from '../../../src/settings/service';
const alternatives:Settings={ghost:'hide',hardDrop:'off',next:'off',hardDropLock:'immediate',lock:'failed-down',hold:'off'};
const cookies=(values:Settings)=>KEYS.map(key=>`tetris_${key}=${values[key]}`).join('; ');
it('uses defaults without creating writes when no source supplies a value',()=>{
 const result=resolveSettings('','');expect(result.settings).toEqual(DEFAULTS);expect(result.explicit).toEqual({});result.settings.hold='off';expect(resolveSettings('','').settings.hold).toBe('on');
});
it.each(KEYS)('uses a valid explicit URL for %s over its cookie',key=>{
 const result=resolveSettings(`?${key}=${alternatives[key]}`,cookies({...DEFAULTS}));expect(result.settings[key]).toBe(alternatives[key]);expect(result.explicit).toEqual({[key]:alternatives[key]});
});
it('retains every omitted saved choice independently',()=>{
 const result=resolveSettings('?unrelated=1',cookies(alternatives));expect(result.settings).toEqual(alternatives);expect(result.explicit).toEqual({});
});
it('schedules valid explicit defaults even when saved choices differ',()=>{
 const search=new URLSearchParams({...DEFAULTS}).toString();const result=resolveSettings(search,cookies(alternatives));expect(result.settings).toEqual(DEFAULTS);expect(result.explicit).toEqual(DEFAULTS);
});
it('mixes URL cookie and default without one invalid key resetting another',()=>{
 const result=resolveSettings('?ghost=dynamic&hardDrop=off&next=BAD&hold=off&unknown=x','tetris_ghost=hide; tetris_next=off; tetris_hardDropLock=immediate');
 expect(result.settings).toEqual({ghost:'dynamic',hardDrop:'off',next:'off',hardDropLock:'immediate',lock:'interval',hold:'off'});expect(result.explicit).toEqual({ghost:'dynamic',hardDrop:'off',hold:'off'});
});
it('treats malformed empty repeated case and whitespace URL values as absent per key',()=>{
 for(const key of KEYS){
  const value=alternatives[key];for(const query of [`${key}=`,`${key}=BAD`,`${key}=${encodeURIComponent(' '+value)}`,`${key}=${value.toUpperCase()}`,`${key}=%E0%A4%A`,`${key}=${DEFAULTS[key]}&${key}=${DEFAULTS[key]}`]){
   const result=resolveSettings(query,cookies(alternatives));expect(result.settings[key],query).toBe(value);expect(result.explicit).not.toHaveProperty(key);
  }
 }
});
it('requires exactly one valid complete-name cookie, with strict decoding and no value trim',()=>{
 for(const key of KEYS){
  const value=alternatives[key],encoded='%'+value.charCodeAt(0).toString(16)+value.slice(1);
  expect(cookieValue(`other=1; tetris_${key}=${encoded}`,key)).toBe(value);
  for(const header of [`tetris_${key}=${value}; tetris_${key}=${value}`,`tetris_${key}=%E0%A4%A`,`tetris_${key}=`,`tetris_${key}=${value} `,`prefix_tetris_${key}=${value}; tetris_${key}_extra=${value}`,`tetris_${key}=%ZZ; tetris_${key}=${value}`]){
   expect(cookieValue(header,key),header).toBeUndefined();expect(resolveSettings('',header).settings[key]).toBe(DEFAULTS[key]);
  }
 }
});
it('lets a valid URL win despite invalid/duplicate cookies and ignores unknown parameter names',()=>{
 const result=resolveSettings('?ghost=show&Ghost=hide&bonus=3','tetris_ghost=hide; tetris_ghost=dynamic');expect(result.settings.ghost).toBe('show');expect(result.explicit).toEqual({ghost:'show'});expect(result.settings.hold).toBe('on');
});
