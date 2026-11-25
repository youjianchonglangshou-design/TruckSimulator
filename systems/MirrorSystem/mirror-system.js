/* RC35 mirror optics/capture, extracted into an instance-owned module.
 * No DOM selectors, other devices, globals, timers or RAF. Host supplies services. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckMirrorSystem=api;})(globalThis,function(){'use strict';
 const keys=['left','right','leftWide','rightWide'];
 const ids=['mirror-left-upper','mirror-left-lower','mirror-right-upper','mirror-right-lower'];
 const STORAGE_KEY='terminal-driver-mirrors-v14';
 const defaults=()=>Object.fromEntries(keys.map(k=>[k,{yaw:0,pitch:0}]));
 function createMirrorSystem({physics:P,clock,storage,createCanvas,getFrame,getRect,camera,renderView,paintView,onCapture,sceneName}){
  const rad=Math.PI/180;
  let angles=defaults(),storageOK=true,frame=0,lastPreview=0;
  try{const raw=JSON.parse(storage.getItem(STORAGE_KEY)||'null');if(raw)for(const k of keys)for(const a of ['yaw','pitch'])if(Number.isFinite(raw[k]?.[a]))angles[k][a]=P.clamp(raw[k][a],a==='yaw'?-28:-22,a==='yaw'?28:32)}catch{storageOK=false}
  const slots=Array.from({length:4},()=>({canvas:createCanvas(),back:createCanvas(),key:'',frame:-1,stage:-1,sceneRevision:-1,camera:null,valid:false}));
  function settings(){return Object.fromEntries(keys.map(k=>[k,{...angles[k]}]));}
  function setAngles(k,yaw,pitch){if(!keys.includes(k))return false;angles[k]={yaw:Math.round(P.clamp(yaw,-28,28)),pitch:Math.round(P.clamp(pitch,-22,32))};return true;}
  function resetAngles(){angles=defaults();}
  function save(){try{storage.setItem(STORAGE_KEY,JSON.stringify(angles));storageOK=true}catch{storageOK=false}return storageOK;}
  function mirrorCamera(s,side,wide=false){const k=(side===-1?'left':'right')+(wide?'Wide':''),adj=angles[k],p=P.at(s.x,s.z,s.a,wide?4.75:4.25,side*(wide?1.87:1.83));return camera(p.x,wide?2.48:3.18,p.z,s.a+Math.PI-side*(wide?.48:.09)+side*adj.yaw*rad,(wide?.81:.23)+adj.pitch*rad,wide?118:49);}
  function mirrorCaptureRect(side,wide){const base=getRect(side,wide),aspect=wide?(0.36/0.31):(0.39/0.68);return {x:0,y:0,w:base.w,h:Math.max(16,Math.round(base.w/aspect))};}
  function invalidate(){const {level,sceneRevision}=getFrame();for(const item of slots){const cv=item.canvas;if(cv.width>0&&cv.height>0){const c=cv.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='copy';c.fillStyle='#16252b';c.fillRect(0,0,cv.width,cv.height);c.restore();}item.key='';item.pose='';item.captureAt=0;item.stage=level;item.sceneRevision=sceneRevision;item.camera=null;item.frame=++frame;item.valid=false;}}
  function capture(objects,all,paint=true,force=false){
   const {vehicle:s,level,sceneRevision,view,difficultyMode,active3d,dpr,qualityRevision,visuals:q,fps,environment:env}=getFrame();if(difficultyMode===2)return;
   const currentFrame=frame++,stride=q.mirrorStride,measuredFps=fps||30,adaptiveStride=measuredFps>0&&measuredFps<22?Math.max(2,stride):stride;
   for(const side of [-1,1])for(const wide of [false,true]){
    const i=(side===-1?0:2)+(wide?1:0),item=slots[i],r=active3d?mirrorCaptureRect(side,wide):getRect(side,wide),{w,h}=r;
    const scale=active3d?1.5:Math.min(1.75,dpr),px=Math.max(1,Math.round(w*scale)),py=Math.max(1,Math.round(h*scale));
    const adj=angles[(side===-1?'left':'right')+(wide?'Wide':'')];
    const key=[sceneRevision,qualityRevision,level,view,w,h,adj.yaw,adj.pitch].join('|');
    const stale=item.key!==key||item.canvas.width!==px||item.canvas.height!==py;
    const pose=[Math.round(s.x*20),Math.round(s.z*20),Math.round(s.a*300),Math.round(s.b*300),env?.time,env?.weather,Math.round((env?.brightness||1)*20)].join('|');
    const movingFrame=item.pose!==pose,weatherDue=env?.weather==='rain'&&clock()-(item.captureAt||0)>580;
    if(force&&!stale)continue;
    if(stale||((movingFrame||weatherDue)&&currentFrame%adaptiveStride===i%adaptiveStride)){
     if(item.back.width!==px)item.back.width=px;if(item.back.height!==py)item.back.height=py;
     const mctx=item.back.getContext('2d');if(typeof mctx.reset==='function')mctx.reset();else{mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,px,py);mctx.globalAlpha=1;mctx.globalCompositeOperation='source-over';}
     mctx.setTransform(px/w,0,0,py/h,0,0);const start=clock(),cam=mirrorCamera(s,side,wide);
     renderView(mctx,cam,{x:0,y:0,w,h},wide?all:objects);const ms=clock()-start;
     if(item.canvas.width!==px)item.canvas.width=px;if(item.canvas.height!==py)item.canvas.height=py;
     const front=item.canvas.getContext('2d');front.setTransform(1,0,0,1,0,0);front.globalAlpha=1;front.globalCompositeOperation='copy';front.drawImage(item.back,0,0,px,py);front.globalCompositeOperation='source-over';
     onCapture(ms);item.revision=(item.revision||0)+1;item.key=key;item.pose=pose;item.captureAt=clock();item.frame=currentFrame;item.stage=level;item.sceneRevision=sceneRevision;item.valid=true;item.camera={x:cam.x,y:cam.y,z:cam.z,a:cam.a,pitch:cam.pitch,fov:cam.fov};
    }
    if(paint)paintView(item.canvas,getRect(side,wide),side,wide);
   }
  }
  function preview(t,objects,all){const f=getFrame();if(!f.active3d||f.view!==0||!objects||!all||t-lastPreview<55)return;lastPreview=t;capture(objects,all,false,true);}
  function validSlot(id){const index=ids.indexOf(id);if(index<0)return null;const item=slots[index],f=getFrame();return item.valid&&item.stage===f.level&&item.sceneRevision===f.sceneRevision?item:null;}
  function feed(id){const item=validSlot(id);return item&&item.canvas.width>1?{stage:item.stage,sceneRevision:item.sceneRevision,frame:item.frame,canvas:item.canvas}:null;}
  function revision(id){return validSlot(id)?.frame??-1;}
  function diagnostics(){const f=getFrame(),s=f.vehicle;return {level:f.level,stage:sceneName(f.level),sceneRevision:f.sceneRevision,vehicle:{x:s.x,z:s.z,a:s.a,b:s.b},panes:slots.map((c,i)=>({slot:i,stage:c.stage,sceneRevision:c.sceneRevision,frame:c.frame,canvas:[c.canvas.width,c.canvas.height],camera:c.camera?{...c.camera}:null}))};}
  return Object.freeze({settings,setAngles,resetAngles,save,storageOK:()=>storageOK,capture,invalidate,preview,feed,revision,diagnostics,capturePasses:()=>frame});
 }
 return Object.freeze({createMirrorSystem});
});
