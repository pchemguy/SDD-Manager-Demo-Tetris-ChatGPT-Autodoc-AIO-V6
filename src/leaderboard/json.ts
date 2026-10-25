/** Compile the canonical draft-2020-12 schema once, without mutating input. */
import Ajv2020 from 'ajv/dist/2020';
import schema from '../../docs/dev/spec/LEADERBOARD-SCHEMA.json';
import {validTimestamp} from './validation';
const ajv=new Ajv2020({strict:true,allErrors:true,validateFormats:true,coerceTypes:false,useDefaults:false,removeAdditional:false});
ajv.addFormat('utc-timestamp',{type:'string',validate:validTimestamp});
export const schemaValid=ajv.compile(schema);

import {rank,validateResults,type Result} from './validation';
export const JSON_LIMIT=65536;
export function encodeJSON(results:readonly Result[]):Uint8Array {
 const data={formatVersion:1,results:rank(validateResults(results))};
 if(!schemaValid(data))throw new Error('JSON schema validation failed.');
 return new TextEncoder().encode(JSON.stringify(data,null,2)+'\n');
}
/** Validate the complete bounded candidate; callers alone own session replacement. */
export function decodeJSON(bytes:Uint8Array):Result[] {
 if(bytes.byteLength>JSON_LIMIT)throw new Error('JSON file exceeds the 65536-byte limit.');
 let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new Error('Invalid UTF-8 JSON file.');}
 let value:unknown;try{value=JSON.parse(text);}catch{throw new Error('Invalid JSON syntax.');}
 if(!schemaValid(value))throw new Error('JSON schema validation failed: '+ajv.errorsText(schemaValid.errors,{separator:'; '}));
 return rank(validateResults((value as {results:unknown}).results));
}
