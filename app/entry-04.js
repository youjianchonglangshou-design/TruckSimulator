/* RC12: deterministic local scripts + one retry of any missing local module.
   Real game physics and the approved RC15 cabin/camera are untouched. */
(function(){
 const required=[
  ['TruckCabinUserLayout','cabin/user-layout.js'],
  ['TruckCabinMountsLayout','cabin/mounts-layout.js'],
  ['TruckCabinPaintLayout','cabin/paint-layout.js'],
  ['TruckCabinRebuild','cabin/model.js'],
  ['TruckCabinMounts','cabin/mounts.js'],
  ['TruckCabinPaint','cabin/paint.js'],
  ['TruckBrakeAdjustment','cabin/brake-adjustment.js'],
  ['TruckDisplayCalibration','cabin/display-calibration.js'],
  ['TruckInteractionCalibration','cabin/interaction-calibration.js']
 ];
 const sources=[
  'cabin/vendor/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.152.2/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js',
  'https://unpkg.com/three@0.152.2/build/three.min.js'
 ];
 function load(src,timeoutMs){return new Promise((resolve,reject)=>{
  const tag=document.createElement('script');tag.src=src;tag.async=false;
  let settled=false;
  const settle=error=>{if(settled)return;settled=true;clearTimeout(timer);
   tag.onload=tag.onerror=null;
   if(error){tag.remove();reject(error)}else resolve()};
  const timer=setTimeout(()=>settle(Error('逾時：'+src)),timeoutMs);
  tag.onload=()=>settle(null);tag.onerror=()=>settle(Error('無法載入：'+src));
  document.body.append(tag);
 });}
 async function verifyLocal(){
  if(!window.TruckCabinBridge){
   const absent=[];
   if(!window.Physics)absent.push('Physics');
   if(!window.TruckPerformance)absent.push('TruckPerformance');
   if(!window.TruckRealScenes)absent.push('TruckRealScenes');
   const fault=window.TruckCabinStartup?.failureDetail?.()||'';
   const phase=window.__truckCoreStarted?'主程式執行期間中斷':'主程式尚未執行';
   throw Error('主遊戲初始化失敗（TruckCabinBridge 未建立） — '+phase+
    (absent.length?'；缺少 '+absent.join(', '):'')+(fault?'；實際錯誤：'+fault:''));
  }
  const missing=[];
  for(const [symbol,path] of required){
   if(window[symbol])continue;
   // One explicit retry: file:// Chrome can fail a deferred child script without
   // a useful stack trace. A failed retry reports its exact file and global.
   try{await load(path+'?v=5.5.12-rc23-retry',3500)}catch(e){console.warn('RC12 local retry',path,e)}
   if(!window[symbol])missing.push(path+' → '+symbol);
  }
  if(missing.length)throw Error('本機車艙模組未載入：'+missing.join('；'));
 }
 document.getElementById('cabUse2D').addEventListener('click',()=>window.TruckVehicleFallbackLevels.install());
 async function start(){try{
  // Mobile launch must precede the first-frame watchdog and GPU initialization.
  await MobileLandscape.whenStarted();
  if(window.TruckCabinStartup?.isCancelled?.())return;
  window.TruckCabinStartup?.begin(MobileLandscape.mobile?45000:19000);
  await verifyLocal();
  if(!window.THREE?.WebGLRenderer){
   for(const src of sources){
    if(window.TruckCabinStartup?.isCancelled?.())return;
    try{await load(src,4800);if(window.THREE?.WebGLRenderer)break}
    catch(e){console.warn('RC12 Three.js fallback',e.message)}
   }
  }
  if(window.TruckCabinStartup?.isCancelled?.())return;
  if(!window.THREE?.WebGLRenderer)throw Error('本機 Three.js 與 CDN 均無法載入；請確認 Chrome 能連線 cdnjs/jsdelivr/unpkg，或改用原本的本機 BAT 伺服器');
  // RC29: evaluate the packaged Three.js integration after THREE is available.
  // The original file is still shipped for maintenance; file:// does not need to fetch it.
  const source=document.getElementById('truck-cabin-integration-source')?.textContent;
  if(!source)throw Error('內嵌 3D 車艙橋接程式遺失');
  const cabinScript=document.createElement('script');
  cabinScript.textContent=source+'\n//# sourceURL=cabin/integration-inline.js';
  document.body.appendChild(cabinScript);
  if(!window.TruckCabinView)throw Error('3D 車艙初始化未完成：'+(window.TruckCabinStartup?.failureDetail?.()||'請查看控制台'));
  // The integration reports readiness only after the first WebGL frame.
 }catch(e){console.error('RC12 3D startup failed',e);window.TruckCabinStartup?.fail(e)}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
