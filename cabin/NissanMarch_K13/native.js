/* K13 calibration adapter: original TruckCabin modules remain byte-identical. */
(function(global){'use strict';
const T=THREE, M=CarModel, source=TruckCabinRebuild, U=TruckCabinUserLayout.settings,L=TruckCabinMountsLayout;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
function map(p,x,y,z){
 const t=clamp((y-1.08)/(2.405-1.08),0,1);
 const along=clamp((z+1.60)/2.68,0,1),round=Math.pow((along-.48)/.52,2);const X=x*lerp(p.width*.455/1.71,p.width*p.roofWidth/1.72,t)*(1-.045*t*t*round);
 const Y=y<=1.08?lerp(p.clearance+.015,p.belt,(y-.12)/.96):lerp(p.belt,p.height,(y-1.08)/1.325)-t*t*(.055*round+.045*Math.pow(Math.abs(x)/1.72,3));
 const front=-p.length*lerp(p.front,p.roofFront,t),rear=-p.length*lerp(p.back,p.roofBack,t);
 const u=(z+1.60)/2.68,b=p.frontDoorRatio,doorZ=lerp(-p.length*p.front,-p.length*p.back,b),topB=clamp((doorZ+p.length*p.roofFront)/(p.length*(p.roofFront-p.roofBack)),.10,.85),anchor=lerp(b,topB,t);
 const warped=u<=b?u*anchor/b:anchor+(u-b)*(1-anchor)/(1-b);
 return [X,Y,lerp(front,rear,warped)];
}
function eyePose(p,angle){
 const base=[p.eyeX,p.eyeY,p.eyeZ],ratio=p.frontDoorRatio;
 if(!angle)return {position:base,outside:false};
 const sideLength=2.68*ratio-.09-clamp(p.pillar/.44,.04,.22);
 const y=1.08+1.325*(p.eyeY-p.belt)/(p.height-p.belt);
 const x=p.eyeX/(p.width*.455/1.71);
 let lo=-2,hi=2;
 for(let i=0;i<32;i++){const m=(lo+hi)/2;if(map(p,x,y,m)[2]<p.eyeZ)lo=m;else hi=m;}
 const z=(lo+hi)/2,from=[x,y,z];
 const pose=source.eyePose(angle,from,{leftWindowWidth:sideLength,rightWindowWidth:sideLength});
 const zDelta=map(p,x,y,pose.z)[2]-map(p,x,y,z)[2];
 const bZ=lerp(-p.length*p.front,-p.length*p.back,ratio);
 const out=pose.leftOutside;
 return {position:[base[0]+(pose.x-x)*(p.width/3.42),base[1]+(pose.y-y)*(p.height-p.belt)/1.325,Math.min(base[2]+zDelta,Math.max(base[2],bZ+.14))],outside:out};
}
function warp(shell,p){
 shell.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){a.setXYZ(i,...map(p,a.getX(i),a.getY(i),a.getZ(i)))}a.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();});
}
// Exterior rear quarter-window divider: same rear-to-front station (.22) as CarModel.build.
function rearQuarterPillars(shell,p){
 const station=.22, bottom=-p.length*(p.back+(p.front-p.back)*station), top=-p.length*(p.roofBack+(p.roofFront-p.roofBack)*station);
 function sourceZ(y,target){let lo=-1.70,hi=1.09;for(let i=0;i<32;i++){const m=(lo+hi)/2;if(map(p,0,y,m)[2]<target)lo=m;else hi=m;}return (lo+hi)/2;}
 for(const sd of [-1,1]){
  const geo=new T.BoxGeometry(.08,1.10,1,1,12,1),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){const y=a.getY(i)+1.65,t=clamp((y-1.08)/1.325,0,1),z=sourceZ(y,lerp(bottom,top,t)+a.getZ(i)*p.pillar);a.setXYZ(i,sd*1.71+a.getX(i),y,z);}
  const mesh=new T.Mesh(geo,shell.userData.paintMaterials.frame);mesh.name=sd<0?'K13-rear-quarter-pillar-left':'K13-rear-quarter-pillar-right';shell.add(mesh);
 }
}
function native(p,baseline=false,inside=false,closed=false,settingsPreview=false){
 const params=baseline?U:{...U,windshieldWidth:2.92,windshieldHeight:1.13,windshieldCorner:.105,frontPillarWidth:lerp(.035,.23,(p.pillar-.018)/.102),shellThickness:lerp(.07,.19,(p.roofThickness-.015)/.060),roofSkinThickness:p.roofThickness/Math.max(.16,(p.height-p.belt)/1.325),leftWindowWidth:2.68*p.frontDoorRatio-.09-clamp(p.pillar/.44,.04,.22),rightWindowWidth:2.68*p.frontDoorRatio-.09-clamp(p.pillar/.44,.04,.22),sideRearFrameWidth:clamp(p.pillar/.44,.04,.22),windowSill:1.08,sideRoof:2.19,closedGlass:closed};
 const shell=(baseline?source:TruckCabinK13Rebuild).buildCabin(T,params),mounts=TruckCabinMounts.create(T,L.offsets,L.rotations,L.scales),root=new T.Group();
 root.add(shell,mounts.root);
 TruckCabinPaint.create(shell,mounts.root,baseline?TruckCabinPaintLayout:{schema:'TruckCabinPaint',shell:inside?'#303237':'#e9e9e4'});
 if(!baseline){
  if(settingsPreview&&!inside)rearQuarterPillars(shell,p);
  warp(shell,p);
  if(!inside)TruckCabinPaint.create(null,mounts.root,{schema:'TruckCabinPaint',shell:'#303237'});
  if(inside){shell.userData.paintMaterials.head.color.set('#92969a');shell.userData.paintMaterials.frame.color.set('#b5b6b3');shell.userData.paintMaterials.trim.color.set('#888c90');shell.userData.materials[5].color.set('#25282c');}

  const deck=mounts.parts.get('base-dashboard').group,front=-p.length*p.front;
  for(const ch of mounts.root.children)ch.visible=false;
  function place(id,x,y,z,sx,sy=sx,sz=sx){const g=mounts.parts.get(id).group;g.visible=true;g.position.set(x,y,z);g.rotation.set(0,0,0);g.scale.set(sx,sy,sz);return g;}
  deck.visible=true;deck.position.set(0,p.dashHeight-1.66*.29+.015,front+.025+1.44*p.dashDepth/1.45);deck.rotation.set(0,0,0);deck.scale.set(p.width*.455/1.68,.29,p.dashDepth/1.45);
  const wheel=place('steering-wheel-cluster',p.wheelX,p.steerY,p.steerZ,p.steerRadius/.285);
  const unit=wheel.getObjectByName('steering-wheel-assembly');
  for(const name of ['wheel-button-pad-left-lower','wheel-button-pad-right-lower']){const o=unit.getObjectByName(name);if(o)o.visible=false;}
  for(const [sd,name] of [[-1,'left'],[1,'right']]){const o=unit.getObjectByName('spoke-upper-'+name);const a=new T.Vector3(0,0,-.004),b=new T.Vector3(sd*.245,0,.010),v=b.clone().sub(a);o.position.copy(a.clone().add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());o.scale.y=v.length()/o.geometry.parameters.height;const pad=unit.getObjectByName('wheel-button-pad-'+name);pad.position.y=0;}
  for(const [sd,name] of [[-1,'left'],[1,'right']]){const o=unit.getObjectByName('spoke-lower-'+name);const a=new T.Vector3(sd*.025,-.02,-.004),b=new T.Vector3(sd*.085,-.245,.010),v=b.clone().sub(a);o.position.copy(a.clone().add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());o.scale.y=v.length()/o.geometry.parameters.height;}
  place('instrument-bay',p.wheelX,p.dashHeight+.075,front+p.dashDepth*.72,.35,.32,.42);
  place('parking-monitor',.045,p.dashHeight-.115,front+p.dashDepth*1.04,.40,.40,.40);
  const gear=place('gear-selector',.095,.43,-.40,.70,.76,.62);gear.rotation.x=-Math.PI/2;
  const panelX=map(p,-(1.71-clamp(params.shellThickness,.07,.19)+.035),.70,-.7)[0];
  const door=place('control-bank',panelX+.0213,p.belt-.18,-.385,.39);
  const normal=new T.Vector3(1,0,0),along=new T.Vector3(0,0,-1),across=along.clone().cross(normal);
  door.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(across,along,normal));
  door.userData.panelX=panelX;
  const radio=place('youtube-radio',.045,p.dashHeight+.065,front+p.dashDepth*.96,.47,.48,.48);
  K13Equipment.decorate(T,mounts,p,root);
  for(const sd of [-1,1]){
   const prefix=sd<0?'left':'right',g=place('mirror-'+prefix+'-upper',sd*p.mirrorX,p.mirrorY,p.mirrorZ,.36);g.rotation.z=Math.PI/2;
   const bracket=mounts.bracketGroups.get(prefix).getObjectByName('lower-exterior-horizontal-arm').clone();
   const a=new T.Vector3(sd*p.width*.455,p.mirrorY-.045,p.mirrorZ-.04),b=new T.Vector3(sd*(p.mirrorX-.07),p.mirrorY-.025,p.mirrorZ-.035),v=b.clone().sub(a);
   bracket.position.copy(a.clone().add(b).multiplyScalar(.5));bracket.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());bracket.scale.y=v.length()/bracket.geometry.parameters.height;root.add(bracket);
  }
  if(inside){const rear=mounts.parts.get('mirror-left-upper').group.clone(true);rear.position.set(0,p.height-.19,-p.length*p.roofFront-.13);rear.rotation.set(0,0,Math.PI/2);rear.scale.setScalar(.31);root.add(rear);rear.name='k13-center-mirror';K13Equipment.attachRearDistance(T,root,rear);}
  // The remaining truck-specific equipment is intentionally hidden during the skeleton phase.
 }
 return {root,shell,mounts,equipment:root.userData.equipment||{},dispose(){K13Equipment.dispose(root);shell.traverse(o=>{if(o.geometry)o.geometry.dispose()});const materials=new Set();shell.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)});for(const m of materials)m.dispose();mounts.dispose();}};
}
function exterior(faces,wire){
 const root=new T.Group(),groups=new Map();
 for(const f of faces){let g=groups.get(f.c);if(!g)groups.set(f.c,g=[]);for(let i=1;i<f.v.length-1;i++)g.push(...f.v[0],...f.v[i],...f.v[i+1]);}
 for(const [c,a] of groups){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(a,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color:c,roughness:.77,metalness:.08,side:T.DoubleSide,wireframe:wire}));mesh.userData.k13ExteriorColor=c;root.add(mesh);}return root;
}
global.K13Native={native,exterior,map,eyePose};
})(window);
