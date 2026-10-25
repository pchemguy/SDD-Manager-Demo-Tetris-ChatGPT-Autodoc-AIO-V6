/** Cookie and history writes are independent effects with observable verification. */
import {expect,it} from 'vitest';
import {DEFAULTS,KEYS,type Settings} from '../../../src/settings/definitions';
import {initializeSettings,saveSetting,createBrowserPort,type SettingsPort} from '../../../src/settings/browser';
const alternatives:Settings={ghost:'hide',hardDrop:'off',next:'off',hardDropLock:'immediate',lock:'failed-down',hold:'off'};
const header=(settings:Settings)=>KEYS.map(key=>`tetris_${key}=${settings[key]}`).join('; ');
function fake(url='https://game.example/play/index.html?foreign=a%20b#stack',cookies='',faults:{cookie?:boolean;cookieRead?:boolean;cookieIgnore?:boolean;url?:boolean;urlRead?:boolean;urlIgnore?:boolean}={}){
 let currentURL=url,currentCookies=cookies;const writes:string[]=[],replaced:string[]=[];
 const port:SettingsPort={protocol:new URL(url).protocol,
  readCookies(){if(faults.cookieRead)throw Error('blocked');return currentCookies;},
  writeCookie(value){writes.push(value);if(faults.cookie)throw Error('blocked');if(faults.cookieIgnore)return;const pair=value.split(';')[0],name=pair.split('=')[0];currentCookies=[...currentCookies.split(';').map(x=>x.trimStart()).filter(x=>x&&!x.startsWith(name+'=')),pair].join('; ');},
  readURL(){if(faults.urlRead)throw Error('blocked');return currentURL;},
  replaceURL(value){replaced.push(value);if(faults.url)throw Error('blocked');if(!faults.urlIgnore)currentURL=value;},
 };
 return {port,writes,replaced,url:()=>new URL(currentURL),cookies:()=>currentCookies};
}
it('saves all valid explicit URL defaults to their exact secure cookies without rewriting URL',()=>{
 const f=fake('https://game.example/?'+new URLSearchParams({...DEFAULTS}),header(alternatives));const result=initializeSettings(f.port);
 expect(result.settings).toEqual(DEFAULTS);expect(result.warnings).toEqual([]);expect(f.replaced).toEqual([]);expect(f.writes).toHaveLength(6);
 for(const key of KEYS)expect(f.writes).toContain(`tetris_${key}=${DEFAULTS[key]}; Path=/; SameSite=Lax; Max-Age=31536000; Secure`);
});
it('does not overwrite omitted cookies or write defaults absent from URL',()=>{
 const f=fake(undefined,header(alternatives));const result=initializeSettings(f.port);expect(result.settings).toEqual(alternatives);expect(f.writes).toEqual([]);expect(f.replaced).toEqual([]);
 const empty=fake();initializeSettings(empty.port);expect(empty.writes).toEqual([]);
});
it('writes only valid unique explicit keys, including a default',()=>{
 const f=fake('https://game.example/?ghost=show&hold=on&hold=on&next=BAD',header(alternatives));const result=initializeSettings(f.port);expect(result.settings.hold).toBe('off');expect(f.writes).toEqual(['tetris_ghost=show; Path=/; SameSite=Lax; Max-Age=31536000; Secure']);
});
it('changes exactly one cookie/query key, collapses duplicates and preserves path foreign values and fragment',()=>{
 const f=fake('http://game.example/play/index.html?foreign=a%20b&hold=on&hold=off#stack');expect(saveSetting(f.port,'hold','off')).toEqual([]);
 expect(f.writes).toEqual(['tetris_hold=off; Path=/; SameSite=Lax; Max-Age=31536000']);expect(f.replaced).toHaveLength(1);expect(f.url().searchParams.getAll('hold')).toEqual(['off']);expect(f.url().searchParams.get('foreign')).toBe('a b');expect(f.url().pathname).toBe('/play/index.html');expect(f.url().hash).toBe('#stack');expect(f.url().searchParams.has('ghost')).toBe(false);
});
it('still updates URL when cookie writing fails',()=>{
 const f=fake(undefined,'',{cookie:true});const warnings=saveSetting(f.port,'hold','off');expect(f.url().searchParams.get('hold')).toBe('off');expect(warnings.join(' ')).toMatch(/Cookies/);
});
it('still saves cookie when history writing fails',()=>{
 const f=fake(undefined,'',{url:true});const warnings=saveSetting(f.port,'hold','off');expect(f.cookies()).toBe('tetris_hold=off');expect(warnings.join(' ')).toMatch(/URL/);
});
it('detects silent cookie and URL write failures independently',()=>{
 const cookie=fake(undefined,'',{cookieIgnore:true});expect(saveSetting(cookie.port,'hold','off').join(' ')).toMatch(/Cookies/);expect(cookie.url().searchParams.get('hold')).toBe('off');
 const url=fake(undefined,'',{urlIgnore:true});expect(saveSetting(url.port,'hold','off').join(' ')).toMatch(/URL/);expect(url.cookies()).toBe('tetris_hold=off');
});
it('keeps URL initialization usable when cookie reads are unavailable and attempts explicit writes only',()=>{
 const f=fake('https://game.example/?hold=off','',{cookieRead:true});const result=initializeSettings(f.port);expect(result.settings.hold).toBe('off');expect(result.warnings.join(' ')).toMatch(/Cookies/);expect(f.writes).toHaveLength(1);expect(f.replaced).toEqual([]);
 const omitted=fake(undefined,'',{cookieRead:true});initializeSettings(omitted.port);expect(omitted.writes).toEqual([]);
});
it('uses saved cookies when URL reading fails without writing defaults',()=>{
 const f=fake(undefined,header(alternatives),{urlRead:true});const result=initializeSettings(f.port);expect(result.settings).toEqual(alternatives);expect(result.warnings.join(' ')).toMatch(/URL/);expect(f.writes).toEqual([]);
});
it('rejects invalid changed tokens before either effect',()=>{
 const f=fake();expect(saveSetting(f.port,'hold','OFF' as 'off').length).toBeGreaterThan(0);expect(f.writes).toEqual([]);expect(f.replaced).toEqual([]);
});
it('binds native document/history/location and preserves history state',()=>{
 const document={cookie:''} as Document,state={retained:1};let href='https://game.example/play#x',received:unknown;
 const history={state,replaceState(value:unknown,_unused:string,url:string|URL|null){received=value;href=String(url);}} as History;
 const location={protocol:'https:',get href(){return href;}} as Location;const port=createBrowserPort(document,history,location);
 port.writeCookie('tetris_hold=off');expect(document.cookie).toBe('tetris_hold=off');port.replaceURL('https://game.example/play?hold=off#x');expect(received).toBe(state);expect(port.readURL()).toContain('hold=off');
});
