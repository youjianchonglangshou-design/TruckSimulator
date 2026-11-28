/* Independent rigid passenger-car dynamics. World convention matches Physics: +Z forward at heading 0. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.TruckPassengerPhysics=api})(globalThis,function(){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),move=(v,t,d)=>v+clamp(t-v,-d,d),angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const practiceWorld=Object.freeze({bounds:Object.freeze({minX:-36,maxX:36,minZ:-180,maxZ:1800}),obstacles:Object.freeze([{x:-10,z:22,a:0,w:3,l:6,h:1.4},{x:10,z:22,a:0,w:3,l:6,h:1.4},{x:0,z:60,a:0,w:10,l:1,h:1.2},{x:18,z:95,a:.4,w:4,l:8,h:1.4}].map(Object.freeze))});
function create(raw,world=practiceWorld,geometry){
 if(!geometry?.overlap||!geometry?.corners)throw Error('passenger geometry dependency missing');
 const spec=Object.freeze({...raw});for(const k of ['length','width','wheelbase','track','minTurningRadius','maxForwardSpeed','maxReverseSpeed','acceleration0to100'])if(!Number.isFinite(spec[k])||spec[k]<=0)throw Error('invalid passenger specification '+k);
 const {length,width,wheelbase:L,track,minTurningRadius:R}=spec,r=Math.sqrt(R*R-L*L)-track/2;if(!(r>0)||L>length||track>width)throw Error('invalid axle or turning radius');
 const maxSteer=Math.atan(L/r),bounds=Object.freeze({...world.bounds}),obstacles=Object.freeze(world.obstacles.map(o=>Object.freeze({...o})));
 if(!['minX','maxX','minZ','maxZ'].every(k=>Number.isFinite(bounds[k]))||bounds.minX>=bounds.maxX||bounds.minZ>=bounds.maxZ||obstacles.some(o=>!['x','z','a','w','l'].every(k=>Number.isFinite(o[k]))||o.w<=0||o.l<=0))throw Error('invalid passenger practice world');
 const levels=Object.freeze([{id:'K13-P03-TEST',name:'單車體物理測試場',theme:'practice'}]);
 const at=(s,f)=>({x:s.x+Math.sin(s.a)*f,z:s.z+Math.cos(s.a)*f});
 const center=s=>at(s,L/2),body=s=>({...center(s),a:s.a,w:width,l:length}),rear=s=>at(s,(L-length)/2),front=s=>at(s,(L+length)/2),bodies=s=>[body(s)];
 function collision(s){const b=body(s);if(world.bodyCollision)return world.bodyCollision(b);return geometry.corners(b).some(p=>world.boundary?!world.boundary(p):p.x<bounds.minX||p.x>bounds.maxX||p.z<bounds.minZ||p.z>bounds.maxZ)||obstacles.some(o=>geometry.overlap(b,o))}
 function start(){return {x:world.start?.x??0,z:world.start?.z??0,a:world.start?.a??0,v:0,steer:0,gear:0,hits:0,contact:false,broken:false,elapsed:0}}
 const forward=spec.maxForwardSpeed/3.6,reverse=spec.maxReverseSpeed/3.6,acc=(100/3.6)/spec.acceleration0to100;
 function advance(initial,input={},dt=.02){
  if(!Number.isFinite(dt)||dt<0||dt>2)throw Error('invalid passenger dt');if(initial.broken||dt===0)return {...initial};
  if(!['x','z','a','v','steer','elapsed','hits'].every(k=>Number.isFinite(initial[k])))throw Error('invalid passenger state');
  const req=[-1,0,1].includes(input.gear)?input.gear:initial.gear,throttle=clamp(Number.isFinite(input.throttle)?input.throttle:0,0,1),steer=clamp(Number.isFinite(input.steer)?input.steer:0,-1,1),braking=!!input.brake||!!input.hand;
  let s={...initial},remaining=dt;
  while(remaining>1e-10&&!s.broken){
   // Bound translation and rotation even at the maximum configured speed; collision evaluated before committing pose.
   const h=Math.min(remaining,.01,.075/(Math.abs(s.v)+.2));remaining-=h;
   let gear=s.gear;if(req===0||req===gear||Math.abs(s.v)<.15||Math.sign(s.v)===req)gear=req;
   let v=s.v;
   if(braking)v=move(v,0,(input.hand?10:7)*h);
   else if(!gear||!throttle)v=move(v,0,(gear?1.25:.65)*h);
   else {
    // A slope can produce tiny opposite-direction creep in N. Consume only the
    // time needed to arrest it, then apply propulsion in the same substep.
    // Otherwise gravity restores the creep forever and D/R never accelerates.
    let driveTime=h;
    if(v*gear<0){const stopTime=Math.abs(v)/7;v=move(v,0,7*h);driveTime=Math.max(0,h-stopTime);}
    if(driveTime>0){const cap=gear>0?forward:reverse,mag=Math.abs(v),a=gear<0?1.8:acc*(mag<=100/3.6?1:Math.max(.18,1-.82*(mag-100/3.6)/Math.max(1,forward-100/3.6)));v=gear*move(mag,cap*throttle,a*driveTime);}
   }
   if(!braking&&world.gravity){const g=world.gravity(s);if(Number.isFinite(g))v=clamp(v+g*h,-reverse,forward);}
   v=clamp(v,-reverse,forward);
   const speed=Math.max(Math.abs(v),Math.abs(s.v)),limit=Math.min(maxSteer,Math.atan(L*5/Math.max(.001,speed*speed)));
   const steering=clamp(move(s.steer,steer*limit,1.8*h),-limit,limit),d=(s.v+v)*h/2,k=Math.tan(steering)/L,da=d*k,a=angle(s.a+da);
   const dx=Math.abs(k)<1e-9?Math.sin(s.a)*d:(Math.cos(s.a)-Math.cos(s.a+da))/k,dz=Math.abs(k)<1e-9?Math.cos(s.a)*d:(Math.sin(s.a+da)-Math.sin(s.a))/k;
   const next={...s,x:s.x+dx,z:s.z+dz,a,v,steer:steering,gear,elapsed:s.elapsed+h};
   if(world.fall?.(next)){s={...next,v:0,gear:0,broken:true,fallen:true,fallVelocity:next.v};break;}
   if(collision(next)){
    // Locate the last non-overlapping pose within this bounded motion step.
    let lo=0,hi=1;for(let i=0;i<20;i++){const t=(lo+hi)/2,q={...s,x:s.x+dx*t,z:s.z+dz*t,a:angle(s.a+da*t)};if(collision(q))hi=t;else lo=t;}
    const hits=s.hits+(s.contact?0:1),x=s.x+dx*lo,z=s.z+dz*lo;
    s={...s,x,z,a:angle(s.a+da*lo),v:0,steer:steering,gear:hits>=10?0:gear,elapsed:s.elapsed+h+remaining,contact:true,contactX:s.contact?s.contactX:x,contactZ:s.contact?s.contactZ:z,hits,broken:hits>=10};break;
   }
   if(s.contact&&Math.hypot(next.x-s.contactX,next.z-s.contactZ)>.18){next.contact=false;delete next.contactX;delete next.contactZ;}s=next;
  }return s;
 }
 return Object.freeze({spec,maxSteer,levels,bounds,obstacles,start,advance,body,bodies,center,rear,front,collision});
}
return Object.freeze({create,practiceWorld});});
