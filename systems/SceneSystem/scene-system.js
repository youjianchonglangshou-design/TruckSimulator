/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6Scene=api;})(globalThis,function(){'use strict';
function createSceneSystemCore(svc){
function buildOriginalYard(){svc.staticFaces=[];svc.faces=svc.staticFaces;svc.flat(0,3,68,76,'#465158',0,0);for(let i=-32;i<=32;i+=8)svc.flat(i,3,.035,76,'#343f45',0,.012);for(let z=-32;z<41;z+=8)svc.flat(0,z,68,.035,'#343f45',0,.012);for(let i=-30;i<=30;i+=5){svc.flat(i,38,.12,2,'#cbc2a1');}for(let side of [-1,1]){svc.flat(side*33,3,.16,75,'#d8bf65');svc.box(side*34.2,3,.38,77,.58,0,'#b0b1aa');for(let z=-32;z<42;z+=6){svc.box(side*34,z,.12,.12,2.65,0,'#c1d8df',0,true);
 svc.box(side*34,z,.14,.14,.38,.06,'#f1c45a',0,true);svc.box(side*34,z,.18,.18,.13,2.6,'#b6c0bf')}}svc.box(0,42,68,.45,.55,0,'#a9aaa3');
svc.box(0,-39,63,6,7,0,'#83969e');svc.box(0,-39,64,6.5,.4,7,'#435560');svc.box(0,-35.87,63,.22,.75,5.7,'#e6e6dd');for(let x=-28;x<=28;x+=4){svc.box(x,-35.91,3.0,.15,3.9,.05,'#242e35');svc.box(x,-35.79,2.65,.13,3.61,.12,'#a9b4b7');for(let y=.3;y<3.7;y+=.27)svc.box(x,-35.70,2.6,.035,.026,y,'#687b83');svc.box(x,-35.57,3.05,.24,.24,.01,'#252c31');for(let side of [-1,1])svc.box(x+side*1.68,-35.16,.17,.18,.84,0,'#e1b443');svc.flat(x,-28.6,.13,13.8,'#e0c87b');}
for(let x of [-1.67,1.67])svc.flat(x,-27.95,.14,14,'#55efb1',0,.045);svc.flat(0,-34.98,3.46,.15,'#55efb1',0,.048);svc.flat(0,-20.95,3.46,.11,'#55efb1',0,.045);for(let z=-35;z<-20;z+=.65)svc.flat(0,z,.055,.33,'#86cdb0',0,.045);svc.flat(0,-34.7,3.16,.10,'#f1eee1',0,.05);for(let x of [-2.1,2.1])for(let z=-18;z<2;z+=3.0)svc.flat(x,z,.09,1.5,'#b1b9b5',0,.03);for(let o of svc.P.obstacles(svc.level).slice(1)){if(o.z<0){svc.containerBody(o.x,o.z,0,12.2,['#557d8e','#817252','#697c70','#855954'][Math.abs(o.x/4)%4],.75);svc.box(o.x,o.z,2.54,12.4,.2,.55,'#333d43');for(let r of [-1.07,1.07])for(let f of [-3.9,-4.9])svc.localBox(o.x,o.z,0,f,r,.33,.85,.66,0,'#272f33')}else{svc.box(o.x,o.z,o.w,o.l,2.5,0,'#9a8868',0,true);for(let z=o.z-5;z<o.z+5;z+=1.2)svc.box(o.x,z,o.w+.04,.06,2.5,0,'#756a56')}}
for(let x of [-30,30])for(let z of [-20,7,30]){const draw=()=>{svc.box(x,z,.32,.32,10,0,'#c1d8df',0,true);
 svc.box(x,z,.335,.335,.54,.14,'#f1c45a',0,true);
 svc.box(x,z,.34,.34,.20,.68,'#29434d',0,true);svc.box(x+(x<0?1:-1),z,2.2,.15,.16,9.6,'#9ca7ab');svc.box(x+(x<0?1.9:-1.9),z,1.05,.45,.24,9.46,'#e1e5df')};if(svc.sceneryBuilder)svc.sceneryBuilder.decorative('lamp',x,z,draw);else draw();}
// Number sign: green target beacon and bollards
svc.box(0,-35.64,2.25,.17,.63,4.25,'#176e5e');for(let x of [-1.85,1.85]){svc.box(x,-34.95,.18,.18,.92,0,'#f4c64c');svc.box(x,-34.95,.19,.19,.21,.55,'#303c3c')}
// Background freight buildings
for(let x=-27;x<=27;x+=9){svc.box(x,49,7.8,8,5+(Math.abs(x)%4),0,'#7e9096');svc.box(x,44.9,5.8,.14,3.2,0,'#4d5d63');}for(let i=0;i<6;i++){svc.box(-38-i%2*7,-28+i*13,5,10,4+i%3,0,'#687f86');svc.box(39+i%2*6,-27+i*13,6,10,4+i%2*2,0,'#829294')} }
function buildWallEdges(){
 const obs=svc.P.obstacles(svc.level);if(!svc.P.levels[svc.level].scene&&svc.P.levels[svc.level].theme!=='practice'){
  // Original yards have perimeter barriers in addition to obstacle boxes.
  for(let x of [-33.75,33.75])svc.flat(x,3,.07,76,'#e1d8c1',0,.038);
  svc.flat(0,40.8,67.5,.07,'#e1d8c1',0,.038);
  if(svc.level>=3)svc.flat(0,-35.95,67.5,.07,'#e1d8c1',0,.038);
 }for(let i=0;i<obs.length;i++){
  const o=obs[i],k=o.kind;if(svc.level<3&&i!==0&&i<obs.length-2)continue;
  if(['parkedtruck','dc3parked','van','median'].includes(k))continue;
  const a=o.a||0;
  // Thin dark expansion joint and light concrete edge. Both follow the existing obstacle perimeter.
  for(const sign of [-1,1]){
   for(const [offset,width,color,y] of [[.035,.07,'#263238',.037],[.10,.06,'#e1d8c1',.038]]){
    let p=svc.P.at(o.x,o.z,a,0,sign*(o.w/2+offset));svc.flat(p.x,p.z,width,o.l+2*offset+width,color,a,y);
    p=svc.P.at(o.x,o.z,a,sign*(o.l/2+offset),0);svc.flat(p.x,p.z,width,o.w+2*offset+width,color,a+Math.PI/2,y);
   }
  }
 }
}
function buildYard(){
 svc.facadeTier=TruckPerformance.kit?.state.tierId||'high';svc.facadeOrigin={x:svc.s.x,z:svc.s.z};svc.facadeBuiltLevel=svc.level;
 buildYardBase();svc.sceneryBuilder?.finish();if(svc.sceneryBuilder)svc.sceneryStats=svc.sceneryBuilder.stats;buildWallEdges();if(svc.Env){for(const f of svc.staticFaces)f.window=svc.Env.markWindow(f);svc.Env.decorate(svc.level,svc.P,svc.box,svc.staticFaces,svc.facadeTier);}
 svc.renderSamples.facadeRebuilds++;
 svc.worldSceneRevision++; // also increments for same-level randomized DC3 docks and visual LOD rebuilds
}
function ensureFacadeLOD(now){
 const tier=TruckPerformance.kit?.state.tierId||'high';
 const moved=Math.hypot(svc.s.x-svc.facadeOrigin.x,svc.s.z-svc.facadeOrigin.z);
 // Quality switches rebuild once; while driving, re-evaluate near vs distant
 // walls every 50 m, at most once per 3 seconds (no physical-stage changes).
 if(tier!==svc.facadeTier||svc.facadeBuiltLevel!==svc.level||((tier!=='ultra'||svc.P.levels[svc.level].scene?.selectStart)&&moved>=50&&now-svc.lastFacadeRebuild>=3000)){
  svc.lastFacadeRebuild=now;buildYard();
 }
}
function buildYardBase(){svc.sceneryStats=null;svc.sceneryBuilder=globalThis.StreetAssets?.create({flat:svc.flat,box:svc.box,face:svc.face,textureFace:svc.textureFace,facadeTier:svc.facadeTier,observer:svc.P.start(svc.level),batch:true});if(svc.P.levels[svc.level].scene){svc.staticFaces=[];svc.faces=svc.staticFaces;svc.P.levels[svc.level].scene.render({flat:svc.flat,box:svc.box,localBox:svc.localBox,containerBody:svc.containerBody,street:svc.sceneryBuilder,face:svc.face,textureFace:svc.textureFace,observer:{...svc.facadeOrigin,tier:svc.facadeTier}});return;}if(svc.level<3){buildOriginalYard();return;}svc.staticFaces=[];svc.faces=svc.staticFaces;const q=svc.P.levels[svc.level],g=svc.P.goal(svc.level),a=q.heading;
const ground=q.theme==='construction'?'#796b50':'#505c60';svc.flat(0,3,68,76,ground,0,0);
const F=(x,z,w,l,c,y=.014)=>{let p=svc.P.local(svc.level,x,z);svc.flat(p.x,p.z,w,l,c,a,y)};
const B=(x,z,w,l,h,y,c,edge=false)=>{let p=svc.P.local(svc.level,x,z);svc.box(p.x,p.z,w,l,h,y,c,a,edge)};
// Paved surfaces and lane markings. All obstacle bodies match the collision boxes.
for(let x=-32;x<=32;x+=8)svc.flat(x,3,.035,76,'#39454a',0,.012);
for(let z=-32;z<41;z+=8)svc.flat(0,z,68,.035,'#39454a',0,.012);
if(q.theme==='alley'){F(0,-20,4.85,30,'#39464d');F(-2.26,-20,.12,29,'#dbc289');F(2.26,-20,.12,29,'#dbc289');F(0,16,14,32,'#465158');for(let z=-5;z<32;z+=4)F(0,z,.11,2,'#c8c9bc',.023)}
if(q.theme==='factory'){F(0,-10,9,41,'#465158');F(0,15,32,25,'#505c60');for(let z=-16;z<30;z+=3){F(-3.1,z,.13,1.7,'#d9ba61',.023);F(3.1,z,.13,1.7,'#d9ba61',.023)}}
if(q.theme==='construction'){F(0,-10,8,46,'#796b50');F(-8,13,12,24,'#827257');for(let i=0;i<12;i++){let z=-15+i*3;F(-3.9,z,.13,1.2,'#e6cf80',.023);F(3.9,z,.13,1.2,'#e6cf80',.023)}}
if(q.theme==='street'){F(5.4,0,10,72,'#465158');F(-2.5,0,1.0,72,'#aaa9a0');F(10.6,0,.6,72,'#b8b6a9');for(let z=-33;z<37;z+=5)F(7.2,z,.13,2.4,'#e7e4da',.027);F(1.8,0,.14,72,'#d6c078',.025);F(-1.8,0,.13,72,'#d6c078',.025);for(let x=3;x<10;x+=1)F(x,29,.48,2.6,'#d9dbd5',.03)}
for(let o of svc.P.obstacles(svc.level)){let {x,z,w,l,h,kind}=o;let col=({house:'#b8aaa0',factory:'#92aabb',shed:'#a1b5ae',wall:'#b5cdd0',barrier:'#d1a659',materials:'#ddc6a3',van:'#d0dade',curb:'#e2d6b8'})[kind];svc.box(x,z,w,l,h,0,col,a,true);
 if(['house','factory','shed'].includes(kind)){svc.box(x,z,w+.16,l+.16,.18,h,'#4e5a60',a);for(let side of [-1,1]){for(let f=-l/2+1.6;f<l/2-1;f+=2.8){if(kind==='house'){for(let y=1.6;y<h-0.9;y+=2.45){const draw=()=>{svc.localBox(x,z,a,f,side*(w/2+.018),.045,1.12,.92,y,'#405866');svc.localBox(x,z,a,f,side*(w/2+.044),.045,.05,.92,y,'#b9c2c2')};if(svc.sceneryBuilder)svc.sceneryBuilder.decorative('window',x,z,draw,`${f}:${side}:${y}`);else draw();}}else{const draw=()=>svc.localBox(x,z,a,f,side*(w/2+.02),.035,1.55,1.02,h-1.7,'#344b59');if(svc.sceneryBuilder)svc.sceneryBuilder.decorative('window',x,z,draw,`${f}:${side}`);else draw();}}}if(kind==='factory'){svc.localBox(x,z,a,l/2+.03,0,3.1,.055,3.9,.04,'#303b42');for(let y=.3;y<3.9;y+=.29)svc.localBox(x,z,a,l/2+.065,0,3.0,.035,.035,y,'#9aaab1')}}
 if(kind==='van'){svc.localBox(x,z,a,l/2-1.0,0,w*.86,.10,1.05,1.2,'#344b59');for(let r of [-1,1])for(let f of [-l/2+1,l/2-1])svc.localBox(x,z,a,f,r*w*.49,.32,.8,.65,.03,'#252f35');svc.localBox(x,z,a,-l/2-.025,0,w*.85,.05,.13,.5,'#b74840')}
 if(kind==='materials'){for(let f=-l/2+.55;f<l/2;f+=1.0)svc.localBox(x,z,a,f,0,w*.93,.16,.13,h,'#bfaa89');for(let r of [-.3,.3])svc.localBox(x,z,a,0,r*w,.045,l*.96,.13,h+.12,'#704f32')}
 if(kind==='barrier'||kind==='wall'){for(let f=-l/2+.4;f<l/2;f+=.9)svc.localBox(x,z,a,f,0,w+.04,.18,.15,h*.72,'#4d5553')}
}
if(q.theme==='practice'){for(let x=-20;x<=20;x+=2)F(x,0,.045,64,x===0?'#efe8cc':'#9aa4a5',.025);for(let z=-30;z<=32;z+=2)F(0,z,48,.045,'#9aa4a5',.025);return;}
// Goal is in its own heading, not tied to the original dock coordinate.
let gp=(f,r)=>svc.P.at(g.x,g.z,g.a,f,r);for(let r of [-g.w/2,g.w/2]){let p=gp(g.l/2,r);svc.flat(p.x,p.z,.14,g.l,'#55efb1',a,.045)}for(let f of [0,g.l]){let p=gp(f,0);svc.flat(p.x,p.z,g.w+.12,.15,'#55efb1',a,.048)}for(let f=.5;f<g.l;f+=.7){let p=gp(f,0);svc.flat(p.x,p.z,.055,.35,'#86cdb0',a,.045)}
if(q.theme!=='street'){let p=gp(-.9,0);svc.box(p.x,p.z,2.25,.15,.60,1.95,'#176e5e',a);for(let r of [-.87,.87]){let post=gp(-.9,r);svc.box(post.x,post.z,.09,.09,1.95,0,'#60736e',a)}for(let r of [-2.0,2.0]){let t=gp(-.25,r);svc.box(t.x,t.z,.16,.16,.8,0,'#e2be51',a)}}
for(let x of [-31,31])for(let z of [-25,0,26]){svc.box(x,z,.24,.24,8,0,'#647680');svc.box(x+(x<0?1:-1),z,2,.16,.15,7.8,'#a6b4b8')}
for(let x of [-34,34])svc.box(x,3,.3,77,.48,0,'#a0a5a2');svc.box(0,42,68,.3,.48,0,'#a0a5a2');svc.box(0,-36.3,68,.3,.48,0,'#a0a5a2');
}
return Object.freeze({buildOriginalYard,buildWallEdges,buildYard,ensureFacadeLOD,buildYardBase});
}
return Object.freeze({createSceneSystemCore});
});
