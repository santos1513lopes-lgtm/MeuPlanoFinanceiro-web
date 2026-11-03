const preferenceKey='meu-financeiro-sidebar-collapsed';
export function initLayout({document:doc=document,window:win=window,storage}={}){
 if(storage===undefined){try{storage=win.localStorage;}catch(error){storage=null;}}
 const shell=doc.getElementById('app-shell'),sidebar=doc.getElementById('sidebar'),body=doc.querySelector('.app-body');
 const toggle=doc.getElementById('sidebar-toggle'),menu=doc.getElementById('menu-button'),close=doc.getElementById('sidebar-close'),backdrop=doc.getElementById('sidebar-backdrop'),logout=doc.getElementById('logout');
 const media=win.matchMedia('(max-width: 760px)');
 let collapsed=false,opened=false;
 try{collapsed=storage?.getItem(preferenceKey)==='true';}catch(error){}
 function sync(){
  const mobile=media.matches;
  shell.classList.toggle('sidebar-collapsed',!mobile&&collapsed);
  shell.classList.toggle('sidebar-open',mobile&&opened);
  sidebar.classList.toggle('open',mobile&&opened);
  sidebar.inert=mobile&&!opened;
  body.inert=mobile&&opened;
  doc.body.classList.toggle('navigation-open',mobile&&opened);
  backdrop.hidden=!(mobile&&opened);
  menu.setAttribute('aria-expanded',String(mobile&&opened));
  toggle.setAttribute('aria-expanded',String(!collapsed));
  toggle.setAttribute('aria-label',collapsed?'Expandir menu lateral':'Recolher menu lateral');
  toggle.title=collapsed?'Expandir menu lateral':'Recolher menu lateral';
  toggle.querySelector('[aria-hidden]').textContent=collapsed?'☰':'⇤';
 }
 function closeMenu({restoreFocus=true}={}){
  const wasOpen=opened;opened=false;sync();
  if(wasOpen&&restoreFocus)menu.focus();
 }
 function toggleDesktop(){
  if(media.matches)return;
  collapsed=!collapsed;
  try{storage?.setItem(preferenceKey,String(collapsed));}catch(error){}
  sync();
 }
 function openMenu(){
  if(!media.matches)return;
  opened=true;sync();close.focus();
 }
 function toggleMobile(){if(opened)closeMenu();else openMenu();}
 function outside(){closeMenu();}
 function exit(){closeMenu({restoreFocus:false});}
 function resized(){const wasOpen=opened;opened=false;sync();if(wasOpen)(media.matches?menu:toggle).focus();}
 function keys(event){
  if(!media.matches||!opened)return;
  if(event.key==='Escape'){event.preventDefault();closeMenu();return;}
  if(event.key!=='Tab')return;
  const focusable=[...sidebar.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&(doc.activeElement===first||!sidebar.contains(doc.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(doc.activeElement===last||!sidebar.contains(doc.activeElement))){event.preventDefault();first.focus();}
 }
 function syncAccount(){
  const source=doc.getElementById('user-label'),header=doc.getElementById('header-user-label');
  const email=source.textContent||'Minha conta';
  source.title=email;header.textContent=email;header.title=email;
 }
 toggle.addEventListener('click',toggleDesktop);menu.addEventListener('click',toggleMobile);
 close.addEventListener('click',outside);backdrop.addEventListener('click',outside);
 logout.addEventListener('click',exit);doc.addEventListener('keydown',keys);
 media.addEventListener('change',resized);
 sync();syncAccount();
 return {closeMenu,openMenu,syncAccount,
  destroy(){toggle.removeEventListener('click',toggleDesktop);menu.removeEventListener('click',toggleMobile);close.removeEventListener('click',outside);backdrop.removeEventListener('click',outside);logout.removeEventListener('click',exit);doc.removeEventListener('keydown',keys);media.removeEventListener('change',resized);opened=false;sync();}
 };
}
