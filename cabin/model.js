/* TruckCabin Rebuild v2.1.5-P01.5-RC6 — physically open, continuous Three.js cabin shell.
   Coordinates: +X passenger/right, +Y up, -Z forward. Model is NOT an image plane.
   P04/P04.1 and their 8/12-point geometry are not used. */
(function(global){
'use strict';
const VERSION='2.1.5-P01.5-RC6';
const DEFAULTS=Object.freeze({
  windshieldWidth:3.03, windshieldHeight:1.01, windshieldCorner:.17,
  // Left/right window aperture widths independently move real rear edges, not just the UI label.
  leftWindowWidth:.80, rightWindowWidth:.63, sideRearFrameWidth:.105,
  frontPillarWidth:.085, windowSill:1.09, sideRoof:2.19,
  dashboardHeight:.76, shellThickness:.10,
  camera:{position:[-.19,1.59,.64],fov:68,pitch:-.14},
  quality:'auto', reference:{show:false,opacity:.50,scale:1,x:0,y:0}
});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smoothstep=(a,b,t)=>{let k=clamp((t-a)/(b-a),0,1);return k*k*(3-2*k)};
function eyePose(deg,base=DEFAULTS.camera.position,settings=DEFAULTS){
  const d=clamp(Number(deg)||0,-180,90), u=Math.max(0,-d/180), r=Math.max(0,d/90);
  // The camera actually passes through the OPEN side-window aperture before looking back.
  // Window adjustments change the safe eye path, so reduced window width never strands
  // the viewer inside the B pillar.  Local vehicle axes: X right, Z rear.
  const leftLength=clamp(Number(settings.leftWindowWidth ?? settings.sideApertureLength ?? DEFAULTS.leftWindowWidth),.45,1.80);
  const rightLength=clamp(Number(settings.rightWindowWidth ?? settings.sideApertureLength ?? DEFAULTS.rightWindowWidth),.45,1.80);
  const leftZ=-1.51+leftLength*.50;
  // The right glass MUST stay at the original RC3 model location, NOT be
  // relocated around the camera. For a 90-degree right view we use a temporary
  // INSIDE-CAB observation eye aligned with the ORIGINAL glass. In particular,
  // x never changes (no head out of the right window). The front/base eye is
  // recovered exactly at 0 degrees. This view-only accommodation is required
  // because the independently approved front eye sits aft of the RC3 aperture.
  const rightZ=-1.51+rightLength*.50;
  const rightInCab=smoothstep(0,1,r);
  // Phase 1: lean through the existing left WINDOW before turning fully around.
  // Phase 2: once the head is outside the cab skin, lean BACK along its left side.
  // In RC4 the eye stopped at z=-0.93 (ahead of the B pillar) even at -180°, so
  // the cabin side wall blocked the user's trailer despite a correct yaw angle.
  // The rearwards phase begins ONLY after the eye is clear of the side glass;
  // it never changes the fitted window, the 11 approved dimensions, or camera base.
  const leftOut=smoothstep(.10,.63,u);
  const enterWindow=smoothstep(.03,.49,u);
  const rearLean=smoothstep(.60,1.00,u);
  const windowEyeZ=base[2]+(leftZ-base[2])*enterWindow;
  const rearSightZ=1.24; // outside and behind the main rear bulkhead at z=1.08
  return {
    x:base[0]-1.87*leftOut,
    y:base[1]+.09*leftOut,
    z:windowEyeZ+(rearSightZ-windowEyeZ)*rearLean+(rightZ-base[2])*rightInCab,
    yaw:-d*Math.PI/180,
    pitch:settings.camera?.pitch ?? DEFAULTS.camera.pitch,
    leftOutside:leftOut>.84,
    rightOutside:false,
    rightSeated:d>=0,
    rightViewInCab:d>0,
    angleDeg:d
  };
}
// Same sampled contour on each layer keeps all ring joins sewn and closed.
function loop(cx,cy,w,h,r,segments=12){
 const p=[],rad=clamp(r,.015,Math.min(w,h)*.48);
 const corners=[
   [cx+w/2-rad,cy+h/2-rad,0,Math.PI/2],
   [cx-w/2+rad,cy+h/2-rad,Math.PI/2,Math.PI],
   [cx-w/2+rad,cy-h/2+rad,Math.PI,Math.PI*1.5],
   [cx+w/2-rad,cy-h/2+rad,Math.PI*1.5,Math.PI*2]
 ];
 for(const [x,y,start,end] of corners){for(let j=0;j<segments;j++){
    const a=start+(end-start)*j/segments;p.push([x+rad*Math.cos(a),y+rad*Math.sin(a)]);
 }}
 return p;
}
class Surface{
 constructor(materials){this.positions=[];this.groups=[];this.materials=materials;this.last=-1;this.start=0;}
 face(a,b,c,material){if(this.last!==material){if(this.last>=0)this.groups.push([this.start,this.positions.length/3-this.start,this.last]);this.start=this.positions.length/3;this.last=material;}
 this.positions.push(...a,...b,...c);}
 quad(a,b,c,d,m){this.face(a,b,c,m);this.face(a,c,d,m);}
 band(A,B,m){const n=A.length;for(let i=0;i<n;i++)this.quad(A[i],A[(i+1)%n],B[(i+1)%n],B[i],m);}
 grid(uSteps,vSteps,coord,m){for(let i=0;i<uSteps;i++)for(let j=0;j<vSteps;j++){
  const a=coord(i/uSteps,j/vSteps),b=coord((i+1)/uSteps,j/vSteps),c=coord((i+1)/uSteps,(j+1)/vSteps),d=coord(i/uSteps,(j+1)/vSteps);this.quad(a,b,c,d,m);
 }}
 mesh(THREE,name){if(this.last>=0)this.groups.push([this.start,this.positions.length/3-this.start,this.last]);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(this.positions,3));
  for(const [start,len,mat] of this.groups)geo.addGroup(start,len,mat);geo.computeVertexNormals();
  const result=new THREE.Mesh(geo,this.materials);result.name=name;result.userData.triangleCount=this.positions.length/9;return result;
 }
}
function surfaceLoopAtXY(array,z,offsetY=0){return array.map(([x,y])=>[x,y+offsetY,z]);}
function surfaceLoopAtYZ(array,x){return array.map(([z,y])=>[x,y,z]);}
function loftFrame(s,outerA,innerA,outerB,innerB,faceMat,wallMat){
 s.band(outerA,innerA,faceMat);s.band(outerB,innerB,faceMat);
 s.band(outerA,outerB,wallMat);s.band(innerA,innerB,wallMat);
}
function makeRoundedExtrusion(THREE,root,w,h,r,d,x,y,z,mat,name){
 const sh=new THREE.Shape();const a=w/2,b=h/2;const k=Math.min(r,a,b);
 sh.moveTo(-a+k,-b);sh.lineTo(a-k,-b);sh.quadraticCurveTo(a,-b,a,-b+k);
 sh.lineTo(a,b-k);sh.quadraticCurveTo(a,b,a-k,b);sh.lineTo(-a+k,b);
 sh.quadraticCurveTo(-a,b,-a,b-k);sh.lineTo(-a,-b+k);sh.quadraticCurveTo(-a,-b,-a+k,-b);
 const geo=new THREE.ExtrudeGeometry(sh,{depth:Math.max(d-.03,.015),bevelEnabled:true,bevelSegments:3,steps:1,bevelThickness:.014,bevelSize:.013,curveSegments:12});
 const ob=new THREE.Mesh(geo,mat);ob.position.set(x,y,z-d/2+.014);ob.name=name;root.add(ob);return ob;
}
function makeInsetHood(THREE,root,mats){
 const shell=new THREE.Group();shell.name='instrument-canopy-shell';root.add(shell);
 // Physically recessed instrument pod (unpopulated in this phase).
 makeRoundedExtrusion(THREE,shell,1.54,.80,.24,.22,-.48,.46,-.34,mats.panel,'instrument-hood-moulding');
 makeRoundedExtrusion(THREE,shell,1.38,.66,.21,.04,-.48,.46,-.217,mats.recess,'instrument-hood-inner');
 const thin=makeRoundedExtrusion(THREE,shell,1.42,.695,.22,.025,-.48,.46,-.190,mats.trim,'instrument-hood-lip');
 thin.position.z=-.19;
}
function buildCabin(THREE,input={}){
 const p={...DEFAULTS,...input};p.camera={...DEFAULTS.camera,...(input.camera||{})};
 const frontPillar=clamp(Number(p.frontPillarWidth ?? .085),.035,.23);
 // Make front A-pillar thickness an independently visible control. The old 3.33 m
 // outside contour stays fixed; changing frontPillarWidth resizes the actual glass
 // opening on BOTH sides (not merely a cosmetic stripe).
 const requestedGlass=clamp(+p.windshieldWidth,2.65,3.13);
 const w=clamp(requestedGlass+2*(.15-frontPillar),2.60,3.25),h=clamp(+p.windshieldHeight,.82,1.18);
 const radius=clamp(+p.windshieldCorner,.08,.27),sill=clamp(+p.windowSill,.92,1.31);
 const sideWidths={
   '-1':clamp(Number(p.leftWindowWidth ?? p.sideApertureLength ?? DEFAULTS.leftWindowWidth),.45,1.80),
    '1':clamp(Number(p.rightWindowWidth ?? p.sideApertureLength ?? DEFAULTS.rightWindowWidth),.45,1.80)
 }; const sideTop=clamp(+p.sideRoof,2.05,2.29);
 const rearPost=clamp(Number(p.sideRearFrameWidth ?? .105),.04,.22);
 const dashH=clamp(+p.dashboardHeight,.58,.93),thick=clamp(+p.shellThickness,.07,.19);
 const root=new THREE.Group();root.name='continuous-cabin-shell-v2';
 const mat=(c,rough=.77,metal=.08)=>new THREE.MeshStandardMaterial({color:c,metalness:metal,roughness:rough,side:THREE.DoubleSide});
 const M={head:mat('#a9b5c8'),roof:mat('#949fb1'),frame:mat('#a5b2c4'),seam:mat('#273342',.65),door:mat('#9aa8bb'),floor:mat('#5d6d80'),dash:mat('#899aaf'),panel:mat('#a1b0c4'),trim:mat('#c1cad8',.58,.13),recess:mat('#384456'),glow:new THREE.MeshBasicMaterial({color:'#eaf4ff',side:THREE.DoubleSide}),buttons:mat('#273646'),black:mat('#202a35')};
 const allMat=[M.head,M.roof,M.frame,M.seam,M.door,M.floor,M.dash];
 const s=new Surface(allMat);
 // Front window is a true aperture, not a blue sheet or fake transparent photo.
 const winY=1.64;
 const fo=loop(0,1.64,3.33,1.43,.245);
 const fi=loop(0,winY,w,h,radius);
 loftFrame(s,surfaceLoopAtXY(fo,-1.70),surfaceLoopAtXY(fi,-1.66),surfaceLoopAtXY(fo,-1.47),surfaceLoopAtXY(fi,-1.46),2,0);
 // continuous headliner and roof: front, top and undersurface share model coordinate stations.
 const roofY=(x,z)=>2.405-.025*Math.pow(x/1.72,2)-.045*Math.pow((z+.40)/1.55,2);
 s.grid(24,17,(u,v)=>{const x=-1.72+3.44*u,z=-1.71+2.8*v;return [x,roofY(x,z),z]},1);
 s.grid(24,17,(u,v)=>{const x=-1.72+3.44*u,z=-1.71+2.8*v;return [x,roofY(x,z)-.145,z]},0);
 // roof meets the side-wall outer skin with no open horizon along the join.
 for(const sd of [-1,1]){
   const x=sd*1.72;
   s.grid(1,16,(u,v)=>{const z=-1.71+2.8*v,y=roofY(x,z);return [x,y-.145*u,z]},1);
 }
 // Side window apertures: shortened glazing and a true thin rear frame,
 // never a full-width rectangular slab like the previous v2.1.0 shell.
 // The outer contour hugs the inner contour by rearPost, instead of being fixed at z=1.04.
 for(const sd of [-1,1]){
   const sideLength=sideWidths[sd];
   // LOCK: Both left/right side apertures begin at z=-1.51, exactly as in
   // user-approved RC3. Right view MUST follow the window: moving the window
   // to the eye (as RC4 did) is a severe geometry regression.
   const innerLeft=-1.51;
   const innerRight=innerLeft+sideLength;
   const outerFront=-1.69,outerRear=innerRight+rearPost;
   const outerZcenter=(outerFront+outerRear)/2;
   const innerZc=(innerLeft+innerRight)/2;
   const outer=loop(outerZcenter,1.64,outerRear-outerFront,1.47,.20);
   const inner=loop(innerZc,(sill+sideTop)/2,sideLength,sideTop-sill,.115);
   const xo=sd*1.71,xi=sd*(1.71-thick);
   loftFrame(s,surfaceLoopAtYZ(outer,xo),surfaceLoopAtYZ(inner,xo),surfaceLoopAtYZ(outer,xi),surfaceLoopAtYZ(inner,xi),0,2);
   // The entire lower door is opaque and smoothly transitions into the sill.
   s.grid(10,15,(u,v)=>{let z=-1.70+2.76*v,y=.13+(sill-.08-.13)*u;
      const off=.018*Math.sin(v*Math.PI)*Math.sin(u*Math.PI);return [sd*(1.71-off),y,z];},4);
   s.grid(10,15,(u,v)=>{let z=-1.70+2.76*v,y=.13+(sill-.08-.13)*u;
      return [sd*(1.71-thick+.035),y,z];},4);
   // Rear door B wall begins where the new slim surround ends.
   // The seam exactly follows the editable rear border; no fixed 0.42m heavy block.
   const postBack=Math.min(outerRear,1.05);
   s.grid(4,12,(u,v)=>{let z=postBack+(1.09-postBack)*v,y=.14+(2.32-.14)*u;return [sd*(1.71-.024*Math.sin(u*Math.PI)),y,z];},0);
   s.grid(4,7,(u,v)=>{let z=-1.7+2.79*v,y=sideTop+(2.35-sideTop)*u;return [sd*(1.7-thick*.45),y,z]},0);
   // Lower windowsill inner cap, continuous into door at y=sill.
   s.grid(3,15,(u,v)=>{let z=-1.60+2.56*v,x=sd*(1.70-.24*u);return [x,sill-.06+.025*Math.sin(v*Math.PI),z]},2);
 }
 // Rear bulkhead + floor seal sightlines (head-out eye passes through window ahead of this).
 s.grid(19,13,(u,v)=>[-1.7+3.4*u,.12+2.20*v,1.08],0);
 s.grid(19,16,(u,v)=>[-1.7+3.4*u,.12,-1.67+2.75*v],5);
 // Keep just a low flat opaque inner boundary: the green-X dashboard and raised
 // interior surfaces are intentionally absent.  This is a structural seal,
 // not a dashboard, hood, or decorative console.
 s.grid(23,4,(u,v)=>{const x=-1.67+3.34*u,y=.12+(.96-.12)*v;
   return [x,y,-1.47];},6);
 const skin=s.mesh(THREE,'continuous-stitched-main-shell');root.add(skin);
 // Real recessed rubber sealing strips. No opaque planes across glass apertures.
 function seal(outer,inner,axis,pos,material){const b=new Surface([material]);
   const A=axis==='xy'?surfaceLoopAtXY(outer,pos):surfaceLoopAtYZ(outer,pos);
   const B=axis==='xy'?surfaceLoopAtXY(inner,pos):surfaceLoopAtYZ(inner,pos);b.band(A,B,0);
   const obj=b.mesh(THREE,'window-gasket');root.add(obj);
 }
 seal(loop(0,winY,w+.045,h+.045,radius+.02),loop(0,winY,w-.012,h-.012,radius-.006),'xy',-1.444,M.seam);
 for(const sd of [-1,1]){
  const sideLength=sideWidths[sd];
  const zStart=-1.51;
  const zc=zStart+sideLength*.50;
  // Separate structural window molding + inner rubber weather seal: both depend
  // on the LEFT/RIGHT window width and are visible when the B-post enters view.
  const insetX=sd*(1.71-thick-.028);
  const outerMolding=loop(zc,(sill+sideTop)/2,sideLength+.070,sideTop-sill+.075,.139);
  const innerMolding=loop(zc,(sill+sideTop)/2,sideLength-.010,sideTop-sill-.010,.105);
  seal(outerMolding,innerMolding,'yz',insetX,M.trim);
  seal(loop(zc,(sill+sideTop)/2,sideLength+.020,sideTop-sill+.022,.117),
       loop(zc,(sill+sideTop)/2,sideLength-.009,sideTop-sill-.009,.103),
       'yz',insetX-sd*.004,M.seam);
  // A solid, thin rear B-pillar edge, connected to the opaque cabin rear wall.
  // This also makes width controls visually move the side-window's visible end.
  const b=new Surface([M.frame,M.trim]);
  const rearZ=zStart+sideLength;
  b.grid(2,12,(u,v)=>[sd*(1.71-thick-.013*u),sill+(sideTop-sill)*v,rearZ+.022+rearPost*u],0);
  const edge=b.mesh(THREE,sd<0?'left-window-rear-border':'right-window-rear-border');root.add(edge);
 }
 // All temporary interior equipment shells have been removed at the user's
 // green-X instruction: instrument hood, console frame, vents, pads, armrests,
 // handles, and raised dash.  Restore these only in the later equipment phase.
 // Intentionally no added overhead lamp pods or overhead console.
 // The user marked all of those extra objects for removal. Keep the continuous
 // roof and original integrated roof beams ONLY: no accumulating fixtures.
 // Deliberately no A-pillar-sill-join corner blocks: user's yellow X marks removed.
 // The continuous sill skin below is the only connection; no added floating corner pads.
 // Geometry dispose done on shell rebuild; material shared only in this rebuild.
 root.userData={version:VERSION,skin,materials:Object.values(M),
  paintMaterials:{head:M.head,roof:M.roof,frame:M.frame,door:M.door,dash:M.dash,panel:M.panel,trim:M.trim},
  stats:{frontClearWidth:w,leftSideClearLength:sideWidths[-1],rightSideClearLength:sideWidths[1],
   leftWindowApertureZ:[-1.51,-1.51+sideWidths[-1]],rightWindowApertureZ:[-1.51,-1.51+sideWidths[1]],
   frontPillarWidth:frontPillar,rearPostWidth:rearPost,triangles:skin.userData.triangleCount,meshes:(()=>{let k=0;root.traverse(o=>{if(o.isMesh)k++});return k})()}};
 return root;
}
global.TruckCabinRebuild={VERSION,DEFAULTS,eyePose,buildCabin,clamp,smoothstep,loop};
})(window);
