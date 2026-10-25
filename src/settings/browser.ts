/** Independent cookie/history effects; source choice remains in the pure service. */
import {KEYS,isSettingValue,type Settings,type SettingKey} from './definitions';
import {resolveSettings,cookieValue} from './service';
export interface SettingsPort {protocol:string;readCookies():string;writeCookie(value:string):void;readURL():string;replaceURL(value:string):void}
export function createBrowserPort(document:Document=globalThis.document,history:History=window.history,location:Location=window.location):SettingsPort {
 return {protocol:location.protocol,readCookies:()=>document.cookie,writeCookie:value=>{document.cookie=value;},readURL:()=>location.href,replaceURL:value=>history.replaceState(history.state,'',value)};
}
const COOKIE_FAILURE='Cookies are unavailable; settings remain active for this page.';
const URL_FAILURE='The URL could not be updated; settings remain active for this page.';
const unique=(warnings:string[])=>[...new Set(warnings)];
function writeCookie<K extends SettingKey>(port:SettingsPort,key:K,value:Settings[K],warnings:string[]):void {
 try {
  const attributes='; Path=/; SameSite=Lax; Max-Age=31536000'+(port.protocol==='https:'?'; Secure':'');
  port.writeCookie('tetris_'+key+'='+encodeURIComponent(value)+attributes);
  if(cookieValue(port.readCookies(),key)!==value)warnings.push(COOKIE_FAILURE);
 }catch{warnings.push(COOKIE_FAILURE);}
}
/** Only valid explicit URL keys enter the startup cookie-write plan. */
export function initializeSettings(port:SettingsPort):{settings:Settings;warnings:string[]} {
 const warnings:string[]=[];let cookies='',search='';
 try{cookies=port.readCookies();}catch{warnings.push(COOKIE_FAILURE);}
 try{search=new URL(port.readURL()).search;}catch{warnings.push('The URL could not be read; saved settings or defaults are in use.');}
 const result=resolveSettings(search,cookies);
 const save=<K extends SettingKey>(key:K)=>{const value=result.explicit[key];if(value!==undefined)writeCookie(port,key,value,warnings);};
 for(const key of KEYS)save(key);
 return {settings:result.settings,warnings:unique(warnings)};
}
/** One failed effect never suppresses the other or changes the active selection. */
export function saveSetting<K extends SettingKey>(port:SettingsPort,key:K,value:Settings[K]):string[] {
 if(!KEYS.some(known=>known===key)||!isSettingValue(key,value))return ['Invalid setting value; selection was not saved.'];
 const warnings:string[]=[];writeCookie(port,key,value,warnings);
 try {
  const url=new URL(port.readURL());url.searchParams.set(key,value);port.replaceURL(url.href);
  if(port.readURL()!==url.href)warnings.push(URL_FAILURE);
 }catch{warnings.push(URL_FAILURE);}
 return unique(warnings);
}
