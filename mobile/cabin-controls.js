(function(g){'use strict';let api,installed=false,press=null,targets=[],radarBase=null,radarBaseZ=null,radarSize='';function install(o){if(installed)return;installed=true;api=o;const {surface,wiper,b}=o;function start(e){if(press||b.snapshot().view!==0||document.querySelector('#cabModal.open,#truckMusicDialog.is-open')||window.TruckMobileMirror?.active())return;const button=e.currentTarget===wiper?o.wiperTarget(e):(o.pick(e)||extraTarget(b.point(e)));if(e.currentTarget===surface&&o.startShifterDrag(e)){press={id:e.pointerId,type:'gear',el:surface};surface.setPointerCapture(e.pointerId);e.preventDefault();return}if(button){press={id:e.pointerId,type:'button',button,el:e.currentTarget,x:e.clientX,y:e.clientY};}else if(e.currentTarget===surface&&o.lookAllowed()){const p=b.point(e);press={id:e.pointerId,type:'look',el:surface,x:p.x,value:b.snapshot().targetProbe}}else return;press.el.setPointerCapture(e.pointerId);e.preventDefault()}
surface.addEventListener('pointerdown',start);wiper.addEventListener('pointerdown',start);function finish(e,cancel=false){if(!press||e.pointerId!==press.id)return;const p=press;press=null;if(p.type==='gear'){o.finishShifterDrag(e,cancel);return}if(!cancel&&p.type==='button'&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<12){const s=b.snapshot();if(s.view===0&&(p.button.kind!=='radar'||s.difficultyMode===0))p.button.run()}}
window.addEventListener('pointermove',e=>{if(!press||press.id!==e.pointerId)return;if(press.type==='gear')o.moveShifterDrag(e);if(press.type==='look')b.setLook(o.cl(press.value+(b.point(e).x-press.x)*.28,-180,90))});window.addEventListener('pointerup',e=>finish(e));for(const t of ['pointercancel','lostpointercapture'])window.addEventListener(t,e=>finish(e,true));window.addEventListener('blur',()=>{if(press)finish({pointerId:press.id},true)});
}
// Scale only the live mobile equipment group, not canonical model/layout data.
function scaleMeshes(doorBank,radarGroup){
 if(doorBank&&!doorBank.userData.mobileScaled){doorBank.scale.multiplyScalar(TruckMobileConfig.controlScale);doorBank.userData.mobileScaled=true;doorBank.updateWorldMatrix(true,true)}
 if(radarGroup){radarBase=radarGroup.scale.clone();radarBaseZ=radarGroup.position.z;radarSize=''}
}
function fitRadar(group,bounds,w,h){
 if(!group||!radarBase||radarSize===`${w}:${h}`)return;
 group.scale.copy(radarBase);group.position.z=radarBaseZ-TruckMobileConfig.radarRecess;group.updateWorldMatrix(true,true);const r=bounds();if(!r||!Number.isFinite(r.w)||!Number.isFinite(r.h)||Math.min(r.w,r.h)<1)return;
 const factor=Math.min(TruckMobileConfig.radarMaxScale,Math.max(1,TruckMobileConfig.radarVisualTarget/Math.min(r.w,r.h)));group.scale.set(radarBase.x*factor,radarBase.y*factor,radarBase.z);group.position.z+=TruckMobileConfig.radarForward;group.updateWorldMatrix(true,true);radarSize=`${w}:${h}`;
}
// Invisible enlarged targets, evaluated only AFTER real mesh raycast / shifter ownership.
// No second HTML artwork and no additional listeners per control.
function anchors(s,items,gear){
 if(!api)return;const valid=r=>r&&[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.w>0&&r.h>0;
 targets=items.filter(i=>i.visible).map(i=>{const r=i.bounds();if(!valid(r))return null;const min=i.kind==='youtube'?TruckMobileConfig.youtubeTarget:TruckMobileConfig.touchTarget;
  const t={...i,...r,w:Math.max(min,r.w),h:Math.max(min,r.h)};
  // Transparent brake zone must not overlap the projected shifter knob.
  if(i.kind==='parking'&&valid(gear)&&TruckMobileLayout.overlap(t,gear)){const bottom=t.y+t.h/2,top=Math.max(t.y-t.h/2,gear.y+gear.h/2+2);if(bottom>top){t.y=(top+bottom)/2;t.h=bottom-top}else return null;}
  return t;
 }).filter(Boolean);
}
function extraTarget(p){let best=null,dist=Infinity;for(const t of targets){const dx=Math.abs(p.x-t.x),dy=Math.abs(p.y-t.y);if(dx>t.w/2||dy>t.h/2)continue;const d=(dx/t.w)**2+(dy/t.h)**2;if(d<dist){dist=d;best=t}}return best}
g.TruckMobileCabin={install,anchors,scaleMeshes,fitRadar,diagnostics:()=>({installed,controls:targets.length,visibleOverlays:0,radarSize})};})(window);
