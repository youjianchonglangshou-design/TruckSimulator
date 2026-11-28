/* RC12: shared settings-only real Three.js exterior preview. */
(function(g){'use strict';
// CPU path uses actual P08 Three.js meshes, not a photo or simplified alternate model.
function meshFaces(T,root,truck=false){
 const faces=[],environment=[],v=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),n=new T.Vector3(),sun=new T.Vector3(...(truck?[-4,8,5]:[-5,9,-5])).normalize(),color=new T.Color();
 root.updateMatrixWorld(true);root.traverseVisible(o=>{if(!o.isMesh||!o.geometry)return;const geo=o.geometry,ar=geo.attributes.position,idx=geo.index,groups=Array.isArray(o.material)?geo.groups:[{start:0,count:idx?idx.count:ar.count,materialIndex:0}];
 const verts=Array.from({length:ar.count},(_,i)=>v.fromBufferAttribute(ar,i).applyMatrix4(o.matrixWorld).toArray());
 for(const group of groups){const mat=Array.isArray(o.material)?o.material[group.materialIndex]:o.material;if(!mat?.visible||!mat.color||mat.opacity<.02)continue;const end=Math.min(group.start+group.count,idx?idx.count:ar.count);
 for(let i=group.start;i+2<end;i+=3){const vs=[0,1,2].map(j=>verts[idx?idx.getX(i+j):i+j]);a.fromArray(vs[1]).sub(v.fromArray(vs[0]));b.fromArray(vs[2]).sub(v);n.crossVectors(a,b).normalize();const light=truck?.76+.23*Math.max(0,n.y)+1.25*Math.max(0,n.dot(sun)):.90+.20*Math.max(0,n.y)+.20*Math.max(0,n.dot(sun));color.copy(mat.color).multiplyScalar(light);faces.push({v:vs,c:'#'+color.getHexString()});}}
 });
 const quad=(x1,z1,x2,z2,y,c)=>environment.push({v:[[x1,y,z1],[x2,y,z1],[x2,y,z2],[x1,y,z2]],c});quad(-75,-75,75,75,-.014,truck?'#293c49':'#344654');for(let i=-15;i<=15;i++){quad(i-.008,-15,i+.008,15,0,'#506572');quad(-15,i-.008,15,i+.008,.001,'#506572');}return {faces,environment};
}
function mount(parent,id){
 const truck=id==='truck';if(!truck&&id!=='NissanMarch_K13')return null;
 const panel=document.createElement('div');panel.className='cab-vehicle-3d';panel.dataset.vehiclePreview=id;
 const canvas=document.createElement('canvas');canvas.className='cab-vehicle-3d-canvas';canvas.setAttribute('aria-label',(truck?'聯結車':'Nissan March K13')+' 外部 3D 模型');canvas.tabIndex=0;
 const hint=document.createElement('span');hint.className='cab-vehicle-3d-hint';hint.textContent='外部 3D · 拖曳旋轉 / 滾輪縮放';
 const reset=document.createElement('button');reset.type='button';reset.className='cab-vehicle-3d-reset';reset.textContent='視角重置';reset.disabled=true;
 const status=document.createElement('div');status.className='cab-vehicle-3d-status';status.setAttribute('role','status');status.textContent='載入 3D 模型…';panel.append(canvas,hint,reset,status);parent.append(panel);
 const start=truck?{yaw:139,pitch:15,distance:.84}:{yaw:35,pitch:16,distance:4.7};let orbit={...start},disposed=false,renderer,scene,camera,model,observer,raf=0,grid,ground,cpu,target,corners,drag=new Map(),pinch=0;
 const coords=e=>{const p=typeof MobileLandscape!=='undefined'?MobileLandscape.point(e):null;return p?[p.x,p.y]:[e.clientX,e.clientY]};
 const rad=Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function render(){raf=0;if(disposed||!panel.isConnected||!model)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;const T=g.THREE;if(renderer)renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const a=orbit.yaw*rad,b=orbit.pitch*rad;const direction=new T.Vector3(Math.sin(a)*Math.cos(b),Math.sin(b),-Math.cos(a)*Math.cos(b));let d=orbit.distance*Math.max(1,1.55/(w/h));if(truck){ // Fit the whole original truck using its true bounds; same projection as source preview.
 const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize(),up=new T.Vector3().crossVectors(direction,right).normalize(),t=Math.tan(camera.fov*rad/2)*.80;let fit=2;for(const p of corners)fit=Math.max(fit,p.dot(direction)+Math.abs(p.dot(right))/(t*camera.aspect),p.dot(direction)+Math.abs(p.dot(up))/t);d=fit*orbit.distance;
 }camera.position.copy(target).addScaledVector(direction,d);camera.lookAt(target);if(renderer){renderer.render(scene,camera);panel.dataset.triangles=String(renderer.info.render.triangles);}else{if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}softwareRender(cpu.context,w,h,[31/255,46/255,58/255],camera.position.toArray(),target.toArray(),camera.fov,cpu.environment,cpu.faces,false);panel.dataset.triangles=String(cpu.faces.length);}panel.dataset.ready='true';panel.dataset.orbit=[orbit.yaw,orbit.pitch,orbit.distance].join(',');}
 function refresh(){if(!disposed&&!raf)raf=requestAnimationFrame(render);}
 function zoom(f){orbit.distance=clamp(orbit.distance*f,truck?.65:3.5,truck?2.5:14);refresh()}
 function down(e){if(!model||e.button>0)return;e.stopPropagation();canvas.setPointerCapture(e.pointerId);drag.set(e.pointerId,coords(e));if(drag.size===2){const [a,b]=[...drag.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);}}
 function move(e){if(!drag.has(e.pointerId))return;e.stopPropagation();const old=drag.get(e.pointerId),now=coords(e);drag.set(e.pointerId,now);if(drag.size===2){const [a,b]=[...drag.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d>0&&pinch>0)zoom(pinch/d);pinch=d;}else if(drag.size===1){orbit.yaw-=(now[0]-old[0])*.45;orbit.pitch=clamp(orbit.pitch+(now[1]-old[1])*.35,3,75);refresh();}}
 function up(e){drag.delete(e.pointerId);pinch=0;e.stopPropagation();}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,up);
 canvas.addEventListener('wheel',e=>{if(!model)return;e.preventDefault();e.stopPropagation();zoom(Math.exp(e.deltaY*.001));},{passive:false});
 canvas.addEventListener('keydown',e=>{if(!model)return;switch(e.key){case'ArrowLeft':orbit.yaw+=10;break;case'ArrowRight':orbit.yaw-=10;break;case'ArrowUp':orbit.pitch=clamp(orbit.pitch+5,3,75);break;case'ArrowDown':orbit.pitch=clamp(orbit.pitch-5,3,75);break;case'+':case'=':zoom(.9);break;case'-':zoom(1.1);break;default:return}e.preventDefault();e.stopPropagation();refresh()});
 reset.onclick=()=>{orbit={...start};refresh()};
 function release(){if(raf)cancelAnimationFrame(raf);raf=0;observer?.disconnect();observer=null;model?.dispose();model=null;for(const o of [grid,ground])if(o){o.geometry.dispose();o.material.dispose()}grid=ground=null;if(renderer){renderer.dispose();renderer.forceContextLoss();renderer=null;}scene=null;camera=null;cpu=null;target=null;corners=null;}
 async function init(){try{const provider=g.TruckVehicleCabins.get('NissanMarch_K13');await provider.prepare();if(disposed||!panel.isConnected)return;const T=g.THREE;
 // Prefer the original Three.js WebGL path; reuse the project's CPU rasterizer only when unavailable.
 try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(g.devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=truck?T.NoToneMapping:T.ACESFilmicToneMapping;renderer.toneMappingExposure=truck?1:1.35;}catch(e){if(renderer){renderer.dispose();renderer=null;}const context=canvas.getContext('2d');if(!context)throw e;cpu={context};}
 scene=new T.Scene();scene.background=new T.Color('#1f2e3a');camera=new T.PerspectiveCamera(42,1,.035,150);scene.add(new T.HemisphereLight(truck?'#ffffff':'#f8fcff',truck?'#677681':'#64788b',truck?1.1:2));const sun=new T.DirectionalLight('#ffffff',truck?1.35:2.6);sun.position.set(...(truck?[-4,8,5]:[-5,9,-5]));scene.add(sun);
 ground=new T.Mesh(new T.PlaneGeometry(150,150),new T.MeshBasicMaterial({color:truck?'#293c49':'#344654',toneMapped:false}));ground.rotation.x=-Math.PI/2;ground.position.y=-.014;scene.add(ground);grid=new T.GridHelper(30,30,'#506572','#506572');grid.material.toneMapped=false;scene.add(grid);
 if(truck){const root=g.TruckExterior3D.create(T);model={root,dispose:()=>g.TruckExterior3D.dispose(root)};const box=new T.Box3().setFromObject(root);target=box.getCenter(new T.Vector3());corners=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])corners.push(new T.Vector3(x,y,z).sub(target));panel.dataset.modelVersion=g.TruckExterior3D.version;}else{model=provider.buildModel({inside:false,settingsPreview:true});target=new T.Vector3(0,model.settings.height*.48,0);panel.dataset.modelVersion='1.0.0-P08';panel.dataset.pillars=String(['left','right'].filter(s=>model.native.shell.getObjectByName('K13-rear-quarter-pillar-'+s)).length);}scene.add(model.root);if(cpu)Object.assign(cpu,meshFaces(T,model.root,truck));panel.dataset.renderer=renderer?'webgl':'software';observer=new ResizeObserver(refresh);observer.observe(canvas);reset.disabled=false;status.hidden=true;refresh();
 }catch(e){release();if(!disposed){status.hidden=false;status.textContent='3D 預覽無法啟動：'+e.message;panel.dataset.ready='error';}}}
 init();return {dispose(){if(disposed)return;disposed=true;release();panel.remove();}};
}
g.TruckVehicleSettingsPreview=Object.freeze({mount});
})(globalThis);
