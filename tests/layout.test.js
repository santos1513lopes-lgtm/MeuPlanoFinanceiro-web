import assert from 'node:assert/strict';
import {initLayout} from '../js/layout.js';
import fs from 'node:fs/promises';

function fixture({mobile=false,preference='false',storageDenied=false}={}){
 const saved=new Map([['meu-financeiro-sidebar-collapsed',preference],['auth-session','keep']]);
 const nodes={},listeners=new Map(),mediaListeners=new Set();
 const doc={activeElement:null,body:null,getElementById:id=>nodes[id],querySelector:selector=>selector==='.app-body'?nodes.body:null,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);}};
 const make=id=>{const classes=new Set(),events=new Map();return {id,textContent:'',title:'',hidden:false,inert:false,attributes:{},events,classList:{toggle:(key,value)=>value?classes.add(key):classes.delete(key),contains:key=>classes.has(key)},setAttribute(key,value){this.attributes[key]=value;},getAttribute(key){return this.attributes[key];},querySelector:()=>nodes.icon,addEventListener(name,fn){events.set(name,fn);},removeEventListener(name,fn){if(events.get(name)===fn)events.delete(name);},focus(){doc.activeElement=this;},getClientRects:()=>[{}],click(){events.get('click')?.();}};};
 for(const id of ['app-shell','sidebar','body','sidebar-toggle','menu-button','sidebar-close','sidebar-backdrop','logout','user-label','header-user-label','icon','brand','nav1','nav2','document-body'])nodes[id]=make(id);
 doc.body=nodes['document-body'];
 const focusable=[nodes.brand,nodes['sidebar-close'],nodes.nav1,nodes.nav2,nodes.logout];
 nodes.sidebar.querySelectorAll=()=>focusable;
 nodes.sidebar.contains=node=>focusable.includes(node)||node===nodes.sidebar;
 nodes['user-label'].textContent='person@example.invalid';
 const media={matches:mobile,addEventListener:(event,fn)=>mediaListeners.add(fn),removeEventListener:(event,fn)=>mediaListeners.delete(fn)};
 const storage={getItem:key=>{if(storageDenied)throw Error('denied');return saved.get(key)||null;},setItem:(key,value)=>{if(storageDenied)throw Error('denied');saved.set(key,value);}};
 const win={localStorage:storage,matchMedia:()=>media};
 const controller=initLayout({document:doc,window:win});
 return {nodes,doc,saved,controller,resize(value){media.matches=value;for(const fn of mediaListeners)fn();},key(key,shiftKey=false){let prevented=false;listeners.get('keydown')?.({key,shiftKey,preventDefault:()=>prevented=true});return prevented;}};
}
export async function runLayoutTests(){
 let passed=0;const test=async(label,fn)=>{try{await fn();passed++;}catch(error){throw Error(label+': '+error.message);}};
 await test('Desktop inicia expandido',()=>{const f=fixture();assert.equal(f.nodes['app-shell'].classList.contains('sidebar-collapsed'),false);assert.equal(f.nodes['sidebar-toggle'].getAttribute('aria-expanded'),'true');assert.equal(f.nodes.body.inert,false);});
 await test('Recolher persiste somente preferencia de layout',()=>{const f=fixture();f.nodes['sidebar-toggle'].click();assert.equal(f.saved.get('meu-financeiro-sidebar-collapsed'),'true');assert.equal(f.saved.get('auth-session'),'keep');assert.equal(f.nodes['sidebar-toggle'].title,'Expandir menu lateral');});
 await test('Preferencia recolhida e restaurada',()=>{const f=fixture({preference:'true'});assert.equal(f.nodes['app-shell'].classList.contains('sidebar-collapsed'),true);});
 await test('Expandir atualiza descricao e aria',()=>{const f=fixture({preference:'true'});f.nodes['sidebar-toggle'].click();assert.equal(f.nodes['sidebar-toggle'].getAttribute('aria-expanded'),'true');assert.equal(f.nodes['sidebar-toggle'].getAttribute('aria-label'),'Recolher menu lateral');});
 await test('Armazenamento bloqueado nao impede navegacao',()=>{const f=fixture({storageDenied:true});f.nodes['sidebar-toggle'].click();assert.equal(f.nodes['app-shell'].classList.contains('sidebar-collapsed'),true);});
 await test('Mobile fechado nao recebe foco no menu oculto',()=>{const f=fixture({mobile:true});assert.equal(f.nodes.sidebar.inert,true);assert.equal(f.nodes['sidebar-backdrop'].hidden,true);});
 await test('Mobile abre menu e bloqueia somente fundo',()=>{const f=fixture({mobile:true});f.nodes['menu-button'].click();assert.equal(f.nodes.sidebar.inert,false);assert.equal(f.nodes.body.inert,true);assert.equal(f.nodes['sidebar-backdrop'].hidden,false);assert.equal(f.doc.activeElement,f.nodes['sidebar-close']);});
 await test('Tocar fora fecha e devolve foco',()=>{const f=fixture({mobile:true});f.controller.openMenu();f.nodes['sidebar-backdrop'].click();assert.equal(f.nodes.body.inert,false);assert.equal(f.doc.activeElement,f.nodes['menu-button']);});
 await test('Botao X fecha menu',()=>{const f=fixture({mobile:true});f.controller.openMenu();f.nodes['sidebar-close'].click();assert.equal(f.nodes.sidebar.inert,true);});
 await test('Escape fecha menu e restaura rolagem',()=>{const f=fixture({mobile:true});f.controller.openMenu();assert.equal(f.key('Escape'),true);assert.equal(f.doc.body.classList.contains('navigation-open'),false);assert.equal(f.nodes['menu-button'].getAttribute('aria-expanded'),'false');});
 await test('Tab fica dentro do menu aberto',()=>{const f=fixture({mobile:true});f.controller.openMenu();f.nodes.logout.focus();assert.equal(f.key('Tab'),true);assert.equal(f.doc.activeElement,f.nodes.brand);});
 await test('Shift Tab volta ao ultimo controle',()=>{const f=fixture({mobile:true});f.controller.openMenu();f.nodes.brand.focus();assert.equal(f.key('Tab',true),true);assert.equal(f.doc.activeElement,f.nodes.logout);});
 await test('Navegar fecha sem roubar foco do conteudo',()=>{const f=fixture({mobile:true});f.controller.openMenu();f.nodes.nav1.focus();f.controller.closeMenu({restoreFocus:false});assert.equal(f.nodes.body.inert,false);assert.equal(f.doc.activeElement,f.nodes.nav1);});
 await test('Mudar para desktop limpa estado do mobile',()=>{const f=fixture({mobile:true,preference:'true'});f.controller.openMenu();f.resize(false);assert.equal(f.nodes.body.inert,false);assert.equal(f.nodes.sidebar.inert,false);assert.equal(f.nodes['sidebar-backdrop'].hidden,true);assert.equal(f.nodes['app-shell'].classList.contains('sidebar-collapsed'),true);assert.equal(f.doc.activeElement,f.nodes['sidebar-toggle']);});
 await test('Preferencia desktop nao recolhe drawer mobile',()=>{const f=fixture({mobile:true,preference:'true'});assert.equal(f.nodes['app-shell'].classList.contains('sidebar-collapsed'),false);f.controller.openMenu();assert.equal(f.nodes.sidebar.inert,false);assert.equal(f.saved.get('meu-financeiro-sidebar-collapsed'),'true');});
 await test('Sair fecha overlay sem executar autenticacao no controlador',()=>{const f=fixture({mobile:true});f.controller.openMenu();f.nodes.logout.click();assert.equal(f.nodes.body.inert,false);assert.equal(f.saved.get('auth-session'),'keep');});
 await test('Email sincronizado no cabecalho e em descricoes',()=>{const f=fixture();assert.equal(f.nodes['header-user-label'].textContent,'person@example.invalid');f.nodes['user-label'].textContent='other@example.invalid';f.controller.syncAccount();assert.equal(f.nodes['header-user-label'].title,'other@example.invalid');});
 await test('Destroy remove listeners',()=>{const f=fixture();f.controller.destroy();f.nodes['sidebar-toggle'].click();assert.equal(f.nodes['app-shell'].classList.contains('sidebar-collapsed'),false);});
 await test('Layout CSS e HTML preservam controles e rolagem separada',async()=>{const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');assert.ok(css.includes('position:sticky;top:0'));assert.ok(css.includes('.sidebar-scroll{flex:1 1 auto;min-height:0;overflow-y:auto'));assert.ok(css.includes('height:100dvh'));assert.ok(css.includes('prefers-reduced-motion:reduce'));assert.equal((html.match(/id="logout"/g)||[]).length,1);assert.ok(html.includes('class="logout-label">Sair'));assert.ok(html.includes('aria-controls="sidebar"'));});
 return passed;
}
export const passed=await runLayoutTests();
console.log(passed+' testes de navegacao passaram.');
