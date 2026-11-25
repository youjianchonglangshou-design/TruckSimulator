/* v4.7: mobile landscape host. Coordinates use logical game pixels, independent of device rotation. */
window.TruckMobileFullscreen=()=>{
 const body=document.body, originalStyle=document.querySelector('head style'), originalCSS=originalStyle.textContent;
 const mobile=true;
 let userExited=false;let rotated=false,started=!mobile,busy=false,width=innerWidth,height=innerHeight,signature='',onChange=()=>{},onInterrupt=()=>{};
 let resolveStarted;const startPromise=new Promise(resolve=>{resolveStarted=resolve});if(started)resolveStarted();
 const launch=document.getElementById('mobileLaunch'),begin=document.getElementById('mobileStart'),full=document.getElementById('full');
 const nativeFull=()=>document.fullscreenElement||document.webkitFullscreenElement;
 const safe=document.createElement('div');safe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;inset:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';if(mobile)document.documentElement.append(safe);
 // Re-evaluate existing responsive breakpoints in the game coordinate system, not the physical screen.
 function logicalCSS(w,h,source=originalCSS){return source.replace(/@media\s*([^{}]+)\{/g,(_,q)=>'@media '+q.replace(/\((max|min)-(width|height)\s*:\s*(\d+)px\)/g,(_,op,axis,n)=>{let v=axis==='width'?w:h;return (op==='max'?v<=+n:v>=+n)?'(min-width:0px)':'(max-width:0px)'}).replace(/\(orientation\s*:\s*(portrait|landscape)\)/g,(_,o)=>(o==='landscape'?'(min-width:0px)':'(max-width:0px)')).replace(/\(pointer\s*:\s*(coarse|fine)\)/g,(_,p)=>p==='coarse'?'(min-width:0px)':'(max-width:0px)')+'{').replace(/(\d*\.?\d+)(dvh|dvw|vh|vw)\b/g,(_,n,u)=>(Number(n)*(u.endsWith('w')?w:h)/100).toFixed(3)+'px');}
 function apply(){
  if(!mobile){width=innerWidth;height=innerHeight;return false;}
  const vv=window.visualViewport,cs=getComputedStyle(safe),inset=k=>parseFloat(cs[k])||0;
  const left=inset('paddingLeft'),right=inset('paddingRight'),top=inset('paddingTop'),bottom=inset('paddingBottom');
  const physicalW=Math.max(1,Math.floor((vv?.width||innerWidth)-left-right)),physicalH=Math.max(1,Math.floor((vv?.height||innerHeight)-top-bottom));
  // Layout viewport direction is stable when a text keyboard reduces visualViewport.
  const editing=document.activeElement?.matches('input:not([type=range]),textarea');
  const nextRotated=editing&&vv&&vv.height<innerHeight*.8?rotated:innerHeight>innerWidth;
  const x=(vv?.offsetLeft||0)+left,y=(vv?.offsetTop||0)+top;
  width=nextRotated?physicalH:physicalW;height=nextRotated?physicalW:physicalH;
  const key=[width,height,nextRotated,x,y].join(':');if(key===signature)return false;
  const changed=signature!=='';signature=key;rotated=nextRotated;
  if(changed)onInterrupt();
  originalStyle.textContent=logicalCSS(width,height);
  for(const id of ['mobile-logical-css','mobile-integration-css']){const extra=document.getElementById(id);if(extra){if(!extra.dataset.source)extra.dataset.source=extra.textContent;extra.textContent=logicalCSS(width,height,extra.dataset.source);}}
  Object.assign(body.style,{position:'fixed',margin:'0',width:width+'px',height:height+'px',left:(rotated?x+physicalW:x)+'px',top:y+'px',transformOrigin:'0 0',transform:rotated?'rotate(90deg)':'none'});
  body.classList.add('mobile-game');body.classList.toggle('mobile-rotated',rotated);
  body.style.setProperty('--physical-center-x',(x+physicalW/2)+'px');body.style.setProperty('--physical-center-y',(y+physicalH/2)+'px');body.style.setProperty('--game-width',width+'px');body.style.setProperty('--game-height',height+'px');
  return true;
 }
 function point(e){if(!mobile)return {x:e.clientX,y:e.clientY};const b=body.getBoundingClientRect();return rotated?{x:e.clientY-b.top,y:b.right-e.clientX}:{x:e.clientX-b.left,y:e.clientY-b.top};}
 function rect(el){const r=el.getBoundingClientRect();if(!mobile)return r;const a=point({clientX:r.left,clientY:r.top}),b=point({clientX:r.right,clientY:r.bottom});const left=Math.min(a.x,b.x),right=Math.max(a.x,b.x),top=Math.min(a.y,b.y),bottom=Math.max(a.y,b.y);return {x:left,y:top,left,right,top,bottom,width:right-left,height:bottom-top};}
 function refresh(){const change=apply();const restore=document.getElementById('mobileRestore');if(restore)restore.hidden=!started||!!nativeFull()||userExited;if(mobile){full.textContent=nativeFull()?'退出全螢幕':started?'恢復全螢幕':'全螢幕';full.title='優先使用裝置原生全螢幕；不支援時維持橫式模式';}if(change)onChange();}
 const bounded=p=>Promise.race([Promise.resolve(p),new Promise(resolve=>setTimeout(resolve,1800))]);
 async function enter(){if(busy)return;userExited=false;busy=true;begin.disabled=true;try{const el=document.documentElement;const request=el.requestFullscreen||el.webkitRequestFullscreen;if(!nativeFull()&&request){try{await bounded(request.call(el));}catch{}}if(nativeFull()&&screen.orientation?.lock){try{await bounded(screen.orientation.lock('landscape'));}catch{}}}finally{started=true;busy=false;begin.disabled=false;launch.hidden=true;refresh();onInterrupt();onChange();resolveStarted();}}
 function toggle(){if(!mobile)return false;if(nativeFull()){userExited=true;try{screen.orientation?.unlock?.()}catch{}const exit=document.exitFullscreen||document.webkitExitFullscreen;try{Promise.resolve(exit?.call(document)).catch(()=>{})}catch{} }else enter();return true;}
 if(mobile){const restore=document.createElement('button');restore.id='mobileRestore';restore.textContent='恢復全螢幕';restore.hidden=true;restore.addEventListener('click',enter);body.append(restore);launch.hidden=false;begin.addEventListener('click',enter);apply();for(const event of ['resize','orientationchange'])window.addEventListener(event,refresh);screen.orientation?.addEventListener?.('change',refresh);document.addEventListener('fullscreenchange',refresh);document.addEventListener('webkitfullscreenchange',refresh);window.visualViewport?.addEventListener('resize',refresh);window.visualViewport?.addEventListener('scroll',refresh);document.addEventListener('visibilitychange',()=>{onInterrupt();refresh()});window.addEventListener('blur',()=>onInterrupt());window.addEventListener('pageshow',refresh);}
 // Only presentation labels; never change keyboard bindings or touch input.
 function syncTouchHints(){
  const touch=true;
  const set=(id,text,title)=>{const el=document.getElementById(id);if(el){el.textContent=text;if(title!==undefined)el.title=title}};
  const out=body.classList.contains('cab-inspecting');
  set('exitCab',out?'上車':touch?'下車':'下車 4');
  set('mirrorSetup',touch?'調後照鏡':'調後照鏡 M');
  set('testView',touch?'方向俯視':'方向俯視 5');
  for(const el of document.querySelectorAll('.probe-zero')){el.textContent=touch?'回正':'回正 2';el.title=touch?'回正':'回正（2 鍵）'}
  for(const el of document.querySelectorAll('.shift-positions [data-gear]')){const letter=({'1':'D','0':'N','-1':'R'})[el.dataset.gear],name=({'1':'前進檔','0':'空檔','-1':'倒車檔'})[el.dataset.gear],key=({'1':'Q','0':'A','-1':'Z'})[el.dataset.gear];el.setAttribute('aria-label',letter+' '+name+(touch?'':' '+key))}
  const hint=document.querySelector('#mirrorPanel .hint');if(hint)hint.textContent=touch?'左右獨立設定，按住後照鏡小方塊拖曳。停車調整後點擊手煞車解除，再切換檔位。':'左右獨立設定，鏡面也可直接拖曳。停車調整後按 B 解除手煞車，再切換檔位。';
 }
 syncTouchHints();
 return {mobile,point,rect,apply,refresh,toggle,whenStarted:()=>startPromise,get width(){return width},get height(){return height},get rotated(){return rotated},get paused(){return mobile&&!started||document.hidden},bind(change,interrupt){onChange=change;onInterrupt=interrupt;refresh()}};
};
