/*
 * TruckCabinMounts v2.3.14-P03.14-RC15 — truly plain gray buttons, no highlight meshes.
 * Standalone module: does not modify TruckCabinRebuild.buildCabin or eyePose.
 * Gear selector body is ported from the successful TruckCabin3D v1.1.4-P02
 * equipment-factory: vertical silver gate, flat N grip, D/N/R labels at right.
 * Mirror feeds preview the real 3D TEST scene; production gameplay data,
 * vehicle telemetry and YouTube music are not connected.
 */
(function(global){'use strict';
const VERSION='2.3.14-P03.14-RC15';
const DEFAULT_MOUNTS={
  'base-dashboard':[0,0,0], 'mirror-left-upper':[0,0,0], 'mirror-left-lower':[0,0,0],
  'mirror-right-upper':[0,0,0], 'mirror-right-lower':[0,0,0],
  'control-bank': [0,0,0], 'steering-wheel-cluster':[0,0,0], 'instrument-bay':[0,0,0],
  'gear-selector':[0,0,0], 'youtube-radio':[0,0,0], 'parking-monitor':[0,0,0]
};
const ALLOWED_IDS=Object.freeze(Object.keys(DEFAULT_MOUNTS));
function create(THREE,offsets={},rotations={},scales={}){
 const root=new THREE.Group();root.name='equipment-mounts-p02';
 const parts=new Map(), resources=[];
 function mat(col,metal=.11,rough=.67){const x=new THREE.MeshStandardMaterial({color:col,metalness:metal,roughness:rough,side:THREE.DoubleSide});resources.push(x);return x}
 const M={body:mat('#9eacbc'),bodySoft:mat('#b9c6d3',.09,.72),upper:mat('#aab9c9'),soft:mat('#d0d8e0'),shadow:mat('#657588'),bezel:mat('#77879a'),dark:mat('#253340'),rubber:mat('#19232e',.06,.84),inset:mat('#152330'),glass:mat('#18242b',.48,.17),silver:mat('#bac5d1',.37,.44),stripe:mat('#56d8c6',.18,.46),button:mat('#33414e'),plainGray:mat('#58616b',.06,.80),buttonInk:mat('#c6d7dc'),screen:mat('#202e3d',.07,.32),blankPanel:mat('#f2f4f7',.02,.86),unified:mat('#a9b9c9',.08,.72)};
 function mesh(parent,geo,material,x=0,y=0,z=0,name){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);if(name)o.name=name;parent.add(o);return o}
 function box(p,w,h,d,x,y,z,m,name){return mesh(p,new THREE.BoxGeometry(w,h,d),m,x,y,z,name)}
 function rounded(p,w,h,d,x,y,z,r,material,name){
  const q=Math.min(r,w*.24,h*.24),sh=new THREE.Shape();
  sh.moveTo(-w/2+q,-h/2);sh.lineTo(w/2-q,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+q);
  sh.lineTo(w/2,h/2-q);sh.quadraticCurveTo(w/2,h/2,w/2-q,h/2);
  sh.lineTo(-w/2+q,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-q);
  sh.lineTo(-w/2,-h/2+q);sh.quadraticCurveTo(-w/2,-h/2,-w/2+q,-h/2);
  return mesh(p,new THREE.ExtrudeGeometry(sh,{depth:Math.max(.006,d-.02),bevelEnabled:true,bevelSize:.009,bevelThickness:.010,bevelSegments:3,curveSegments:9}),material,x,y,z-d/2+.010,name);
 }
 function roundedPane(p,w,h,x,y,z,r,material,name){
  const q=Math.min(r,w*.24,h*.24),sh=new THREE.Shape();
  sh.moveTo(-w/2+q,-h/2);sh.lineTo(w/2-q,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+q);
  sh.lineTo(w/2,h/2-q);sh.quadraticCurveTo(w/2,h/2,w/2-q,h/2);
  sh.lineTo(-w/2+q,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-q);
  sh.lineTo(-w/2,-h/2+q);sh.quadraticCurveTo(-w/2,-h/2,-w/2+q,-h/2);
  return mesh(p,new THREE.ShapeGeometry(sh,10),material,x,y,z,name);
 }
 // True molded recess with an OPEN inner contour, not another solid box on top
 // of the instrument/screen. Front lip and cavity share the same color as the
 // dashboard carrier; only the inner cavity wall is shadowed for depth.
 function recessRing(parent,outerW,outerH,innerW,innerH,zFront,depth,radius,label){
  const sides=12;
  function roundedLoop(w,h,r){const pts=[];const k=Math.min(r,w*.25,h*.25);
   const c=[[w/2-k,h/2-k,0,Math.PI/2],[-w/2+k,h/2-k,Math.PI/2,Math.PI],
            [-w/2+k,-h/2+k,Math.PI,Math.PI*1.5],[w/2-k,-h/2+k,Math.PI*1.5,Math.PI*2]];
   for(const [cx,cy,start,end] of c)for(let j=0;j<sides;j++){
    const a=start+(end-start)*j/sides;pts.push([cx+k*Math.cos(a),cy+k*Math.sin(a)]);
   }return pts;
  }
  const outer=roundedLoop(outerW,outerH,radius),inner=roundedLoop(innerW,innerH,Math.max(.025,radius-(outerW-innerW)*.5));
  const faces=[];
  const quad=(a,b,c,d)=>faces.push(...a,...b,...c,...a,...c,...d);
  const ring=(z1,z2,front)=>{for(let i=0;i<outer.length;i++){const n=(i+1)%outer.length;
    const a=[...outer[i],z1],b=[...outer[n],z1],c=[...inner[n],z2],d=[...inner[i],z2];
    if(front)quad(a,b,c,d);else quad(d,c,b,a);
   }};
  ring(zFront,zFront,true);ring(zFront-depth,zFront-depth,false);
  for(let i=0;i<outer.length;i++){const n=(i+1)%outer.length;
    quad([...outer[i],zFront-depth],[...outer[n],zFront-depth],[...outer[n],zFront],[...outer[i],zFront]);
    quad([...inner[n],zFront-depth],[...inner[i],zFront-depth],[...inner[i],zFront],[...inner[n],zFront]);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(faces,3));geo.computeVertexNormals();
  return mesh(parent,geo,M.unified,0,0,0,label);
 }
 function bar(p,a,b,r,m,name){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A),h=v.length();const o=mesh(p,new THREE.CylinderGeometry(r,r,h,12),m,...A.clone().add(B).multiplyScalar(.5).toArray(),name);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.userData.supportEndpoints=[a.slice(),b.slice()];return o}
 function register(id,origin,fn){
  const mount=new THREE.Group();mount.name=id;mount.position.set(...origin);root.add(mount);
  const content=new THREE.Group();content.name=id+'-model';mount.add(content);
  fn(content);const delta=offsets[id]||[0,0,0];
  if(!Array.isArray(delta)||delta.length!==3||delta.some(v=>!Number.isFinite(Number(v))||Math.abs(Number(v))>.8))throw Error('Invalid mount offset '+id);
  mount.position.set(...origin.map((v,i)=>v+Number(delta[i])));
  // Rotation is in DEGREES in equipment JSON; Three.js consumes radians.
  // Each mount owns its transform.  The approved shell/camera are independent.
  const angles=rotations[id]||[0,0,0], size=scales[id]??1;
  if(!Array.isArray(angles)||angles.length!==3||angles.some(v=>!Number.isFinite(+v)||Math.abs(+v)>180))throw Error('Invalid mount rotation '+id);
  if(!Number.isFinite(+size)||+size<.25||+size>2.5)throw Error('Invalid mount scale '+id);
  mount.rotation.set(...angles.map(a=>Number(a)*Math.PI/180),'XYZ');
  mount.scale.set(Number(size),Number(size),Number(size));
  parts.set(id,{id,origin:[...origin],group:mount,content,offset:delta.map(Number),rotation:angles.map(Number),scale:Number(size)});
  return mount;
 }
 function quadGeo(points){const pos=[];for(const [a,b,c] of [[0,1,2],[0,2,3]])pos.push(...points[a],...points[b],...points[c]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
 function cabDeckShape(){
  // Continuous equipment substrate: a subtly curved top and front skirt, NOT
  // a replacement windshield or an unbroken solid slab across the view.
  const points=[],tri=[],w=24,t=12;
  function addQuad(a,b,c,d){tri.push(...a,...b,...c,...a,...c,...d)}
  function surface(x,z){const v=(z+1.44)/1.45;let y=1.025-.245*Math.pow(Math.max(0,v),.86);
   y-=.026*Math.pow(Math.abs(x)/1.68,3);return [x,y,z]}
  for(let k=0;k<2;k++)for(let i=0;i<w;i++)for(let j=0;j<t;j++){
   const u=i/w,un=(i+1)/w,v=j/t,vn=(j+1)/t;
   const xy=(a,b)=>{const x=-1.66+3.32*a,z=-1.44+1.42*b;const p=surface(x,z);p[1]-=k*.085;return p};
   addQuad(xy(u,v),xy(un,v),xy(un,vn),xy(u,vn));
  }
  // Front fascia skirt extends below the deck; close visible lower-edge gaps.
  for(let i=0;i<w;i++){
   const x=-1.66+3.32*i/w,x2=-1.66+3.32*(i+1)/w;
   const a=surface(x,-.02),b=surface(x2,-.02);
   addQuad(a,b,[x2,.37,-.02],[x,.37,-.02]);
   const fa=surface(x,-1.44),fb=surface(x2,-1.44);
   addQuad([x,.37,-1.44],[x2,.37,-1.44],fb,fa);
  }
  for(const sd of [-1,1])for(let j=0;j<t;j++){
    const z=-1.44+1.42*j/t,z2=-1.44+1.42*(j+1)/t,x=sd*1.66;
    addQuad(surface(x,z),surface(x,z2),[x,.37,z2],[x,.37,z]);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(tri,3));g.computeVertexNormals();return g;
 }
 // Main dashboard substrate / window sills, independent of fixed shell.
 register('base-dashboard',[0,0,0],g=>{
  mesh(g,cabDeckShape(),M.body,0,0,0,'dashboard-continuous-curved-deck');
  // ONE continuous molded carrier below the windshield and BEHIND both
  // approved equipment mounts. Its shoulders rise where the two instrument
  // cavities attach, then flow down into the original curved dashboard deck.
  // No fake air vents, floating filler blocks or isolated chrome strips.
  const baseDown=Number((offsets['base-dashboard']||[0,0,0])[1]||0);
  const stations=30,depthSegments=18,skin=[];
  const lift=x=>Math.exp(-Math.pow((x+.63)/.79,4))*.16 + Math.exp(-Math.pow((x-.72)/.65,4))*.085;
  const deckTop=(x,z)=>1.025-.245*Math.pow(Math.max(0,(z+1.44)/1.45),.86)-.026*Math.pow(Math.abs(x)/1.68,3);
  const carrier=(x,t)=>{
    const z=-1.39+1.31*t;
    const elevated=.90+lift(x)-baseDown;
    // The upright part remains behind the two displays (z<-1.08);
    // beyond that station the deck stays BELOW the displays. This avoids
    // accidentally covering the approved instrument and monitor screens.
    const turn=.235,join=deckTop(x,-1.39+1.31*turn);
    const easing=t<turn?(t/turn)**2*(3-2*(t/turn)):Math.min(1,(t-turn)/(1-turn));
    const y=t<turn? elevated+(join-elevated)*easing
                   :join+(deckTop(x,z)-join)*easing;
    return [x,y,z];
  };
  for(let i=0;i<stations;i++)for(let j=0;j<depthSegments;j++){
    const x=-1.58+3.16*i/stations,x2=-1.58+3.16*(i+1)/stations;
    const t=j/depthSegments,t2=(j+1)/depthSegments;
    skin.push(...carrier(x,t),...carrier(x2,t),...carrier(x2,t2),...carrier(x,t),...carrier(x2,t2),...carrier(x,t2));
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(skin,3));geo.computeVertexNormals();
  mesh(g,geo,M.unified,0,0,0,'single-piece-molded-dashboard-carrier');
  // restrained rounded lower face, not full decorative gauges
  rounded(g,3.06,.31,.10,0,.42,-.011,.09,M.unified,'dashboard-lower-fascia');
  for(const sd of [-1,1]){
   const top=mesh(g,quadGeo([[sd*1.63,.92,-1.37],[sd*1.67,.91,-.06],[sd*1.41,.81,-.06],[sd*1.43,1.01,-1.37]]),M.unified,0,0,0,sd<0?'left-window-sill-mount':'right-window-sill-mount');
   rounded(g,.36,.16,.15,sd*1.44,.70,-.16,.04,M.unified,'side-dashboard-corner');
  }
 });
 // Four mirrors: ONE black structural frame + ONE actual live-reflection surface.
 // No layered blue-grey glass, grey bezel or static fake reflection.
 // Mount IDs, centers, user XYZ/rotation/scale and shell are untouched.
 const mirrorFaces=new Map();
 for(const side of [-1,1]){
  const prefix=side<0?'left':'right';
  for(const kind of ['upper','lower']){
   const upper=kind==='upper',id='mirror-'+prefix+'-'+kind;
   register(id,[side*2.12,upper?1.73:1.16,-1.41],g=>{
    const h=upper?.68:.31,w=upper?.39:.36;
    rounded(g,w+.073,h+.065,.094,0,0,-.018,.070,M.rubber,'mirror-black-housing');
    // Black rim IS the mirror housing. Only the inner opening receives a live scene texture.
    const reflectiveMaterial=new THREE.MeshBasicMaterial({color:'#1a242b',side:THREE.DoubleSide,toneMapped:false});
    resources.push(reflectiveMaterial);
    const face=roundedPane(g,w+.015,h+.008,0,0,.043,.058,reflectiveMaterial,'mirror-live-reflection-surface');
    face.userData.mirrorId=id;mirrorFaces.set(id,face);
   });
  }
 }
 // Exact photo-3 visual: angled UPPER ARM -> shared vertical stalk ->
 // mid-height double-mirror coupling -> LOWER horizontal arm. Thin BLACK tubes.
 const bracketGroups=new Map();
 function clearBracket(group){const old=[...group.children];for(const child of old){group.remove(child);child.traverse(x=>{if(x.geometry)x.geometry.dispose()})}}
 function refreshBrackets(sideFilter=null){
  for(const side of [-1,1]){
   if(sideFilter!==null&&side!==sideFilter)continue;
   const prefix=side<0?'left':'right',top=parts.get('mirror-'+prefix+'-upper'),bottom=parts.get('mirror-'+prefix+'-lower');
   let g=bracketGroups.get(prefix);if(!g){g=new THREE.Group();g.name='mirror-'+prefix+'-continuous-black-support';root.add(g);bracketGroups.set(prefix,g)}
   clearBracket(g);
   const tx=top.group.position.x,ty=top.group.position.y,tz=top.group.position.z;
   const bx=bottom.group.position.x,by=bottom.group.position.y,bz=bottom.group.position.z;
   // Approved cabin opening and mirror housings must NOT move.
   // Each external bracket must show from the cockpit through the gap BETWEEN
   // the A-pillar (X≈±1.72) and the mirror inner edge (X≈±1.89).
   // RC10/RC11 wrongly put the feet at ±2.04, almost UNDER the mirror body;
   // the rods therefore vanished behind the black mirror casing. This repair
   // restores the physically external door mounts AT the side window edge.
   const footX=side*1.78;
   const upperPivotX=side*1.885;
   const upperHousingX=tx-side*.137;
   const lowerHousingX=bx-side*.153;
   const upperFoot=[footX,2.160,-1.550];
   const upperPivot=[upperPivotX,2.112,-1.530];
   const upperHousing=[upperHousingX,ty+.243,tz-.095];
   const lowerFoot=[footX,1.140,-1.550];
   const lowerHousing=[lowerHousingX,by-.035,bz-.075];
   // Only TWO compact foot blocks, both sitting outside the sheet-metal skin.
   // These attach at the upper/lower exterior DOOR edge, NOT on the windscreen.
   rounded(g,.052,.077,.055,...upperFoot,.020,M.rubber,'upper-exterior-door-foot');
   rounded(g,.052,.067,.055,...lowerFoot,.019,M.rubber,'lower-exterior-door-foot');
   // Upper slanted bracket: roof/door anchor -> visible upward bend -> upper
   // inside corner of the mirror's black HOUSING (not the reflective glass).
   bar(g,upperFoot,upperPivot,.017,M.rubber,'upper-exterior-angled-arm');
   bar(g,upperPivot,upperHousing,.017,M.rubber,'upper-mirror-housing-arm');
   // Lower nearly-horizontal bracket: sill/door anchor -> lower mirror housing.
   // Its first ~10 cm is fully visible IN FRONT OF the side-window opening.
   bar(g,lowerFoot,lowerHousing,.020,M.rubber,'lower-exterior-horizontal-arm');
   // The short connecting stalk stays on the BACK of the black mirror housings.
   // No support is painted, no tube enters the cockpit, and no stub protrudes
   // from the front reflection face.
   const rearTop=[tx,ty+.14,tz-.105];
   const rearLow=[bx,by+.10,bz-.105];
   bar(g,rearTop,rearLow,.012,M.rubber,'rear-mirror-frame-connecting-stalk');
  }
 }
 refreshBrackets();
 // Left control panel in the blue-marked column. Static switches, not working logic.
 register('control-bank',[-1.21,.92,-.67],g=>{
  const plate=rounded(g,.30,.48,.073,0,0,-.016,.05,M.bezel,'left-control-bank-bezel');
  for(let i=0;i<3;i++){
   const y=.148-i*.145;
   // Plain neutral gray button body only: no white glyph, no color LED.
   rounded(g,.263,.126,.032,0,y,.040,.030,M.plainGray,'control-switch-'+(i+1));
  }
 });
 // Steering wheel + wheel buttons = ONE component group, not split apart.
 register('steering-wheel-cluster',[-.48,.49,-.36],g=>{
  const carrier=new THREE.Group();carrier.name='steering-wheel-assembly';carrier.rotation.x=-22*Math.PI/180;g.add(carrier);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.285,.040,18,44),M.rubber);rim.name='steering-wheel-rim';carrier.add(rim);
  const core=new THREE.Mesh(new THREE.CylinderGeometry(.092,.092,.060,26),M.dark);core.rotation.x=Math.PI/2;core.position.z=.022;core.name='steering-wheel-core';carrier.add(core);
  const badge=rounded(carrier,.115,.090,.016,0,0,.056,.022,M.plainGray,'steering-wheel-center-badge');
  // RC7: remove the lower round cylinder under the steering center per user markup.
  // RC8: no lower column cylinder; preserve wheel rim, badge, buttons and spokes.
  function spoke(x1,y1,x2,y2,r,name){bar(carrier,[x1,y1,-.004],[x2,y2,.010],r,M.dark,name)}
  spoke(0,0,.19,.17,.022,'spoke-upper-right');
  spoke(0,0,-.19,.17,.022,'spoke-upper-left');
  spoke(0,0,.17,-.16,.024,'spoke-lower-right');
  spoke(0,0,-.17,-.16,.024,'spoke-lower-left');
  const buttonPads=[[-.165,.115,'left'],[.165,.115,'right'],[-.145,-.115,'left-lower'],[.145,-.115,'right-lower']];
  for(const [x,y,label] of buttonPads){
    // All four steering-wheel button banks are single-piece gray pads.
    // No small pale button strips are generated on top.
    rounded(carrier,.118,.072,.026,x,y,.034,.020,M.plainGray,'wheel-button-pad-'+label);
  }
  // User-marked lower inner cylinders removed: keep only the four gray pads,
  // center badge, rim and spokes.
 });
 // Instrument screen is dark when OFF, matching the adjacent parking display.
 // No demonstration telemetry, no power-on UI. Existing frame/shape/transforms stay.
 register('instrument-bay',[-.47,.83,-.65],g=>{
  rounded(g,1.29,.62,.18,0,0,-.045,.15,M.unified,'instrument-bay-physical-housing');
  recessRing(g,1.246,.575,1.105,.469,.082,.073,.145,'instrument-bay-INSET-cavity-rim');
  rounded(g,1.112,.482,.013,0,.010,.010,.104,M.screen,'instrument-bay-blank-backing');
  rounded(g,1.084,.456,.008,0,.011,.027,.100,M.screen,'instrument-bay-blank-display');
 });
 // Exact P02 flat vertical shifter architecture: narrow silver fascia, BLACK LEFT
 // SLOT, short FLAT N grip within the slot, small D/N/R markings on the RIGHT.
 // In RC5 a molded pedestal is restored beneath the selector so the shifter no
 // longer floats visually. The base is part of the same component and follows
 // the approved JSON X/Y/Z, rotation and scale exactly.
 register('gear-selector',[.31,.64,-.60],g=>{
  rounded(g,.420,.615,.120,-.010,-.048,-.122,.072,M.unified,'shifter-integrated-base');
  rounded(g,.355,.525,.070,-.006,-.032,-.056,.060,M.bodySoft,'shifter-base-top');
  rounded(g,.300,.470,.034,0,.003,-.046,.041,M.bezel,'shifter-panel-outer');
  rounded(g,.262,.405,.026,0,-.020,-.023,.036,M.silver,'shifter-panel-silver');
  rounded(g,.089,.296,.010,-.047,-.020,.015,.035,M.rubber,'shifter-slot');
  rounded(g,.070,.271,.008,-.047,-.020,.023,.030,M.inset,'shifter-slot-inset');
  const knob=new THREE.Group();knob.name='shifter-knob-carrier';g.add(knob);
  bar(knob,[-.047,-.055,.036],[-.047,.014,.066],.013,M.silver,'shifter-stem');
  const outlineRim=[[-.110,-.048],[-.106,-.088,-.068,-.095],[-.016,-.095],
    [.012,-.090,.022,-.056],[.025,.000],[.019,.057,-.013,.065],[-.069,.066],
    [-.109,.059,-.113,.018],[-.110,-.048]];
  const outline=[[-.103,-.047],[-.102,-.080,-.063,-.087],[-.022,-.087],
    [.006,-.080,.014,-.049],[.016,.000],[.010,.051,-.021,.058],[-.064,.058],
    [-.101,.050,-.104,.012],[-.103,-.047]];
  function extrudeGrip(lines,d,x,y,z,mat,name){const sh=new THREE.Shape();lines.forEach((a,i)=>{if(i===0)sh.moveTo(a[0],a[1]);else if(a.length===4)sh.quadraticCurveTo(...a);else sh.lineTo(...a)});const o=mesh(knob,new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelSize:.006,bevelThickness:.007,bevelSegments:4,curveSegments:20}),mat,x,y,z,name);return o}
  extrudeGrip(outlineRim,.032,0,0,.058,M.shadow,'shifter-knob-rim');
  extrudeGrip(outline,.035,0,0,.094,M.dark,'shifter-knob');
  // Model labels are local canvas-texture art on genuine THREE mesh, not HTML.
  function textPlate(txt,w,h,font,color='white'){
   const c=document.createElement('canvas');c.width=192;c.height=256;const ctx=c.getContext('2d');
   ctx.clearRect(0,0,192,256);ctx.fillStyle=color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.fillText(txt,96,126);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
   const material=new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,toneMapped:false});resources.push(material);
   return {geometry:new THREE.PlaneGeometry(w,h),material};
  }
  const knobLabel=textPlate('N',.087,.098,'bold 160px Arial');mesh(knob,knobLabel.geometry,knobLabel.material,-.044,-.007,.151,'shifter-label-knob-N');
  for(const [i,l] of ['D','N','R'].entries()){
    const p=textPlate(l,.034,.068,'bold 148px Arial','#263745');mesh(g,p.geometry,p.material,.070,.080-i*.105,.050,'gear-position-'+l);
  }
 });
 // Empty YouTube audio *mount* only. No audio player or external UI at this phase.
 register('youtube-radio',[.62,1.005,-.565],g=>{
  rounded(g,.64,.150,.075,0,0,-.050,.045,M.unified,'youtube-mount-housing');
  rounded(g,.59,.110,.020,0,0,.003,.033,M.screen,'youtube-audio-screen-BLANK');
  rounded(g,.085,.083,.012,-.235,0,.017,.026,M.dark,'youtube-logo-placeholder');
 });
 // Real parking-monitor bezel with a blank recessed screen (NO fake parking feed).
 register('parking-monitor',[.83,.735,-.445],g=>{
  rounded(g,.83,.57,.17,0,0,-.058,.075,M.unified,'parking-monitor-housing');
  recessRing(g,.797,.536,.655,.360,.089,.072,.074,'parking-monitor-INSET-cavity-rim');
  rounded(g,.663,.374,.012,0,.015,.011,.041,M.shadow,'parking-monitor-glass-surround');
  rounded(g,.640,.350,.008,0,.015,.027,.038,M.screen,'parking-monitor-BLANK');
 });
 // The recess rims are part of the component geometry itself. No separate
 // faux vent add-ons or dangling lower transition boxes: the common molded
 // carrier supplies the surrounding material and visual continuity.
 // Narrow recessed vents corresponding to the user-marked blue edges flanking
 // the parking screen. Their position follows that device's own layout.
 const vents=new THREE.Group();vents.name='parking-monitor-paired-air-vents';parts.get('parking-monitor').group.add(vents);
 // Vents are positioned in WORLD-scaled coordinates relative to the monitor
 // attachment mount, not baked into the shell and not added as large boxes.
 for(const side of [-1,1]){
  const x=side*.525;
  rounded(vents,.113,.375,.065,x,.003,-.024,.026,M.bodySoft,side<0?'left-air-vent-integrated-surround':'right-air-vent-integrated-surround');
  rounded(vents,.073,.316,.009,x,.002,.024,.021,M.inset,side<0?'left-vent-recess':'right-vent-recess');
  for(let i=0;i<5;i++){
   const slat=box(vents,.066,.012,.019,x,-.108+i*.057,.037,M.shadow,'air-vent-horizontal-slat-'+(side<0?'L':'R')+'-'+i);
   slat.rotation.x=-.13;
  }
 }
 // Real independent rear-view captures for test scene; user mirrors keep
 // independent transform data and each face receives its own render target.
 let feed=null;
 function connectMirrorFeeds(renderer,scene,getShell){
  if(feed)return feed;
  const ids=[...mirrorFaces.keys()],cameras=[],targets=[];let cursor=0,lastTick=0;
  for(const id of ids){
   const upper=id.includes('upper'),side=id.includes('left')?-1:1;
   const target=new THREE.WebGLRenderTarget(upper?180:148,upper?256:128,{depthBuffer:true,stencilBuffer:false});
   const cam=new THREE.PerspectiveCamera(upper?52:79,(upper?180:148)/(upper?256:128),.08,140);
   const face=mirrorFaces.get(id);face.material.color.set('#ffffff');face.material.map=target.texture;face.material.needsUpdate=true;
   // Each camera looks down the actual rearward 3D test roadway +Z.
   cameras.push({id,side,cam});targets.push(target);
  }
  feed={
   ids,targets,cameras,
   update(frame,qualityLevel){
    if(root.visible===false)return;
    const q=Math.max(0,Math.min(4,qualityLevel||0));
    const interval=[2,3,5,7,11][q];
    if(frame%interval!==0)return;
    const index=cursor++%ids.length;
    const {id,side,cam}=cameras[index],part=parts.get(id),p=part.group.position;
    cam.position.set(p.x,p.y,p.z+.10);cam.up.set(0,1,0);
    // Both cameras look REARWARDS and inward along their respective trailer
    // side (not outward at empty sky). Lower wide-angle sees the tires/road.
    const upper=id.includes('upper');
    const target=[p.x-side*(upper?1.55:1.65),p.y-(upper?.24:.66),p.z+18];
    cam.lookAt(...target);cam.userData.mirrorTarget=target;
    cam.updateProjectionMatrix();
    const shell=getShell?.(),oldShellVisible=shell?.visible,oldRootVisible=root.visible;
    const previous=renderer.getRenderTarget?.()||null;
    try{
     if(shell)shell.visible=false;root.visible=false;
     renderer.setRenderTarget(targets[index]);renderer.clear();renderer.render(scene,cam);
    }finally{
     renderer.setRenderTarget(previous);root.visible=oldRootVisible;
     if(shell)shell.visible=oldShellVisible;
    }
   },
   dispose(){
    targets.forEach(t=>t.dispose());
    for(const id of ids){const material=mirrorFaces.get(id).material;material.map=null;material.needsUpdate=true}
    if(feed===this)feed=null;
   }
  };
  return feed;
 }
 const summary=Object.fromEntries([...parts].map(([id,p])=>[id,{
  origin:[...p.origin],position:p.group.position.toArray(),offset:[...p.offset],rotation:[...p.rotation],scale:p.scale,meshes:(()=>{let n=0;p.group.traverse(x=>{if(x.isMesh)n++});return n})()}
 ]));
 function setOffset(id,delta){const p=parts.get(id);if(!p)throw Error('Unknown mount '+id);if(!Array.isArray(delta)||delta.length!==3||delta.some(v=>!Number.isFinite(+v)||Math.abs(+v)>.8))throw Error('Invalid offset');p.offset=delta.map(Number);p.group.position.set(...p.origin.map((v,i)=>v+p.offset[i]));if(id.startsWith('mirror-'))refreshBrackets(id.includes('left')?-1:1);}
 function setRotation(id,deg){
  const p=parts.get(id);if(!p)throw Error('Unknown mount '+id);
  if(!Array.isArray(deg)||deg.length!==3||deg.some(v=>!Number.isFinite(+v)||Math.abs(+v)>180))throw Error('Invalid rotation');
  p.rotation=deg.map(Number);p.group.rotation.set(...p.rotation.map(a=>a*Math.PI/180),'XYZ');
 }
 function setScale(id,value){
  const p=parts.get(id);if(!p)throw Error('Unknown mount '+id);
  if(!Number.isFinite(+value)||+value<.25||+value>2.5)throw Error('Invalid scale');
  p.scale=Number(value);p.group.scale.set(p.scale,p.scale,p.scale);
 }
 function getLayout(){return {schema:'TruckCabinEquipmentMounts',version:VERSION,
   offsets:Object.fromEntries([...parts].map(([id,p])=>[id,[...p.offset]])),
   rotations:Object.fromEntries([...parts].map(([id,p])=>[id,[...p.rotation]])),
   scales:Object.fromEntries([...parts].map(([id,p])=>[id,p.scale]))
 }}
 function dispose(){if(feed)feed.dispose();root.traverse(o=>{if(o.geometry)o.geometry.dispose()});const unique=new Set(resources);for(const m of unique){if(m.map)m.map.dispose();m.dispose()}}
 root.userData.paintMaterials={body:M.body,bodySoft:M.bodySoft,upper:M.upper,unified:M.unified,bezel:M.bezel};
 root.userData={...root.userData,version:VERSION,phase:'P03_STEERING_HUD_AND_VENTS',stats:{mounts:parts.size,mirrors:4,liveMirrorFaces:mirrorFaces.size,independentBlackBrackets:bracketGroups.size,buttonShapes:15,gearType:'P02-flattened-slot-knob-DNR',activeFunctionalBindings:0,telemetryPlaceholders:0,steeringWheel:true,vents:2}};
 return {root,parts,setOffset,setRotation,setScale,getLayout,dispose,summary,connectMirrorFeeds,mirrorFaces,bracketGroups,refreshBrackets};
}
global.TruckCabinMounts={VERSION,ALLOWED_IDS,DEFAULT_MOUNTS,create};
})(window);
