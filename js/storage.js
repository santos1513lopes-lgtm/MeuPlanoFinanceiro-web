import {planReset,applyReset,resetModes} from './reset.js';
import {collections,emptyState,today,addMonths} from './finance.js';
import {firebaseConfig} from './firebase-config.js';
let sdk=null,user=null,demo=false;
export const isDemo=()=>demo;
export const currentUser=()=>user;
export async function connect(onUser){
 const [app,auth,fire]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')]);
 sdk={...auth,...fire};sdk.auth=auth.getAuth(app.initializeApp(firebaseConfig));sdk.db=fire.getFirestore();auth.onAuthStateChanged(sdk.auth,u=>{if(demo)return;user=u;onUser(u);});return sdk;
}
export async function login(email,password){if(!sdk)throw Error('A conexão com o Firebase ainda não está pronta. Aguarde a mensagem de conexão ou recarregue a página.');demo=false;const credential=await sdk.signInWithEmailAndPassword(sdk.auth,email,password);user=credential.user;return credential.user;}
export async function assertAccess(){
 if(demo)return;
 if(!sdk||!user){const error=new Error('Entre com uma conta criada pelo administrador.');error.code='app/sign-in-required';throw error;}
 const access=await sdk.getDocFromServer(sdk.doc(sdk.db,'authorized_users',user.uid));
 if(!access.exists()||access.data().enabled!==true){const error=new Error('Seu acesso ainda não foi liberado. Peça ao administrador para autorizar seu UID no Firebase.');error.code='app/access-not-approved';throw error;}
}
export async function resetPassword(email){if(!sdk||!email)throw Error('Informe o e-mail para recuperar a senha.');await sdk.sendPasswordResetEmail(sdk.auth,email);}
export async function logout(){if(demo){demo=false;user=null;return;}if(sdk)await sdk.signOut(sdk.auth);user=null;}
const demoKey='meu-financeiro-demo-v2';
export function startDemo(){demo=true;user={uid:'demo',email:'Demonstracao local'};if(!localStorage.getItem(demoKey))localStorage.setItem(demoKey,JSON.stringify(sample()));return user;}
export async function readState(){if(demo)return JSON.parse(localStorage.getItem(demoKey)||JSON.stringify(emptyState()));if(!sdk||!user)throw Error('Entre na sua conta.');await assertAccess();const result=emptyState();const lists=await Promise.all(collections.map(k=>sdk.getDocs(sdk.collection(sdk.db,'finance_v2',user.uid,k))));collections.forEach((k,i)=>result[k]=lists[i].docs.map(d=>({...d.data(),id:d.id})));return result;}
export async function saveRows(kind,rows){if(resetInProgress)throw Error('Aguarde o término da limpeza.');if(!collections.includes(kind)||!rows.length||rows.length>450)throw Error('Operacao fora do limite.');if(demo){const s=await readState();for(const row of rows){const i=s[kind].findIndex(x=>x.id===row.id);if(i<0)s[kind].push(row);else s[kind][i]=row;}localStorage.setItem(demoKey,JSON.stringify(s));return;}if(!sdk||!user)throw Error('Entre novamente.');await assertAccess();if(!navigator.onLine)throw Error('Sem internet. Reconecte antes de salvar; nada foi confirmado no servidor.');const b=sdk.writeBatch(sdk.db);for(const row of rows){const {id,...data}=row;b.set(sdk.doc(sdk.db,'finance_v2',user.uid,kind,id),data);}await b.commit();}

let resetInProgress=false;
function requireResetSession(snapshot){
 if(!snapshot||snapshot.uid!==user?.uid||snapshot.demo!==demo)throw Error('A sessão mudou. Prepare a limpeza novamente.');
 if(!demo&&(!sdk||!navigator.onLine))throw Error('Conecte-se à internet antes de limpar seus registros.');
}
export async function prepareReset(mode){
 if(!Object.hasOwn(resetModes,mode))throw Error('Opção de limpeza inválida.');
 if(resetInProgress)throw Error('Uma limpeza já está em andamento.');
 if(demo){
  if(!user)throw Error('Entre na demonstração antes de continuar.');
  return {mode,uid:user.uid,demo:true,date:today(),state:await readState()};
 }
 if(!sdk||!user)throw Error('Entre na sua conta antes de continuar.');
 if(!navigator.onLine)throw Error('A limpeza precisa de conexão com o servidor.');
 await assertAccess();
 const uid=user.uid;
 const snapshots=await Promise.all(collections.map(kind=>sdk.getDocsFromServer(sdk.collection(sdk.db,'finance_v2',uid,kind))));
 if(user?.uid!==uid||demo)throw Error('A sessão mudou durante a consulta.');
 const state=emptyState();
 collections.forEach((kind,i)=>state[kind]=snapshots[i].docs.map(doc=>({...doc.data(),id:doc.id})));
 return {mode,uid,demo:false,date:today(),state};
}
export async function executeReset(snapshot,confirmation,onProgress=()=>{}){
 requireResetSession(snapshot);
 if(!Object.hasOwn(resetModes,snapshot.mode)||confirmation!==resetModes[snapshot.mode].phrase)throw Error('Confirmação da limpeza incorreta.');
 if(resetInProgress)throw Error('Uma limpeza já está em andamento.');
 const operations=planReset(snapshot.state,snapshot.mode,snapshot.date);
 resetInProgress=true;
 let completed=0;
 try{
  if(demo){
   // One localStorage write preserves theme, Auth persistence and other keys.
   localStorage.setItem(demoKey,JSON.stringify(applyReset(snapshot.state,snapshot.mode,snapshot.date)));
   onProgress(operations.length,operations.length);
   return {completed:operations.length,total:operations.length};
  }
  for(let start=0;start<operations.length;start+=450){
   requireResetSession(snapshot);
   await assertAccess();
   requireResetSession(snapshot);
   const batch=sdk.writeBatch(sdk.db);
   const part=operations.slice(start,start+450);
   for(const operation of part){
    const ref=sdk.doc(sdk.db,'finance_v2',snapshot.uid,operation.kind,operation.id);
    if(operation.type==='delete')batch.delete(ref);
    else {const {id,...row}=operation.row;batch.set(ref,row);}
   }
   await batch.commit();
   completed+=part.length;
   onProgress(completed,operations.length);
  }
  return {completed,total:operations.length};
 }catch(error){
  const failure=new Error(completed
   ? 'Limpeza interrompida após '+completed+' de '+operations.length+' operações confirmadas. Não há reversão automática. Atualize os dados, confira o resultado e prepare a limpeza novamente para concluir o restante. Detalhe: '+error.message
   : 'A limpeza não foi confirmada. Atualize os dados antes de tentar novamente; se houve queda de conexão, confira o resultado no servidor. Detalhe: '+error.message);
  failure.code=error.code;
  failure.completed=completed;
  throw failure;
 }finally{resetInProgress=false;}
}

export function sample(){const s=emptyState(),d=today(),m=d.slice(0,7),due=m+'-28';s.accounts=[{id:'bank',name:'Conta principal',kind:'checking',openingCents:350000,openingDate:m+'-01'},{id:'reserve',name:'Reserva de emergencia',kind:'saving',openingCents:500000,openingDate:m+'-01'},{id:'invest',name:'Carteira de investimentos',kind:'investment',openingCents:200000,openingDate:m+'-01'}];s.cards=[{id:'card1',name:'Meu cartao',closingDay:20,dueDay:28,limitCents:600000}];s.categories=['Salario','Moradia','Alimentacao','Transporte','Saude','Lazer','Rendimentos','Outros'].map((name,i)=>({id:'cat'+i,name}));const base={category:'cat7',accountId:'bank',toAccountId:'',cardId:'',date:d,dueDate:d,competence:m,paidDate:d,status:'posted',groupId:'',installment:1,installments:1};s.transactions=[{...base,id:'salary',kind:'income',description:'Salario do mes',category:'cat0',amountCents:450000},{...base,id:'rent',kind:'expense',description:'Moradia',category:'cat1',amountCents:150000},{...base,id:'market',kind:'expense',description:'Mercado da semana',category:'cat2',amountCents:32890},{...base,id:'future',kind:'expense',description:'Conta de energia',category:'cat1',dueDate:m+'-25',status:'planned',paidDate:'',amountCents:18500},{...base,id:'cardbuy',kind:'card',description:'Compra no cartao',accountId:'',cardId:'card1',category:'cat5',dueDate:due,paidDate:'',amountCents:27000},{...base,id:'contribution',kind:'transfer',description:'Aporte mensal',toAccountId:'invest',amountCents:50000}];s.budgets=[{id:'budget1',month:m,category:'cat2',limitCents:90000},{id:'budget2',month:m,category:'cat5',limitCents:50000}];s.goals=[{id:'goal1',name:'Reserva de emergencia',targetCents:1500000,savedCents:500000,deadline:addMonths(d,18)}];return s;}
