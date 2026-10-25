/** Page-memory-only collection; validation completes before any replacement. */
import {rank,validateResult,validateResults,type Result} from './validation';
export class Leaderboard {
 private records:Result[]=[];
 get results():Result[]{return this.records.map(r=>({...r}));}
 has(id:string):boolean{return this.records.some(r=>r.id===id);}
 add(value:unknown):void {const result=validateResult(value);if(this.has(result.id))throw new Error('Duplicate result ID.');this.records=rank([...this.records,result]);}
 replace(value:unknown):void {const candidate=validateResults(value);this.records=rank(candidate);}
 clear():void {this.records=[];}
}
