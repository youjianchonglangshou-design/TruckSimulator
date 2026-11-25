(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckMirrorCabin=api;})(globalThis,function(){'use strict';
function createMirrorCabin({T,mounts,b,position,add,btn,action,makeButton,dragHints,normalizeMirrorUV}){
 let mirrorTextures=new Map(),mirrorGeneration=null,buttons={},controller=null,stops=[];
 // CanvasTexture storage is size-dependent. A resize of the SAME canvas is not
 // a fresh GPU allocation: replace/dispose the old texture when dimensions change.
 function createTexture(canvas){
  const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;tx.minFilter=T.LinearFilter;
  tx.magFilter=T.LinearFilter;tx.generateMipmaps=false;return tx;
 }
 function publish(m,canvas){
  if(m.width!==canvas.width||m.height!==canvas.height){
   const old=m.texture;m.texture=createTexture(canvas);m.width=canvas.width;m.height=canvas.height;
   m.face.material.map=m.texture;m.face.material.needsUpdate=true;old.dispose?.();
  }else{m.texture.image=canvas;}
  m.texture.needsUpdate=true;
 }
 function mount(){if(mirrorTextures.size)return;
 for(const [id,face] of mounts.mirrorFaces){
  const c=document.createElement('canvas');c.width=id.endsWith('upper')?260:200;c.height=id.endsWith('upper')?350:205;
  const tx=createTexture(c);
  // Map the original old-game camera over the WHOLE rounded glass opening.
  const original={geometry:face.geometry,map:face.material.map,color:face.material.color.clone()};
  face.geometry=normalizeMirrorUV(face.geometry.clone());
  face.material.map=tx;face.material.color.set('#ffffff');face.material.needsUpdate=true;
  mirrorTextures.set(id,{texture:tx,blank:c,revision:-1,face,original,width:c.width,height:c.height});
 }
 }
 function mountControls(host){if(controller)return;controller=new AbortController();const {signal}=controller;
 const make=(id,title,fn)=>makeButton(host,id,title,fn);
 for(const id of mounts.mirrorFaces.keys()){
  const bt=make('cabMirror'+id,id.replace(/mirror-|-/g,' '),()=>{});
  bt.textContent='';bt.classList.add('cab-mirror-hit');bt.title='拖曳調整 '+id;
  dragHints?.attach(bt,id);
  if(window.TruckMobileMirror){stops.push(window.TruckMobileMirror.bind(bt,id,{...b,action},".cab-mirror-grip",signal));buttons[id]=bt;continue;}
  let drag=null; stops.push(()=>{if(drag)action('mirrorEnd');drag=null});
  bt.addEventListener('pointerdown',e=>{
   const snap=b.snapshot();if(snap.view!==0||Math.abs(snap.probe)>.5||Math.abs(snap.speed)>.18||snap.difficultyMode===2||snap.coach){return}
   const k=id.split('-')[1]+(id.endsWith('lower')?'Wide':'');
   const source=snap.settings[k];if(!source||!action('mirrorBegin'))return;
   const pt=b.point(e);drag={id:e.pointerId,x:pt.x,y:pt.y,yaw:source.yaw,pitch:source.pitch,k,side:id.includes('left')?-1:1};
   e.preventDefault();bt.setPointerCapture(e.pointerId);
  },{signal});
  bt.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;
   const pt=b.point(e);b.action('mirrorSet',{id:drag.k,yaw:drag.yaw+drag.side*(pt.x-drag.x)*.22,pitch:drag.pitch-(pt.y-drag.y)*.22});
   // Use the working game camera feed: publish its newly adjusted canvas even
   // when the 3D interface has paused the physics tick.
   b.action('mirrorRefresh');
  },{signal});
  const stop=()=>{if(drag)action('mirrorEnd');drag=null};for(const n of ['pointerup','pointercancel','lostpointercapture'])bt.addEventListener(n,stop,{signal});
  buttons[id]=bt;
 }
 }
 function renderSettings(section,current){
 const mirrors=section('四面後照鏡精細調整（直接在此頁操作）','mirrors');
 add(mirrors,'p',null,'依原規則須停車、回正並使用空檔；開始調整會自動拉起手煞車。');
 const mirrorRegion=add(mirrors,'div',null,'','cab-mirror-setting');
 const mirrorKeys=[['left','左上後照鏡'],['right','右上後照鏡'],['leftWide','左下廣角鏡'],['rightWide','右下廣角鏡']];
 let started=false;
 for(const [key,title] of mirrorKeys){
  const group=add(mirrorRegion,'section');add(group,'b',null,title);
  for(const [field,label,min,max] of [['yaw','左右角度',-28,28],['pitch','上下角度',-22,32]]){
   const wrap=add(group,'label',null,'','cab-setting-range');add(wrap,'span',null,label);
   const slider=add(wrap,'input');slider.type='range';slider.min=String(min);slider.max=String(max);slider.step='1';slider.value=current.settings[key]?.[field]??0;
   const val=add(wrap,'output',null,slider.value+'°');slider.addEventListener('input',()=>{
    if(!started){if(!action('mirrorBegin')){slider.value=String(b.snapshot().settings[key]?.[field]??0);return}started=true}
    const setting=b.snapshot().settings[key]||{yaw:0,pitch:0};action('mirrorSet',{id:key,yaw:field==='yaw'?+slider.value:setting.yaw,pitch:field==='pitch'?+slider.value:setting.pitch});action('mirrorRefresh');
    val.textContent=String(slider.value)+'°';
   });
  }
  btn(group,'此鏡重設',()=>{if(!started){if(!action('mirrorBegin'))return;started=true}action('mirrorReset',key);for(const slider of group.querySelectorAll('input[type=range]')){slider.value='0';slider.nextElementSibling.textContent='0°'}});
 }
 btn(mirrors,'四面後照鏡全部重設',()=>{if(!started){if(!action('mirrorBegin'))return;started=true}action('mirrorReset');for(const slider of mirrorRegion.querySelectorAll('input[type=range]')){slider.value='0';slider.nextElementSibling.textContent='0°'}});
 }
function mirrors(s){
 // Keep the approved RC15 glass and mirror camera placement unchanged.
 // As in the user-supplied WORKING mirror version, consume the original game's
 // actual four camera canvases and revisions. Do not require the newer optional
 // mirrorFeed() wrapper to succeed before displaying a freshly adjusted pane.
 const generation=`${s.level}|${s.sceneRevision}`;
 if(generation!==mirrorGeneration){
  mirrorGeneration=generation;
  for(const m of mirrorTextures.values()){
   m.revision=-1;publish(m,m.blank);
  }
 }
 if(s.difficultyMode===2||s.view!==0)return;
 for(const [id,m] of mirrorTextures){
  let cv=b.mirrorImage?.(id)||null;
  let rev=cv?(b.mirrorRevision?.(id)??-1):-1;
  // Compatibility with prior RC22's scene-labelled source. The game-side
  // mirrorImage()/mirrorRevision() already enforce current stage/generation.
  if(!cv||rev<0){
   const feed=b.mirrorFeed?.(id);
   if(!feed||feed.stage!==s.level||feed.sceneRevision!==s.sceneRevision)continue;
   cv=feed.canvas;rev=feed.frame;
  }
  if(!cv||rev<0||rev===m.revision)continue;
  publish(m,cv);m.revision=rev;
 }
}
 function updateAnchors(s){const active=s.view===0;
  // Each mirrored pane has an independent material held by the RC15 Map.
 for(const [id,el] of Object.entries(buttons))position(el,s.difficultyMode!==2&&active&&Math.abs(s.probe)<1?mounts.mirrorFaces.get(id):null);
 }
 function updateVisibility(s){
 // RC31: hide the entire four-mirror assemblies and their support arms in Hell mode.
 const showMirrors=s.difficultyMode!==2;
 for(const id of mounts.mirrorFaces.keys())mounts.parts.get(id).group.visible=showMirrors;
 for(const group of mounts.bracketGroups.values())group.visible=showMirrors;
 }
 function restoreContext(){for(const m of mirrorTextures.values()){m.revision=-1;m.texture.needsUpdate=true;}}
 function unmount(){for(const stop of stops)stop();stops=[];controller?.abort();controller=null;for(const bt of Object.values(buttons))bt.remove();buttons={};
 for(const m of mirrorTextures.values()){m.face.geometry.dispose();m.face.geometry=m.original.geometry;m.face.material.map=m.original.map;m.face.material.color.copy(m.original.color);m.face.material.needsUpdate=true;m.texture.dispose();}mirrorTextures.clear();mirrorGeneration=null;}
 return Object.freeze({mount,mountControls,renderSettings,update:mirrors,updateAnchors,updateVisibility,restoreContext,unmount,dispose:unmount,diagnostics:()=>({textures:mirrorTextures.size,controls:Object.keys(buttons).length,generation:mirrorGeneration})});
}

return Object.freeze({createMirrorCabin});
});
