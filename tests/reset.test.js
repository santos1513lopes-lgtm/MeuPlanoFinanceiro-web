import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as F from '../js/finance.js';
import {planReset,applyReset,resetModes} from '../js/reset.js';

function fixture(n=2){
 const s=F.emptyState();
 s.accounts=[{id:'bank',name:'Banco',kind:'checking',openingCents:100000,openingDate:'2026-01-01'}];
 s.cards=[{id:'card',name:'Cartao',closingDay:20,dueDay:28,limitCents:500000}];
 s.categories=[{id:'cat',name:'Geral'}];
 s.budgets=[{id:'budget',month:'2026-11',category:'cat',limitCents:30000}];
 s.goals=[{id:'goal',name:'Reserva',targetCents:500000,savedCents:12000,deadline:'2027-11-01'}];
 s.transactions=Array.from({length:n},(_,i)=>({id:'tx'+i,description:'Lancamento '+i,amountCents:500}));
 return s;
}
function fakeStorage(source,{state=fixture(),approved=true,failBatch=0,offline=false}={}){
 const data=new Map(F.collections.map(kind=>[kind,new Map(state[kind].map(({id,...row})=>[id,row]))]));
 const untouched={otherUser:{amount:123},authorization:{enabled:approved},auth:{uid:'user-A',email:'a@example.invalid'}};
 const local=new Map([['other-key','preserve'],['firebase-auth','preserve']]);
 let batchNo=0,reads=0,queryFailure=false;
 const commits=[];
 const sdk={
  db:{},doc:(_db,...segments)=>segments,collection:(_db,...segments)=>segments,
  getDocFromServer:async ref=>{assert.deepEqual(Array.from(ref),['authorized_users','user-A']);return {exists:()=>true,data:()=>({enabled:untouched.authorization.enabled})};},
  getDocsFromServer:async ref=>{reads++;if(queryFailure)throw Error('read failed');assert.equal(ref[0],'finance_v2');assert.equal(ref[1],'user-A');return {docs:[...data.get(ref[2])].map(([id,row])=>({id,data:()=>({...row})}))};},
  writeBatch:()=>{const pending=[];return {delete:ref=>pending.push({type:'delete',ref}),set:(ref,row)=>pending.push({type:'set',ref,row}),commit:async()=>{batchNo++;if(batchNo===failBatch)throw Error('batch failed');assert.ok(pending.length<=450);for(const op of pending){assert.equal(op.ref[0],'finance_v2');assert.equal(op.ref[1],'user-A');assert.ok(F.collections.includes(op.ref[2]));const rows=data.get(op.ref[2]);if(op.type==='delete')rows.delete(op.ref[3]);else rows.set(op.ref[3],op.row);}commits.push(pending);}};}
 };
 sdk.getDocs=sdk.getDocsFromServer;
 const context={fakeSDK:sdk,collections:F.collections,emptyState:F.emptyState,today:()=> '2026-11-02',addMonths:F.addMonths,planReset,applyReset,resetModes,navigator:{onLine:!offline},localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value)}};
 vm.createContext(context);
 vm.runInContext(source.replace(/^import .*;\r?$/gm,'').replace(/\bexport /g,'')+"\nsdk=fakeSDK;user={uid:'user-A',email:'a@example.invalid'};",context);
 return {api:context,data,untouched,local,commits,setReadFailure:()=>queryFailure=true,reads:()=>reads,changeSession:()=>vm.runInContext("user={uid:'other-user'};",context),demo:()=>{local.set('meu-financeiro-demo-v2',JSON.stringify(state));vm.runInContext("demo=true;user={uid:'demo'};",context);}};
}
export async function runResetTests(){
 let passed=0;const test=async(label,fn)=>{try{await fn();passed++;}catch(error){throw Error(label+': '+error.message);}};
 const source=await fs.readFile(new URL('../js/storage.js',import.meta.url),'utf8');
 const date='2026-11-02';
 await test('Movimentacoes: zera valores e preserva cadastros',()=>{
  const original=fixture(),next=applyReset(original,'movements',date);
  assert.equal(next.transactions.length,0);assert.equal(next.accounts[0].openingCents,0);assert.equal(next.accounts[0].openingDate,date);assert.equal(next.goals[0].savedCents,0);
  for(const kind of ['cards','categories','budgets'])assert.deepEqual(next[kind],original[kind]);assert.equal(next.goals[0].targetCents,original.goals[0].targetCents);assert.equal(original.accounts[0].openingCents,100000);
 });
 await test('Reinicio total: somente colecoes financeiras',()=>{const original=fixture(),next=applyReset(original,'all',date);assert.ok(F.collections.every(k=>next[k].length===0));assert.equal(original.transactions.length,2);});
 await test('Opcao invalida nao gera exclusao',()=>assert.throws(()=>planReset(fixture(),'authorization',date)));
 await test('Data invalida nao gera exclusao',()=>assert.throws(()=>planReset(fixture(),'all','2026-02-31')));
 await test('ID com caminho rejeitado',()=>{const s=fixture();s.accounts[0].id='../../authorized_users';assert.throws(()=>planReset(s,'all',date));});
 await test('Plano nao contem login ou aprovacao',()=>{for(const mode of ['all','movements'])for(const op of planReset(fixture(),mode,date))assert.ok(F.collections.includes(op.kind));});
 await test('Consulta ao servidor sem gravar na preparacao',async()=>{const env=fakeStorage(source);const s=await env.api.prepareReset('all');assert.equal(s.uid,'user-A');assert.equal(env.reads(),6);assert.equal(env.commits.length,0);});
 await test('Confirmacao incorreta bloqueia gravacao',async()=>{const env=fakeStorage(source);const s=await env.api.prepareReset('all');await assert.rejects(env.api.executeReset(s,'SIM'));assert.equal(env.commits.length,0);});
 await test('Sem autorizacao bloqueia preparacao',async()=>{const env=fakeStorage(source,{approved:false});await assert.rejects(env.api.prepareReset('all'));assert.equal(env.commits.length,0);});
 await test('Autorizacao revogada apos preparar bloqueia execucao',async()=>{const env=fakeStorage(source);const s=await env.api.prepareReset('all');env.untouched.authorization.enabled=false;await assert.rejects(env.api.executeReset(s,'ZERAR'));assert.equal(env.commits.length,0);});
 await test('Sessao trocada bloqueia execucao',async()=>{const env=fakeStorage(source);const s=await env.api.prepareReset('all');env.changeSession();await assert.rejects(env.api.executeReset(s,'ZERAR'));assert.equal(env.commits.length,0);});
 await test('Offline bloqueia preparacao',async()=>{const env=fakeStorage(source,{offline:true});await assert.rejects(env.api.prepareReset('all'));assert.equal(env.reads(),0);});
 await test('Falha de leitura nao permite limpar',async()=>{const env=fakeStorage(source);env.setReadFailure();await assert.rejects(env.api.prepareReset('all'));assert.equal(env.commits.length,0);});
 await test('Limpeza real simulada preserva aprovacao, login e outro usuario',async()=>{const env=fakeStorage(source);const before=JSON.stringify(env.untouched);const snapshot=await env.api.prepareReset('all');await env.api.executeReset(snapshot,'ZERAR');assert.ok([...env.data.values()].every(m=>m.size===0));assert.equal(JSON.stringify(env.untouched),before);});
 await test('Limpeza de movimentos no transporte',async()=>{const env=fakeStorage(source);const snapshot=await env.api.prepareReset('movements');await env.api.executeReset(snapshot,'LIMPAR');assert.equal(env.data.get('transactions').size,0);assert.equal(env.data.get('accounts').get('bank').openingCents,0);assert.equal(env.data.get('goals').get('goal').savedCents,0);assert.equal(env.data.get('cards').size,1);});
 await test('Multiplos lotes e progresso',async()=>{const env=fakeStorage(source,{state:fixture(1001)});const snapshot=await env.api.prepareReset('all');const progress=[];const result=await env.api.executeReset(snapshot,'ZERAR',(done,total)=>progress.push([done,total]));assert.equal(env.commits.length,3);assert.equal(result.completed,1006);assert.equal(progress.at(-1)[0],1006);});
 await test('Falha parcial reporta progresso e permite retomar',async()=>{const env=fakeStorage(source,{state:fixture(1001),failBatch:2});const first=await env.api.prepareReset('all');await assert.rejects(env.api.executeReset(first,'ZERAR'),error=>error.completed===450&&error.message.includes('interrompida'));assert.equal(env.data.get('transactions').size,551);const retry=await env.api.prepareReset('all');await env.api.executeReset(retry,'ZERAR');assert.ok([...env.data.values()].every(m=>m.size===0));});
 await test('Novo registro apos preparacao nao e apagado sem revisao',async()=>{const env=fakeStorage(source);const snapshot=await env.api.prepareReset('all');env.data.get('transactions').set('new-after-confirmation',{amountCents:10});await env.api.executeReset(snapshot,'ZERAR');assert.equal(env.data.get('transactions').size,1);});
 await test('Demo altera somente chave de dados ficticios',async()=>{const env=fakeStorage(source);env.demo();const snapshot=await env.api.prepareReset('all');await env.api.executeReset(snapshot,'ZERAR');assert.ok(Object.values(JSON.parse(env.local.get('meu-financeiro-demo-v2'))).every(rows=>rows.length===0));assert.equal(env.local.get('firebase-auth'),'preserve');assert.equal(env.local.get('other-key'),'preserve');assert.equal(env.commits.length,0);});
 await test('Demo limpa movimentos preservando cadastros',async()=>{const env=fakeStorage(source);env.demo();const snapshot=await env.api.prepareReset('movements');await env.api.executeReset(snapshot,'LIMPAR');const s=JSON.parse(env.local.get('meu-financeiro-demo-v2'));assert.equal(s.transactions.length,0);assert.equal(s.accounts.length,1);assert.equal(s.accounts[0].openingCents,0);});
 await test('Cliques simultaneos nao iniciam segunda limpeza',async()=>{const env=fakeStorage(source);const snapshot=await env.api.prepareReset('all');const first=env.api.executeReset(snapshot,'ZERAR');await assert.rejects(env.api.executeReset(snapshot,'ZERAR'));await first;});
 await test('Login, logout e autorizacao nao sao modificados pelo reset',()=>{
  const tail=source.slice(source.indexOf('let resetInProgress='));
  assert.equal(tail.includes('signOut('),false);assert.equal(tail.includes('deleteUser('),false);assert.equal(tail.includes('updatePassword('),false);
 });
 return passed;
}
export const passed=await runResetTests();
console.log(passed+' testes de reinicio passaram.');
