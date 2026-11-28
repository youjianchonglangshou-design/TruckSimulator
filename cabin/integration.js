/* TruckSimulator v6.0.0-alpha.REBUILD-DEV.17-P09-RC13 — real-game bridge into user-approved RC15 Three.js shell.
   No duplicate physics, stages, weather, music player, or quality controller. */
(()=>{'use strict';
const $=id=>document.getElementById(id), b=window.TruckCabinBridge, M=window.TruckCabinRebuild, U=window.TruckCabinUserLayout;
const brakeAdjustment=window.TruckBrakeAdjustment;
const displayCal=window.TruckDisplayCalibration;
const interactionCal=window.TruckInteractionCalibration;
const canvas=$('cabin3d'),host=$('cabin-ui-root');
if(!b||!M||!brakeAdjustment||!displayCal||!interactionCal||!window.TruckCabinMounts||!window.TruckCabinPaint||!window.THREE){
 const check={TruckCabinBridge:b,TruckCabinRebuild:M,TruckBrakeAdjustment:brakeAdjustment,
  TruckDisplayCalibration:displayCal,TruckInteractionCalibration:interactionCal,TruckCabinMounts:window.TruckCabinMounts,
  TruckCabinPaint:window.TruckCabinPaint,THREE:window.THREE};
 const missing=Object.entries(check).filter(([,value])=>!value).map(([name])=>name);
 window.TruckCabinStartup?.fail('3D 初始化缺少模組：'+missing.join('、'));
 return;
}
const T=window.THREE;
const registry=TruckDeviceRegistry.createRegistry(e=>console.error("Device failure",e));
const {normalizeMirrorUV}=TruckRenderGeometry;
let cssText,renderer,scene,camera,shell,mounts,paint,alive=true,frame=0,mirrorCursor=0,last=0,lastHud=0,last3d=0,worldW=0,worldH=0;
let appliedPixelRatio=0,contextLossCount=0,contextLost=false,contextRestoreDeadline=null,contextScale=1;
const quality={ultra:1.5,high:1.5,balanced:1.5,safe:1.5,emergency:1.5};
let paintingDirty=true;
let mirrorCabin=null,radarCabin=null,car=null,carKey='',carPublisher=null,carButtons=[],carGearDrag=null,carPaint=null,carPaintRevision=-1,carMirrorMaterial=null,carMusic=null;
const isCar=()=>b.vehicles.activeId()!=='truck';
function vehiclePaint(){if(!carPaint)carPaint=TruckVehiclePaint.create(b.vehicles.storageFor('NissanMarch_K13'));return {get:()=>({shell:carPaint.get()||'#e9e9e4'}),set:(k,v)=>carPaint.set(v),save:()=>true,reset:()=>carPaint.reset()};}
function currentPaint(){return isCar()?vehiclePaint():paint;}
function releaseCar(){if(!car)return;TruckV6TransmissionCabinInstance().cancelDrag();carPublisher?.unmount();carPublisher=null;if(physicalPressed?.button?.vehicleMesh){cancelPhysicalLongPress();physicalPressed=null;}if(physicalHover?.vehicleMesh)physicalHover=null;if(carMirrorMaterial){const {face,original}=carMirrorMaterial;face.material.dispose();face.material=original;carMirrorMaterial=null;}scene.remove(car.root);carMusic=null;car.dispose();car=null;carKey='';carButtons=[];carGearDrag=null;}
function ensureCar(s){const provider=TruckVehicleCabins.get(s.vehicleId),p=K13ApprovedLayout.settings,key=s.vehicleId+':'+K13Native.eyePose(p,s.probe).outside;
 if(car&&key===carKey)return;
 if(!car)mirrorCabin.unmount();else releaseCar();
 car=provider.buildModel({inside:true,look:s.probe});carKey=key;carPaintRevision=-1;scene.add(car.root);
 const m=car.native.mounts;
 // Each K13 cabin owns its wave texture; use the same playback state and animation as the truck.
 const musicSurfaces={};
 carMusic=TruckV6MusicCabin.createMusicPlayerSystemCabin({displaySurfaces:musicSurfaces,isYoutubePlaying:()=>window.TruckMusic?.isYoutubePlaying?.()});
 carMusic.createWaveSurface(T,m.root.getObjectByName('youtube-audio-screen-BLANK').parent);
 const wave=musicSurfaces.youtubeWave;
 // Lift only the K13 overlay just in front of the existing screen to prevent depth fighting.
 wave.mesh.position.z+=.002;
 // Mount disposal already covers geometry. Equipment disposal covers the additional material/texture.
 car.native.root.userData.equipmentDisposables.push(wave.texture,wave.mesh.material);
 const center=car.root.getObjectByName('k13-center-mirror').getObjectByName('mirror-live-reflection-surface');carMirrorMaterial={face:center,original:center.material};center.material=center.material.clone();
 const mirrorFaces=new Map([['mirror-left-upper',m.mirrorFaces.get('mirror-left-upper')],['mirror-right-upper',m.mirrorFaces.get('mirror-right-upper')],['mirror-center',center]]);
 const normalize=geo=>{normalizeMirrorUV(geo);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,1-v,u)}uv.needsUpdate=true;return geo};
 carPublisher=TruckMirrorCabin.createMirrorCabin({T,mounts:{mirrorFaces},b,position,add,btn,action,makeButton:(host,id,title,fn)=>{const el=add(host,'button',id,title,'cab-physical');on(el,fn);return el},dragHints:window.TruckMirrorDragHints,normalizeMirrorUV:normalize});carPublisher.mount();carPublisher.mountControls(host);
 const labels={head:'燈光',horn:'喇叭',wiper:'雨刷',settings:'設定',levels:'選關',exit:'下車',mode:'駕駛模式',restart:'重來',music:'YouTube',radar:'雷達',brake:'手剎車',gear:'排檔','gear-cycle':'排檔'};
 carButtons=(car.native.root.userData.equipmentHits||[]).map(mesh=>{const a=mesh.userData.k13Action;return {mesh,vehicleMesh:true,label:labels[a]||a,kind:({head:'lowbeam',brake:'parking',music:'youtube'})[a]||a,mode:['settings','levels','exit'].includes(a)?'door':'wheel',run:()=>{if(['settings','levels','mode'].includes(a))openModal(a);else if(a==='horn')horn();else if(a==='gear')action('gear',mesh.userData.k13Value);else if(a==='gear-cycle')action('gear',b.snapshot().gear===1?0:b.snapshot().gear===0?-1:1);else action(({head:'lights',exit:'view'})[a]||a)},longRun:a==='head'?()=>action('high'):null}});
}
function carFrame(s,ms){const previousCar=car;ensureCar(s);const p=TruckVehicleCabins.get(s.vehicleId).cameraPose(car.settings,s.probe,true);if(camera.fov!==p.fov){camera.fov=p.fov;camera.updateProjectionMatrix();}camera.position.set(...p.eye);camera.lookAt(...p.target);shell.visible=mounts.root.visible=false;car.root.visible=s.view===0;
 vehiclePaint();if(carPaintRevision!==carPaint.revision()){TruckVehiclePaint.applyK13(car,carPaint.get(),TruckCabinPaint,true);carPaintRevision=carPaint.revision();}
 const seconds=Math.floor(s.elapsed),time=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');K13LiveDisplay.update(car,{state:{v:s.speed/3.6,hits:s.hits,gear:s.gear,steer:s.steer,braking:s.hand},hand:s.hand,devices:{distance:s.difficultyMode===0,mirrors:s.difficultyMode!==2,radar:s.radarEnabled&&s.difficultyMode===0,environment:s.environment||{}},distance:s.distance,distanceLabel:s.driveThrough||s.mission?.mountain||s.mission?.route==='out'?'迄點距離':'後端距離',time,now:ms,radarRevision:TruckRadarSystem.revision(b.getRadar()),drawRadar:c=>{const src=b.getRadar();if(src?.width){const [w,h]=TruckTextTexture.size(c);TruckTextTexture.context(c).drawImage(src,0,0,w,h)}}});
 carMusic.updateYoutubeWave(ms);
 if(car!==previousCar||ms-lastHud>=75){updateHud(s);lastHud=ms;}carPublisher.update(s);const webglStart=performance.now();renderCabin(car.root.visible);window.TruckRenderDiagnostics?.sample('webglMs',performance.now()-webglStart);updateAnchors(s);
}

let first3dFrame=false,stoppedFor2D=false;
function stopFor2D(){
 if(stoppedFor2D)return;stoppedFor2D=true;alive=false;clearTimeout(contextRestoreDeadline);
 if(window.TruckCabinView){window.TruckCabinView.active=false;window.TruckCabinView.uiPaused=false;}
 if(ui.modal?.classList.contains('open'))closeModal();
 host.hidden=true;releaseCar();cssText?.dispose();TruckTextTexture.disableCapture();renderer?.dispose?.();
}

let displayCalibration=displayCal.load();
let interactionCalibration=interactionCal.load();
const displaySurfaces={};
const saved=b.snapshot(),params={...M.DEFAULTS,...U.settings,camera:{...M.DEFAULTS.camera,...U.settings.camera}};
const cl=(n,min,max)=>Math.max(min,Math.min(max,n));
const text=(s)=>String(s??'');
const local=(id)=>mounts?.root.getObjectByName(id);
const ui={};
const physicalButtons=[];
const raycaster=new T.Raycaster();
const pointerNdc=new T.Vector2();
let physicalPressed=null, physicalHover=null, physicalLongPressTimer=null, physicalTooltipHideTimer=null;
const PHYSICAL_LONG_PRESS_MS=550;
function add(parent,tag,id,contents='',klass=''){
 const el=document.createElement(tag);if(id)el.id=id;if(klass)el.className=klass;if(contents)el.textContent=contents;parent.append(el);return el;
}
function action(name,arg){return b.action(name,arg)}
function on(el,fn){el.addEventListener('click',e=>{e.stopPropagation();fn(e)})}
function init3d(){
 TruckTextTexture.enableCapture();
 renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 cssText=TruckCSS3DText.create(T,canvas);
 canvas.addEventListener('webglcontextlost',e=>{
  if(stoppedFor2D)return; e.preventDefault();contextLost=true;alive=false;cssText?.hide();contextLossCount++;
  // Browser-owned WebGL restoration is preferable to tearing down RC15 and
  // creating yet another GPU context. Reduce the resolution on recovery.
  contextScale=Math.max(.55,contextScale*.75);appliedPixelRatio=0;
  clearTimeout(contextRestoreDeadline);
  contextRestoreDeadline=setTimeout(()=>{if(contextLost)window.TruckCabinStartup?.fail('WebGL 無法自動恢復。已暫停 3D，請重新載入；可先將畫質設為省電／最低。')},9000);
 },{passive:false});
 canvas.addEventListener('webglcontextrestored',()=>{
  if(stoppedFor2D||!contextLost)return;clearTimeout(contextRestoreDeadline);contextLost=false;alive=true;
  worldW=0;worldH=0;appliedPixelRatio=0;last3d=0;
  mirrorCabin?.restoreContext();carPublisher?.restoreContext();cssText?.restoreContext();
  for(const d of Object.values(displaySurfaces))if(d.texture)d.texture.needsUpdate=true;
  TruckV6WeatherCabinInstance().restoreContext();
  requestAnimationFrame(tick);
 });
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 scene=new T.Scene();scene.background=null;camera=new T.PerspectiveCamera(params.camera.fov,1,.035,150);
 camera.rotation.order='YXZ';
 scene.add(new T.HemisphereLight('#f8fcff','#64788b',2.0));
 const direct=new T.DirectionalLight('#ffffff',2.6);direct.position.set(-5,9,-5);scene.add(direct);
 shell=M.buildCabin(T,params);scene.add(shell);
 const m=window.TruckCabinMountsLayout;
 mounts=window.TruckCabinMounts.create(T,m.offsets,m.rotations,m.scales);scene.add(mounts.root);
 paint=window.TruckCabinPaint.create(shell,mounts.root,window.TruckCabinPaintLayout);paint.loadSaved();
 mirrorCabin=TruckMirrorCabin.createMirrorCabin({T,mounts,b:Object.freeze({snapshot:()=>{const q=b.snapshot();return {view:q.view,probe:q.probe,speed:q.speed,difficultyMode:q.difficultyMode,coach:q.coach,settings:q.settings}},point:b.point,action:(name,arg)=>{if(!['mirrorSet','mirrorRefresh'].includes(name))throw Error('invalid mirror command');return b.action(name,arg)},mirrorImage:b.mirrorImage,mirrorRevision:b.mirrorRevision,mirrorFeed:b.mirrorFeed}),position,add,btn,action:(name,arg)=>{if(!['mirrorBegin','mirrorEnd','mirrorSet','mirrorRefresh','mirrorReset'].includes(name))throw Error('invalid mirror command');return b.action(name,arg)},makeButton:(host,id,title,fn)=>{const el=add(host,'button',id,title,'cab-physical');el.title=title;el.setAttribute('aria-label',title);on(el,fn);return el},dragHints:window.TruckMirrorDragHints,normalizeMirrorUV});
 createPillarHud();
 create3dParkingBrake();
 applyParkingBrakeCalibration(brakeAdjustment.defaults);
 createPhysicalButtons();
 create3dRestartButton();
 // Workbench makeWorld() and connectMirrorFeeds() are deliberately NOT invoked.
 registry.register("mirror",mirrorCabin,{critical:true});registry.invoke("mirror","mount");
 // RC25 HUD base is the existing instrument-bay equipment group, not a second shell.
 displaySurfaces.hudBase={mesh:mounts.parts.get('instrument-bay').content,origin:[0,0,0]};
 applyDisplayCalibration('hudBase');
 // RC10: ExtrudeGeometry is NOT a 0..1 UV display. Keep the approved RC15
 // housing and add properly mapped planes *inside* its existing recesses.
 // All five canvases consume the same real TruckCabinBridge telemetry source.
 createDisplaySurface('instrument','instrument-bay-blank-display',.410,.360,[.306,.011,.108],1024,640);
 // Keep the RC24 shared instrument transform as a hidden parent anchor, so
 // previous saved placements remain pixel-identical. Each new surface has its
 // own UV plane, canvas, calibration and independent raycast-free transform.
 displaySurfaces.instrument.mesh.material.visible=false;
 createDisplaySurface('speedGear','instrument-bay-blank-display',.410*604/1024,.360,[-.410/2+.410*604/1024/2,0,.001],604,640,displaySurfaces.instrument.mesh);
 createDisplaySurface('hitsTime','instrument-bay-blank-display',.410*420/1024,.360,[.410/2-.410*420/1024/2,0,.001],420,640,displaySurfaces.instrument.mesh);
 createDisplaySurface('angle','instrument-bay-blank-display',.140,.082,[-.278,.196,.108],512,256);
 createDisplaySurface('distance','instrument-bay-blank-display',.140,.082,[-.300,-.109,.108],512,256);
 createDisplaySurface('radar','parking-monitor-BLANK',.632,.342,[0,.015,.108],768,432);
 radarCabin=TruckRadarCabin.createRadarCabin({surface:displaySurfaces.radar,getRadar:b.getRadar,action:(name)=>{if(name!=='radarOrientation')throw Error('invalid radar command');return b.action(name)},position,T,makeButton:host=>{const e=add(host,'button','cabRadarOrientation','','cab-radar-orientation');e.type='button';e.title='切換雷達方向（AUTO／車頭固定／地圖固定）';return e}});
 registry.register("radar",radarCabin);
 const ytHolder=local('youtube-logo-placeholder');ytHolder.geometry.computeBoundingBox();
 createDisplaySurface('youtube','youtube-logo-placeholder',.079,.079,[0,0,Math.max(.014,ytHolder.geometry.boundingBox.max.z+.002)],256,256,ytHolder);
 drawYoutube();
 TruckV6MusicCabinInstance().createWaveSurface(T,local('youtube-audio-screen-BLANK').parent);
 registerMediaButtons();
 applyAllIconSizes();
 window.TruckMobileCabin?.scaleMeshes(mounts.parts.get('control-bank')?.content,ui.radarGroup);

}
// The visual planes are children of existing RC15 equipment-model groups.
// Calibration changes ONLY these overlay meshes; it never moves the parent model.
function createDisplaySurface(id,target,w,h,origin,width,height,parentOverride){
 const parent=parentOverride||local(target)?.parent;
 if(!parent)throw Error('RC10 display mount not found: '+target);
 const hd=['speedGear','hitsTime','angle','distance','radar'].includes(id);
 const c=hd?TruckTextTexture.canvas(width,height,true):document.createElement('canvas');if(!hd){c.width=width;c.height=height;}
 const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;
 if(hd)TruckTextTexture.configure(T,tx,true);else if(id!=='youtube'){tx.minFilter=T.LinearFilter;tx.magFilter=T.LinearFilter;tx.anisotropy=renderer.capabilities?.getMaxAnisotropy?.()??1;}
 const material=new T.MeshBasicMaterial({map:tx,side:T.DoubleSide,toneMapped:false,transparent:true,depthWrite:false});
 const mesh=new T.Mesh(new T.PlaneGeometry(w,h),material);
 mesh.name='rc11-real-display-'+id;parent.add(mesh);
 displaySurfaces[id]={mesh,origin,canvas:c,texture:tx};
 applyDisplayCalibration(id);
 return mesh;
}
function applyDisplayCalibration(id){
 const d=displaySurfaces[id];if(!d)return;
 const v=displayCalibration.components[id],base=d.origin;
 d.mesh.position.set(base[0]+v.position.x,base[1]+v.position.y,base[2]+v.position.z);
 d.mesh.rotation.set(v.rotation.x*Math.PI/180,v.rotation.y*Math.PI/180,v.rotation.z*Math.PI/180,'XYZ');
 d.mesh.scale.set(v.scale.x,v.scale.y,1);
 if(id==='youtube'){d.mesh.position.x+=.04;d.mesh.position.y-=.01;d.mesh.scale.set(v.scale.x/.95,v.scale.y/1.7,1);}
 d.mesh.updateMatrixWorld(true);
 if(id==='youtube'){const btn=physicalButtons.find(v=>v.kind==='youtube');if(btn)btn.normalZ=d.mesh.position.z}
}
function updateCalibration(id,field,axis,value){
 const n=displayCal.normalize({components:{[id]:{...displayCalibration.components[id],
  [field]:{...displayCalibration.components[id][field],[axis]:value}}}});
 displayCalibration.components[id]=n.components[id];
 displayCal.save(displayCalibration);applyDisplayCalibration(id);
}
// Interactive media switches are real 3D meshes; no projected HTML rectangles.
// The YouTube target IS the calibrated visible decal. The radar switch has an
// actual bevelled body underneath the dashboard screen in the original mount.
function registerMediaButtons(){
 const youtube=displaySurfaces.youtube.mesh;
 const youtubeButton={name:'rc11-3d-youtube',kind:'youtube',label:'YouTube Music',mode:'media',mesh:youtube,
  material:youtube.material,normalZ:youtube.position.z,run:()=>{closeModal();action('music')}};
 youtubeButton.baseColor=youtube.material.color?.clone?.();
 physicalButtons.push(youtubeButton);
 const parent=mounts.parts.get('parking-monitor')?.content;
 if(!parent)throw Error('RC11 radar physical mount unavailable');
 const group=new T.Group();group.name='rc11-radar-switch-group';parent.add(group);
 const body=new T.Mesh(new T.CylinderGeometry(.033,.033,.014,36),
  new T.MeshStandardMaterial({color:'#3d7784',metalness:.24,roughness:.44,emissive:'#082b30',emissiveIntensity:.16}));
 body.rotation.x=Math.PI/2;body.name='rc11-3d-radar-button';group.add(body);
 const can=document.createElement('canvas');can.width=256;can.height=256;
 const cx=can.getContext('2d');cx.clearRect(0,0,256,256);
 cx.strokeStyle='#dffef7';cx.lineWidth=16;cx.lineCap='round';
 cx.beginPath();cx.arc(128,128,77,0,Math.PI*2);cx.stroke();
 cx.beginPath();cx.moveTo(128,48);cx.lineTo(128,207);cx.moveTo(47,128);cx.lineTo(207,128);cx.stroke();
 cx.fillStyle='#dffef7';cx.beginPath();cx.roundRect(110,94,36,69,10);cx.fill();
 const tex=new T.CanvasTexture(can);tex.colorSpace=T.SRGBColorSpace;
 const face=new T.Mesh(new T.PlaneGeometry(.052,.052),new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
 face.position.z=.009;face.raycast=()=>{};group.add(face);
 ui.radarGroup=group;ui.radarFace=face;
 const btn={name:'rc11-3d-radar-button',kind:'radar',label:'俯視雷達開關',mode:'radar',mesh:body,
  material:body.material,normalZ:body.position.z,baseColor:body.material.color.clone(),
  baseEmissive:body.material.emissive.clone(),baseEmissiveIntensity:body.material.emissiveIntensity,run:()=>action('radar')};
 physicalButtons.push(btn);
 applyRadarButtonCalibration();
}
function applyRadarButtonCalibration(){
 const r=ui.radarGroup;if(!r)return;
 const v=displayCalibration.controls.radarToggle;
 r.position.set(v.position.x,-.311+v.position.y,.115+v.position.z);
 r.rotation.set(v.rotation.x*Math.PI/180,v.rotation.y*Math.PI/180,v.rotation.z*Math.PI/180,'XYZ');
 r.scale.set(v.scale.x,v.scale.y,1);r.updateMatrixWorld(true);
}
function applyRestartButtonCalibration(...args){return TruckV6RestartCabinInstance().applyRestartButtonCalibration(...args)}

function applyNamedControlCalibration(key){
 if(key==='radarToggle')applyRadarButtonCalibration();
 else if(key==='restartButton')applyRestartButtonCalibration();
 else applyAllIconSizes();
}

function applyAllIconSizes(){
 for(const button of physicalButtons){
  if(!button.decal||!(button.name in displayCalibration.controls.iconSizes))continue;
  const k=displayCalibration.controls.iconSizes[button.name];
  button.decal.scale.set(k,k,1);button.decal.updateMatrixWorld(true);
 }
}
function updateControlCalibration(key,field,axis,value){
 const existingControl=displayCalibration.controls[key];
 const next=displayCal.normalize({components:displayCalibration.components,controls:{
  ...displayCalibration.controls,
  iconSizes:{...displayCalibration.controls.iconSizes,[key]:field==='icon'?value:displayCalibration.controls.iconSizes[key]},
  [key]:existingControl&&field!=='icon'?{...existingControl,[field]:{...existingControl[field],[axis]:value}}:existingControl
 }});
 displayCalibration=displayCal.save(next);
 applyNamedControlCalibration(key);
}

var TruckV6MusicCabinPrivate;function TruckV6MusicCabinInstance(){return TruckV6MusicCabinPrivate||(TruckV6MusicCabinPrivate=TruckV6MusicCabin.createMusicPlayerSystemCabin({get displaySurfaces(){return displaySurfaces},isYoutubePlaying:()=>window.TruckMusic?.isYoutubePlaying?.()}));}
function drawYoutube(...args){return TruckV6MusicCabinInstance().drawYoutube(...args)}
// Seven real RC15 physical switches: no HTML hitboxes or independent screen coordinates.
// The translucent artwork is printed directly onto each existing extruded Mesh's local face.
const physicalDefinitions=[
 {name:'control-switch-1',kind:'gear',label:'設定',mode:'door',run:()=>openModal('settings')},
 {name:'control-switch-2',kind:'location',label:'選關',mode:'door',run:()=>openModal('levels')},
 {name:'control-switch-3',kind:'exit',label:'下車',mode:'door',run:()=>action('view')},
 {name:'wheel-button-pad-left',kind:'lowbeam',label:'車燈',mode:'wheel',run:()=>action('lights')},
 {name:'wheel-button-pad-right',kind:'wiper',label:'雨刷',mode:'wheel',run:()=>action('wiper')},
 {name:'wheel-button-pad-left-lower',kind:'highbeam',label:'遠光',mode:'wheel',run:()=>action('high')},
 {name:'wheel-button-pad-right-lower',kind:'sliders',label:'模式',mode:'wheel',run:()=>openModal('mode')},
 {name:'steering-wheel-center-badge',kind:'horn',label:'喇叭',mode:'wheel',run:()=>horn()},
 {name:'shifter-3d-parking-brake',kind:'parking',label:'手剎車 B',mode:'brake',run:()=>action('brake')}
];
function drawPhysicalGlyph(ctx,kind){
 ctx.save();ctx.strokeStyle='#edfaff';ctx.fillStyle='#edfaff';ctx.lineWidth=7.5;ctx.lineCap='round';ctx.lineJoin='round';
 const stroke=(pts)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
 if(kind==='gear'){
  for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.fillRect(-7,-54,14,23);ctx.restore()}
  ctx.beginPath();ctx.arc(0,0,37,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';
 }else if(kind==='location'){
  stroke([[-52,-37],[-18,-47],[18,-33],[53,-44],[53,38],[18,48],[-18,34],[-52,45],[-52,-37]]);
  stroke([[-18,-45],[-18,35]]);stroke([[18,-32],[18,45]]);
  ctx.beginPath();ctx.arc(0,-12,17,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,-12,5,0,Math.PI*2);ctx.fill();
 }else if(kind==='exit'){
  stroke([[-42,-47],[5,-47],[5,45],[-42,45],[-42,-47]]);stroke([[-28,-33],[-3,-26],[-3,33],[-28,40]]);
  stroke([[12,0],[55,0]]);stroke([[38,-19],[57,0],[38,19]]);
 }else if(kind==='lowbeam'||kind==='highbeam'){
  ctx.beginPath();ctx.moveTo(-14,-36);ctx.bezierCurveTo(-50,-32,-50,32,-14,36);ctx.closePath();ctx.stroke();
  for(let i=-1;i<=1;i++){const y=i*22;stroke(kind==='lowbeam'?[[1,y-8],[52,y+3]]:[[1,y],[52,y]])}
 }else if(kind==='wiper'){
  ctx.beginPath();ctx.moveTo(-53,35);ctx.lineTo(-40,-40);ctx.quadraticCurveTo(0,-55,40,-40);ctx.lineTo(53,35);ctx.closePath();ctx.stroke();
  stroke([[-42,30],[40,-12]]);stroke([[0,32],[32,10]]);
 }else if(kind==='sliders'){
  for(let i=0;i<3;i++){const y=-33+i*33;stroke([[-52,y],[52,y]]);const x=[-19,19,-2][i];
   ctx.fillStyle='#d4fff9';ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#edfaff'}
 }else if(kind==='horn'){
  // Bold steering wheel horn silhouette: unmistakable even from the normal driving eye point.
  stroke([[-48,-18],[-18,-18],[12,-43],[12,43],[-18,18],[-48,18],[-48,-18]]);
  ctx.beginPath();ctx.moveTo(25,-30);ctx.quadraticCurveTo(53,0,25,30);ctx.stroke();
  ctx.beginPath();ctx.moveTo(41,-48);ctx.quadraticCurveTo(83,0,41,48);ctx.stroke();
 }
 ctx.restore();
}
function drawPhysicalArtwork(button){
 const c=button.canvas,x=TruckTextTexture.context(c),[w,h]=TruckTextTexture.size(c);x.clearRect(0,0,w,h);
 // A single oversized pictogram fills the native 3D key; readable text lives ONLY in the hover/hold tooltip.
 const isDoor=button.mode==='door';
 if(button.kind==='parking'){
  TruckV6BrakeCabin.drawParkingArtwork(x,w,h);
  button.texture.needsUpdate=true;return;
 }
 x.save();x.translate(w / 2,h / 2);x.scale(isDoor ? 5.2 : 4.55,isDoor ? 4.0 : 4.0);
 x.shadowColor='#244253';x.shadowBlur=2;
 drawPhysicalGlyph(x,button.kind);x.restore();
 button.texture.needsUpdate=true;
}

function createPhysicalButtons(){
 for(const def of physicalDefinitions){
  const mesh=local(def.name);if(!mesh?.geometry)throw Error('RC15 physical button missing: '+def.name);
  if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
  const box=mesh.geometry.boundingBox;
  const hd=def.mode==='brake';const canvas=hd?TruckTextTexture.canvas(1024,256):document.createElement('canvas');if(!hd){canvas.width=def.mode==='door'?1024:768;canvas.height=512;}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  if(hd)TruckTextTexture.configure(T,texture);else texture.anisotropy=renderer.capabilities?.getMaxAnisotropy?.()??1;
  const geometry=new T.PlaneGeometry((box.max.x-box.min.x)*.84,(box.max.y-box.min.y)*.86);
  const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
  const decal=new T.Mesh(geometry,material);
  decal.name='printed-glyph-'+def.name;
  decal.position.set((box.min.x+box.max.x)/2,(box.min.y+box.max.y)/2,box.max.z+.0025);
  // Crucially, preserve the RC15 body, geometry, mount transforms and wheel parenting.
  decal.raycast=()=>{};mesh.add(decal); // hits must resolve to the REAL body Mesh, never the label
  const button={...def,mesh,decal,canvas,texture,normalZ:mesh.position.z,normalMaterial:mesh.material};
  if(mesh.material?.clone){mesh.material=mesh.material.clone()}
  button.material=mesh.material;
  button.baseColor=mesh.material?.color?.clone?.();
  button.baseEmissive=mesh.material?.emissive?.clone?.();
  button.baseEmissiveIntensity=mesh.material?.emissiveIntensity??0;
  physicalButtons.push(button);drawPhysicalArtwork(button);
 }
}
// RC33: use the unmodified, bevelled gray pad's projected silhouette. Cache
// local vertices once and only project again when the mesh or camera moves.


var TruckV6WiperCabinPrivate;function TruckV6WiperCabinInstance(){return TruckV6WiperCabinPrivate||(TruckV6WiperCabinPrivate=TruckV6WiperCabin.createWiperSystemCabin({get b(){return b},get camera(){return camera},get interactionCal(){return interactionCal},get mounts(){return mounts},get physicalButtons(){return physicalButtons},get physicalPressed(){return physicalPressed},get T(){return T},get ui(){return ui},get worldH(){return worldH},get worldW(){return worldW}}));}
function wiperHitCorners(...args){return TruckV6WiperCabinInstance().wiperHitCorners(...args)}
// Transparent SVG only routes input at the exact projected pad, not a second
// button artwork. Its parent ignores pointer events; only the polygon accepts them.
function updateWiperHitPreview(...args){return TruckV6WiperCabinInstance().updateWiperHitPreview(...args)}
// RC28: glossy red 3D restart button at the player-marked dashboard position.
// This is not an HTML overlay and it does not move the approved RC15 controls.

var TruckV6RestartCabinPrivate;function TruckV6RestartCabinInstance(){return TruckV6RestartCabinPrivate||(TruckV6RestartCabinPrivate=TruckV6RestartCabin.createRestartSystemCabin({get action(){return action},get displayCalibration(){return displayCalibration},get mounts(){return mounts},get physicalButtons(){return physicalButtons},get T(){return T},get ui(){return ui}}));}
function create3dRestartButton(...args){return TruckV6RestartCabinInstance().create3dRestartButton(...args)}
// A real bevelled 3D switch on the existing RC15 shifter pedestal's lower strip.
// Its parent is the approved gear-selector-model: the pedestal, pose, layout JSON
// and native knob mesh are never moved or reconstructed.

var TruckV6BrakeCabinPrivate;function TruckV6BrakeCabinInstance(){return TruckV6BrakeCabinPrivate||(TruckV6BrakeCabinPrivate=TruckV6BrakeCabin.createParkingBrakeSystemCabin({get brakeAdjustment(){return brakeAdjustment},get local(){return local},get mounts(){return mounts},get physicalButtons(){return physicalButtons},get physicalHover(){return physicalHover},get physicalPressed(){return physicalPressed},get setPhysicalFeedback(){return setPhysicalFeedback},get T(){return T}}));}
function create3dParkingBrake(...args){return TruckV6BrakeCabinInstance().create3dParkingBrake(...args)}
// RC7 tuner adjusts ONLY the new switch's local transform under the existing selector.
// The approved RC15 pedestal, selector mount, camera, and all other meshes are untouched.
function applyParkingBrakeCalibration(...args){return TruckV6BrakeCabinInstance().applyParkingBrakeCalibration(...args)}
function update3dParkingBrake(...args){return TruckV6BrakeCabinInstance().update3dParkingBrake(...args)}
function refreshPhysicalButtonLabels(s){
 const door=physicalButtons.find(o=>o.name==='control-switch-3');if(!door)return;
 const desired=s.view===3?'上車':'下車';
 if(door.label!==desired)door.label=desired;
 const current=physicalPressed?.button||physicalHover;
 if(current&&ui.tooltip&&!ui.tooltip.hidden){const next=interactionCal.label(current,s.environment);if(ui.tooltip.textContent!==next)ui.tooltip.textContent=next;}
}
function setPhysicalFeedback(button,level){
 if(button?.vehicleMesh)return;
 if(!button)return;
 button.mesh.position.z=button.normalZ-(level===2?.006:0);
 if(button.material?.emissive){
  if(level)button.material.emissive.set('#3d8588');
  else if(button.baseEmissive)button.material.emissive.copy(button.baseEmissive);
  button.material.emissiveIntensity=level===2?.73:level===1?.48:button.baseEmissiveIntensity;
 }
 if(button.material?.color&&button.baseColor){
  button.material.color.copy(button.baseColor);
  if(level)button.material.color.lerp(new T.Color('#e6f3fd'),level===2?.24:.16);
 }
}
function cancelPhysicalLongPress(){if(physicalLongPressTimer!==null){clearTimeout(physicalLongPressTimer);physicalLongPressTimer=null}}
function hidePhysicalTooltip(){clearTimeout(physicalTooltipHideTimer);physicalTooltipHideTimer=null;if(ui.tooltip)ui.tooltip.hidden=true}
function showPhysicalTooltip(button,e){
 if(!button||!ui.tooltip)return;
 clearTimeout(physicalTooltipHideTimer);physicalTooltipHideTimer=null;
 const rect=host.getBoundingClientRect(),rotated=document.body.classList.contains('mobile-rotated');
 const {x,y}=rotated?b.point(e):{x:e.clientX-rect.left,y:e.clientY-rect.top};
 const width=rotated?host.clientWidth:rect.width,height=rotated?host.clientHeight:rect.height;
 ui.tooltip.textContent=interactionCal.label(button,b.snapshot().environment);
 ui.tooltip.style.left=cl(x,42,Math.max(42,width-42))+'px';
 ui.tooltip.style.top=cl(y-18,46,Math.max(46,height-16))+'px';
 ui.tooltip.hidden=false;
}
function schedulePhysicalTooltipHide(delay=0){
 clearTimeout(physicalTooltipHideTimer);
 if(delay)physicalTooltipHideTimer=setTimeout(()=>{physicalTooltipHideTimer=null;hidePhysicalTooltip()},delay);
 else hidePhysicalTooltip();
}
// RC35: SVG is a local input surface for the wiper only. Never query SVG
// geometry or change raycasting for other controls, even if the wiper fails.
function wiperTarget(...args){return TruckV6WiperCabinInstance().wiperTarget(...args)}
function pickPhysicalButton(e){
 if(!document.body.classList.contains('cabin3d-ready')||!(isCar()?car?.root.visible:mounts?.root.visible)||(ui.modal?.classList.contains('open'))||b.snapshot().view!==0)return null;
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;
 if(document.body.classList.contains('mobile-rotated')){const p=b.point(e);pointerNdc.set(2*p.x/canvas.clientWidth-1,1-2*p.y/canvas.clientHeight)}
 else pointerNdc.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
 camera.updateMatrixWorld();mounts.root.updateWorldMatrix(true,true);
 raycaster.setFromCamera(pointerNdc,camera);
 if(isCar()){const mesh=car&&K13LiveDisplay.pick(car,raycaster);return carButtons.find(x=>x.mesh===mesh)||null;}
 // RC35: original RC32 non-wiper raycast. Rain uses its own DOM target.
 const intersections=raycaster.intersectObjects(physicalButtons.filter(x=>x.kind!=='wiper').map(x=>x.mesh),false);
 return physicalButtons.find(x=>x.mesh===intersections[0]?.object)||null;
}
// The shifter knob is the sole drag target. Pointer movement is measured
// along the projected 3D gear-track axis, so perspective and screen size
// do not affect selection (including mobile landscape).

var TruckV6TransmissionCabinPrivate;function TruckV6TransmissionCabinInstance(){return TruckV6TransmissionCabinPrivate||(TruckV6TransmissionCabinPrivate=TruckV6TransmissionCabin.createTransmissionSystemCabin({get action(){return action},get b(){return b},get camera(){return camera},get canvas(){return canvas},get cl(){return cl},get hidePhysicalTooltip(){return hidePhysicalTooltip},get local(){return local},get mounts(){return mounts},get dragRoot(){return isCar()?car?.root:mounts.root},get dragLocal(){return isCar()?n=>car?.root.getObjectByName(n):local},get dragTolerance(){return isCar()?5:0},get physicalHover(){return physicalHover},set physicalHover(value){physicalHover=value},get pointerNdc(){return pointerNdc},get raycaster(){return raycaster},get setPhysicalFeedback(){return setPhysicalFeedback},get T(){return T},get ui(){return ui},get worldH(){return worldH},get worldW(){return worldW}}));}
function pickShifterKnob(e){return TruckV6TransmissionCabinInstance().pickShifterKnob(e)}
function gearAxisInPixels(...args){return TruckV6TransmissionCabinInstance().gearAxisInPixels(...args)}
function startShifterDrag(e){return TruckV6TransmissionCabinInstance().startShifterDrag(e)}
function moveShifterDrag(e){return TruckV6TransmissionCabinInstance().moveShifterDrag(e)}
function finishShifterDrag(e,cancel=false){return TruckV6TransmissionCabinInstance().finishShifterDrag(e,cancel)}
function ownsGear(id){return TruckV6TransmissionCabinInstance().ownsPointer(id)}
function initPhysicalPointerInput(){
 const surface=$('scene');
 const consume=e=>{e.preventDefault();e.stopImmediatePropagation()};
 const resetPress=()=>{
  cancelPhysicalLongPress();setPhysicalFeedback(physicalPressed?.button,0);physicalPressed=null;
 };
 const startPress=(e,nativeWiper=false)=>{
  if(e.button!==0 && e.pointerType==='mouse')return;
  if(!nativeWiper&&startShifterDrag(e)){consume(e);return;}
  const button=nativeWiper?wiperTarget(e):pickPhysicalButton(e);if(!button)return;
  cancelPhysicalLongPress();hidePhysicalTooltip();
  physicalPressed={button,id:e.pointerId,x:e.clientX,y:e.clientY,longPress:false,moved:false,start:performance.now(),pointerType:e.pointerType,nativeWiper};
  setPhysicalFeedback(button,2);
  if(e.pointerType==='touch'){
   const startId=e.pointerId,x=e.clientX,y=e.clientY;
   physicalLongPressTimer=setTimeout(()=>{
    physicalLongPressTimer=null;
    if(!physicalPressed||physicalPressed.id!==startId||physicalPressed.moved)return;
    physicalPressed.longPress=true;
    setPhysicalFeedback(button,1);
    showPhysicalTooltip(button,{clientX:x,clientY:y});
   },PHYSICAL_LONG_PRESS_MS);
  }
  consume(e);
 };
 surface.addEventListener('pointerdown',e=>startPress(e),true);
 TruckV6WiperCabinInstance().surface().addEventListener('pointerdown',e=>startPress(e,true),true);
 window.addEventListener('pointermove',e=>{
  if(ownsGear(e.pointerId)){moveShifterDrag(e);consume(e);return;}
  if(physicalPressed?.id===e.pointerId){
   if(Math.hypot(e.clientX-physicalPressed.x,e.clientY-physicalPressed.y)>14){
    physicalPressed.moved=true;cancelPhysicalLongPress();hidePhysicalTooltip();
   }
   consume(e);return;
  }
  if((e.target!==surface&&e.target!==TruckV6WiperCabinInstance().surface())||e.pointerType==='touch'){
   setPhysicalFeedback(physicalHover,0);physicalHover=null;surface.style.cursor='';hidePhysicalTooltip();return;
  }
  const hovered=e.target===TruckV6WiperCabinInstance().surface()?wiperTarget(e):pickPhysicalButton(e);
  if(hovered!==physicalHover){setPhysicalFeedback(physicalHover,0);physicalHover=hovered;setPhysicalFeedback(hovered,1)}
  surface.style.cursor=hovered?'pointer':pickShifterKnob(e)?'grab':'';
  if(hovered)showPhysicalTooltip(hovered,e);else hidePhysicalTooltip();
 },true);
 window.addEventListener('pointerup',e=>{
  if(ownsGear(e.pointerId)){finishShifterDrag(e);consume(e);return;}
  if(!physicalPressed||physicalPressed.id!==e.pointerId)return;
  const p=physicalPressed;
  const wasLongPress=(p.button.longRun&&performance.now()-p.start>=PHYSICAL_LONG_PRESS_MS)||p.longPress||(p.pointerType==='touch'&&performance.now()-p.start>=PHYSICAL_LONG_PRESS_MS);
  const valid=!p.moved&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<=18&&(p.nativeWiper?document.elementFromPoint(e.clientX,e.clientY)===TruckV6WiperCabinInstance().surface()&&wiperTarget({target:TruckV6WiperCabinInstance().surface()})===p.button:pickPhysicalButton(e)===p.button);
  resetPress();consume(e);
  if(wasLongPress){
   if(valid&&p.button.longRun)p.button.longRun();
   if(p.pointerType==='touch'&&valid)showPhysicalTooltip(p.button,e);
   schedulePhysicalTooltipHide(900);
  }else{
   hidePhysicalTooltip();
   if(valid&&(p.button.kind!=='radar'||b.snapshot().difficultyMode===0))p.button.run();
   // A mouse still hovering above the same real Mesh should remain highlighted after release.
   if(valid&&p.pointerType==='mouse'&&(p.nativeWiper?wiperTarget(e)===p.button:pickPhysicalButton(e)===p.button)){
    physicalHover=p.button;setPhysicalFeedback(p.button,1);showPhysicalTooltip(p.button,e);
   }else{setPhysicalFeedback(physicalHover,0);physicalHover=null}
  }
 },true);
 window.addEventListener('pointercancel',e=>{
  if(ownsGear(e.pointerId)){finishShifterDrag(e,true);consume(e);return;}
  if(physicalPressed?.id!==e.pointerId)return;
  resetPress();hidePhysicalTooltip();consume(e);
 },true);
 surface.addEventListener('click',e=>{if(pickPhysicalButton(e)||pickShifterKnob(e))consume(e)},true);
 TruckV6WiperCabinInstance().surface().addEventListener('click',e=>{if(wiperTarget(e))consume(e)},true);
 TruckV6WiperCabinInstance().surface().addEventListener('contextmenu',e=>{if(wiperTarget(e))consume(e)},true);
 surface.addEventListener('contextmenu',e=>{if(pickPhysicalButton(e))consume(e)},true);
 window.addEventListener('blur',()=>{
  resetPress();carGearDrag=null;TruckV6TransmissionCabinInstance().cancelDrag();setPhysicalFeedback(physicalHover,0);physicalHover=null;hidePhysicalTooltip();surface.style.cursor='';
 });
}

// Retain the original RC15 label planes. Only update their canvas artwork,
// move the lettering DOWN within each face and print Q/A/Z beside D/N/R.
function syncShifterLabels(...args){return TruckV6TransmissionCabinInstance().syncShifterLabels(...args)}
// RC27: the A-pillar weather card is a slow-moving 3D hanging ornament.
// The hole is real ShapeGeometry (not just a painted dot); cord/eyelet are meshes.
// Only this card moves: shell, A-pillar, camera and approved weather contents stay as-is.

var TruckV6WeatherCabinPrivate;function TruckV6WeatherCabinInstance(){return TruckV6WeatherCabinPrivate||(TruckV6WeatherCabinPrivate=TruckV6WeatherCabin.createWeatherDisplaySystemCabin({get normalizeMirrorUV(){return normalizeMirrorUV},get shell(){return shell},get T(){return T},get ui(){return ui}}));}
function createPillarHud(...args){return TruckV6WeatherCabinInstance().createPillarHud(...args)}
function updatePillar(...args){return TruckV6WeatherCabinInstance().updatePillar(...args)}
function initUi(){
 host.hidden=false;
 const nav=add(host,'div','cabProbeNav');ui.probeNav=nav;
 const navButtons=add(nav,'div',null,'','cab-probe-buttons');
 for(const [d,t] of [[-180,'1 左探180°'],[0,'2 回正'],[90,'3 右看90°（座內）']]){
  const bt=add(navButtons,'button',`cabLook${d}`,t,'cab-control');on(bt,()=>b.setLook(d));
 }
 const sliderRow=add(nav,'div',null,'','cab-angle');
 ui.angleSlider=add(sliderRow,'input','cabAngleSlider');ui.angleSlider.type='range';ui.angleSlider.min='-180';ui.angleSlider.max='90';ui.angleSlider.step='1';ui.angleSlider.value='0';ui.angleSlider.setAttribute('aria-label','目前左探頭、右探頭角度');
 ui.angleValue=add(sliderRow,'output','cabAngleValue','回正 0°');
 ui.angleSlider.addEventListener('input',()=>b.setLook(+ui.angleSlider.value));
 const mission=add(host,'div','cabMission');ui.missionTitle=add(mission,'strong',null,'');ui.missionText=add(mission,'small',null,'');
 ui.weather=add(host,'div','cabWeather','');ui.weather.innerHTML='<svg viewBox="0 0 48 38" aria-hidden="true"><circle class="wx-sun" cx="16" cy="14" r="7" fill="#ffdb85"/><path class="wx-cloud" d="M12 24 Q9 17 17 15 Q20 6 30 11 Q39 10 39 20 Q44 27 35 29 H17 Q11 29 12 24" fill="#d8e7f2"/><path class="wx-rain" d="M19 30l-2 5M28 30l-2 5M37 30l-2 5" stroke="#8ae0f9" stroke-width="2.3"/></svg><span></span>';
 ui.weatherText=ui.weather.querySelector('span');
 ui.danger=add(host,'div','cabDanger','');ui.danger.hidden=true;
 ui.help=add(host,'button','cabHelp','?','cab-control');on(ui.help,()=>openModal('help'));
 add(host,'span','cabBrand','TERMINAL DRIVER · v6.0.0-alpha.REBUILD-DEV.17-P09-RC13');
 const make=(id,title,func,cls='')=>{const btn=add(host,'button',id,title,'cab-physical '+cls);btn.title=title;btn.setAttribute('aria-label',title);on(btn,func);return btn};
 ui.returnCab=add(host,'button','cabReturn','上車','cab-control');on(ui.returnCab,()=>action('view'));
 // The seven physical door/wheel switches are Three.js meshes, not HTML buttons.
 ui.tooltip=add(host,'div','cabPhysicalTooltip','','cab-physical-tooltip');ui.tooltip.hidden=true;ui.tooltip.setAttribute('role','tooltip');
 // 21-1 and 30-1 are genuine raycasted 3D surfaces (registered in registerMediaButtons).
 // 16 and 20 are now real Three.js meshes; no floating HTML gear or brake hit areas.
 registry.invoke("mirror","mountControls",host);registry.invoke("radar","mount",host);
 window.TruckPerformance?.mountCabinHud?.(host);
 TruckV6WiperCabinInstance().mount(host);
 // Interaction calibration UI removed; approved defaults and all hit testing retained.
 ui.coachBar=add(host,'div','cabCoachBar','','cab-coachbar');ui.coachBar.hidden=true;
 ui.coachStatus=add(ui.coachBar,'span','cabCoachStatus','教練示範');
 const coachPauseBtn=add(ui.coachBar,'button','cabCoachPause','暫停','cab-control');on(coachPauseBtn,()=>action('pause'));
 const coachReplayBtn=add(ui.coachBar,'button','cabCoachReplay','重播','cab-control');on(coachReplayBtn,()=>action('replay'));
 const coachSpeed=add(ui.coachBar,'select','cabCoachSpeed');for(const v of ['0.5','1','2','4']){const opt=new Option(v+'×',v);coachSpeed.add(opt)}
 coachSpeed.addEventListener('change',()=>action('coachSpeed',coachSpeed.value));
 const coachPracticeBtn=add(ui.coachBar,'button','cabCoachPractice','自己練習','cab-control');on(coachPracticeBtn,()=>action('practice'));
 ui.modal=add(host,'div','cabModal');
 const card=add(ui.modal,'div',null,'','cab-dialog');const header=add(card,'header');ui.modalTitle=add(header,'h3',null,'');const close=add(header,'button',null,'✕');on(close,closeModal);
 ui.modalBody=add(card,'div',null,'','cab-dialog-body');
 ui.modal.addEventListener('pointerdown',e=>{if(e.target===ui.modal)closeModal()});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&ui.modal.classList.contains('open'))closeModal()});
 if(window.TruckMobileCabin)window.TruckMobileCabin.install({host,b,surface:$('scene'),wiper:TruckV6WiperCabinInstance().surface(),pick:pickPhysicalButton,wiperTarget,startShifterDrag,moveShifterDrag,finishShifterDrag,ownsGear,cancelGear:()=>{carGearDrag=null;TruckV6TransmissionCabinInstance().cancelDrag()},lookAllowed:()=>b.lookAllowed(),cl});else initPhysicalPointerInput();
 // Three.js viewport has pointer-events:none; front-world drags only turn the head when safe.
 if(!window.TruckMobileCabin){let drag=null;$('scene').addEventListener('pointerdown',e=>{
  if(!b.lookAllowed()||!document.body.classList.contains('cabin3d-ready')||e.target!==$('scene'))return;
  const pt=b.point(e);drag={id:e.pointerId,x:pt.x,y:pt.y,value:b.snapshot().targetProbe};
 });
 window.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;
  const pt=b.point(e),next=cl(drag.value+(pt.x-drag.x)*.28,-180,90);b.setLook(next);
 });
 for(const t of ['pointerup','pointercancel'])window.addEventListener(t,e=>{if(drag?.id===e.pointerId)drag=null});}
}
function row(parent){return add(parent,'div',null,'','cab-row')}
function btn(parent,title,fn){const e=add(parent,'button',null,title);on(e,fn);return e}
function sub(parent,title){add(parent,'h4',null,title)}

var TruckV6SettingsCabinPrivate;function TruckV6SettingsCabinInstance(){return TruckV6SettingsCabinPrivate||(TruckV6SettingsCabinPrivate=TruckV6SettingsCabin.createSettingsSystemCabin({get action(){return action},get add(){return add},get b(){return b},get btn(){return btn},get mirrorCabin(){return mirrorCabin},get paint(){return currentPaint()},get row(){return row},get sub(){return sub},get ui(){return ui}}));}
function closeModal(...args){return TruckV6SettingsCabinInstance().closeModal(...args)}
function optionSelect(...args){return TruckV6SettingsCabinInstance().optionSelect(...args)}
function renderSettings(...args){return TruckV6SettingsCabinInstance().renderSettings(...args)}
function openModal(...args){return TruckV6SettingsCabinInstance().openModal(...args)}

var TruckV6HornCabinPrivate;function TruckV6HornCabinInstance(){return TruckV6HornCabinPrivate||(TruckV6HornCabinPrivate=TruckV6HornCabin.createAudioSystemCabin({get b(){return b},get ui(){return ui}}));}
function horn(...args){return TruckV6HornCabinInstance().horn(...args)}
function position(el,obj,offX=0,offY=0,scale=1){
 if(!el||!obj||!obj.visible){if(el)el.style.display='none';return}
 obj.updateWorldMatrix?.(true,false);
 const v=obj.getWorldPosition(new T.Vector3());v.x+=offX;v.y+=offY;
 const center=v.clone().project(camera);
 if(center.z<=-1||center.z>=1||Math.abs(center.x)>1.1||Math.abs(center.y)>1.1){el.style.display='none';return}
 el.style.display='flex';el.style.left=((center.x+1)*.5*worldW)+'px';el.style.top=((1-center.y)*.5*worldH)+'px';
 // The model meshes, not short text labels, define the clickable hit area.
 if(el.classList.contains('cab-physical')&&obj.geometry){
  const geo=obj.geometry;if(!geo.boundingBox)geo.computeBoundingBox();
  const bb=geo.boundingBox,p=bb.min,q=bb.max;let loX=1e9,loY=1e9,hiX=-1e9,hiY=-1e9;
  for(const x of [p.x,q.x])for(const y of [p.y,q.y])for(const z of [p.z,q.z]){
   const corner=new T.Vector3(x,y,z).applyMatrix4(obj.matrixWorld).project(camera);
   if(corner.z>=1||corner.z<=-1)continue;
   const X=(corner.x+1)*.5*worldW,Y=(1-corner.y)*.5*worldH;
   loX=Math.min(loX,X);loY=Math.min(loY,Y);hiX=Math.max(hiX,X);hiY=Math.max(hiY,Y);
  }
  if(loX!==1e9){
   let width=Math.max(34,hiX-loX+12),height=Math.max(31,hiY-loY+11);
   if(el.classList.contains('cab-mirror-hit')){width=Math.max(45,hiX-loX);height=Math.max(55,hiY-loY)}
   el.style.left=(loX+hiX)/2+'px';el.style.top=(loY+hiY)/2+'px';el.style.width=width+'px';el.style.height=height+'px';
  }
 }
}
function pointAt(el,id,x,y,z){const ref=mounts.parts.get(id)?.group;if(!ref)return;
 const q=new T.Vector3(x,y,z);ref.localToWorld(q);const dummy={visible:true,getWorldPosition(v){return v.copy(q)}};position(el,dummy);
}
const mobileProjectedBounds=mesh=>{if(!mesh?.geometry)return null;mesh.updateWorldMatrix(true,false);const box=mesh.geometry.boundingBox|| (mesh.geometry.computeBoundingBox(),mesh.geometry.boundingBox);let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new T.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(camera);if(v.z<=-1||v.z>=1)continue;const px=(v.x+1)*worldW/2,py=(1-v.y)*worldH/2;x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);}return {x:(x0+x1)/2,y:(y0+y1)/2,w:x1-x0,h:y1-y0}};
function updateAnchors(s){
 const active=s.view===0;

 if(isCar())TruckV6WiperCabinInstance().surface().style.display='none';else updateWiperHitPreview(s);
 window.TruckPerformance?.setCabinHudActive?.(active);
 if(!active||ui.modal?.classList.contains('open')){setPhysicalFeedback(physicalHover,0);physicalHover=null;hidePhysicalTooltip()}
 document.body.classList.toggle('cab-inspecting',s.view===3);
 ui.probeNav.hidden=s.view===3;
 const mobileHints=(globalThis.document?.body?.classList.contains('mobile-game')||!!globalThis.matchMedia?.('(pointer:coarse)')?.matches);
 if(ui.mobileHints!==mobileHints){
  ui.mobileHints=mobileHints;
  for(const [id,desktop,touch] of [['cabLook-180','1 左探180°','左探180°'],['cabLook0','2 回正','回正'],['cabLook90','3 右看90°（座內）','右看90°（座內）']]){const el=$(id);if(el)el.textContent=mobileHints?touch:desktop}
  const brake=physicalButtons.find(o=>o.kind==='parking');if(brake){brake.label=mobileHints?'手剎車':'手剎車 B';drawPhysicalArtwork(brake)}
 }
 ui.returnCab.style.display=s.view===3?'block':'none';
 ui.angleSlider.disabled=!active||!b.lookAllowed();
 ui.angleSlider.setAttribute('aria-disabled',String(ui.angleSlider.disabled));
 if(isCar()){carPublisher?.updateAnchors(s);ui.weather.style.display='none';const orientation=$('cabRadarOrientation');if(orientation)orientation.style.display='none';if(window.TruckMobileCabin)window.TruckMobileCabin.anchors(s,carButtons.map(button=>({...button,visible:active&&Math.abs(s.probe)<1&&(button.kind!=='radar'||s.difficultyMode===0),bounds:()=>mobileProjectedBounds(button.mesh)})),mobileProjectedBounds(car?.root.getObjectByName('shifter-knob')));return;}
 refreshPhysicalButtonLabels(s);
 registry.invoke("mirror","updateAnchors",s);registry.invoke("radar","anchor",s);
 {const p=new T.Vector3(1.52,1.30,-1.37);position(ui.weather,{visible:true,getWorldPosition(v){return v.copy(p)}})}
 if(!active)ui.weather.style.display='none';
 const radar=physicalButtons.find(v=>v.kind==='radar');
 if(radar){radar.mesh.parent.visible=active;radar.mesh.material.color.set(s.radarEnabled?'#53b5a1':'#3d7784');
  radar.baseColor?.set(s.radarEnabled?'#53b5a1':'#3d7784');}
 refreshPhysicalButtonLabels(s);
 if(window.TruckMobileCabin){window.TruckMobileCabin.anchors(s,physicalButtons.filter(button=>button.mode==='door'||['parking','radar','youtube'].includes(button.kind)).map(button=>({kind:button.kind,mode:button.mode,label:button.label,run:button.run,visible:active&&mounts.root.visible&&Math.abs(s.probe)<1&&(button.kind!=='radar'||s.difficultyMode===0),bounds:()=>mobileProjectedBounds(button.mesh)})),mobileProjectedBounds(local('shifter-knob')));}


}

var TruckV6InstrumentCabinPrivate;function TruckV6InstrumentCabinInstance(){return TruckV6InstrumentCabinPrivate||(TruckV6InstrumentCabinPrivate=TruckV6InstrumentCabin.createInstrumentSystemCabin({get cl(){return cl},get displaySurfaces(){return displaySurfaces}}));}
function drawSpeedometer(...args){return TruckV6InstrumentCabinInstance().drawSpeedometer(...args)}
function drawInstrument(...args){return TruckV6InstrumentCabinInstance().drawInstrument(...args)}
function updateWeather(...args){return TruckV6WeatherCabinInstance().updateWeather(...args)}

var TruckV6CoachCabinPrivate;function TruckV6CoachCabinInstance(){return TruckV6CoachCabinPrivate||(TruckV6CoachCabinPrivate=TruckV6CoachCabin.createCoachSystemCabin({get $(){return $},get ui(){return ui}}));}
function updateCoach(...args){return TruckV6CoachCabinInstance().updateCoach(...args)}
function updateHud(s){updateCoach(s);ui.angleSlider.value=String(Math.round(s.probe));
 ui.angleValue.textContent=s.probe<-.5?`左探 ${Math.round(-s.probe)}°`:s.probe>.5?`右探 ${Math.round(s.probe)}°`:'回正 0°';
 for(const [d,elid] of [[-180,'cabLook-180'],[0,'cabLook0'],[90,'cabLook90']]){
  const el=$(elid);if(el)el.classList.toggle('active',Math.abs(s.targetProbe-d)<1)}
 ui.missionTitle.textContent=s.missionTitle;ui.missionText.textContent=s.missionText;
 ui.danger.hidden=!Number.isFinite(s.nearGap)||s.nearGap>1.2;
 if(!ui.danger.hidden)ui.danger.textContent=`障礙物接近 ${s.nearGap.toFixed(2)} m`;
 if(!isCar()){updateWeather(s);updatePillar(s);drawInstrument(s);registry.invoke("radar","update",s);}
}
function renderCabin(visible){cssText.prepare(scene,camera,visible,worldW,worldH);try{if(visible)renderer.render(scene,camera);else renderer.clear();}finally{cssText.finish();}}
function resize(){const w=document.body.clientWidth||innerWidth,h=document.body.clientHeight||innerHeight;
 const qualityId=b.snapshot().quality;
 const pixelRatio=Math.max(.5,Math.min(window.devicePixelRatio||1,quality[qualityId]??1)*contextScale);
 if(w===worldW&&h===worldH&&Math.abs(pixelRatio-appliedPixelRatio)<.015)return;
 const sizeChanged=w!==worldW||h!==worldH;worldW=w;worldH=h;appliedPixelRatio=pixelRatio;
 renderer.setPixelRatio(pixelRatio);renderer.setSize(w,h,false);
 if(sizeChanged){camera.aspect=w/h;camera.updateProjectionMatrix();}
}
function tick(ms){if(window.TruckCabinStartup?.isCancelled?.()){stopFor2D();return;}if(!alive)return;requestAnimationFrame(tick);if(window.TruckVehicleCabins?.isOpen()||ms-last3d<29)return;last3d=ms;
 try{
 const s=b.snapshot();resize();frame++;
 if(s.vehicleId!=='truck'){carFrame(s,ms);return;}
 if(car){releaseCar();mirrorCabin.mount();mirrorCabin.mountControls(host);camera.fov=params.camera.fov;camera.updateProjectionMatrix();}
 // The RC15 camera, shell and model geometry are unchanged at all view angles.
 const pose=M.eyePose(s.probe,params.camera.position,params);
 camera.position.set(pose.x,pose.y,pose.z);camera.rotation.set(params.camera.pitch,pose.yaw,0,'YXZ');
 const visible=s.view===0;shell.visible=visible;mounts.root.visible=visible;
 registry.invoke("mirror","updateVisibility",s);
 const wheel=local('steering-wheel-assembly');if(wheel)wheel.rotation.z=-s.steer/.59*.62;
 const knob=local('shifter-knob-carrier');if(knob&&!TruckV6TransmissionCabinInstance().isDragging())knob.position.y=s.gear*.085;
 syncShifterLabels(s.gear);update3dParkingBrake(s.hand);
 // The startup gate opens after this render. Upload actual game HUD/radar and
 // current mirror caches BEFORE that first visible frame, not one frame late.
 if(ms-lastHud>=75||!first3dFrame){updateHud(s);lastHud=ms}
 registry.invoke("mirror","update",s);
 TruckV6WeatherCabinInstance().rotate(ms);
 TruckV6MusicCabinInstance().updateYoutubeWave(ms);
  if(window.TruckMobileCabin&&visible&&Math.abs(s.probe)<1){camera.updateMatrixWorld();window.TruckMobileCabin.fitRadar(ui.radarGroup,()=>mobileProjectedBounds(physicalButtons.find(x=>x.kind==='radar')?.mesh),worldW,worldH);}
  const __webglStart=performance.now();renderCabin(visible);window.TruckRenderDiagnostics?.sample('webglMs',performance.now()-__webglStart);
 updateAnchors(s);
 if(!first3dFrame && window.__truck2DFrameSeen){
  first3dFrame=true;document.body.classList.add('cabin3d-ready');
  window.TruckCabinStartup?.ready();
 }
 }catch(e){if(contextLost){console.warn('RC15 render paused for WebGL context recovery',e);return;}alive=false;console.error('RC15 rendering failed',e);window.TruckCabinStartup?.fail(e)}
}
function init(){try{
 if(window.TruckCabinStartup?.isCancelled?.())return;
 init3d();initUi();resize();host.hidden=false;
 window.TruckCabinView={active:true,stopFor2D,paint,renderer,scene,camera,mounts,shell,version:'6.0.0-alpha.REBUILD-DEV.17-P09-RC13',getDeviceDiagnostics:()=>registry.status(),getQualityDiagnostics:()=>({tier:b.snapshot().quality,webglPixelRatio:appliedPixelRatio,mirrorFrames:frame,contextLossCount}),displaySurfaces,getTextDiagnostics:()=>cssText.diagnostics(),getDisplayCalibration:()=>displayCal.normalize(displayCalibration),physicalButtons,getBrakeCalibration:()=>TruckV6BrakeCabinInstance().getCalibration(),getState:()=>b.snapshot(),getPaint:()=>currentPaint().get(),getInteractionCalibration:()=>interactionCal.normalize(interactionCalibration),getWiperHitCorners:()=>wiperHitCorners()?.map(p=>({x:p.x,y:p.y,z:p.z}))||null};
 requestAnimationFrame(tick);
 }catch(e){console.error('RC15 integration failed',e);cssText?.dispose();TruckTextTexture.disableCapture();if(renderer)renderer.dispose();document.body.classList.remove('cabin3d-ready');host.hidden=true;window.TruckCabinStartup?.fail(e);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
