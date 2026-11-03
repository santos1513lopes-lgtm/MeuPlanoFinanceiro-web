import {collections,emptyState,validDate} from './finance.js?v=controls-20261103';

export const resetModes = {
 movements: {title:'Limpar movimentações',phrase:'LIMPAR'},
 all: {title:'Começar do zero',phrase:'ZERAR'}
};
export function planReset(state,mode,date){
 if(!Object.hasOwn(resetModes,mode)||!validDate(date))throw Error('Opção ou data de limpeza inválida.');
 const operations=[];
 const remove=kind=>{for(const row of state[kind]||[])operations.push({kind,id:row.id,type:'delete'});};
 if(mode==='movements'){
  remove('transactions');
  for(const row of state.pots||[])operations.push({kind:'pots',id:row.id,type:'set',row:{...row,reservedCents:0}});
  for(const row of state.accounts)operations.push({kind:'accounts',id:row.id,type:'set',row:{...row,openingCents:0,openingDate:date}});
  for(const row of state.goals)operations.push({kind:'goals',id:row.id,type:'set',row:{...row,savedCents:0}});
 }else{
  for(const kind of ['transactions','budgets','goals','pots','accounts','cards','categories'])remove(kind);
 }
 for(const op of operations){if(!collections.includes(op.kind)||typeof op.id!=='string'||!op.id||op.id.includes('/'))throw Error('Registro inválido; a limpeza foi cancelada.');}
 return operations;
}
export function applyReset(state,mode,date){
 const next=JSON.parse(JSON.stringify(state));
 for(const op of planReset(state,mode,date)){
  if(op.type==='delete')next[op.kind]=next[op.kind].filter(row=>row.id!==op.id);
  else next[op.kind]=next[op.kind].map(row=>row.id===op.id?op.row:row);
 }
 return next;
}
