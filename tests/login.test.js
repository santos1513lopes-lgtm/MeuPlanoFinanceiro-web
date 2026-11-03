import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

export async function runLoginTests(){
 const source=await fs.readFile(new URL('../js/app.js',import.meta.url),'utf8');
 const storage=await fs.readFile(new URL('../js/storage.js',import.meta.url),'utf8');
 const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
 const helpers=source.slice(source.indexOf('function loginDeadline'),source.indexOf('function drawNav'));
 const enter=source.slice(source.indexOf('async function enter(user)'),source.indexOf("$('header-date')"));
 const handler=source.slice(source.indexOf("$('login-form').noValidate=true;"),source.indexOf("$('reset-password').onclick="));
 function screen({approved=true,neverReply=false,signInError=null}={}){
  const nodes=Object.fromEntries(['login-form','login-submit','email','password','auth-message','login-screen','app-shell','user-label','mode-label','demo-banner'].map(id=>[id,{hidden:false,disabled:false,textContent:'',value:'',validity:{valid:true}}]));
  nodes['app-shell'].hidden=true;nodes.email.value='test@example.invalid';nodes.password.value='not-a-real-password';
  const messages=[];let text='';Object.defineProperty(nodes['auth-message'],'textContent',{get:()=>text,set:value=>{text=value;messages.push(value);}});
  let authCalls=0,signOuts=0,reloads=0;
  const context={$:id=>nodes[id],setTimeout,clearTimeout,layout:{syncAccount:()=>{},closeMenu:()=>{}},F:{emptyState:()=>({})},reload:async()=>{reloads++;},Store:{
   login:async()=>{authCalls++;if(signInError)throw signInError;return {uid:'user-A',email:'test@example.invalid'};},
   assertAccess:async()=>{if(neverReply)return new Promise(()=>{});if(!approved)throw Object.assign(Error('denied'),{code:'app/access-not-approved'});},
   logout:async()=>signOuts++,isDemo:()=>false
  }};
  vm.createContext(context);
  vm.runInContext('let ready=false,state={},entrySequence=0,manualLoginPending=false;\n'+helpers+'\n'+enter.replace("15000,'app/access-timeout'","5,'app/access-timeout'")+'\n'+handler,context);
  return {context,nodes,messages,submit:()=>nodes['login-form'].onsubmit({preventDefault(){}}),calls:()=>({authCalls,signOuts,reloads})};
 }
 let passed=0;const test=async(label,fn)=>{try{await fn();passed++;}catch(error){throw Error(label+': '+error.message);}};
 await test('E-mail vazio mostra mensagem antes do Firebase',async()=>{const s=screen();s.nodes.email.value='';await s.submit();assert.match(s.nodes['auth-message'].textContent,/e-mail válido/);assert.equal(s.calls().authCalls,0);});
 await test('E-mail malformado mostra mensagem',async()=>{const s=screen();s.nodes.email.validity.valid=false;await s.submit();assert.match(s.nodes['auth-message'].textContent,/e-mail válido/);assert.equal(s.calls().authCalls,0);});
 await test('Senha vazia mostra mensagem',async()=>{const s=screen();s.nodes.password.value='';await s.submit();assert.match(s.nodes['auth-message'].textContent,/Informe sua senha/);assert.equal(s.calls().authCalls,0);});
 await test('Credenciais rejeitadas mostram erro e liberam botao',async()=>{const s=screen({signInError:{code:'auth/invalid-credential'}});await s.submit();assert.match(s.nodes['auth-message'].textContent,/E-mail ou senha incorretos/);assert.equal(s.nodes['login-submit'].disabled,false);assert.equal(s.nodes['app-shell'].hidden,true);});
 await test('Login aceito e aprovado abre painel explicitamente',async()=>{const s=screen();await s.submit();assert.equal(s.nodes['app-shell'].hidden,false);assert.equal(s.nodes['login-screen'].hidden,true);assert.equal(s.calls().reloads,1);assert.equal(s.nodes.password.value,'');assert.ok(s.messages.some(x=>x.includes('Conferindo e-mail')));assert.ok(s.messages.some(x=>x.includes('Verificando sua autorização')));});
 await test('Login aceito sem aprovacao nao abre painel',async()=>{const s=screen({approved:false});await s.submit();assert.equal(s.nodes['app-shell'].hidden,true);assert.match(s.nodes['auth-message'].textContent,/Acesso não autorizado/);assert.equal(s.calls().signOuts,1);});
 await test('Firestore sem resposta termina com mensagem especifica',async()=>{const s=screen({neverReply:true});await s.submit();assert.match(s.nodes['auth-message'].textContent,/senha foram aceitos.*Firestore não respondeu/);assert.equal(s.nodes['app-shell'].hidden,true);assert.equal(s.nodes['login-submit'].disabled,false);});
 await test('Cliques repetidos nao duplicam autenticacao',async()=>{const s=screen();const first=s.submit();await s.submit();await first;assert.equal(s.calls().authCalls,1);});
 await test('Resposta atrasada nao substitui tentativa mais recente',async()=>{const s=screen({neverReply:true});const old=s.context.enter({uid:'old',email:'old@example.invalid'});vm.runInContext('entrySequence++;',s.context);await old;assert.equal(s.calls().signOuts,0);assert.equal(s.nodes['app-shell'].hidden,true);});
 await test('Servico devolve usuario autenticado para o formulario',async()=>{
  const login=storage.slice(storage.indexOf('export async function login('),storage.indexOf('export async function assertAccess(')).replace(/^export /gm,'');
  const expected={uid:'user-A'};const context={fakeSDK:{auth:{},signInWithEmailAndPassword:async()=>({user:expected})}};vm.createContext(context);vm.runInContext('let sdk=fakeSDK,user=null,demo=true;\n'+login,context);assert.equal(await context.login('test@example.invalid','not-a-real-password'),expected);assert.equal(vm.runInContext('user.uid',context),'user-A');
 });
 await test('Carregamento inicial tem falha visivel',()=>{assert.ok(html.includes('Falha ao carregar o código do aplicativo'));assert.ok(html.includes("import('./js/app.js"));});
 await test('Erro de conexao e erro de dados sao distintos',()=>{const s=screen();assert.match(s.context.errorText({code:'app/connection-timeout'}),/conexão inicial/);assert.match(s.context.errorText({code:'app/data-timeout'}),/dados do Firestore/);});
 return passed;
}
export const passed=await runLoginTests();
console.log(passed+' testes de login passaram.');
