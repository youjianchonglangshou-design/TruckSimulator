/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6SettingsCabin=api;})(globalThis,function(){'use strict';
function createSettingsSystemCabin(svc){
let nicoPreview=null,vehiclePreview=null;
function disposeNicoPreview(){nicoPreview?.dispose();nicoPreview=null;vehiclePreview?.dispose();vehiclePreview=null;}
function closeModal(){disposeNicoPreview();svc.action('mirrorEnd');svc.ui.modal.classList.remove('open','mirror-live-preview');svc.ui.modalBody.replaceChildren();if(!svc.scoped&&window.TruckCabinView)window.TruckCabinView.uiPaused=false;}
function optionSelect(parent,label,values,current,update){
 const wrap=svc.add(parent,'label',null,'','cab-field');svc.add(wrap,'span',null,label);
 const sel=svc.add(wrap,'select');for(const [value,title] of values){const op=new Option(title,value);sel.add(op)}sel.value=String(current);
 sel.addEventListener('change',()=>update(sel.value));window.TruckMobileModal?.adaptSelect(sel);return sel;
}
function renderSettings(d){
 const current=svc.b.snapshot(),Env=window.TruckEnvironment,Performance=window.TruckPerformance;
 const section=(title,key)=>{
  const f=svc.add(d,'section',null,'','cab-settings-section');f.dataset.section=key;
  const head=svc.add(f,'div',null,'','cab-tab-head');const label=svc.add(head,'div',null,title,'cab-tab-title');
  const tail=document.createElementNS('http://www.w3.org/2000/svg','svg');tail.setAttribute('class','cab-tab-outline');tail.setAttribute('viewBox','0 0 24 28');tail.setAttribute('preserveAspectRatio','none');tail.setAttribute('aria-hidden','true');
  const path=document.createElementNS(tail.namespaceURI,'path');path.setAttribute('d','M0 .5 H3 Q8 .5 11 10 L15 21 Q18 27.5 24 27.5');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1');path.setAttribute('vector-effect','non-scaling-stroke');tail.append(path);head.append(tail);svc.add(head,'span',null,'','cab-tab-line');
  return svc.add(f,'div',null,'','cab-tab-content');
 };
 if(svc.b.vehicles&&window.TruckVehicleSelection){const vehicles=section('選擇車輛','vehicle');TruckVehicleSelection.mount({parent:vehicles,registry:svc.b.vehicles,onChange:async id=>{if(id===svc.b.snapshot().vehicleId)return;const buttons=[...vehicles.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{if(await svc.action('vehicle',id)!==false)openModal('settings')}finally{buttons.forEach(b=>b.disabled=false)}}});}
 vehiclePreview=window.TruckVehicleSettingsPreview?.mount(d,current.vehicleId)||null;
 if(svc.mirrorCabin)svc.mirrorCabin.renderSettings(section,current);
 const soundQuality=section('音效與畫質','quality');const controls=svc.row(soundQuality);
 const sound=svc.btn(controls,current.muted?'開啟音效':'關閉音效',()=>{svc.action('sound');sound.textContent=svc.b.snapshot().muted?'開啟音效':'關閉音效'});
 svc.btn(controls,'全螢幕',()=>svc.action('fullscreen'));
 const perf=Performance?.kit?.state||{mode:'auto',tierId:'balanced'};
 const perfRow=svc.row(soundQuality);
 const choices=[['auto','AUTO 自動'],['ultra','極高'],['high','高'],['balanced','均衡'],['safe','省電'],['emergency','最低']];
 const perfButtons=[];
 for(const [id,title] of choices){const button=svc.btn(perfRow,title,()=>{
  svc.action('quality',{mode:id==='auto'?'auto':'manual',tier:id==='auto'?undefined:id});
  for(const e of perfButtons)e.classList.toggle('selected',e.dataset.quality===id)
 });button.dataset.quality=id;button.classList.toggle('selected',id===(perf.mode==='auto'?'auto':perf.tierId));perfButtons.push(button)}
 const liveQuality=svc.add(soundQuality,'small',null,'','cab-quality-status');
 const showQuality=()=>{const status=Performance?.qualityStatus?.();
  if(status)liveQuality.textContent=`目前：${status.modeText} (${status.tier}) · ${status.fpsText} · ${status.ratioText}`;};
 showQuality();
 for(const button of perfButtons)button.addEventListener('click',showQuality);
 const thresholdRow=svc.add(soundQuality,'label',null,'','cab-auto-fps-threshold');
 svc.add(thresholdRow,'span',null,'AUTO FPS 門檻');
 const thresholdInput=svc.add(thresholdRow,'input','cabAutoFpsThreshold');thresholdInput.type='range';thresholdInput.min='8';thresholdInput.max='30';thresholdInput.step='1';thresholdInput.value=String(Performance?.fpsThreshold??12);thresholdInput.setAttribute('aria-label','AUTO FPS 門檻');
 const thresholdValue=svc.add(thresholdRow,'output',null,thresholdInput.value+' FPS');thresholdValue.setAttribute('for','cabAutoFpsThreshold');
 thresholdRow.style.cssText='display:grid;grid-template-columns:auto minmax(0,1fr) 52px;gap:8px;align-items:center;padding:7px 9px;border:1px solid #385a65;border-radius:7px;min-width:0';
 thresholdInput.style.cssText='width:100%;max-width:100%;min-width:0;accent-color:#78e2d0;margin:0';thresholdValue.style.cssText='text-align:right;color:#b8f5eb;font-variant-numeric:tabular-nums;white-space:nowrap';
 thresholdInput.addEventListener('input',()=>{const v=Performance?.setFpsThreshold?.(thresholdInput.value)??Number(thresholdInput.value);thresholdValue.textContent=v+' FPS';showQuality()});
 svc.add(soundQuality,'small',null,'AUTO 自動尋找符合門檻的最高畫質；手動畫質不受限制。');
 const hudLabel=svc.add(soundQuality,'label',null,'','cab-quality-hud-option');
 const hudCheck=svc.add(hudLabel,'input','cabQualityHudToggle');hudCheck.type='checkbox';hudCheck.checked=!!Performance?.hudEnabled;
 svc.add(hudLabel,'span',null,'在車艙顯示即時畫質 / FPS');
 hudCheck.addEventListener('change',()=>Performance?.setHudEnabled?.(hudCheck.checked));
 const environment=section('時間與天氣（設定後不關閉卡片）','environment');
 const envHeading=environment.parentElement.querySelector('.cab-tab-title');envHeading.classList.add('cab-settings-env-legend');
 const envStatus=svc.add(envHeading,'span',null,'','cab-env-live-status');envStatus.setAttribute('aria-live','polite');
 const env=Env?.state?.settings||{mode:'manual',time:'day',weather:'sun',head:'auto'};
 const setting={...env};const environmentRegion=svc.add(environment,'div',null,'','cab-env-setting');
 // Each select applies directly, just like choosing a stage. The settings card
 // stays open, and the weather/time state continues to be owned by TruckEnvironment.
 const applyEnvironmentNow=()=>{
  svc.action('environmentApply',{...setting});
  const state=svc.b.snapshot().environment;
  if(state)envStatus.textContent='目前：'+({dawn:'清晨',day:'白天',dusk:'傍晚',night:'黑夜'}[state.time]||state.time)+'・'+({sun:'晴天',cloud:'陰天',rain:'下雨'}[state.weather]||state.weather);
 };
 const modeSelect=optionSelect(environmentRegion,'時間運行方式',[['manual','手動指定'],['random','每局隨機'],['taiwan','同步台灣時間 UTC+8']],env.mode,v=>{setting.mode=v;applyEnvironmentNow()});
 optionSelect(environmentRegion,'時間環境',[['dawn','清晨'],['day','白天'],['dusk','傍晚'],['night','黑夜']],env.time,v=>{setting.time=v;
  // Explicitly selecting a clock period overrides an automatic clock mode.
  if(setting.mode!=='manual'){setting.mode='manual';modeSelect.value='manual'}applyEnvironmentNow()});
 optionSelect(environmentRegion,'天氣環境',[['sun','晴天'],['cloud','陰天'],['rain','下雨'],['random','每局隨機']],env.weather,v=>{setting.weather=v;applyEnvironmentNow()});
 optionSelect(environmentRegion,'大燈模式',[['auto','AUTO 自動'],['on','ON 開啟'],['off','OFF 關閉']],env.head,v=>{setting.head=v;applyEnvironmentNow()});
 const currentEnvironment=svc.b.snapshot().environment;
 envStatus.textContent=currentEnvironment?'目前：'+({dawn:'清晨',day:'白天',dusk:'傍晚',night:'黑夜'}[currentEnvironment.time]||currentEnvironment.time)+'・'+({sun:'晴天',cloud:'陰天',rain:'下雨'}[currentEnvironment.weather]||currentEnvironment.weather):'';
 const nico=window.NicoGuide;
 const nicoSection=section('NICO 引導員環境設定','nico');
 if(nico&&window.TruckNicoPreview)nicoPreview=window.TruckNicoPreview.mount(nicoSection,nico);
 const paintSection=section('RC15 車身與內裝配色','paint');svc.add(paintSection,'p',null,'使用原 RC15 的配色控制與儲存，不會重畫車殼。');
 const colors=svc.row(paintSection);const paintLabel=svc.add(colors,'label',null,'','cab-paint-input');svc.add(paintLabel,'span',null,'主色');
 const paintInput=svc.add(paintLabel,'input');paintInput.type='color';paintInput.value=svc.paint.get().shell;
 paintInput.addEventListener('input',()=>svc.paint.set('shell',paintInput.value));
 for(const c of ['#4c5667','#f3f4f6','#253b55','#c74440','#dca33d','#23877b','#32373f']){const e=svc.btn(colors,'',()=>{svc.paint.set('shell',c);paintInput.value=c});e.style.background=c;e.style.flex='0 0 29px';e.title=c;e.setAttribute('aria-label','選擇配色 '+c)}
 const paintTools=svc.row(paintSection);svc.btn(paintTools,'儲存配色',()=>{svc.paint.save();paintNote.textContent='配色已儲存'});
 svc.btn(paintTools,'恢復預設',()=>{svc.paint.reset();paintInput.value=svc.paint.get().shell;paintNote.textContent='已恢復預設色'});
 const paintNote=svc.add(paintSection,'small',null,'');
}
function openModal(name){window.TruckMobileTouch?.release();
 if(document.querySelector('#truckMusicDialog')?.open||(window.TruckMobileModal&&document.querySelector('#truckMusicDialog.is-open')))return;
 if(name!=='settings')svc.action('mirrorEnd');
 svc.ui.interactionTuner?.setOpen(false);
 disposeNicoPreview();svc.ui.modalBody.replaceChildren();svc.ui.modal.classList.add('open');svc.ui.modal.classList.toggle('mirror-live-preview',name==='settings');if(!svc.scoped&&window.TruckCabinView)window.TruckCabinView.uiPaused=true;svc.b.releaseKeys();
 if(!svc.scoped)window.TruckMobileModal?.prepare(name,svc.ui.modal);
 const d=svc.ui.modalBody,s=svc.b.snapshot();
 const titles={levels:'選擇關卡',mode:'駕駛模式與教練示範',settings:'車艙與遊戲設定',help:'遊戲操作導引',mirror:'四面後照鏡精細調整',paint:'車艙顏色'};
 svc.ui.modalTitle.textContent=titles[name]||'設定';
 if(name==='levels'){
  const levels=svc.b.levels(),groups=['基本訓練','實景考題'];
  const current=levels.find(l=>+l.id===+s.level);const area=svc.add(d,'div',null,'','cab-stage-groups');
  
  for(const name of groups){
   const items=levels.filter(l=>l.group===name);if(!items.length)continue;
   const section=svc.add(area,'details',null,'','cab-stage-group');section.open=name===current?.group;
   const summary=svc.add(section,'summary');summary.textContent=name;
   const count=svc.add(summary,'span',null,`${items.length} 關`,'cab-stage-count');
   const entries=svc.add(section,'div',null,'','cab-stage-entries');
   if(name==='實景考題'&&items.every(l=>l.mission)&&globalThis.TruckMissionUI){TruckMissionUI.mount({svc,entries,items,current,close:closeModal});continue;}
   for(const level of items){
    const entry=svc.btn(entries,level.name,()=>{if(+level.id!==+svc.b.snapshot().level)svc.action('level',level.id);closeModal()});
    entry.classList.add('cab-stage-entry');entry.dataset.level=String(level.id);
    if(+level.id===+s.level){entry.classList.add('selected');entry.setAttribute('aria-current','true')}
   }
  }
 }else if(name==='mode'){
  svc.sub(d,'駕駛難度（選擇後即生效）');const rr=svc.row(d);
  for(const [id,label] of [[0,'一般模式'],[1,'老師傅模式'],[2,'地獄模式']]){const p=svc.btn(rr,label,()=>{svc.action('mode',id);closeModal()});if(s.difficultyMode===id)p.classList.add('selected')}
  svc.sub(d,'教練示範（不是難度模式）');const coachControls=svc.row(d);coachControls.style.flexWrap='nowrap';
  const coachStart=svc.btn(coachControls,'開始示範',()=>{svc.action('coach');if(svc.b.snapshot().coach)svc.action('coachSpeed',speed.value);closeModal()});
  coachStart.style.flex='1 1 0';const label=svc.add(coachControls,'label',null,'示範速度');label.style.cssText='flex:1 1 0;min-width:0;white-space:nowrap';const speed=svc.add(label,'select');speed.style.maxWidth='none';
  for(const v of ['0.5','1','2','4']){const o=new Option(v+'×',v);speed.add(o)}speed.value=String(s.coachSpeed||1);window.TruckMobileModal?.adaptSelect(speed);speed.addEventListener('change',()=>{if(svc.b.snapshot().coach)svc.action('coachSpeed',speed.value)});
 }else if(name==='settings'){
  renderSettings(d);
 }else if(name==='help'){
  const touch=!!window.TruckMobileHelp;
  const quick=svc.add(d,'div',null,'','cab-help-hero');
  const quickTitle=svc.add(quick,'div',null,'新手快速上手','cab-help-hero-title');
  const quickDesc=svc.add(quick,'div',null,'先看圖、再上路。依序完成排檔 → 觀察 → 操作 → 入位。','cab-help-hero-desc');
  const steps=svc.add(quick,'div',null,'','cab-help-steps');
  [['①','選 D / R 檔'],['②','看左右探頭與後照鏡'],['③',window.TruckMobileHelp?.steerText||'用方向鍵慢慢修正'],['④','把貨櫃倒入目標框']].forEach(([num,text])=>{const item=svc.add(steps,'div',null,'','cab-help-step');svc.add(item,'span',null,num,'cab-help-step-no');svc.add(item,'span',null,text,'cab-help-step-text');});
  const grid=svc.add(d,'div',null,'','cab-help-grid');
  const cards=window.TruckMobileHelp?.cards||[
   {icon:'↕',title:'行駛',lead:'油門、煞車、轉向',rows:[['↑','油門'],['↓ / Space','煞車'],['← / →','轉向'],['Shift + ↑','微速']],note:'倒車時建議先用微速，方向修正更穩。'},
   {icon:'DNR',title:'排檔',lead:'先入檔，再動車',rows:[['Q','前進 D'],['A','空檔 N'],['Z','倒車 R'],['B','手煞車']],note:'倒車入庫前，通常先切 R。'},
   {icon:'👀',title:'觀察',lead:'用探頭確認角度',rows:[['1','左探頭 180°'],['2','回正'],['3','右看 90°'],['滑桿','自由調角度']],note:'上方滑桿與滑鼠拖曳都能轉頭。'},
   {icon:'🪞',title:'下車與後照鏡',lead:'停車後可精修鏡面',rows:[['4','上車 / 下車'],['拖曳','直接調鏡'],['M','精細調整'],['重設','個別 / 四鏡重設']],note:'需要時先停車，再調整四面後照鏡。'},
   {icon:'🧭',title:'輔助與關卡',lead:'找功能按鈕',rows:[['雷達','下方圓形按鈕'],['選關','車門中鍵'],['模式','方向盤右下'],['重來','儀表旁紅色按鈕']],note:'遇到不熟的路線，可先開雷達輔助。'},
   {icon:'🔊',title:'聲光與天氣',lead:'喇叭、燈光、雨刷',rows:[['喇叭','方向盤中間'],['車燈','左上'],['遠光','左下'],['雨刷','右上；A 柱看天氣']],note:'右 A 柱會顯示目前時間與天氣狀態。'}
  ];
  cards.forEach(card=>{const item=svc.add(grid,'section',null,'','cab-help-card');const head=svc.add(item,'div',null,'','cab-help-card-head');svc.add(head,'div',null,card.icon,'cab-help-icon');const titleWrap=svc.add(head,'div',null,'','cab-help-card-titlewrap');svc.add(titleWrap,'h4',null,card.title,'cab-help-card-title');svc.add(titleWrap,'p',null,card.lead,'cab-help-card-lead');const list=svc.add(item,'div',null,'','cab-help-badges');card.rows.forEach(([key,text])=>{const row=svc.add(list,'div',null,'','cab-help-badge');svc.add(row,'span',null,key,'cab-help-kbd');svc.add(row,'span',null,text,'cab-help-badge-text');});svc.add(item,'p',null,card.note,'cab-help-note');});
 }
}
return Object.freeze({closeModal,optionSelect,renderSettings,openModal});
}
return Object.freeze({createSettingsSystemCabin});
});
