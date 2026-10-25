/** Pure per-key source resolution; browser effects belong to the adapter. */
import {DEFAULTS,KEYS,isSettingValue,type Settings,type SettingKey} from './definitions';
export interface Resolution {settings:Settings;explicit:Partial<Settings>}
/** Duplicate names are invalid even when one value decodes correctly. */
export function cookieValue<K extends SettingKey>(header:string,key:K):Settings[K]|undefined {
 const prefix='tetris_'+key+'=';
 const values=header.split(';').map(part=>part.replace(/^[ \t]+/,'')).filter(part=>part.startsWith(prefix)).map(part=>part.slice(prefix.length));
 if(values.length!==1)return undefined;
 try {const value=decodeURIComponent(values[0]);return isSettingValue(key,value)?value:undefined;}
 catch {return undefined;}
}
export function resolveSettings(search:string,cookies:string):Resolution {
 const params=new URLSearchParams(search),settings:Settings={...DEFAULTS},explicit:Partial<Settings>={};
 const resolve=<K extends SettingKey>(key:K)=>{
  const values=params.getAll(key);
  if(values.length===1&&isSettingValue(key,values[0])){
   settings[key]=values[0];explicit[key]=values[0];return;
  }
  const saved=cookieValue(cookies,key);if(saved!==undefined)settings[key]=saved;
 };
 for(const key of KEYS)resolve(key);
 return {settings,explicit};
}
