import {cents} from './finance.js?v=money-pots-20261103';
// Currency entry follows the cent-based convention: 1 -> 0,01; 12345 -> 123,45.
export function moneyDigits(value){
 const raw=String(value??''),negative=raw.trim().startsWith('-');
 let digits=raw.replace(/\D/g,'').replace(/^0+(?=\d)/,'');
 if(!digits)return negative?'-':'';
 digits=digits.padStart(3,'0');
 const integer=digits.slice(0,-2).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
 return (negative?'-':'')+integer+','+digits.slice(-2);
}
export function moneyValue(value){
 if(value===null||value===undefined||value==='')return '';
 const amount=cents(value,true);
 return moneyDigits(String(amount));
}
export function pastedMoney(text,allowNegative=false){
 let raw=String(text).trim();
 if(/^[-+]?\d{1,3}(\.\d{3})+$/.test(raw))raw=raw.replace(/\./g,'');
 return moneyDigits(String(cents(raw,allowNegative)));
}
export function installMoneyInputs(root=document){
 const isMoney=target=>target?.dataset?.money==='true';
 function format(target){
  const raw=target.value,start=target.selectionStart??raw.length,right=(raw.slice(start).match(/\d/g)||[]).length;
  target.value=moneyDigits(raw);
  let position=target.value.length,remaining=right;
  while(position>0&&remaining>0){position--;if(/\d/.test(target.value[position]))remaining--;}
  target.setSelectionRange?.(position,position);
  target.setCustomValidity?.(target.value.startsWith('-')&&target.dataset.allowNegative!=='true'?'Use um valor positivo.':'');
 }
 const onInput=event=>{if(isMoney(event.target)&&!event.isComposing)format(event.target);};
 const onPaste=event=>{
  const target=event.target;if(!isMoney(target)||!event.clipboardData)return;
  // Preserve normal native selection/replacement behaviour; whole-field pastes use reais.
  if(target.selectionStart!==0||target.selectionEnd!==target.value.length){if(target.value!=='')return;}
  event.preventDefault();
  try{target.value=pastedMoney(event.clipboardData.getData('text'),target.dataset.allowNegative==='true');target.setCustomValidity?.('');target.setSelectionRange?.(target.value.length,target.value.length);}
  catch(error){target.setCustomValidity?.(error.message);target.reportValidity?.();}
 };
 const beforeInput=event=>{
  const t=event.target;if(!isMoney(t)||t.selectionStart!==t.selectionEnd)return;
  const p=t.selectionStart;
  if(event.inputType==='deleteContentBackward'&&/[.,]/.test(t.value[p-1]||'')){let start=p-2;while(start>=0&&!/\d/.test(t.value[start]))start--;if(start>=0)t.setSelectionRange(start,p);}
  if(event.inputType==='deleteContentForward'&&/[.,]/.test(t.value[p]||'')){let end=p+1;while(end<t.value.length&&!/\d/.test(t.value[end]))end++;if(end<t.value.length)t.setSelectionRange(p,end+1);}
 };
 root.addEventListener('input',onInput);root.addEventListener('paste',onPaste);root.addEventListener('beforeinput',beforeInput);
 return ()=>{root.removeEventListener('input',onInput);root.removeEventListener('paste',onPaste);root.removeEventListener('beforeinput',beforeInput);};
}
