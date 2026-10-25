/** Shared portable result invariants; codecs add their own container validation. */
export interface Result {id:string;score:number;timestamp:string}
export function validTimestamp(value:unknown):value is string {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)||value.startsWith('0000'))return false;
 const date=new Date(value);return Number.isFinite(date.getTime())&&date.toISOString()===value;
}
export function validateResult(value:unknown):Result {
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='id,score,timestamp')throw new Error('Invalid result fields.');
 const r=value as Record<string,unknown>;
 if(typeof r.id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(r.id))throw new Error('Invalid result ID.');
 if(typeof r.score!=='number'||!Number.isSafeInteger(r.score)||r.score<0)throw new Error('Score must be a non-negative safe integer.');
 if(!validTimestamp(r.timestamp))throw new Error('Timestamp must be a real canonical UTC date with milliseconds.');
 return {id:r.id,score:r.score,timestamp:r.timestamp};
}
export function validateResults(value:unknown):Result[] {
 if(!Array.isArray(value)||value.length>10)throw new Error('Expected at most ten results.');
 const results=value.map(validateResult);if(new Set(results.map(r=>r.id)).size!==results.length)throw new Error('Duplicate result IDs.');return results;
}
/** Canonical UTC text sorts chronologically; relational string comparison is ASCII. */
export function rank(results:readonly Result[]):Result[] {
 const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;
 return results.map(r=>({...r})).sort((a,b)=>b.score-a.score||compare(a.timestamp,b.timestamp)||compare(a.id,b.id)).slice(0,10);
}
