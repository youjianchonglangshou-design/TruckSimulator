/* P04 live surfaces preserve the approved mesh and texture layout. */
(function(g){'use strict';
const cache=new WeakMap();
const context=c=>globalThis.TruckTextTexture?.context(c)||c.getContext('2d');
const size=c=>globalThis.TruckTextTexture?.size(c)||[c.width,c.height];
function updateWipers(model,environment){
 const data=model.native.root.userData,mode=environment?.settings?.wiper||0;
 if(!mode){if(data.wipers)data.wipers.group.visible=false;return;}
 const T=THREE,p=model.settings;
 if(!data.wipers){const group=new T.Group();group.name='K13-wipers';model.native.root.add(group);const geo=new T.BoxGeometry(1,1,1),mat=new T.MeshBasicMaterial({color:'#080f14'});data.equipmentDisposables.push(geo,mat);const pieces=[];for(let i=0;i<4;i++){const m=new T.Mesh(geo,mat);m.name='K13-wiper-'+i;m.raycast=()=>{};group.add(m);pieces.push(m);}data.wipers={group,pieces};}
 const {group,pieces}=data.wipers;group.visible=true;
 const a=environment.wiperAngle??-.13;
 function pt(x,y,t){return new T.Vector3(...K13Native.map(p,x+Math.cos(a)*t,y-Math.sin(a)*t,-1.50));}
 for(const [i,x] of [-.64,.48].entries()){const A=pt(x,1.20,0),B=pt(x,1.20,.40),C=pt(x,1.20,.87);for(const [j,u,v,w] of [[0,A,B,.006],[1,B,C,.012]]){const m=pieces[i*2+j],d=v.clone().sub(u);m.position.copy(u).add(v).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());m.scale.set(w,d.length(),.005);}}
}
function update(model,{state,hand,devices,distance,distanceLabel='後端距離',time,now,drawRadar,radarRevision}){const root=model.root,native=model.native.root,data=native.userData,tex=n=>root.getObjectByName(n)?.material?.map;let old=cache.get(model)||{};const v=String(Math.round(Math.abs(state.v)*3.6)).padStart(2,'0'),hits=state.hits+'/10',timerKey=time+'|'+hits;
 if(v!==old.speed){const sp=tex('K13-HUD-preview');if(sp){const x=context(sp.image);x.fillStyle='#14283d';x.fillRect(0,0,768,320);x.fillStyle='#e1f1ff';x.textAlign='center';x.textBaseline='middle';x.font='bold 120px Arial';x.fillText(v,270,81);x.font='43px Arial';x.fillText('km/h',467,81);sp.needsUpdate=true}old.speed=v;}if(timerKey!==old.timerKey){const met=tex('timer-display');if(met){const x=context(met.image);x.fillStyle='#14283d';x.fillRect(0,94,640,150);x.fillRect(0,365,640,150);x.fillStyle='#d5e9f7';x.textAlign='center';x.textBaseline='middle';x.font='bold 117px Arial, sans-serif';x.fillText(time,320,166);x.fillStyle=state.hits>=10?'#ff6f70':state.hits>=7?'#ffad70':'#d5e9f7';x.fillText(hits,320,436);met.needsUpdate=true}old.timerKey=timerKey}
 const dkey=distanceLabel+'|'+(Number.isFinite(distance)?distance.toFixed(1):'—');if(dkey!==old.distance){data.setRearDistance?.(distance,distanceLabel);old.distance=dkey}const dist=root.getObjectByName('k13-rear-distance');if(dist)dist.visible=devices.distance;
 for(const name of ['mirror-left-upper','mirror-right-upper']){const m=model.native.mounts.parts.get(name)?.group;if(m)m.visible=devices.mirrors}const center=root.getObjectByName('k13-center-mirror');if(center)center.visible=devices.mirrors;
 if(old.gear!==state.gear){data.syncShifterLabels?.(state.gear);const knob=root.getObjectByName('shifter-knob-carrier');if(knob)knob.position.y=state.gear*.085;old.gear=state.gear}
 const wheel=root.getObjectByName('steering-wheel-assembly');if(wheel)wheel.rotation.z=-state.steer*2.4;
 updateWipers(model,devices.environment);data.brakeState?.(hand);data.weatherUpdate?.(devices.environment);data.weatherRotate?.(now);
 if(old.radar!==devices.radar){data.radarState?.(devices.radar);old.radar=devices.radar;old.radarRevision=undefined}if(devices.radar&&(radarRevision===undefined||radarRevision!==old.radarRevision)){const rt=tex('K13-radar-preview');if(rt){drawRadar(rt.image,now);rt.needsUpdate=true;old.radarRevision=radarRevision}}
 // Update original exterior lamp color groups only; they are model-local materials.
 model.exterior?.traverse(o=>{if(!o.isMesh)return;const c=o.userData.k13ExteriorColor,m=o.material;if(c==='#dce6e7'){m.emissive.set(devices.environment.headOn?'#fff4c7':'#000000');m.emissiveIntensity=devices.environment.headOn?(devices.environment.highOn?1.8:.8):0}else if(c==='#b63032'){m.emissive.set(state.braking||devices.environment.headOn?'#ff3933':'#000000');m.emissiveIntensity=state.braking?1:devices.environment.headOn?.35:0}else if(c==='#e3d6cb'){m.emissive.set(state.gear===-1?'#f1f9ff':'#000000');m.emissiveIntensity=state.gear===-1?.8:0}});
 cache.set(model,old);
}
function visible(o){for(let q=o;q;q=q.parent)if(!q.visible)return false;return true}
function pick(model,ray){model.root.updateMatrixWorld(true);const targets=model.native.root.userData.equipmentHits||[];const hit=ray.intersectObjects(targets,false).find(h=>visible(h.object));if(!hit)return null;/* Same direct real-pad hit as the original truck light button. */if(hit.object.userData.k13Action==='head')return hit.object;const front=ray.intersectObject(model.root,true).find(h=>visible(h.object)&&h.object.material?.visible!==false);if(front&&front.distance<hit.distance-.008){let o=front.object;while(o&&o!==hit.object)o=o.parent;if(!o)return null;}return hit.object}
function dragGear(model,camera,viewport,start,end,gear){const knob=model.root.getObjectByName('shifter-knob-carrier'),parent=knob?.parent;if(!parent)return gear;const r=viewport.getBoundingClientRect();parent.updateWorldMatrix(true,false);const project=y=>new THREE.Vector3(-.045,y,.15).applyMatrix4(parent.matrixWorld).project(camera);const a=project(-.085),b=project(.085),x=(b.x-a.x)*r.width/2,y=-(b.y-a.y)*r.height/2,len=x*x+y*y,dx=end.clientX-start.x,dy=end.clientY-start.y;if(Math.hypot(dx,dy)<6)return gear===1?0:gear===0?-1:1;if(len<4)return gear;return Math.max(-1,Math.min(1,Math.round(gear+2*(dx*x+dy*y)/len)))}
g.K13LiveDisplay={update,pick,dragGear};})(globalThis);
