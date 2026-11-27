/* Taroko only: opposing articulated traffic. All dimensions in metres.
 * Uses the existing bicycle / hitch integrator for the reference trajectory;
 * braking and following then advance along that trajectory at a variable speed.
 * No changes to player physics, vehicle mesh or global render quality. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.JQDTrucks=api;})(globalThis,function(){'use strict';
const ZONES=Object.freeze([175,780,1043,1223,1550,1765]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cache=new WeakMap();
const cabColors=['#d7e0e2','#36637c','#b64439','#e4c48c','#727f86'];
const boxColors=['#b64d32','#59716c','#737c91','#b8b3a3','#376d83'];
function buildPath(P,scene){
 // Centre of the opposing lane, with a small curvature correction for the
 // tractor front swing and the 8.7 m trailer bogie lag. Use the same P.advance
 // as the player, rather than snapping the trailer to the tractor heading.
 const lane=d=>-2.65-clamp(P.angle(scene.routeAt(d+16).a-scene.routeAt(d-5).a)/21*15,-.22,.50);
 let d=scene.length+6,q=scene.routeAt(d),s={...scene.positionAt(d,lane(d)),a:P.angle(q.a+Math.PI),b:P.angle(q.a+Math.PI),v:4,steer:0};
 const samples=[{...s,d}];
 for(let i=0;d>-9&&i<8000;i++){
  const target=scene.positionAt(d-7,lane(d-7)),err=P.angle(Math.atan2(target.x-s.x,target.z-s.z)-s.a);
  s=P.advance(s,{gear:1,throttle:4/7,steer:clamp(Math.atan(2*3.7*Math.sin(err)/7)/.59,-1,1)},.1);
  const next=scene.locate(s).s;if(next>=d-1e-5)throw Error('JQD opposing trajectory stalled');d=next;samples.push({...s,d});
 }
 if(d>-9)throw Error('JQD opposing trajectory incomplete');
 function at(d){d=clamp(d,samples.at(-1).d,samples[0].d);let lo=0,hi=samples.length-1;while(hi-lo>1){const m=(hi+lo)>>1;if(samples[m].d>=d)lo=m;else hi=m;}const a=samples[lo],b=samples[hi],t=(a.d-d)/(a.d-b.d),mix=k=>a[k]+(b[k]-a[k])*t,ang=k=>P.angle(a[k]+P.angle(b[k]-a[k])*t);return {x:mix('x'),z:mix('z'),a:ang('a'),b:ang('b'),steer:mix('steer'),d};}
 return {at,samples};
}
function create(P,world,scene,reverse,random=Math.random){
 const count=1+Math.min(2,Math.floor(random()*3)),pool=[...ZONES],plans=[];let active=[],clock=0,path=null;
 for(let i=0;i<count;i++){const j=Math.min(pool.length-1,Math.floor(random()*pool.length)),zone=pool.splice(j,1)[0],station=zone+(random()-.5)*54;plans.push({id:'truck-'+i,zone,station,target:reverse?scene.length-station:station,speed:3.5+random()*1.2,cab:cabColors[(i+Math.floor(random()*cabColors.length))%cabColors.length],color:boxColors[(i+Math.floor(random()*boxColors.length))%boxColors.length],used:false});}plans.sort((a,b)=>a.target-b.target);
 function trajectory(){if(path)return path;let dirs=cache.get(world);if(!dirs){dirs={};cache.set(world,dirs);}const key=reverse?'reverse':'forward';return path=dirs[key]||(dirs[key]=buildPath(P,scene));}
 const bodies=s=>[P.tractor(s),P.trailer(s)];
 function intersects(a,b,gap=0){return a.some(x=>b.some(y=>P.overlap(gap?{...x,w:x.w+2*gap,l:x.l+2*gap}:x,y)));}
 const span=s=>({front:s.d-6,rear:s.d+14}); // conservative longitudinal queue envelope
 function tick(prev,next,dt,started,cars){clock+=dt;const d=scene.locate(next).s,player=bodies(next),oldPlayer=bodies(prev);let hit=false,horn=false;
  for(const p of plans){if(p.used||!started||d<p.target-105)continue;if(d>p.target+45){p.used=true;continue;}
   const near=cars.map(c=>({front:c.d-c.l/2,rear:c.d+c.l/2})).concat(active.map(span));let start=Math.max(d+85,p.target+42);
   for(let i=0;i<near.length+1;i++){const conflict=near.find(b=>start-6<b.rear+5&&start+14>b.front-5);if(!conflict)break;start=conflict.rear+12;}
   if(start>scene.length+6||start>d+165)continue;
   p.used=true;active.push({...p,...trajectory().at(start),v:p.speed,waiting:false,lastHorn:-Infinity});
  }
  active.sort((a,b)=>a.d-b.d);
  for(let i=0;i<active.length;i++){
   let c=active[i],gap=c.d-d,ai=bodies(c),near=Math.abs(gap)<45;
   if(near&&(intersects(player,ai)||intersects(oldPlayer,ai))){hit=true;break;}
   // In open valley sections the mountain-side truck yields on the forward
   // trip. In the reverse trip the opposing truck crawls only when clear.
   // Neither direction forces a pass through a blocked sweep envelope.
   let target=c.speed,waiting=false;
   const tailClear=gap < -30;
   if(!reverse&&!tailClear&&gap<46){target=0;waiting=true;}
   else if(!tailClear&&gap<58){target=Math.min(target,2.6);}
   let lower=-Infinity;
   for(const a of cars)if(a.d<c.d)lower=Math.max(lower,a.d+a.l/2+10);
   for(let j=0;j<i;j++)lower=Math.max(lower,active[j].d+23);
   if(lower>-Infinity){target=Math.min(target,Math.sqrt(Math.max(0,4*(c.d-lower))));if(c.d-lower<.4)waiting=true;}
   // Look ahead through the braking sweep, including the independently
   // articulated trailer. The 0.5 m buffer is intentionally conservative.
   if(Math.abs(gap)<65&&!tailClear){const look=Math.max(2,c.v*c.v/5+1.2),futurePlayer=bodies({...next,...P.at(next.x,next.z,next.a,Math.max(0,next.v)*.6)});
    for(let off=0;off<=look+.01;off+=.5){const test=bodies(trajectory().at(c.d-off));if(intersects(test,player,.5)||intersects(test,futurePlayer,.5)){target=0;waiting=true;break;}}
   }
   const v=c.v+clamp(target-c.v,-3.0*dt,1.3*dt),desired=Math.max(0,(v+c.v)*dt/2);
   let nd=Math.max(c.d-desired,Math.min(c.d,lower));let n={...c,...trajectory().at(nd),v,waiting};
   // The AI may brake faster than its nominal deceleration to avoid entering
   // the final safety buffer. A player driving into its stationary body still
   // triggers actual contact, not an invisible enlarged collision box.
   if(near&&intersects(bodies(n),player,.5)){n={...c,v:0,waiting:true};}
   if(nd===c.d)n.v=0;
   if(near&&(intersects(player,bodies(n))||intersects(oldPlayer,bodies(n)))){hit=true;break;}
   if(gap>=-7&&gap<=43&&clock-c.lastHorn>3.5&&player.some(b=>P.corners(b).some(p=>scene.locate(p).r<.05))){n.lastHorn=clock;horn=true;}
   active[i]=n;
  }
  active=active.filter(c=>c.d>-8&&c.d>d-100);
  return {hit,horn};
 }
 // Low-face AI-only version of the original tractor/container silhouette;
 // dimensions, axle positions and separate terrain planes match the player.
 function model(c){const out=[],terrain=world.terrainPose(c),h=P.hitch(c);let base=c,angle=c.a,plane=terrain.tractor;
  const pt=(f,r,y)=>{const p=P.at(base.x,base.z,angle,f,r);return {...p,y:y+plane.heightAt(p)};};
  const face=(coords,color,emit=false)=>out.push({v:coords.map(p=>pt(...p)),c:color,depth3D:true,...(emit?{emit:true}:{})});
  const shade=(hex,k)=>'#'+[1,3,5].map(i=>Math.round(clamp(parseInt(hex.slice(i,i+2),16)*k,0,255)).toString(16).padStart(2,'0')).join('');
  function box(f,r,w,l,y,height,col){const x=f-l/2,X=f+l/2,z=r-w/2,Z=r+w/2,Y=y+height;face([[x,z,Y],[X,z,Y],[X,Z,Y],[x,Z,Y]],shade(col,1.12));face([[x,z,y],[x,z,Y],[x,Z,Y],[x,Z,y]],shade(col,.82));face([[X,z,y],[X,z,Y],[X,Z,Y],[X,Z,y]],col);face([[x,z,y],[X,z,y],[X,z,Y],[x,z,Y]],shade(col,.85));face([[x,Z,y],[X,Z,y],[X,Z,Y],[x,Z,Y]],shade(col,.93));}
  function wheel(f,r,turn=0){const R=.51,W=.20,segments=8,center=P.at(base.x,base.z,angle,f,r),a=angle+turn;const p=(t,side,rr=R)=>{const x=P.at(center.x,center.z,a,Math.sin(t)*rr,side);return {...x,y:.53+Math.cos(t)*rr+plane.heightAt(x)};};const add=(v,c)=>out.push({v,c,depth3D:true});for(let j=0;j<segments;j++){const t=j*2*Math.PI/segments,u=(j+1)*2*Math.PI/segments;add([p(t,-W),p(u,-W),p(u,W),p(t,W)],'#24292c');}const side=Math.sign(r)*W;add(Array.from({length:segments},(_,i)=>p(i*2*Math.PI/segments,side)),'#34393c');add(Array.from({length:segments},(_,i)=>p(i*2*Math.PI/segments,side+Math.sign(r)*.005,.25)),'#929ca2');}
  box(1.65,0,2.25,6.35,.8,.35,'#28383f');box(3.25,0,2.48,3.25,1.02,1.43,c.cab);box(3.12,0,2.48,2.95,2.44,1.35,c.cab);
  box(4.61,0,2.22,.025,2.77,.87,'#294b5b');for(const r of [-1,1]){box(3.59,r*1.249,.02,1.55,2.79,.84,'#365767');box(4.41,r*1.24,.21,.30,2.7,.59,'#24333b');box(4.98,r*.91,.37,.025,1.45,.25,'#f4e9bd');wheel(3.7,r*1.04,c.steer);wheel(0,r*.96);wheel(-1.16,r*.96);}
  box(4.92,0,2.32,.12,1.5,.72,'#303c42');box(4.97,0,2.46,.08,1.08,.3,'#626f73');
  base=h;angle=c.b;plane=terrain.trailer;box(-5.5,0,2.5,13.3,.85,.29,'#303b40');box(-6.05,0,2.44,12.2,1.13,2.61,c.color);
  for(const r of [-1,1]){for(let f=-11.8;f<-.2;f+=.74){const z=r*1.223;face([[f-.035,z,1.25],[f+.035,z,1.25],[f+.035,z,3.63],[f-.035,z,3.63]],shade(c.color,.72));}for(const f of [-7.55,-8.7,-9.85])wheel(f,r*1.03);box(-12.17,r*.99,.28,.03,.95,.18,'#cc4b32');}
  box(-12.15,0,2.55,.14,.83,.22,'#9ea6a9');
  // The hinge and tyre cap polygons are planar under the terrain affine map.
  return out;
 }
 return {tick,plan:()=>plans.map(p=>({...p})),trucks:()=>active.map(c=>({...c})),blocks:()=>active.map(c=>({...span(c),d:c.d})),faces:()=>active.flatMap(model),mirrorStamp:()=>active.map(c=>`${c.id}:${Math.round(c.d*5)}`).join(','),trajectory};
}
return Object.freeze({create,buildPath,ZONES});
});
