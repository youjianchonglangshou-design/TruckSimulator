/* P05: vehicle-specific optics; capture, cache, UV normalization and texture
   publishing reuse MirrorSystem. Coordinates remain P07-local (+X right, -Z forward). */
(function(g){'use strict';
const rad=Math.PI/180,ids={left:'mirror-left-upper',right:'mirror-right-upper',center:'mirror-center'},names={left:'左後照鏡',right:'右後照鏡',center:'中央後照鏡'};
function create({store,settings,engine,getState,getMode,getEnvironment,getQuality,getPaint}){
 const p=settings,center=s=>engine?engine.center(s):{x:0,z:0};let revision=0,last=-Infinity,binding=null,road=[],sky=[.62,.77,.83],rain=null,body=[],rearFrame=[],disposed=false,wasHidden=false;
 const localToWorld=(s,v)=>{const b=center(s),c=Math.cos(s.a),t=Math.sin(s.a);return [b.x+v[0]*c-v[2]*t,v[1]+(engine?.terrain?.(s).height||0)-(engine?.terrain?.(s).grade||0)*v[2],-b.z+v[0]*t+v[2]*c]};
 const localBody=CarModel.build(p,false).filter(f=>['body','roof','glass','wheel','wheel-rim','headlamp','taillamp','hatch','door-seam','door-handle','plate','frame'].includes(f.part));
 // Three original horizontal rounded glass panes. The rear-view eye is at the
 // actual center mirror, with rear window frame geometry occluding the view.
 const panes=Object.keys(ids).map(key=>({key,id:ids[key],rect:()=>({x:0,y:0,w:256,h:144}),camera(s,adj){const side=key==='left'?-1:1,central=key==='center',origin=central?[0,p.height-.19,-p.length*p.roofFront-.13]:[side*p.mirrorX,p.mirrorY,p.mirrorZ+.055],eye=localToWorld(s,origin);return {x:eye[0],y:eye[1],z:eye[2],a:s.a+Math.PI+(central?0:-side*.19)+(central?1:side)*adj.yaw*rad,pitch:(central?-.105:-.085)-adj.pitch*rad,fov:central?17:31,key};}}));
 const sys=TruckMirrorSystem.createMirrorSystem({panes,defaultAngles:g.TruckK13Descriptor?.mirrorDefaults,storageKey:'terminal-driver-mirrors-v14',physics:{clamp:Physics.clamp},clock:()=>performance.now(),storage:store,createCanvas:()=>document.createElement('canvas'),getFrame:()=>({vehicle:{...getState(),b:0},level:0,sceneRevision:revision,view:0,difficultyMode:getMode(),active3d:false,dpr:1,qualityRevision:getQuality?.().revision??0,trafficPose:[getEnvironment()?.headOn,getEnvironment()?.highOn,getPaint?.(),engine?.traffic?.mirrorStamp()].join('|'),visuals:{mirrorStride:getQuality?.().mirrorStride??1},fps:getQuality?.().fps||30,environment:getEnvironment()}),renderView(ctx,cam,r){
  const eye=[cam.x,cam.y,cam.z],target=[cam.x+Math.sin(cam.a)*Math.cos(cam.pitch),cam.y+Math.sin(cam.pitch),cam.z-Math.cos(cam.a)*Math.cos(cam.pitch)];
  // Same software road renderer as main view. Horizontal reflection reverses the camera image once.
  ctx.save();ctx.translate(r.w,0);ctx.scale(-1,1);softwareRender(ctx,r.w,r.h,sky,eye,target,cam.fov,road,cam.key==='center'?rearFrame:body,false);ctx.restore();rain?.(ctx,r,'mirror',performance.now());
 },paintView(){},onCapture(){},sceneName:()=>engine?'practice':'preview'});
 // Build rear aperture from actual P07 shell triangles, not a drawn window mask.
 function shellFaces(shell){const mesh=shell.getObjectByName('continuous-stitched-main-shell');if(!mesh)return [];mesh.updateWorldMatrix(true,false);const geo=mesh.geometry,pos=geo.attributes.position,index=geo.index,arr=[],T=g.THREE;for(const group of geo.groups){const mat=mesh.material[group.materialIndex];for(let i=group.start;i<group.start+group.count;i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(pos,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld).toArray());if(v.every(q=>q[2]>.65))arr.push({v,c:'#'+mat.color.getHexString()})}}return arr;}
 let localFrame=[];
 function capture(faces=road,colors=sky,weatherRain=rain,now=performance.now(),force=false){if(disposed)return;if(getMode()===2){if(!wasHidden){sys.invalidate();wasHidden=true}return}if(wasHidden){wasHidden=false;force=true}if(!force&&now-last<100)return;last=now;road=faces;sky=colors;rain=weatherRain;const s=getState();const color=getPaint?.();body=localBody.map(f=>({...f,c:color&&f.part==='body'?TruckCabinPaint.shadedColor(f.c,'#e9e9e4',color):f.c,v:f.v.map(v=>localToWorld(s,v))}));rearFrame=localFrame.map(f=>({...f,v:f.v.map(v=>localToWorld(s,v))}));sys.capture(road,road,false);}
 function setRearFrame(model){localFrame=shellFaces(model.native.shell);revision++;sys.invalidate();last=-Infinity;}
 function detach(){if(!binding)return;binding.publisher.unmount();binding.centerFace.material=binding.originalMaterial;binding.centerMaterial.dispose();binding=null;localFrame=[];}
 function attach(model){detach();if(!model.root.getObjectByName('k13-center-mirror'))return;const T=g.THREE,m=model.native.mounts,centerFace=model.root.getObjectByName('k13-center-mirror').getObjectByName('mirror-live-reflection-surface'),originalMaterial=centerFace.material,centerMaterial=originalMaterial.clone();centerFace.material=centerMaterial;
  const mirrorFaces=new Map([[ids.left,m.mirrorFaces.get(ids.left)],[ids.right,m.mirrorFaces.get(ids.right)],[ids.center,centerFace]]);
  // All three K13 housings are rotated +90° around Z from truck's upright source.
  const normalize=geo=>{TruckRenderGeometry.normalizeMirrorUV(geo);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,1-v,u)}uv.needsUpdate=true;return geo};
  const publisher=TruckMirrorCabin.createMirrorCabin({T,mounts:{mirrorFaces},b:{mirrorImage:id=>sys.feed(id)?.canvas,mirrorRevision:sys.revision,mirrorFeed:sys.feed},normalizeMirrorUV:normalize});publisher.mount();binding={model,publisher,centerFace,originalMaterial,centerMaterial,mirrorFaces};setRearFrame(model);
 }
 function publish(){if(!binding)return;binding.publisher.update({level:0,sceneRevision:revision,difficultyMode:getMode(),view:0});const show=getMode()!==2;for(const name of ['mirror-left-upper','mirror-right-upper'])binding.model.native.mounts.parts.get(name).group.visible=show;binding.model.root.getObjectByName('k13-center-mirror').visible=show;for(const o of binding.model.native.root.children)if(o.name==='lower-exterior-horizontal-arm')o.visible=show;}
 function pick(ray){if(!binding||getMode()===2)return null;const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};const hit=ray.intersectObjects([...binding.mirrorFaces.values()],false).find(h=>visible(h.object));if(!hit)return null;const front=ray.intersectObject(binding.model.root,true).find(h=>visible(h.object)&&h.object.material?.visible!==false);if(front&&front.distance<hit.distance-.006)return null;return Object.keys(ids).find(k=>binding.mirrorFaces.get(ids[k])===hit.object)||null;}
 function set(key,yaw,pitch){if(getMode()===2||!sys.setAngles(key,yaw,pitch))return false;sys.save();last=-Infinity;return true;}
 function reset(key){if(getMode()===2)return false;if(!sys.resetAngles(key))return false;sys.save();last=-Infinity;return true;}
 function invalidate(){revision++;sys.invalidate();last=-Infinity;}
 return {attach,detach,setRearFrame,publish,capture,pick,set,reset,invalidate,settings:sys.settings,storageOK:sys.storageOK,feed:key=>sys.feed(ids[key]),diagnostics:sys.diagnostics,dispose(){if(disposed)return;detach();disposed=true;sys.invalidate()}};
}
g.K13Mirrors=Object.freeze({create,names,ids});
})(globalThis);
