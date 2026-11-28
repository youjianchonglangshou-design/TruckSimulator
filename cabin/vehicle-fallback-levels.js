/* P08: the existing multi-vehicle levels menu remains reachable after explicit 2D fallback. */
(function(g){'use strict';
let modal=null,button=null,menus=null,previous=[];
const isOpen=()=>!!modal?.classList.contains('open');
function install(){
 if(button||!g.TruckCabinBridge||!g.TruckV6SettingsCabin)return;
 const b=g.TruckCabinBridge,add=(p,t,id,text,cls)=>{const e=document.createElement(t);if(id)e.id=id;if(text)e.textContent=text;if(cls)e.className=cls;p.append(e);return e};
 const btn=(p,text,fn)=>{const e=add(p,'button',null,text);e.type='button';e.onclick=fn;return e};
 // A failed 3D session may have built the old modal. It is retired until page reload.
 const retired=document.getElementById('cabModal');if(retired){retired.classList.remove('open');retired.id='cabModalRetired';retired.hidden=true;}
 button=btn(document.querySelector('.top'),'選關',()=>open('levels'));button.id='vehicleFallbackLevels';document.querySelector('#level').after(button);const settings=btn(document.querySelector('.top'),'設定',()=>open('settings'));settings.id='vehicleFallbackSettings';button.after(settings);
 modal=add(document.body,'div','cabModal');modal.dataset.vehicleFallback='true';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','vehicleFallbackTitle');
 const card=add(modal,'div',null,null,'cab-dialog'),header=add(card,'header'),title=add(header,'h3','vehicleFallbackTitle'),close=btn(header,'關閉',()=>menus.closeModal());close.id='vehicleFallbackClose';const body=add(card,'div',null,null,'cab-dialog-body');
 function restore(){for(const [el,inert] of previous)el.inert=inert;previous=[];b.releaseKeys();button.focus();}
 // Reuse the original levels implementation including mission UI and original truck launch actions.
 const originalPaint=TruckCabinPaint.create(null,null,TruckCabinPaintLayout);originalPaint.loadSaved();const carPaint=TruckVehiclePaint.create(b.vehicles.storageFor('NissanMarch_K13'));const paint={get:()=>b.snapshot().vehicleId==='truck'?originalPaint.get():{shell:carPaint.get()||'#e9e9e4'},set:(k,v)=>b.snapshot().vehicleId==='truck'?originalPaint.set(k,v):carPaint.set(v),save:()=>b.snapshot().vehicleId==='truck'?originalPaint.save():true,reset:()=>b.snapshot().vehicleId==='truck'?originalPaint.reset():carPaint.reset()};const mirrorCabin=TruckMirrorCabin.createMirrorCabin({b,add,btn,action:b.action});menus=TruckV6SettingsCabin.createSettingsSystemCabin({paint,mirrorCabin,ui:{modal,modalTitle:title,modalBody:body},b,action:b.action,add,btn,row:p=>add(p,'div',null,null,'cab-row'),sub:(p,t)=>add(p,'h4',null,t)});
 function open(name){if(isOpen()||g.TruckVehicleCabins.isOpen())return;b.releaseKeys();menus.openModal(name);if(!isOpen())return;previous=[...document.body.children].filter(e=>e!==modal&&!['SCRIPT','STYLE','LINK'].includes(e.tagName)).map(e=>[e,e.inert]);for(const [e] of previous)e.inert=true;close.focus();}
 new MutationObserver(()=>{if(!isOpen()&&previous.length)restore()}).observe(modal,{attributes:true,attributeFilter:['class']});
 modal.addEventListener('pointerdown',e=>{if(e.target===modal&&!g.TruckVehicleCabins.isOpen())menus.closeModal()});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen()&&!g.TruckVehicleCabins.isOpen()){e.preventDefault();e.stopImmediatePropagation();menus.closeModal()}},true);
}
g.TruckVehicleFallbackLevels=Object.freeze({install,isOpen});
})(globalThis);
