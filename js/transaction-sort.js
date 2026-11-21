import {debtInfo} from './finance.js?v=partial-20261103';
export const transactionSortKeys=Object.freeze(['dueDate','description','amountCents']);
const collator=new Intl.Collator('pt-BR',{sensitivity:'base',numeric:true});
export function sortTransactions(rows,state,key='dueDate',direction='asc'){
 if(!transactionSortKeys.includes(key))key='dueDate';
 const sign=direction==='desc'?-1:1;
 const value=t=>key==='dueDate'?debtInfo(t,state).dueDate:key==='amountCents'?t.amountCents:t.description;
 return rows.map((row,index)=>({row,index,value:value(row)})).sort((a,b)=>{
  const comparison=key==='amountCents'?a.value-b.value:collator.compare(a.value||'',b.value||'');
  return sign*comparison||a.index-b.index;
 }).map(entry=>entry.row);
}
