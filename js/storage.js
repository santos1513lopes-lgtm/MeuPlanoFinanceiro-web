import {planReset,applyReset,resetModes} from './reset.js?v=controls-20261103';
import {collections,emptyState,today,addMonths} from './finance.js?v=controls-20261103';
import {assertControl,otherControl,projectLinks,validateLink,validatePots,assertPotTransaction,freshControls} from './controls.js?v=controls-20261103';
import {validateTx} from './finance.js?v=controls-20261103';
import {firebaseConfig} from './firebase-config.js?v=controls-20261103';
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
const demoKey='meu-financeiro-demo-v3';
let selected='personal',controlOwner='',resetInProgress=false,mutationBusy=false;
const scopeKey=uid=>'meu-financeiro-control-'+uid;
function ensureSelection(){if(controlOwner!==user?.uid){controlOwner=user?.uid||'';let saved=null;try{saved=localStorage.getItem(scopeKey(controlOwner));}catch{};selected=['personal','business'].includes(saved)?saved:'personal';}}
export function currentControl(){ensureSelection();return selected;}
export function selectControl(id){if(resetInProgress||mutationBusy)throw Error('Aguarde o término da operação atual.');ensureSelection();selected=assertControl(id);try{localStorage.setItem(scopeKey(controlOwner),selected);}catch{};}
function session(){if(!user)throw Error('Entre novamente.');ensureSelection();return {uid:user.uid,demo,control:selected};}
function requireSession(s){if(!user||s.uid!==user.uid||s.demo!==demo||s.control!==currentControl())throw Error('A sessão ou controle mudou. Recarregue os dados antes de salvar.');}
const root=(uid,...parts)=>['finance_v3',uid,...parts];
const guardRef=(uid,control)=>sdk.doc(sdk.db,...root(uid,'controls',control));
const collectionRef=(uid,control,kind)=>sdk.collection(sdk.db,...root(uid,'controls',control,kind));
const rowRef=(uid,control,kind,id)=>sdk.doc(sdk.db,...root(uid,'controls',control,kind,id));
const linksRef=uid=>sdk.collection(sdk.db,...root(uid,'links'));
const parseList=snapshot=>snapshot.docs.map(d=>({...d.data(),id:d.id}));
function demoRead(){return JSON.parse(localStorage.getItem(demoKey)||JSON.stringify({states:freshControls(),links:[]}));}
function demoWrite(value){localStorage.setItem(demoKey,JSON.stringify(value));}
export function startDemo(){demo=true;user={uid:'demo',email:'Demonstração local'};ensureSelection();if(!localStorage.getItem(demoKey)){const states=freshControls(),d=today(),base={kind:'checking',openingDate:d};states.personal.accounts=[{...base,id:'personal-bank',name:'Conta pessoal',openingCents:400000}];states.business.accounts=[{...base,id:'business-bank',name:'Conta PJ',openingCents:1200000}];for(const [control,names] of Object.entries({personal:['Salário','Moradia','Internet','Alimentação','Outros'],business:['Clientes','Fornecedores','Internet','Folha de pagamento','Impostos','Outros']}))states[control].categories=names.map((name,i)=>({id:control+'-cat-'+i,name}));states.business.pots=[{id:'payroll',name:'Folha de pagamento',accountId:'business-bank',reservedCents:400000,targetCents:400000},{id:'taxes',name:'Impostos',accountId:'business-bank',reservedCents:200000,targetCents:250000}];demoWrite({states,links:[]});}return user;}
async function cloudState(uid,control){const lists=await Promise.all(collections.map(kind=>sdk.getDocsFromServer(collectionRef(uid,control,kind))));const result=emptyState();collections.forEach((kind,i)=>result[kind]=parseList(lists[i]));return result;}
export async function readLinks(){const s=session();if(demo)return demoRead().links;await assertAccess();const result=parseList(await sdk.getDocsFromServer(linksRef(s.uid)));requireSession(s);return result;}
export async function readState(control=currentControl()){assertControl(control);const s=session();if(demo){const value=demoRead();return projectLinks(value.states[control],value.links,control);}if(!sdk)throw Error('Conecte-se ao Firebase.');await assertAccess();const [state,links]=await Promise.all([cloudState(s.uid,control),sdk.getDocsFromServer(linksRef(s.uid)).then(parseList)]);requireSession(s);return projectLinks(state,links,control);}
async function mutate(affected,update,resetPermit=false){
 if(mutationBusy||(resetInProgress&&!resetPermit))throw Error('Aguarde a operação atual.');
 const s=session();mutationBusy=true;
 try{
  if(s.demo){const value=demoRead();await update(value,null,s);requireSession(s);demoWrite(value);return;}
  if(!sdk||!navigator.onLine)throw Error('Conecte-se à internet antes de salvar.');await assertAccess();requireSession(s);
  await sdk.runTransaction(sdk.db,async tx=>{
   const guards=await Promise.all(affected.map(control=>tx.get(guardRef(s.uid,control))));
   const states=Object.fromEntries(await Promise.all(affected.map(async control=>[control,await cloudState(s.uid,control)])));
   const links=parseList(await sdk.getDocsFromServer(linksRef(s.uid)));requireSession(s);
   await update({states,links},tx,s);
   affected.forEach((control,i)=>tx.set(guardRef(s.uid,control),{revision:(guards[i].data()?.revision||0)+1}));
  });
 }finally{mutationBusy=false;}
}
export async function saveRows(kind,rows){
 if(!collections.includes(kind)||!rows.length||rows.length>440)throw Error('Operação fora do limite.');
 const control=currentControl();
 await mutate([control],async(value,tx,s)=>{
  const state=value.states[control];
  for(const row of rows){if(!row.id||row.id.includes('/')||row.id.startsWith('link:'))throw Error('Registro inválido.');if(kind==='transactions'){validateTx(row,state);assertPotTransaction(row,state);}const i=state[kind].findIndex(x=>x.id===row.id);if(i<0)state[kind].push(row);else state[kind][i]=row;}
  const projected=projectLinks(state,value.links,control);validatePots(projected);
  for(const link of value.links.filter(l=>l.status!=='cancelled')){const account=state.accounts.find(a=>a.id===(link.fromControl===control?link.fromAccount:link.toAccount));if(account&&link.status==='posted'&&link.paidDate<account.openingDate)throw Error('A abertura não pode ser posterior às movimentações entre controles.');}
  if(tx)for(const row of rows){const {id,...data}=row;tx.set(rowRef(s.uid,control,kind,id),data);}
 });
}
export async function saveLink(link){
 await mutate(['personal','business'],async(value,tx,s)=>{
  validateLink(link,value.states);
  const i=value.links.findIndex(x=>x.id===link.id);if(i<0)value.links.push(link);else value.links[i]=link;
  for(const control of ['personal','business'])validatePots(projectLinks(value.states[control],value.links,control));
  if(tx){const {id,...data}=link;tx.set(sdk.doc(sdk.db,...root(s.uid,'links',id)),data);}
 });
}
export async function prepareReset(mode){
 if(!Object.hasOwn(resetModes,mode)||mutationBusy||resetInProgress)throw Error('Aguarde ou escolha uma limpeza válida.');
 const s=session();await assertAccess();
 const links=await readLinks();if(links.some(l=>l.status!=='cancelled'))throw Error('Há movimentações entre os controles. Cancele-as em Entre controles antes de limpar; isso ajusta os dois lados.');
 const state=await readState();requireSession(s);
 return {...s,mode,date:today(),state};
}
export async function executeReset(snapshot,confirmation,onProgress=()=>{}){
 requireSession(snapshot);
 if(confirmation!==resetModes[snapshot.mode]?.phrase)throw Error('Confirmação incorreta.');
 const current=await prepareReset(snapshot.mode);
 if(JSON.stringify(current.state)!==JSON.stringify(snapshot.state))throw Error('Os dados mudaram. Prepare a limpeza novamente.');
 const ops=planReset(snapshot.state,snapshot.mode,snapshot.date);let done=0;
 // Each batch rechecks the session and the remaining snapshot before deleting.
 let expected=JSON.parse(JSON.stringify(snapshot.state));
 resetInProgress=true;
 try{for(let start=0;start<ops.length;start+=440){
  requireSession(snapshot);const part=ops.slice(start,start+440);
  let nextExpected;
  await mutate([snapshot.control],async(value,tx,s)=>{
   if(value.links.some(l=>l.status!=='cancelled'))throw Error('Surgiu uma movimentação entre controles. Limpeza interrompida.');
   if(JSON.stringify(value.states[s.control])!==JSON.stringify(expected))throw Error('Os registros mudaram durante a limpeza. Atualize e confira o resultado parcial.');
   for(const op of part){if(op.type==='delete'){value.states[s.control][op.kind]=value.states[s.control][op.kind].filter(r=>r.id!==op.id);if(tx)tx.delete(rowRef(s.uid,s.control,op.kind,op.id));}else{value.states[s.control][op.kind]=value.states[s.control][op.kind].map(r=>r.id===op.id?op.row:r);if(tx){const {id,...data}=op.row;tx.set(rowRef(s.uid,s.control,op.kind,id),data);}}}
   nextExpected=JSON.parse(JSON.stringify(value.states[s.control]));
  },true);expected=nextExpected;done+=part.length;onProgress(done,ops.length);
 }}finally{resetInProgress=false;}
 return {completed:done,total:ops.length};
}
