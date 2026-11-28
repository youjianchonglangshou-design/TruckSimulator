/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6TransmissionCabin=api;})(globalThis,function(){'use strict';
function createTransmissionSystemCabin(svc){
const dragLocal=n=>svc.dragLocal?svc.dragLocal(n):svc.local(n);
let shifterDrag=null,previousGear=null,previousTouch=null,knobCanvas=null,knobTexture=null;
function ownsPointer(id){return shifterDrag?.id===id;}
function isDragging(){return !!shifterDrag;}
function cancelDrag(){shifterDrag=null;}
function pickShifterKnob(e){
 if(!document.body.classList.contains('cabin3d-ready')||!(svc.dragRoot||svc.mounts?.root)?.visible||(svc.ui.modal?.classList.contains('open'))||svc.b.snapshot().view!==0)return null;
 const rect=svc.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;
 if(document.body.classList.contains('mobile-rotated')){const p=svc.b.point(e);svc.pointerNdc.set(2*p.x/svc.canvas.clientWidth-1,1-2*p.y/svc.canvas.clientHeight)}
 else svc.pointerNdc.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
 svc.camera.updateMatrixWorld();(svc.dragRoot||svc.mounts.root).updateWorldMatrix(true,true);
 svc.raycaster.setFromCamera(svc.pointerNdc,svc.camera);
 const targets=[dragLocal('shifter-knob'),dragLocal('shifter-knob-rim')].filter(Boolean),hit=svc.raycaster.intersectObjects(targets,false)[0]?.object;if(hit)return hit;
 // Small screen-space tolerance around the actual rounded grip; never the whole console.
 const pad=svc.dragTolerance||0;if(!pad)return null;
 const w=svc.canvas.clientWidth,h=svc.canvas.clientHeight,px=(svc.pointerNdc.x+1)*w/2,py=(1-svc.pointerNdc.y)*h/2;
 for(const o of targets){const box=o.geometry.boundingBox||(o.geometry.computeBoundingBox(),o.geometry.boundingBox);let l=Infinity,r=-Infinity,t=Infinity,b=-Infinity;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const q=new svc.T.Vector3(x,y,z).applyMatrix4(o.matrixWorld).project(svc.camera);if(q.z<=-1||q.z>=1)continue;const X=(q.x+1)*w/2,Y=(1-q.y)*h/2;l=Math.min(l,X);r=Math.max(r,X);t=Math.min(t,Y);b=Math.max(b,Y);}if(px>=l-pad&&px<=r+pad&&py>=t-pad&&py<=b+pad)return o;}return null;
}
function gearAxisInPixels(){
 const carrier=dragLocal('shifter-knob-carrier'),parent=carrier?.parent;if(!parent)return null;
 parent.updateWorldMatrix(true,false);svc.camera.updateMatrixWorld();
 const point=y=>{const v=new svc.T.Vector3(-.045,y,.15).applyMatrix4(parent.matrixWorld).project(svc.camera);
  return {x:(v.x+1)*.5*svc.worldW,y:(1-v.y)*.5*svc.worldH};};
 const up=point(.085),down=point(-.085);
 const dx=up.x-down.x,dy=up.y-down.y,len2=dx*dx+dy*dy;
 return len2>16?{dx,dy,len2}:null;
}
function startShifterDrag(e){
 const s=svc.b.snapshot();
 if(s.done||s.broken||s.coach||s.view!==0||!pickShifterKnob(e))return false;
 const axis=gearAxisInPixels();if(!axis)return false;
 if(s.hand)svc.action('parkingWarning');
 const rotated=document.body.classList.contains('mobile-rotated'),pt=rotated?svc.b.point(e):{x:e.clientX,y:e.clientY};
 shifterDrag={id:e.pointerId,x:pt.x,y:pt.y,rotated,initial:s.gear*.085,
  preview:s.gear*.085,moved:false,axis};
 svc.setPhysicalFeedback(svc.physicalHover,0);svc.physicalHover=null;svc.hidePhysicalTooltip();
 return true;
}
function moveShifterDrag(e){
 const d=shifterDrag;if(!d||d.id!==e.pointerId)return;
 const pt=d.rotated?svc.b.point(e):{x:e.clientX,y:e.clientY};
 const mx=pt.x-d.x,my=pt.y-d.y;
 d.moved ||= Math.hypot(mx,my)>5;
 const fraction=(mx*d.axis.dx+my*d.axis.dy)/d.axis.len2;
 d.preview=svc.cl(d.initial+.170*fraction,-.085,.085);
 const knob=dragLocal('shifter-knob-carrier');if(knob)knob.position.y=d.preview;
}
function finishShifterDrag(e,cancel=false){
 const d=shifterDrag;if(!d||d.id!==e.pointerId)return;
 if(!cancel)moveShifterDrag(e);
 shifterDrag=null;
 if(!cancel&&d.moved){
  const target=d.preview>.0425?1:d.preview<-.0425?-1:0;
  svc.action('gear',target); // the original game's setGear is the single authority
 }
 const knob=dragLocal('shifter-knob-carrier');if(knob)knob.position.y=svc.b.snapshot().gear*.085;
}
function syncShifterLabels(gear){
 const touch=(globalThis.document?.body?.classList.contains('mobile-game')||!!globalThis.matchMedia?.('(pointer:coarse)')?.matches);if(gear===previousGear&&touch===previousTouch)return;previousGear=gear;previousTouch=touch;
 const knob=svc.local('shifter-label-knob-N');if(!knob)return;
 if(!knobCanvas){
  const H=globalThis.TruckTextTexture,c=H?H.canvas(512,512):document.createElement('canvas');if(!H){c.width=512;c.height=512;}
  knobCanvas=c;knobTexture=new svc.T.CanvasTexture(c);knobTexture.colorSpace=svc.T.SRGBColorSpace;H?.configure(svc.T,knobTexture);
  knob.material=new svc.T.MeshBasicMaterial({map:knobTexture,transparent:true,side:svc.T.DoubleSide,toneMapped:false,depthWrite:false});
  knob.position.y-=.019; // optical centering: the RC15 original glyph reads high on the grip
 }
 const c=knobCanvas,x=globalThis.TruckTextTexture?.context(c)||c.getContext('2d');x.clearRect(0,0,512,512);
 x.font='bold 365px Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffffff';
 x.fillText(({1:'D',0:'N','-1':'R'})[gear]||'N',256,276);knobTexture.needsUpdate=true;
 const rows=[[1,['D','Q']],[0,['N','A']],[-1,['R','Z']]];
 for(const [g,[letter,key]] of rows){
  const label=svc.local('gear-position-'+letter);if(!label)continue;
  if(!label.userData.gearArt){
   const H=globalThis.TruckTextTexture,art=H?H.canvas(512,256):document.createElement('canvas');if(!H){art.width=512;art.height=256;}
   const tx=new svc.T.CanvasTexture(art);tx.colorSpace=svc.T.SRGBColorSpace;H?.configure(svc.T,tx);
   label.geometry.dispose?.();label.geometry=new svc.T.PlaneGeometry(.104,.066);
   label.position.x=.082;label.position.y-=.019;label.position.z+=.003;
   label.material=new svc.T.MeshBasicMaterial({map:tx,transparent:true,side:svc.T.DoubleSide,toneMapped:false,depthWrite:false});
   label.userData.gearArt={art,tx};
  }
  const {art,tx}=label.userData.gearArt,a=globalThis.TruckTextTexture?.context(art)||art.getContext('2d');
  a.clearRect(0,0,512,256);
  const selected=g===gear;
  a.textAlign='center';a.textBaseline='middle';
  // RC8: engraved lettering remains dark when unselected. A selected gear
  // has a smoked graphite lens, with colored light seemingly illuminating
  // the glyph from inside; no flat green rectangle and no glaring white text.
  if(selected){
   const glow=a.createLinearGradient(30,38,448,216);
   glow.addColorStop(0,'#26333a');glow.addColorStop(.5,'#15272f');glow.addColorStop(1,'#233037');
   a.fillStyle=glow;a.shadowColor='#447e72';a.shadowBlur=17;
   a.beginPath();a.roundRect(28,30,448,192,30);a.fill();
   a.shadowBlur=0;a.strokeStyle='#536c69';a.lineWidth=3;a.stroke();
  }
  // Maintain the RC6 engraved glyph and its independent glow over the badge.
  a.font='bold 194px Arial,sans-serif';
  if(!selected){
   a.shadowBlur=0;a.shadowColor='transparent';
   a.fillStyle='#b4c5d1';a.fillText(letter,touch?256:157,133); // bevel's upper rim
  }
  a.fillStyle=selected?'#97e5c1':'#263847';
  a.shadowColor=selected?'#5be4b6':'rgba(7,19,31,.4)';
  a.shadowBlur=selected?24:1;
  a.fillText(letter,touch?256:157,128);
  a.shadowBlur=0;a.shadowColor='transparent';
  // Q/A/Z are key reminders only: less than half of the main glyph height.
  a.font='bold 82px Arial,sans-serif';
  a.fillStyle=selected?'#91acaa':'#475866';if(!touch)a.fillText(key,370,131);
  tx.needsUpdate=true;
 }
}
return Object.freeze({ownsPointer,isDragging,cancelDrag,pickShifterKnob,gearAxisInPixels,startShifterDrag,moveShifterDrag,finishShifterDrag,syncShifterLabels});
}
return Object.freeze({createTransmissionSystemCabin});
});
