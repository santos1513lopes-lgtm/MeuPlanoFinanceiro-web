import {debtInfo,canSettle,validDate,today} from './finance.js?v=partial-20261103';
export function settlementRequest(transactionId,command){return JSON.stringify({transactionId,cashCents:command.cashCents,paidDate:command.paidDate,remainder:command.remainder,newDueDate:command.newDueDate||'',reason:command.reason||'',expectedRemaining:command.expectedRemaining});}
export function buildSettlements(state,transactionId,command){
 const tx=state.transactions.find(t=>t.id===transactionId);
 if(!tx||!canSettle(tx)||tx.status!=='planned')throw Error('Esta baixa é para receitas e despesas previstas. Use a operação própria para cartões e repasses.');
 if(!/^[A-Za-z0-9-]{1,100}$/.test(command.operationId||''))throw Error('Identificador da operação inválido.');
 const requestKey=settlementRequest(transactionId,command),old=(state.settlements||[]).filter(e=>e.operationId===command.operationId);
 if(old.length){if(old.some(e=>e.transactionId!==transactionId||e.requestKey!==requestKey))throw Error('Esta operação já foi usada com outros valores. Atualize a tela.');return [];}
 const info=debtInfo(tx,state),amount=command.cashCents;
 if(!info.remaining||info.remaining!==command.expectedRemaining)throw Error('O saldo deste compromisso mudou. Atualize e confira antes de confirmar.');
 if(!Number.isSafeInteger(amount)||amount<0||amount>info.remaining)throw Error('A baixa deve ser de zero até o saldo restante.');
 if(!['keep','reschedule','close'].includes(command.remainder))throw Error('Escolha o destino do restante.');
 const account=state.accounts.find(a=>a.id===tx.accountId);
 if(amount>0&&(!validDate(command.paidDate)||command.paidDate>today()||!account||command.paidDate<account.openingDate))throw Error('Confira a data efetiva: deve ser até hoje e não anterior à abertura da conta.');
 const remaining=info.remaining-amount,reason=(command.reason||'').trim();
 if(reason.length>200)throw Error('Use um motivo com até 200 caracteres.');
 if(remaining>0&&command.remainder==='reschedule'&&(!validDate(command.newDueDate)||command.newDueDate<today()||command.newDueDate===info.dueDate||!reason))throw Error('Informe novo vencimento a partir de hoje e o motivo da renegociação.');
 if(remaining>0&&command.remainder==='close'&&!reason)throw Error('Informe o motivo para encerrar o restante sem dinheiro.');
 if(amount===0&&(command.remainder==='keep'||remaining===0))throw Error('Informe um valor de baixa ou escolha renegociar/encerrar o restante.');
 let seq=Math.max(0,...(state.settlements||[]).filter(e=>e.transactionId===transactionId).map(e=>e.sequence));
 const events=[],event=(kind,value,extra={})=>events.push({id:command.operationId+'-'+kind,transactionId,kind,amountCents:value,date:kind==='cash'?command.paidDate:today(),dueDate:'',previousDueDate:'',reason:'',targetId:'',operationId:command.operationId,requestKey,sequence:++seq,...extra});
 if(amount)event('cash',amount);
 if(remaining&&command.remainder==='close')event('close',remaining,{reason});
 if(remaining&&command.remainder==='reschedule')event('reschedule',0,{dueDate:command.newDueDate,previousDueDate:info.dueDate,reason});
 return events;
}
export function buildReversal(state,eventId,operationId,reason){
 if(!/^[A-Za-z0-9-]{1,100}$/.test(operationId||''))throw Error('Identificador da correção inválido.');
 const original=(state.settlements||[]).find(e=>e.id===eventId);
 if(!original||original.kind==='reverse'||!reason?.trim()||reason.length>200)throw Error('Escolha um registro válido e informe o motivo da correção.');
 if((state.settlements||[]).some(e=>e.kind==='reverse'&&e.targetId===eventId))throw Error('Este registro já foi desfeito. Atualize o histórico.');
 const tx=state.transactions.find(t=>t.id===original.transactionId);if(!tx||!canSettle(tx))throw Error('Compromisso não encontrado.');
 const sequence=Math.max(0,...state.settlements.filter(e=>e.transactionId===tx.id).map(e=>e.sequence))+1;
 return {id:operationId+'-reverse',transactionId:tx.id,kind:'reverse',amountCents:0,date:today(),dueDate:'',previousDueDate:'',reason:reason.trim(),targetId:eventId,operationId,requestKey:JSON.stringify({eventId,reason:reason.trim()}),sequence};
}
