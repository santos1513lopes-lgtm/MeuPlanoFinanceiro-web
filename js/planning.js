import {invoices,forecast,pendingRows,today,validDate,monthEnd} from './finance.js?v=partial-20261103';
export function pendingCommitments(state,asOf=today()){
 const items=pendingRows(state).filter(t=>t.status==='planned'&&['income','expense','yield','interIn','interOut'].includes(t.kind)).map(t=>({
  id:t.id,kind:t.kind,description:t.description,dueDate:t.dueDate,amount:t.amountCents,
  incoming:t.kind==='income'||t.kind==='yield'||t.kind==='interIn',cardId:'',accountId:t.accountId
 }));
 for(const invoice of invoices(state,asOf)){
  if(invoice.open>0)items.push({id:invoice.key,kind:'invoice',description:'Fatura',dueDate:invoice.dueDate,amount:invoice.open,incoming:false,cardId:invoice.cardId,accountId:''});
 }
 return items.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.id.localeCompare(b.id));
}
export function planningSummary(state,month,asOf=today(),scope='month'){
 if(!validDate(month+'-01')||!validDate(asOf))throw Error('Período de planejamento inválido.');
 const items=pendingCommitments(state,asOf),selected=scope==='all'?items:items.filter(t=>t.dueDate.startsWith(month));
 const sum=list=>list.reduce((total,item)=>total+item.amount,0);
 const monthIncome=sum(selected.filter(t=>t.incoming));
 const monthExpenses=sum(selected.filter(t=>['expense','interOut'].includes(t.kind)));
 const monthInvoices=sum(selected.filter(t=>t.kind==='invoice'));
 const future=items.filter(t=>!t.incoming&&t.dueDate>=asOf),overdue=items.filter(t=>!t.incoming&&t.dueDate<asOf);
 const offset=(Number(month.slice(0,4))-Number(asOf.slice(0,4)))*12+Number(month.slice(5,7))-Number(asOf.slice(5,7));
 const projection=offset>=0&&offset<120?forecast(state,asOf,Math.max(12,offset+1))[offset]:null;
 return {month,items:selected,income:monthIncome,expenses:monthExpenses,invoices:monthInvoices,toPay:monthExpenses+monthInvoices,
  overdueInMonth:sum(selected.filter(t=>!t.incoming&&t.dueDate<asOf)),
  futureTotal:sum(future),futureCount:future.length,lastFutureDate:future.at(-1)?.dueDate||'',
  overdueTotal:sum(overdue),projection,monthEnd:monthEnd(month)};
}
