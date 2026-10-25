/** Compile the canonical draft-2020-12 schema once, without mutating input. */
import Ajv2020 from 'ajv/dist/2020';
import schema from '../../docs/dev/spec/LEADERBOARD-SCHEMA.json';
import {validTimestamp} from './validation';
const ajv=new Ajv2020({strict:true,allErrors:true,validateFormats:true,coerceTypes:false,useDefaults:false,removeAdditional:false});
ajv.addFormat('utc-timestamp',{type:'string',validate:validTimestamp});
export const schemaValid=ajv.compile(schema);
