import assert from 'node:assert/strict';
import {emptyState,collections} from '../js/finance.js';
import {planReset,applyReset,resetModes} from '../js/reset.js';
function fixture(){const s=emptyState();for(const k of collections)s[k]=[{id:k+'-1'}];s.accounts[0]={id:'account-1',name:'Conta',openingCents:10000,openingDate:'2026-01-01'};s.goals[0]={id:'goal-1',name:'Meta',savedCents:500,targetCents:1000};s.pots[0]={id:'pot-1',name:'Impostos',reservedCents:700,targetCents:800,accountId:'account-1'};return s;}
let passed=0;const test=(label,fn)=>{try{fn();passed++;}catch(e){throw Error(label+': '+e.message);}};
test('Modo inválido',()=>assert.throws(()=>planReset(fixture(),'other','2026-11-03')));
test('Data inválida',()=>assert.throws(()=>planReset(fixture(),'all','2026-02-30')));
test('Zerar apaga oito coleções',()=>{const s=fixture(),n=applyReset(s,'all','2026-11-03');assert.equal(planReset(s,'all','2026-11-03').length,8);for(const k of collections)assert.equal(n[k].length,0);});
test('Limpar preserva cadastros',()=>{const n=applyReset(fixture(),'movements','2026-11-03');assert.equal(n.transactions.length,0);assert.equal(n.settlements.length,0);for(const k of collections.filter(k=>!['transactions','settlements'].includes(k)))assert.equal(n[k].length,1);});
test('Zera abertura e atualiza data',()=>{const a=applyReset(fixture(),'movements','2026-11-03').accounts[0];assert.equal(a.openingCents,0);assert.equal(a.openingDate,'2026-11-03');assert.equal(a.name,'Conta');});
test('Mantém objetivo da meta',()=>{const g=applyReset(fixture(),'movements','2026-11-03').goals[0];assert.equal(g.savedCents,0);assert.equal(g.targetCents,1000);});
test('Mantém objetivo e conta do pote',()=>{const p=applyReset(fixture(),'movements','2026-11-03').pots[0];assert.equal(p.reservedCents,0);assert.equal(p.targetCents,800);assert.equal(p.accountId,'account-1');});
test('Não modifica original',()=>{const s=fixture(),b=JSON.stringify(s);planReset(s,'all','2026-11-03');applyReset(s,'movements','2026-11-03');assert.equal(JSON.stringify(s),b);});
test('Rejeita ID com caminho',()=>{const s=fixture();s.accounts[0].id='wrong/path';assert.throws(()=>planReset(s,'all','2026-11-03'));});
test('Limpeza vazia',()=>{assert.equal(planReset(emptyState(),'all','2026-11-03').length,0);assert.equal(planReset(emptyState(),'movements','2026-11-03').length,0);assert.equal(resetModes.all.phrase,'ZERAR');});
console.log(passed+' testes de limpeza passaram.');
