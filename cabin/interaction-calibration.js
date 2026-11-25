/* RC33: approved mirror grip size and physical switch status; never changes the 3D artwork or mirror cameras. */
(function(g){'use strict';
const KEY='truck-cabin-interaction-calibration-v2';
const fields=[['mirrorGrip','size','四鏡拖曳方塊大小',12,48,1,12,'px']];
function normalize(raw){
 const v={schema:'TruckCabinInteractionCalibration',version:1,mirrorGrip:{},wiperHit:{offsetX:0,offsetY:0,scaleX:1,scaleY:1}};
 for(const [group,key,,min,max,,def] of fields){const n=raw?.[group]?.[key];v[group][key]=n==null||n===''||!Number.isFinite(Number(n))?def:Math.min(max,Math.max(min,Number(n)));}
 return v;
}
function load(){try{return normalize(JSON.parse(g.localStorage.getItem(KEY)))}catch{return normalize()}}
function save(raw){const v=normalize(raw);try{g.localStorage.setItem(KEY,JSON.stringify(v))}catch{}return v;}
function label(button,environment){
 const settings=environment?.settings;
 if(button.kind==='lowbeam')return `${button.label}：${({auto:'AUTO',on:'ON',off:'OFF'})[settings?.head]||'AUTO'}`;
 if(button.kind==='highbeam')return `${button.label}：${(environment?.highOn??settings?.high)?'ON':'OFF'}`;
 if(button.kind==='wiper')return `${button.label}：${['OFF','LOW','HIGH'][settings?.wiper]||'OFF'}`;
 return button.label;
}
// Convex projected silhouette, including exact edges. Degenerate faces are rejected.
function containsPoint(corners,x,y){
 if(!corners||corners.length<3||!Number.isFinite(x)||!Number.isFinite(y))return false;
 let sign=0,area=0;
 for(let i=0;i<corners.length;i++){
  const a=corners[i],b=corners[(i+1)%corners.length];if(!Number.isFinite(a.x)||!Number.isFinite(a.y))return false;
  area+=a.x*b.y-b.x*a.y;
  const cross=(b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x);
  if(Math.abs(cross)<1e-9)continue;const next=Math.sign(cross);if(sign&&sign!==next)return false;sign=next;
 }
 return Math.abs(area)>1e-9;
}
function convexHull(points){
 const sorted=points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).slice().sort((a,b)=>a.x-b.x||a.y-b.y);
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const half=arr=>{const out=[];for(const p of arr){while(out.length>=2&&cross(out.at(-2),out.at(-1),p)<=1e-12)out.pop();out.push(p)}return out};
 if(sorted.length<3)return [];
 const lower=half(sorted),upper=half(sorted.slice().reverse());return lower.slice(0,-1).concat(upper.slice(0,-1));
}
function applyGrip(host,v){host.style.setProperty('--cab-mirror-grip-size',v.mirrorGrip.size+'px');}
function mount(host,{initial,onChange,onVisibility}){
 let value=normalize(initial),opened=false;const sliders=[];
 const add=(parent,tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;parent.append(el);return el;};
 const trigger=add(host,'button','環境參數','cab-control');trigger.id='cabInteractionToggle';trigger.type='button';trigger.setAttribute('aria-expanded','false');
 const panel=add(host,'section');panel.id='cabInteractionPanel';panel.hidden=true;panel.setAttribute('aria-label','環境參數・操作校準');
 const header=add(panel,'header');add(header,'strong','環境參數・操作校準');const close=add(header,'button','✕','cab-control');close.type='button';close.setAttribute('aria-label','關閉環境參數');
 add(panel,'p','四面後照鏡拖曳方塊即時調整；預設為已確認的 12 px。');
 const list=add(panel,'div',null,'cab-interaction-list');
 const format=(n,unit)=>unit==='px'?`${n} px`:unit==='m'?`${Math.round(n*1000)} mm`:`${Number(n).toFixed(2)} ×`;
 function update(){for(const [group,key,slider,out,unit] of sliders){slider.value=value[group][key];out.textContent=format(value[group][key],unit);}applyGrip(host,value);onChange(value);}
 for(const [group,key,title,min,max,step,,unit] of fields){
  const wrap=add(list,'label');add(wrap,'span',title);const slider=add(wrap,'input');slider.type='range';slider.min=min;slider.max=max;slider.step=step;slider.id='cabTune-'+key;const out=add(wrap,'output');out.setAttribute('for',slider.id);sliders.push([group,key,slider,out,unit]);
  slider.addEventListener('input',()=>{value=save({...value,[group]:{...value[group],[key]:Number(slider.value)}});update();});
 }
 const tools=add(panel,'div',null,'cab-interaction-tools');
 const reset=add(tools,'button','恢復預設','cab-control');reset.type='button';reset.addEventListener('click',()=>{value=save();update();});
 const exportBtn=add(tools,'button','匯出 JSON','cab-control');exportBtn.type='button';exportBtn.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='TruckCabin_interaction-calibration.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 function setOpen(v){opened=!!v;panel.hidden=!opened;trigger.setAttribute('aria-expanded',String(opened));onVisibility(opened);}
 trigger.addEventListener('click',()=>setOpen(!opened));close.addEventListener('click',()=>setOpen(false));
 g.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){setOpen(false);}});
 update();return {trigger,panel,setOpen,get open(){return opened;},get value(){return normalize(value);}};
}
g.TruckInteractionCalibration=Object.freeze({KEY,normalize,load,save,label,containsPoint,convexHull,applyGrip,mount});
})(window);
