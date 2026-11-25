/* TruckSimulator v5.2.0 — GamePerformanceKit v1.0.0 bridge.
 * Presentation only. Physics/collision ticks, scenarios and controls are unchanged.
 */
(function(root){
 'use strict';
 const fpsThresholdKey='truck-simulator-v5:auto-fps-threshold';
 let fpsThreshold=12;
 try{const saved=root.localStorage?.getItem(fpsThresholdKey);if(saved!=null&&saved.trim()!==''&&Number.isFinite(Number(saved)))fpsThreshold=Math.max(8,Math.min(30,Math.round(Number(saved))));}catch(_){}
 const kit = root.GamePerformanceKit?.create({ namespace:'truck-simulator-v5', targetFps:30, fpsThreshold, mobileHint:root.MobileLandscape?.mobile });
 function setFpsThreshold(value){
  if(value===null||value===''||!Number.isFinite(Number(value)))return fpsThreshold;
  fpsThreshold=Math.max(8,Math.min(30,Math.round(Number(value))));
  kit?.setFpsThreshold(fpsThreshold);
  try{root.localStorage?.setItem(fpsThresholdKey,String(fpsThreshold));}catch(_){}
  refreshUI();return fpsThreshold;
 }
 const looks={
  ultra:{mirrorStride:1,mirrorScale:1.75,facadeSpan:2.4,skyDetails:true,rainScale:1,radarInterval:80},
  high:{mirrorStride:1,mirrorScale:1.35,facadeSpan:3.4,skyDetails:true,rainScale:1,radarInterval:80},
  balanced:{mirrorStride:2,mirrorScale:1.22,facadeSpan:5.8,skyDetails:true,rainScale:.8,radarInterval:100},
  safe:{mirrorStride:3,mirrorScale:1.2,facadeSpan:11,skyDetails:false,rainScale:.55,radarInterval:140},
  emergency:{mirrorStride:4,mirrorScale:1.18,facadeSpan:20,skyDetails:false,rainScale:.32,radarInterval:190}
 };
 const labels={auto:'自動',ultra:'極高',high:'高',balanced:'均衡',safe:'省電',emergency:'最低'};
 let resizeFn=null,ui=null,frameNow=0,revision=0,inputPause=null;
 // RC21: opt-in read-only cockpit telemetry; no new render loop or quality changes.
 // DEV.9: start the new opt-in preference off once, without touching any other settings.
 const hudStorageKey='truck-simulator-v5:show-quality-hud:v2';
 let hudEnabled=false,cabinHud=null,cabinHudActive=true;
 try{hudEnabled=root.localStorage?.getItem(hudStorageKey)==='1';}catch(_){}
 function qualityStatus(){
  const state=kit?.state,mode=state?.mode||'auto',tier=state?.tierId||'balanced';
  const fps=Math.round(kit?.fps||0),ratio=Number(root.TruckCabinView?.getQualityDiagnostics?.().webglPixelRatio||1).toFixed(2);
  return {mode,tier,modeText:(mode==='auto'?'AUTO 自動':'手動')+' · '+(labels[tier]||tier),fpsText:'2D '+(fps>0?fps:'—')+' FPS',ratioText:'WebGL '+ratio+'×（固定）'};
 }
 function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
 function refreshCabinHud(){
  if(!cabinHud)return;
  const {element,mode,fps,ratio}=cabinHud;
  element.hidden=!hudEnabled||!cabinHudActive;
  if(element.hidden)return;
  const status=qualityStatus();
  setText(mode,status.modeText+' ('+status.tier+')');
  setText(fps,status.fpsText+' · ');
  setText(ratio,status.ratioText);
 }
 function setHudEnabled(enabled){
  hudEnabled=!!enabled;
  try{root.localStorage?.setItem(hudStorageKey,hudEnabled?'1':'0');}catch(_){}
  refreshCabinHud();
 }
 function mountCabinHud(host){
  if(cabinHud||!host)return;
  const doc=host.ownerDocument,element=doc.createElement('div');
  element.id='cabQualityHud';element.hidden=true;element.setAttribute('aria-label','即時畫質與街景 FPS');
  const mode=doc.createElement('span'),line=doc.createElement('span'),fps=doc.createElement('span'),ratio=doc.createElement('span');
  mode.className='cab-quality-mode';line.className='cab-quality-fps';line.append(fps,ratio);element.append(mode,line);host.append(element);
  cabinHud={element,mode,fps,ratio};
  // Use logical layout coordinates so rotated mobile mode does not misplace it.
  const layout=()=>{
   const nav=doc.getElementById('cabProbeNav');
   if(!nav||!host.clientWidth)return;
   const navRight=nav.offsetLeft+nav.offsetWidth/2,navLeft=nav.offsetLeft-nav.offsetWidth/2;
   // Preserve the original FPS HUD position using the former tuner footprint.
   const anchor=host.clientWidth-Math.min(145,Math.max(12,host.clientWidth*.07))-68;
   const available=anchor-navRight-16,compactLeft=available<120;
   const width=Math.min(190,compactLeft?Math.max(80,navLeft-16):available);
   element.style.width=width+'px';
   element.style.right=(compactLeft?host.clientWidth-navLeft+8:host.clientWidth-anchor+8)+'px';
   element.style.top=(host.clientWidth>=1000?16:Math.min(16,Math.max(4,nav.offsetTop)))+'px';
  };
  if(root.ResizeObserver){const observer=new root.ResizeObserver(layout);observer.observe(host);const nav=doc.getElementById('cabProbeNav');if(nav)observer.observe(nav);}
  root.addEventListener?.('resize',layout);layout();refreshCabinHud();
 }
 function setCabinHudActive(active){if(cabinHudActive===!!active)return;cabinHudActive=!!active;refreshCabinHud();}
 let visuals={...looks[kit?.state.tierId || 'balanced']};
 function applyState(state){
  visuals={...looks[state.tierId]}; revision++;
  // All quality modifications are visual; never touch driving simulation state.
  if(resizeFn)kit.commitPendingResize({allowDuringPlay:true});
  refreshUI();
 }
 kit?.subscribe(applyState);
 function resolution(w,h){
  // Fixed RC19 ultra resolution budget per device, independent of scenery tier.
  const budget=(kit?.state?.mobile||root.MobileLandscape?.mobile)?3000000:7600000;
  const d=Math.max(.5,Math.min(1.75,root.devicePixelRatio||1,Math.sqrt(budget/(Math.max(1,w)*Math.max(1,h)))));
  return {renderDpr:d,pixelWidth:Math.max(1,Math.round(w*d)),pixelHeight:Math.max(1,Math.round(h*d))};
 }
 function onRender(t,playing){
  kit?.frame(t,{isPlaying:!!playing});
  if(t-frameNow>470){frameNow=t;refreshUI();}
 }
 function setMode(mode,tier){
  if(!kit)return;
  if(mode==='auto')kit.setMode('auto');else kit.setMode('manual',tier);
  refreshUI();
 }
 function refreshUI(){
  refreshCabinHud();
  if(!ui)return;
  const state=kit?.state, fps=Math.round(kit?.fps||0);
  const mode=state?.mode||'auto',tier=state?.tierId||'balanced';
  ui.button.textContent='畫質 '+(mode==='auto'?'AUTO':labels[tier]);
  ui.button.title='效能工具包｜'+labels[tier]+'｜FPS '+fps;
  ui.current.textContent=(mode==='auto'?'自動 · ':'手動 · ')+labels[tier];
  ui.fps.textContent=fps?fps+' FPS':'FPS 偵測中';
  ui.dpr.textContent='渲染倍率 '+(root.__truckRenderDpr||1).toFixed(2)+'×';
  ui.revision.textContent='RC21 · 街景材質與裝飾降階，解析度固定';
  ui.threshold.value=String(fpsThreshold);ui.thresholdValue.textContent=fpsThreshold+' FPS';
  for(const b of ui.options){const chosen=b.dataset.quality=== (mode==='auto'?'auto':tier);b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));}
 }
 function mount(){
  if(ui||!root.document?.body)return;
  const doc=root.document, top=doc.querySelector('.top'), existing=doc.getElementById('full');
  if(!top)return;
  const button=doc.createElement('button');button.type='button';button.id='performanceSetup';button.className='toggle';button.textContent='畫質 AUTO';button.setAttribute('aria-expanded','false');button.title='遊戲效能調整';
  top.insertBefore(button,existing||null);
  const sheet=doc.createElement('style');sheet.textContent=`
   #performanceSetup{white-space:nowrap;flex-shrink:0}
   #performanceOverlay[hidden]{display:none!important}
   #performanceOverlay{position:absolute;inset:0;display:grid;place-items:center;z-index:110;background:rgba(4,12,18,.72);font:13px system-ui,-apple-system,sans-serif;color:#e2f4f0;pointer-events:auto}
   #performanceCard{box-sizing:border-box;width:min(440px,calc(100% - 22px));max-height:calc(100% - 16px);overflow-y:auto;padding:16px;border-radius:13px;background:#142731;border:1px solid #4a7c81;box-shadow:0 15px 50px #0009}
   #performanceCard header{display:flex;align-items:center;justify-content:space-between;gap:10px}
   #performanceCard h2{margin:0;font-size:17px;color:#ecfff9}
   #performanceCard p{margin:10px 0;color:#bfd6d5;line-height:1.5}
   #performanceCard .perf-current{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0;padding:9px 10px;background:#0b1e27;border-radius:8px}
   #performanceCard .perf-current span{white-space:nowrap}
   #performanceCard .perf-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
   #performanceCard button{border:1px solid #54747c;border-radius:7px;background:#263c45;color:#dff5ef;padding:10px 5px;cursor:pointer;min-height:35px;font:inherit}
   #performanceCard button.selected{background:#1d6f61;border-color:#81efc5;color:#fff}
   #performanceCard #performanceClose{min-width:52px;padding:5px 10px}
   #performanceCard .perf-threshold{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;margin:10px 0;font-size:12px}
   #performanceCard .perf-threshold input{min-width:0;width:100%;accent-color:#67e3db}
   #performanceCard .perf-note{font-size:11px;line-height:1.5;opacity:.85}
   @media(max-height:480px){#performanceCard{padding:9px 12px}#performanceCard p{margin:6px 0}#performanceCard .perf-current{margin:6px 0;padding:5px}#performanceCard .perf-options button{padding:6px 4px}}
  `;doc.head.appendChild(sheet);
  const overlay=doc.createElement('div');overlay.id='performanceOverlay';overlay.hidden=true;
  overlay.innerHTML=`<section id="performanceCard" role="dialog" aria-modal="true" aria-label="遊戲畫質設定"><header><h2>遊戲效能 · 畫質設定</h2><button id="performanceClose" type="button">關閉</button></header><div class="perf-current"><span id="performanceCurrent"></span><span id="performanceFps"></span><span id="performanceDpr"></span></div><div class="perf-options"><button type="button" data-quality="auto">AUTO 自動</button><button type="button" data-quality="ultra">極高</button><button type="button" data-quality="high">高</button><button type="button" data-quality="balanced">均衡</button><button type="button" data-quality="safe">省電</button><button type="button" data-quality="emergency">最低</button></div><label class="perf-threshold">AUTO FPS 門檻<input id="performanceThreshold" type="range" min="8" max="30" step="1" value="12" aria-label="AUTO FPS 門檻"><output id="performanceThresholdValue">12 FPS</output></label><p>AUTO 尋找能維持門檻的最高畫質。手動選擇鎖定等級；不影響物理、車速及碰撞。</p><div class="perf-note" id="performanceRevision"></div></section>`;
  doc.body.appendChild(overlay);
  ui={button,overlay,current:doc.getElementById('performanceCurrent'),fps:doc.getElementById('performanceFps'),dpr:doc.getElementById('performanceDpr'),revision:doc.getElementById('performanceRevision'),threshold:doc.getElementById('performanceThreshold'),thresholdValue:doc.getElementById('performanceThresholdValue'),options:[...overlay.querySelectorAll('[data-quality]')]};
  function close(){overlay.hidden=true;button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});}
  button.addEventListener('click',()=>{inputPause?.();overlay.hidden=false;button.setAttribute('aria-expanded','true');refreshUI();});
  doc.getElementById('performanceClose').addEventListener('click',close);
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)close();});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
  ui.threshold.addEventListener('input',()=>setFpsThreshold(ui.threshold.value));
  for(const b of ui.options)b.addEventListener('click',()=>setMode(b.dataset.quality==='auto'?'auto':'manual',b.dataset.quality));
  refreshUI();
 }
 // Do not install the generic Canvas2D adapter: this game's custom canvas and
 // forced-landscape coordinate system already own resize and ctx.setTransform().
 root.TruckPerformance=Object.freeze({kit,resolution,onRender,mount,setMode,setFpsThreshold,get fpsThreshold(){return fpsThreshold;},get visuals(){return visuals;},get revision(){return revision;},get isOpen(){return !!ui&&!ui.overlay.hidden;},attachResize(fn){resizeFn=fn;kit?.setResizeHandler(fn);kit?.commitPendingResize({isPlaying:false});},bindPause(fn){inputPause=fn;},refreshUI,qualityStatus,mountCabinHud,setCabinHudActive,setHudEnabled,get hudEnabled(){return hudEnabled;}});
})(globalThis);
