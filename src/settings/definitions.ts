/** Exact case-sensitive serialization vocabulary shared by domain and browser adapters. */
export const OPTIONS={
 ghost:['hide','dynamic','show'],hardDrop:['on','off'],next:['on','off'],
 hardDropLock:['follow','immediate'],lock:['failed-down','interval'],hold:['on','off'],
} as const;
export type SettingKey=keyof typeof OPTIONS;
export type Settings={[K in SettingKey]:(typeof OPTIONS)[K][number]};
export const KEYS=Object.freeze(['ghost','hardDrop','next','hardDropLock','lock','hold'] as const);
export const DEFAULTS:Readonly<Settings>=Object.freeze({ghost:'show',hardDrop:'on',next:'on',hardDropLock:'follow',lock:'interval',hold:'on'});
export function isSettingValue<K extends SettingKey>(key:K,value:unknown):value is Settings[K] {
 return typeof value==='string'&&(OPTIONS[key] as readonly string[]).includes(value);
}
