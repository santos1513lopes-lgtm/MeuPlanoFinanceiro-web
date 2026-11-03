import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as F from '../js/finance.js';
import * as C from '../js/controls.js';
import * as R from '../js/reset.js';
import {buildSettlements,buildReversal} from '../js/settlements.js';
const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
function fixture(){const states=C.freshControls();for(const c of ['personal','business']){states[c].accounts=[{id:c+'-bank',name:c,kind:'checking',openingCents:1000000,openingDate:'2020-01-01'}];states[c].categories=[{id:c+'-cat',name:'Geral'}];}return states;}
const source=await fs.readFile(new URL('../js/storage.js',import.meta.url),'utf8');
export function storageFixture({real=false}={}){
 const local=new Map(),db=new Map(),writes=[],calls=[];let fail=false,retry=false;
 const doc=(db,...parts)=>parts.join('/');const snap=(path)=>({exists:()=>db.has(path),data:()=>clone(db.get(path))});
 const sdk={db:{},doc,collection:doc,getDocFromServer:async path=>{calls.push(path);return snap(path)},getDocsFromServer:async path=>{calls.push(path);return {docs:[...db.entries()].filter(([key])=>key.startsWith(path+'/')&&!key.slice(path.length+1).includes('/')).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>({id:key.split('/').at(-1),data:()=>clone(value)}))}},runTransaction:async(_db,fn)=>{let attempts=0;while(true){const pending=[];const transaction={get:async path=>snap(path),set:(path,data)=>pending.push(['set',path,clone(data)]),delete:path=>pending.push(['delete',path])};await fn(transaction);if(retry&&attempts++===0){retry=false;continue;}if(fail)throw Error('simulated commit failure');for(const [op,path,data] of pending){writes.push([op,path,data]);if(op==='set')db.set(path,data);else db.delete(path);}return;}}};
 const context={...F,...C,...R,buildSettlements,buildReversal,localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},navigator:{onLine:true},firebaseConfig:{},mockSdk:sdk,console};vm.createContext(context);vm.runInContext(source.replace(/^import .*;\r?$/gm,'').replace(/^export /gm,''),context);
 if(real){db.set('authorized_users/user-A',{enabled:true});vm.runInContext("sdk=mockSdk;user={uid:'user-A',email:'test@example.invalid'};demo=false;",context);}else context.startDemo();
 function seed(states=fixture(),links=[]){if(real){for(const [c,s] of Object.entries(states))for(const kind of F.collections)for(const row of s[kind]){const {id,...data}=row;db.set('finance_v3/user-A/controls/'+c+'/'+kind+'/'+id,clone(data));}for(const row of links){const {id,...data}=row;db.set('finance_v3/user-A/links/'+id,clone(data));}}else local.set('meu-financeiro-demo-v3',JSON.stringify({states,links}));}
 return {context,db,local,writes,calls,seed,fail:value=>fail=value,retry:()=>retry=true};
}
