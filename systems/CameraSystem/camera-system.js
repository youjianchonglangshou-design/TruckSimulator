/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6Camera=api;})(globalThis,function(){'use strict';
function createCameraSystemCore(svc){
function inspectionPoint(r){let obs=svc.P.obstacles(svc.level).concat([svc.P.tractor(svc.s),svc.P.trailer(svc.s)]);let safe=p=>(svc.P.levels[svc.level].scene?svc.P.levels[svc.level].scene.bounds(p):Math.abs(p.x)<33.8&&p.z>-35.8&&p.z<40.8)&&!obs.some(o=>svc.P.overlap({x:p.x,z:p.z,a:0,w:.38,l:.38},o));for(let [f,rOffset] of [[-3,-2.7],[-3,2.7],[-1.1,-1.9],[-1.1,1.9],[.5,-1.75],[.5,1.75],[2,-1.75],[2,1.75],[4,-2],[4,2]]){let p=svc.P.at(r.x,r.z,svc.s.b,f,rOffset);if(safe(p))return p}for(let f=-5;f<=12;f+=.5)for(let side of [-1,1])for(let d=1.65;d<=7;d+=.4){let p=svc.P.at(r.x,r.z,svc.s.b,f,side*d);if(safe(p))return p}return svc.P.at(r.x,r.z,svc.s.b,2,-1.7)}
function probeCamera(t){if(t<0){const u=-t,e=u*u*(3-2*u),lean=1-Math.pow(1-u,2),p=svc.P.at(svc.s.x,svc.s.z,svc.s.a,3.88-.24*lean,-.54-1.46*lean);return svc.camera(p.x,3.16+.23*lean,p.z,svc.P.angle(svc.s.a+svc.probeDegrees(t)*svc.rad),.035+.34*e,89-10*e)}if(t>0){const u=t,e=u*u*(3-2*u),head=svc.P.at(svc.s.x,svc.s.z,svc.s.a,3.88-.04*e,-.54+.14*e);return svc.camera(head.x,3.16+.04*e,head.z,svc.P.angle(svc.s.a+svc.probeDegrees(t)*svc.rad),.035+.075*e,89)}const p=svc.P.at(svc.s.x,svc.s.z,svc.s.a,3.88,-.54);return svc.camera(p.x,3.16,p.z,svc.s.a,.035,89)}
function probeAllowed(){return svc.view===0&&!svc.done&&!svc.$('#mirrorPanel').classList.contains('open')}
function syncProbeControls(){const allowed=probeAllowed(),d=svc.probeDegrees(svc.probeTarget);for(const [side,val] of [['Left',Math.max(0,-d)],['Right',Math.max(0,d)]]){const el=svc.$('#probe'+side),range=svc.$('#probe'+side+'Range'),value=Math.round(val);if(+range.value!==value)range.value=String(value);svc.$('#probe'+side+'Out').textContent=value+'°';el.classList.toggle('active',value>0);el.setAttribute('aria-disabled',String(!allowed));range.disabled=!allowed;el.querySelector('button').disabled=!allowed}}
function setProbeDegrees(d){svc.probeTarget=svc.probeFraction(svc.P.clamp(d,-180,90));syncProbeControls()}
function releaseProbe(){svc.keys.delete('1');svc.keys.delete('3');svc.probeTarget=0;syncProbeControls()}
function updateProbe(dt){const allowed=probeAllowed(),left=allowed&&svc.keys.has('1'),right=allowed&&svc.keys.has('3');if(left!==right){setProbeDegrees(svc.probeDegrees(svc.probeTarget)+(left?-1:1)*105*dt)}if(!allowed&&svc.probeTarget!==0)setProbeDegrees(0);const current=svc.probeDegrees(svc.probe),target=svc.probeDegrees(svc.probeTarget),delta=target-current;const move=Math.min(Math.abs(delta),Math.abs(delta)*(1-Math.exp(-dt/.105)),180*dt);svc.probe=svc.probeFraction(Math.abs(delta)<.08?target:current+Math.sign(delta)*move);let show=svc.difficultyMode!==2&&svc.view===0&&Math.abs(svc.probe)<.02;if((svc.$('#mirrorLeft').style.display==='block')!==show)svc.layoutMirrorHits()}
function setView(v){if(svc.coach)return;if(svc.shiftDrag)svc.clearShiftDrag();if(![0,3,4].includes(v)||v===4&&svc.P.levels[svc.level].theme!=='practice')return;if(v===3){if(Math.abs(svc.s.v)>.05){svc.message('請先完全煞停，再下車確認');return}svc.setMirrorPanel(false);svc.setGear(0);svc.hand=true;svc.keys.clear()}else if(svc.view===3){svc.keys.clear()}if(v===4&&svc.difficultyMode)return;if(v!==0){svc.setMirrorPanel(false);releaseProbe();svc.probe=0}svc.view=v;globalThis.document?.body?.classList.toggle('cab-inspecting',v===3);svc.layoutMirrorHits();svc.$('#testView').classList.toggle('active',v===4);svc.$('#exitCab').textContent=v===3?'上車':(globalThis.document?.body?.classList.contains('mobile-game')||!!globalThis.matchMedia?.('(pointer:coarse)')?.matches)?'下車':'下車 4';svc.$('#exitCab').classList.toggle('active',v===3);syncProbeControls();svc.$('#shifter').dataset.out=String(v===3)}
function cabinEyeCamera(){
 const model=window.TruckCabinRebuild;
 if(!model)return probeCamera(svc.probe);
 // Use the exact same approved RC15 layout settings as the WebGL camera.
 // Defaults alone shift the eye during head-out and desynchronize the real world.
 const approved=window.TruckCabinUserLayout?.settings||model.DEFAULTS;
 const eye=approved.camera?.position||model.DEFAULTS.camera.position;
 const pose=model.eyePose(svc.probeDegrees(svc.probe),eye,approved);
 const p=svc.P.at(svc.s.x,svc.s.z,svc.s.a,3.88-(pose.z-.64),-.54+(pose.x+.19));
 return svc.camera(p.x,3.16+(pose.y-1.59),p.z,svc.P.angle(svc.s.a+svc.probeDegrees(svc.probe)*svc.rad),
   -(pose.pitch||0),approved.camera?.fov||model.DEFAULTS.camera.fov);
}
return Object.freeze({inspectionPoint,probeCamera,probeAllowed,syncProbeControls,setProbeDegrees,releaseProbe,updateProbe,setView,cabinEyeCamera});
}
return Object.freeze({createCameraSystemCore});
});
