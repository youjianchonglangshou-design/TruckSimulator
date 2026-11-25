/* RC9 startup gate: no legacy cockpit is shown by default, even on an offline CDN failure. */
(function(){
 let ready=false,failed=false,declined=false,latestError='';
 const bootErrors=[];
 function record(error){if(error&&bootErrors.length<16)bootErrors.push(error);latestError=bootErrors[0]||error||latestError;}
 function detail(){return bootErrors.filter(Boolean).join(' | ').slice(0,500);}
 const card=()=>document.getElementById('cabStartup');
 const panel=()=>document.getElementById('cabStartupCard');
 const msg=()=>document.getElementById('cabStartupMessage');
 const actions=()=>document.getElementById('cabStartupActions');
 let limit=null,revealTimer=null;
 function clearReveal(){clearTimeout(revealTimer);revealTimer=null;}
 function begin(timeout=19000){if(limit!==null||ready||failed||declined)return;
  revealTimer=setTimeout(()=>{revealTimer=null;if(!ready&&!failed&&!declined)panel().hidden=false;},3000);
  limit=setTimeout(()=>fail('3D 駕駛艙載入逾時。可能是 Three.js 網路來源或 WebGL 無法使用。'),timeout);}
 function fail(error){
  if(failed||declined)return;
  failed=true;ready=false;clearTimeout(limit);clearReveal();
  document.body.classList.add('cabin3d-starting');card().hidden=false;panel().hidden=false;
  document.getElementById('cabStartupTitle').textContent='3D 駕駛艙載入失敗';
  const info=String(error?.message||error||latestError||'未知錯誤').slice(0,250);
  msg().textContent=info+(latestError&&!info.includes(latestError)?'（最近錯誤：'+latestError.slice(0,120)+'）':'')+'。原版駕駛艙不會自動覆蓋新車艙。';
  actions().hidden=false;
  document.body.classList.add('cabin3d-failed');
 }
 function succeed(){
  if(ready||declined)return;
  ready=true;failed=false;clearTimeout(limit);clearReveal();panel().hidden=true;
  document.body.classList.remove('cabin3d-starting','cabin3d-failed');
  card().hidden=true;
 }
 window.addEventListener('error',e=>{
  if(e.target&&e.target!==window&&e.target.tagName!=='SCRIPT')return;
  if(e.target?.tagName==='SCRIPT'){
   record('腳本載入失敗：'+(e.target.src||'未知腳本'));return;
  }
  const source=e.filename?e.filename.split('/').pop():'主程式';
  const location=e.lineno?`:${e.lineno}:${e.colno||0}`:'';
  const message=e.error?.message||((e.message&&e.message!=='Script error.')?e.message:'未提供詳細錯誤');
  record(`${source}${location} — ${message}`);
 },true);
 window.addEventListener('unhandledrejection',e=>{
  const message=e.reason?.message||String(e.reason||'未知 Promise 錯誤');
  record('非同步執行失敗 — '+message);
 });
 window.TruckCabinStartup={begin,ready:succeed,fail,failureDetail:detail,isCancelled:()=>declined};
 document.getElementById('cabRetry3D').addEventListener('click',()=>location.reload());
 document.getElementById('cabUse2D').addEventListener('click',()=>{
  declined=true;clearTimeout(limit);clearReveal();panel().hidden=true;window.TruckCabinView?.stopFor2D?.();document.body.classList.remove('cabin3d-starting','cabin3d-failed','cabin3d-ready');
  card().hidden=true;document.getElementById('cabin-ui-root').hidden=true;
 });
})();
