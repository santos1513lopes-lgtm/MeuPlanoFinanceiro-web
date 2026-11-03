import {today,debtInfo} from './finance.js?v=partial-20261103';
import {pendingCommitments} from './planning.js?v=partial-20261103';
export function obligations(state,{direction='pay',scope='month',month=today().slice(0,7),timing='all',query='',asOf=today()}={}){
 const incoming=direction==='receive';
 const all=pendingCommitments(state,asOf).filter(t=>direction==='both'||t.incoming===incoming);
 const scoped=scope==='all'?all:all.filter(t=>t.dueDate.startsWith(month));
 const sum=items=>items.reduce((n,t)=>n+t.amount,0);
 const summary={overdue:sum(scoped.filter(t=>t.dueDate<asOf)),today:sum(scoped.filter(t=>t.dueDate===asOf)),future:sum(scoped.filter(t=>t.dueDate>asOf)),total:sum(scoped),count:scoped.length};
 const rows=scoped.filter(t=>(timing==='all'||timing==='overdue'&&t.dueDate<asOf||timing==='today'&&t.dueDate===asOf||timing==='future'&&t.dueDate>asOf)&&t.description.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR'))).map(t=>{
  const original=state.transactions.find(tx=>tx.id===t.id);
  return {...t,info:original?debtInfo(original,state):null};
 });
 return {rows,summary,allTotal:sum(all),filteredTotal:sum(rows)};
}
