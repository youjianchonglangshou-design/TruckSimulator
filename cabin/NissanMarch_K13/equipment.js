/* K13 adjustable equipment adapter. Original TruckCabinMounts + original glyph/restart/radar/YouTube source. */
(function(g){'use strict';
const names={'control-bank':'左門三鍵｜設定／選關／下車','steering-wheel-cluster':'方向盤','base-dashboard':'基座平台','gear-selector':'排檔桿','instrument-bay':'HUD 儀表板','parking-monitor':'倒車雷達螢幕','youtube-radio':'YouTube 音響','restart':'重來按鈕','radar':'雷達開關','peek':'探頭控制／滑桿','weather':'天氣公仔','mode-select':'模式選擇','rear-distance':'後端距離（中央後照鏡下方）','timer':'用時＋碰撞次數 HUD','parking-brake':'手剎車'};
const blank=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}});
const clamp=(v,a,b,d)=>typeof v==='number'&&Number.isFinite(v)?Math.min(b,Math.max(a,v)):d;
function defaults(){return Object.fromEntries(Object.keys(names).map(id=>[id,structuredClone(g.K13UserEquipmentDefaults[id]||blank())]));}
function normalize(raw,legacy=false){const def=defaults();return Object.fromEntries(Object.keys(names).map(id=>{let a=def[id];const entry=legacy&&id==='control-bank'?null:(raw?.[id]??(id==='mode-select'?raw?.['level-select']:undefined));for(const k of Object.keys(a))for(const axis of ['x','y','z'])a[k][axis]=clamp(entry?.[k]?.[axis],k==='scale'?.25:k==='rotation'?-180:-1,k==='scale'?3:k==='rotation'?180:1,a[k][axis]);return [id,a]}))}
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

function decorate(T,mounts,p,root){
 const parts={},disposables=[],targets=[];
 const add=(id,o)=>{parts[id]={object:o,position:o.position.clone(),rotation:o.quaternion.clone(),scale:o.scale.clone()};return o};
 const part=id=>mounts.parts.get(id).group;
 const H=globalThis.TruckTextTexture;
 const texture=(w,h,draw,hd=false)=>{const c=hd&&H?H.canvas(w,h,hd===true):document.createElement('canvas');if(!hd||!H){c.width=w;c.height=h;}draw(hd&&H?H.context(c):c.getContext('2d'),c);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(hd&&H)H.configure(T,t,hd===true);disposables.push(t);return t};
 const plane=(parent,w,h,z,tex,name,x=0,y=0)=>{const mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide});const geo=new T.PlaneGeometry(w,h);const m=new T.Mesh(geo,mat);m.name=name;if(parent.geometry){parent.geometry.computeBoundingBox();z=Math.max(z,parent.geometry.boundingBox.max.z+.002);}m.position.set(x,y,z);parent.add(m);disposables.push(mat,geo);return m};
 function hit(o,id,act){o.userData.k13Action=act;o.userData.k13Part=id;targets.push(o)}
 for(const id of Object.keys(names))if(mounts.parts.has(id))add(id,part(id));
 for(const [i,kind,act] of [[1,'gear','settings'],[2,'location','levels'],[3,'exit','exit']]){
 const mesh=part('control-bank').getObjectByName('control-switch-'+i);
 const tex=texture(256,256,(ctx,c)=>{ctx.translate(128,128);ctx.scale(1.8,1.8);drawPhysicalGlyph(ctx,kind)});
 plane(mesh,.13,.10,.036,tex,'original-door-glyph');hit(mesh,'control-bank',act);
 }
 const wheel=part('steering-wheel-cluster');
 for(const [name,kind] of [['wheel-button-pad-left','lowbeam'],['steering-wheel-center-badge','horn'],['wheel-button-pad-right','wiper']]){
  const m=wheel.getObjectByName(name),t=texture(256,256,(ctx)=>{ctx.translate(128,128);ctx.scale(1.55,1.55);drawPhysicalGlyph(ctx,kind)});
  plane(m,.077,.058,.002,t,'wheel-glyph-'+kind);hit(m,'steering-wheel-cluster',kind==='lowbeam'?'head':kind);
 }
 const hud=part('instrument-bay').getObjectByName('instrument-bay-blank-display');
 const hudTex=texture(768,320,(x,c)=>{x.fillStyle='#14283d';x.fillRect(0,0,768,320);x.fillStyle='#e1f1ff';x.textAlign='center';x.textBaseline='middle';x.font='bold 120px Arial';x.fillText('00',270,81);x.font='43px Arial';x.fillText('km/h',467,81)},true);
 plane(hud,1.02,.405,.009,hudTex,'K13-HUD-preview');
 const monitor=part('parking-monitor').getObjectByName('parking-monitor-BLANK');
 const radarCan=H?H.canvas(512,280,true):document.createElement('canvas');if(!H){radarCan.width=512;radarCan.height=280;}const rt=new T.CanvasTexture(radarCan);rt.colorSpace=T.SRGBColorSpace;H?.configure(T,rt,true);disposables.push(rt);
 plane(monitor,.60,.32,.009,rt,'K13-radar-preview');
 function radarState(on){const x=H?H.context(radarCan):radarCan.getContext('2d');x.fillStyle='#132737';x.fillRect(0,0,512,280);x.textAlign='center';x.fillStyle='#b6d5dc';x.font='25px Microsoft JhengHei';x.fillText(on?'倒車雷達 · 校準預覽':'倒車雷達 OFF',256,126);x.font='17px Microsoft JhengHei';x.fillText('未連接遊戲雷達',256,166);rt.needsUpdate=true;}
 radarState(false);
 {const yt=part('youtube-radio').getObjectByName('youtube-logo-placeholder');
 const square=texture(256,256,(x,c)=>TruckV6MusicCabin.drawYoutubeBadge(c));
 plane(yt,.079,.079,.014,square,'original-youtube-logo');hit(yt,'youtube-radio','music');}
 const physicalButtons=[],ui={},displayCalibration={controls:{restartButton:{position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1}}}};
 TruckV6RestartCabin.createRestartSystemCabin({T,mounts,physicalButtons,ui,displayCalibration,action:()=>{}}).create3dRestartButton();
 ui.restartGroup.position.set(.22,p.dashHeight-.005,-p.length*p.front+p.dashDepth*1.03);ui.restartGroup.rotation.set(-.25,0,0);ui.restartGroup.scale.setScalar(.30);add('restart',ui.restartGroup);hit(ui.restart3d,'restart','restart');
 const group=new T.Group();group.name='rc11-radar-switch-group';root.add(group);
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

 group.position.set(.17,p.dashHeight-.225,-p.length*p.front+p.dashDepth*1.27);group.scale.setScalar(.62);add('radar',group);hit(body,'radar','radar');
 // Additional P05 units; original equipment remains unchanged.
 const dashFront=-p.length*p.front;
 function newGroup(id,x,y,z){const o=new T.Group();o.name='k13-'+id;root.add(o);o.position.set(x,y,z);return o}
 function cloneMesh(src,parent,name){const m=src.clone(false);m.geometry=src.geometry.clone();m.material=src.material.clone();m.name=name;parent.add(m);disposables.push(m.geometry,m.material);return m;}
 const level=newGroup('mode-select',.317,p.dashHeight-.035,dashFront+p.dashDepth*1.04);
 level.rotation.set(-.30,0,0);level.scale.setScalar(.32);
 const levelSrc=part('control-bank').getObjectByName('control-switch-2'),button=cloneMesh(levelSrc,level,'k13-mode-button');
 button.position.set(0,0,0);button.material.color.set('#378a98');
 const levelTex=texture(256,256,x=>{x.translate(128,128);x.scale(1.75,1.75);drawPhysicalGlyph(x,'sliders')});
 plane(button,.145,.104,.004,levelTex,'mode-select-glyph');add('mode-select',level);hit(button,'mode-select','mode');
 // P07: retain the timer housing and its exact calibration; one texture for both metrics.
 const metric=newGroup('timer',.33,.667,-.44);metric.rotation.set(-.22,-.10,0);metric.scale.set(.178,.146,.19);
 const metricSrc=part('instrument-bay');
 for(const n of ['instrument-bay-physical-housing','instrument-bay-INSET-cavity-rim','instrument-bay-blank-backing','instrument-bay-blank-display'])cloneMesh(metricSrc.getObjectByName(n),metric,'timer-'+n);
 const metricTexture=texture(640,540,c=>{
  c.fillStyle='#14283d';c.fillRect(0,0,640,540);c.fillStyle='#d5e9f7';c.textAlign='center';c.textBaseline='middle';
  c.font='53px Microsoft JhengHei, Noto Sans CJK TC, sans-serif';c.fillText('用時',320,53);c.fillText('碰撞次數',320,323);
  c.font='bold 117px Arial, sans-serif';c.fillText('00:00',320,166);c.fillText('0/10',320,436);
  c.strokeStyle='#57718b';c.lineWidth=4;c.beginPath();c.moveTo(56,270);c.lineTo(584,270);c.stroke();
 },true);
 plane(metric.getObjectByName('timer-instrument-bay-blank-display'),1.02,.405,.009,metricTexture,'timer-display');add('timer',metric);
 // K13 mascot uses the already-resolved shared environment, never rolls its own time/weather.
 const weather=newGroup('weather',-.055,p.dashHeight-.008,-.70);
 const mascot=K13WeatherMascot.create(T,weather);
 add('weather',weather);root.userData.weatherRotate=mascot.rotate;root.userData.weatherUpdate=mascot.update;
 weather.traverse(o=>{if(o.isMesh)disposables.push(o.geometry,o.material)});
 // Actual original parking-brake button and shape. It follows the shifter's parent transform.
 const brakeSys=TruckV6BrakeCabin.createParkingBrakeSystemCabin({T,mounts,brakeAdjustment:{normalize:v=>v,defaults:{}}});
 brakeSys.create3dParkingBrake();
 const brake=part('gear-selector').getObjectByName('shifter-3d-parking-brake');
 brake.scale.setScalar(.95);
 const brakeTex=texture(1024,256,x=>TruckV6BrakeCabin.drawParkingArtwork(x,1024,256),'static');
 brake.geometry.computeBoundingBox();const bb=brake.geometry.boundingBox;
 const brakeLabel=plane(brake,(bb.max.x-bb.min.x)*.84,(bb.max.y-bb.min.y)*.86,bb.max.z+.0025,brakeTex,'parking-brake-label',(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2);brakeLabel.raycast=()=>{};
 hit(brake,'parking-brake','brake');
 const transmission=TruckV6TransmissionCabin.createTransmissionSystemCabin({T,local:name=>part('gear-selector').getObjectByName(name)});
 transmission.syncShifterLabels(0);root.userData.syncShifterLabels=gear=>transmission.syncShifterLabels(gear);
 for(const name of ['shifter-label-knob-N','gear-position-D','gear-position-N','gear-position-R']){const m=part('gear-selector').getObjectByName(name);disposables.push(m.geometry,m.material,m.material.map);}
 root.userData.brakeState=on=>{brake.material.color.set(on?'#b52a35':'#637d8f');brake.material.emissive.set(on?'#682126':'#000000');brake.material.emissiveIntensity=on?.12:0;};
 disposables.push(brake.geometry,brake.material);
 // Source-generated accessories own textures outside the original mounts resources.
 for(const o of [ui.restartGroup,group])o.traverse(m=>{if(m.isMesh){disposables.push(m.geometry,m.material);if(m.material.map)disposables.push(m.material.map)}});
 for(const [letter,value] of [['D',1],['N',0],['R',-1]]){const o=part('gear-selector').getObjectByName('gear-position-'+letter);hit(o,'gear-selector','gear');o.userData.k13Value=value;}hit(part('gear-selector').getObjectByName('shifter-knob'),'gear-selector','gear-cycle');root.userData.equipment=parts;root.userData.equipmentHits=targets;root.userData.equipmentDisposables=disposables;root.userData.radarState=on=>{radarState(on);body.material.color.set(on?"#53b5a1":"#3d7784");};
}
function attachRearDistance(T,root,mirror){
 root.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(mirror.getObjectByName('mirror-black-housing'));
 const w=(box.max.x-box.min.x)*.91,h=.030,r=.008;
 const o=new T.Group();o.name='k13-rear-distance';o.position.set((box.min.x+box.max.x)/2,box.min.y-h/2+.005,box.max.z-.007);root.add(o);
 const shape=new T.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const housing=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.009,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0015,bevelSegments:2,curveSegments:6}),mirror.getObjectByName('mirror-black-housing').material.clone());housing.name='k13-distance-mirror-housing';o.add(housing);
 const H=globalThis.TruckTextTexture,c=H?H.canvas(1024,144,true):document.createElement('canvas');if(!H){c.width=1024;c.height=144;}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;H?.configure(T,t,true);
 const mat=new T.MeshBasicMaterial({map:t,toneMapped:false,side:T.DoubleSide});
 const geo=new T.PlaneGeometry(w-.009,h-.007),face=new T.Mesh(geo,mat);face.position.z=.011;face.name='rear-distance-display';o.add(face);
 function setDistance(meters,label='後端距離'){const x=H?H.context(c):c.getContext('2d');x.fillStyle='#14283d';x.fillRect(0,0,1024,144);x.fillStyle='#d9eafa';x.textBaseline='middle';x.textAlign='center';x.font='bold 77px Microsoft JhengHei';x.fillText(label,248,76);x.strokeStyle='#57718b';x.beginPath();x.moveTo(475,20);x.lineTo(475,124);x.stroke();x.font='bold 84px Arial';x.fillText(Number.isFinite(meters)?meters.toFixed(1)+' m':'—',750,76);t.needsUpdate=true;}
 setDistance(2008.7);
 root.userData.setRearDistance=setDistance;
 root.userData.equipment['rear-distance']={object:o,position:o.position.clone(),rotation:o.quaternion.clone(),scale:o.scale.clone()};
 root.userData.equipmentDisposables.push(t,mat,geo,housing.geometry,housing.material);
}
function apply(root,layout){for(const [id,b] of Object.entries(root.userData.equipment||{})){const a=layout[id],o=b.object;o.position.copy(b.position).add(new THREE.Vector3(...['x','y','z'].map(k=>a.position[k])));o.quaternion.copy(b.rotation).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...['x','y','z'].map(k=>a.rotation[k]*Math.PI/180),'XYZ')));o.scale.copy(b.scale).multiply(new THREE.Vector3(...['x','y','z'].map(k=>a.scale[k])));}}
function dispose(root){for(const d of new Set(root.userData.equipmentDisposables||[]))d.dispose();}
g.K13Equipment={names,normalize,defaults,decorate,attachRearDistance,apply,dispose};
})(window);
