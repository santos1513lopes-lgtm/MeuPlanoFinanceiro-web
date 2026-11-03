import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as F from '../js/finance.js';
import {reserveSummary} from '../js/controls.js';
import {pendingCommitments,planningSummary} from '../js/planning.js';
import {helpTopics,searchHelp,normalizeHelp} from '../js/help.js';

const asOf='2026-11-03';
function fixture(){const s=F.emptyState();s.accounts=[{id:'bank',name:'Banco',kind:'checking',openingCents:100000,openingDate:'2026-01-01'}];s.cards=[{id:'card',name:'Cartao',closingDay:5,dueDay:14}];s.categories=[{id:'cat',name:'Geral'}];return s;}
const tx={id:'purchase',kind:'card',description:'Compra de teste',category:'cat',accountId:'',toAccountId:'',cardId:'card',date:'2026-11-02',dueDate:'2026-11-14',competence:'2026-11',paidDate:'',amountCents:18000,status:'posted',groupId:'g',installment:1,installments:1};
const payment={...tx,id:'payment',kind:'invoicePayment',accountId:'bank',category:'',paidDate:'2026-11-03'};
export async function runPlanningTests(){
 let passed=0;const test=async(label,fn)=>{try{await fn();passed++;}catch(error){throw Error(label+': '+error.message);}};
 await test('Compra 180 de 14 novembro aparece uma vez na previsao',()=>{const s=fixture();s.transactions=[tx];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.invoices,18000);assert.equal(p.expenses,0);assert.equal(p.toPay,18000);assert.equal(p.futureTotal,18000);assert.equal(p.projection.balance,82000);assert.equal(p.items.length,1);});
 await test('Data da compra nao substitui vencimento da fatura',()=>{const s=fixture();s.transactions=[{...tx,date:'2026-10-20'}];assert.equal(planningSummary(s,'2026-10',asOf).toPay,0);assert.equal(planningSummary(s,'2026-11',asOf).toPay,18000);});
 await test('Pagamento parcial reduz apenas a divida restante',()=>{const s=fixture();s.transactions=[tx,{...payment,amountCents:5000}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.invoices,13000);assert.equal(p.toPay,13000);assert.equal(p.projection.opening,95000);assert.equal(p.projection.balance,82000);});
 await test('Fatura quitada desaparece das pendencias',()=>{const s=fixture();s.transactions=[tx,payment];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.invoices,0);assert.equal(p.futureTotal,0);assert.equal(p.items.length,0);});
 await test('Despesas comuns e faturas somadas sem duplicar',()=>{const s=fixture();s.transactions=[tx,{...tx,id:'expense',kind:'expense',cardId:'',accountId:'bank',status:'planned',amountCents:2000}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.expenses,2000);assert.equal(p.toPay,20000);assert.equal(p.projection.balance,80000);});
 await test('Receita e rendimento previstos ficam a receber',()=>{const s=fixture();s.transactions=[{...tx,id:'income',kind:'income',accountId:'bank',cardId:'',status:'planned',amountCents:10000},{...tx,id:'yield',kind:'yield',accountId:'bank',cardId:'',status:'planned',amountCents:100}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.income,10100);assert.equal(p.toPay,0);assert.equal(p.futureTotal,0);assert.equal(p.projection.balance,110100);});
 await test('Receita recebida nao continua prevista',()=>{const s=fixture();s.transactions=[{...tx,kind:'income',accountId:'bank',cardId:'',paidDate:asOf}];assert.equal(planningSummary(s,'2026-11',asOf).income,0);});
 await test('Cancelamento exclui compra e despesa prevista',()=>{const s=fixture();s.transactions=[{...tx,status:'cancelled'},{...tx,id:'expense',kind:'expense',status:'cancelled'}];assert.equal(planningSummary(s,'2026-11',asOf).toPay,0);});
 await test('Parcelas agrupadas por vencimento mensal',()=>{const s=fixture();s.transactions=[tx,{...tx,id:'next',competence:'2026-12',dueDate:'2026-12-14'}];assert.equal(planningSummary(s,'2026-11',asOf).invoices,18000);assert.equal(planningSummary(s,'2026-12',asOf).invoices,18000);assert.equal(planningSummary(s,'2026-11',asOf).futureTotal,36000);});
 await test('Compras da mesma fatura nao duplicam linhas de vencimento',()=>{const s=fixture();s.transactions=[tx,{...tx,id:'second',amountCents:2000}];const items=pendingCommitments(s,asOf);assert.equal(items.length,1);assert.equal(items[0].amount,20000);});
 await test('Vencidos separados dos futuros e incorporados no primeiro mes',()=>{const s=fixture();s.transactions=[{...tx,dueDate:'2026-10-14',competence:'2026-10'}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.overdueTotal,18000);assert.equal(p.futureTotal,0);assert.equal(p.toPay,0);assert.equal(p.projection.card,18000);});
 await test('Vencimento hoje faz parte do futuro e nao esta atrasado',()=>{const s=fixture();s.transactions=[{...tx,dueDate:asOf}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.futureTotal,18000);assert.equal(p.overdueTotal,0);});
 await test('Transferencia nao e despesa nem receita de consumo',()=>{const s=fixture();s.accounts.push({id:'invest',name:'Invest',kind:'investment',openingCents:0,openingDate:'2026-01-01'});s.transactions=[{...tx,kind:'transfer',cardId:'',accountId:'bank',toAccountId:'invest',status:'planned'}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.toPay,0);assert.equal(p.income,0);assert.equal(p.futureTotal,0);assert.equal(p.projection.outgoing,18000);});
 await test('Pagamento de fatura previsto nao duplica previsao legado',()=>{const s=fixture();s.transactions=[tx,{...payment,status:'planned',paidDate:''}];assert.equal(planningSummary(s,'2026-11',asOf).toPay,18000);});
 await test('Mes passado nao inventa projecao retroativa',()=>assert.equal(planningSummary(fixture(),'2026-10',asOf).projection,null));
 await test('Mes futuro calcula saldo acumulado das pendencias anteriores',()=>{const s=fixture();s.transactions=[tx];assert.equal(planningSummary(s,'2026-12',asOf).projection.balance,82000);});
 await test('Compromissos alem de 12 meses continuam no total',()=>{const s=fixture();s.transactions=[{...tx,dueDate:'2028-12-14',competence:'2028-12'}];const p=planningSummary(s,'2026-11',asOf);assert.equal(p.toPay,0);assert.equal(p.futureTotal,18000);assert.equal(p.lastFutureDate,'2028-12-14');});
 await test('Limite de horizonte da projecao nao causa loop sem limite',()=>assert.equal(planningSummary(fixture(),'9999-12',asOf).projection,null));
 await test('Saldo negativo projetado continua visivel',()=>{const s=fixture();s.accounts[0].openingCents=100; s.transactions=[tx];assert.equal(planningSummary(s,'2026-11',asOf).projection.balance,-17900);});
 await test('Consultas nao modificam registros',()=>{const s=fixture();s.transactions=[tx];const before=JSON.stringify(s);planningSummary(s,'2026-11',asOf);assert.equal(JSON.stringify(s),before);});
 await test('Busca de ajuda ignora acentos e maiusculas',()=>{assert.ok(searchHelp('CARTAO').some(t=>t.id==='cards'));assert.equal(normalizeHelp('  PREVISÃO '),'previsao');});
 await test('Busca de ajuda cobre saldo inicial e reinicio',()=>{assert.ok(searchHelp('saldo inicial').some(t=>t.id==='start'));assert.ok(searchHelp('reset').some(t=>t.id==='settings'));assert.equal(searchHelp('zzzznonexistent').length,0);});
 await test('Ajuda documenta recursos, limites e exemplo de 180',()=>{assert.equal(helpTopics.length,18);const text=helpTopics.flatMap(t=>t.steps).join(' ');assert.ok(text.includes('R$ 180'));assert.ok(text.includes('Não há desfazer'));assert.ok(text.toLowerCase().includes('não há restauração automática'));assert.ok(text.includes('senha'));});
 const app=await fs.readFile(new URL('../js/app.js',import.meta.url),'utf8');
 const viewsLine=app.split('\n').find(line=>line.startsWith('const views='));
 const views=vm.runInNewContext('('+viewsLine.slice('const views='.length,-1)+')');
 await test('Todos os links da ajuda apontam para paginas existentes',()=>{for(const topic of helpTopics)assert.ok(views[topic.view]);assert.ok(views.help);});
 await test('Dashboard renderiza resumo de 180 e 12 meses',()=>{
  const s=fixture();s.transactions=[tx];const money=F.money;
  const context={reserveSummary,Store:{currentControl:()=> 'personal'},controls:{personal:'Pessoal'},state:s,period:'2026-11',F:{...F,today:()=>asOf,forecast:state=>F.forecast(state,asOf)},planningSummary:(state,month)=>planningSummary(state,month,asOf),heading:()=>'',monthInput:()=>'',action:(text,act,id)=>'<button data-action="'+act+'" data-id="'+id+'">'+text+'</button>',metric:(title,value)=>title+money(value),badge:()=>'',e:x=>String(x),amt:money,date:x=>x,name:()=> 'Cartao',chart:()=>'',empty:()=>'',recentRows:()=>'',goalCard:()=>''};
  vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function dashboard(){'),app.indexOf('function filters(){')),context);const html=context.dashboard();assert.ok(html.includes('Faturas em aberto no mês'+money(18000)));assert.ok(html.includes('Total a pagar no mês'+money(18000)));assert.equal((html.match(/data-action="planning-month"/g)||[]).length,12);assert.ok(html.includes('Fatura Cartao'));
 });
 await test('Acao de mes abre compromissos no periodo escolhido',async()=>{
  const actions=app.slice(app.indexOf('async function onAction('),app.indexOf('function doCalculation('));
  let opened=null;const ctx={F:{validDate:F.validDate},go:target=>opened=target,notice:()=>{},errorText:error=>error.message};vm.createContext(ctx);vm.runInContext("let period='2026-11';\n"+actions,ctx);await ctx.onAction('planning-month','2026-12');assert.equal(opened,'future');assert.equal(vm.runInContext('period',ctx),'2026-12');opened=null;await ctx.onAction('planning-month','not-a-month');assert.equal(opened,null);
 });
 return passed;
}
export const passed=await runPlanningTests();
console.log(passed+' testes de planejamento e ajuda passaram.');
