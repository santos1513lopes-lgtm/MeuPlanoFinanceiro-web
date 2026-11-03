import {balances,cashRows,emptyState,validDate,today} from './finance.js?v=partial-20261103';
export const controls={personal:'Pessoal',business:'Empresa'};
export const purposes={prolabore:'Pró-labore líquido',profit:'Distribuição de lucros',contribution:'Aporte do proprietário',reimbursement:'Reembolso'};
export const otherControl=id=>id==='personal'?'business':'personal';
export function assertControl(id){if(!Object.hasOwn(controls,id))throw Error('Controle inválido.');return id;}
export function projectLinks(state,links,control){
 assertControl(control);
 const next={...state,transactions:[...state.transactions]};
 for(const link of links){
  if(link.status==='cancelled')continue;
  const incoming=link.toControl===control;
  if(!incoming&&link.fromControl!==control)continue;
  next.transactions.push({id:'link:'+link.id,linkId:link.id,purpose:link.purpose,kind:incoming?'interIn':'interOut',description:link.description,amountCents:link.amountCents,category:'',accountId:incoming?link.toAccount:link.fromAccount,toAccountId:'',cardId:'',date:link.date,dueDate:link.dueDate,competence:link.dueDate.slice(0,7),paidDate:link.paidDate,status:link.status,groupId:link.id,installment:1,installments:1});
 }
 return next;
}
export function validateLink(link,states){
 assertControl(link.fromControl);assertControl(link.toControl);
 if(link.fromControl===link.toControl||!Object.hasOwn(purposes,link.purpose))throw Error('Escolha controles diferentes e uma finalidade.');
 if((['prolabore','profit'].includes(link.purpose)&&link.fromControl!=='business')||(link.purpose==='contribution'&&link.fromControl!=='personal'))throw Error('Pró-labore/lucros saem da Empresa; aportes saem do Pessoal.');
 if(!link.description.trim()||link.description.length>200||!Number.isSafeInteger(link.amountCents)||link.amountCents<1||link.amountCents>1e12)throw Error('Confira descrição e valor positivo.');
 if(!['planned','posted','cancelled'].includes(link.status)||![link.date,link.dueDate].every(validDate)||link.date>today())throw Error('Confira as datas e a situação.');
 if(link.status==='posted'&&(!validDate(link.paidDate)||link.paidDate>today()))throw Error('Informe a data efetiva, até hoje.');
 for(const [control,id] of [[link.fromControl,link.fromAccount],[link.toControl,link.toAccount]]){
  const account=states[control].accounts.find(a=>a.id===id);
  if(!account)throw Error('Cadastre e escolha uma conta em cada controle.');
  if(link.status==='posted'&&link.paidDate<account.openingDate)throw Error('A baixa deve ocorrer na data de abertura das contas ou depois.');
 }
}
export function potSpent(state,pot){const account=state.accounts.find(a=>a.id===pot.accountId);return cashRows(state).filter(t=>t.potId===pot.id&&t.accountId===pot.accountId&&t.status==='posted'&&['expense','invoicePayment'].includes(t.kind)&&t.paidDate>=(account?.openingDate||'')).reduce((n,t)=>n+t.amountCents,0);}
export const potBalance=(state,pot)=>pot.reservedCents-potSpent(state,pot);
export function reserveSummary(state){
 const b=balances(state);const eligible=state.accounts.filter(a=>a.kind!=='investment');
 const total=eligible.reduce((n,a)=>n+b[a.id],0),reserved=(state.pots||[]).reduce((n,p)=>n+potBalance(state,p),0);
 return {total,reserved,unallocated:total-reserved,accounts:eligible.map(a=>({id:a.id,balance:b[a.id],reserved:(state.pots||[]).filter(p=>p.accountId===a.id).reduce((n,p)=>n+potBalance(state,p),0)}))};
}
export function validatePots(state){
 for(const pot of state.pots||[]){const a=state.accounts.find(a=>a.id===pot.accountId);if(!a||a.kind==='investment'||!pot.name.trim()||pot.name.length>100||!Number.isSafeInteger(pot.reservedCents)||pot.reservedCents<0||pot.reservedCents>1e12||!Number.isSafeInteger(pot.targetCents)||pot.targetCents<0||pot.targetCents>1e12)throw Error('Confira nome, conta e valores do pote.');if(potBalance(state,pot)<0)throw Error('O pagamento supera a reserva do pote. Reforce a reserva ou escolha outro pote.');}
 for(const a of reserveSummary(state).accounts)if(a.reserved>Math.max(0,a.balance))throw Error('A conta não possui saldo suficiente para suas reservas. Libere parte dos potes ou escolha outra conta.');
}
export function assertPotTransaction(t,state){
 if(!t.potId)return;
 const p=(state.pots||[]).find(p=>p.id===t.potId);
 if(!p||p.accountId!==t.accountId||!['expense','invoicePayment'].includes(t.kind))throw Error('O pote deve pertencer à conta que paga a despesa ou fatura.');
}
export function freshControls(){return {personal:emptyState(),business:emptyState()};}
