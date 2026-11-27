/* Lightweight moving oncoming vehicles, JQD only. World units metres; no static scene rebuild. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.JQDTraffic=api;})(globalThis,function(){'use strict';
const LIMITS=Object.freeze({forward:Object.freeze([[4,8],[6,12],[8,16]].map(Object.freeze)),reverse:Object.freeze([[6,12],[8,16],[12,20]].map(Object.freeze))});
// Distance is measured in the driver's direction. World geometry is never mirrored.
function travelScene(scene){const k=scene.travelDirection?.()===-1?-1:1,L=scene.length;if(k===1)return scene;return {...scene,routeAt:d=>{const p=scene.routeAt(L-d);return {...p,s:d,a:p.a+Math.PI};},positionAt:(d,r=0,y=0)=>scene.positionAt(L-d,-r,y),locate:p=>{const q=scene.locate(p);return {...q,s:L-q.s,r:-q.r};}};}

const MODELS=Object.freeze([
 {type:'sedan',w:1.82,l:4.65,h:1.45,front:.27,back:-.29,roofFront:.08,roofBack:-.16},
 {type:'hatchback',w:1.76,l:4.10,h:1.52,front:.25,back:-.44,roofFront:.06,roofBack:-.36},
 {type:'suv',w:1.93,l:4.80,h:1.78,front:.29,back:-.45,roofFront:.13,roofBack:-.36},
 {type:'wagon',w:1.86,l:4.72,h:1.59,front:.26,back:-.44,roofFront:.06,roofBack:-.35},
 {type:'compact',w:1.70,l:3.82,h:1.49,front:.30,back:-.41,roofFront:.12,roofBack:-.30},
 {type:'mpv',w:1.88,l:4.58,h:1.85,front:.35,back:-.45,roofFront:.24,roofBack:-.39}
]);
const COLORS=['#d9dcdf','#354d6d','#b33b36','#5c6268','#e2b955','#263237','#49756b','#9c7258','#8a92a2','#f1f0e8','#725980','#4984a4'];
const lane=-2.55,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function tint(c,k){return '#'+[1,3,5].map(i=>Math.round(clamp(parseInt(c.slice(i,i+2),16)*k,0,255)).toString(16).padStart(2,'0')).join('');}
function create(P,worldScene,random=Math.random){
 const reverse=worldScene.travelDirection?.()===-1,scene=travelScene(worldScene),length=scene.length,models=[...MODELS],colors=[...COLORS];let lastModel,lastColor;
 const draw=a=>a.splice(Math.min(a.length-1,Math.floor(random()*a.length)),1)[0];
 const range=LIMITS[reverse?'reverse':'forward'],quantile=random(),quota=range.map(([lo,hi])=>lo+Math.floor(quantile*(hi-lo+1)));
 const curve=d=>P.angle(scene.routeAt(d+12).a-scene.routeAt(d-12).a),bend=d=>clamp(Math.abs(curve(d))/.24,0,1);
 const candidates=Array.from({length:Math.ceil(length/4)},(_,i)=>{const d=(i+random())*4;return {d,b:bend(d),left:curve(d)<-.085};}).filter(c=>c.d>=12&&c.d<=length-35);
 let groups=[],plans=[],id=0,groupId=0,active=[],clock=0,crashed=false;
 let risk=0,riskStation=null,occupiedDistance=0,tier=0,adaptiveCount=0;
 function choose(min,pair,adaptive){const max=length-(pair?85:35),gap=adaptive||reverse?100:150;
  let pool=candidates.filter(c=>c.d>=min&&c.d<=max&&groups.every(g=>Math.abs(g.target-c.d)>=gap));
  if(!pool.length)return null;
  const weight=c=>1+3*c.b+(adaptive&&c.left?4:0);let r=random()*pool.reduce((sum,c)=>sum+weight(c),0);for(const c of pool){r-=weight(c);if(r<0)return c;}return pool.at(-1);
 }
 function add(pick,n,adaptive){const g={target:pick.d,bend:pick.b,speed:4.5+random()*2.3,used:false,adaptive,id:groupId++};const spacing=n===2?g.speed*(6+random()*4):0;
  g.members=Array.from({length:n},(_,index)=>{if(!models.length)models.push(...MODELS.filter(m=>m.type!==lastModel));if(!colors.length)colors.push(...COLORS.filter(c=>c!==lastColor));const m=draw(models);lastModel=m.type;const color=draw(colors);lastColor=color;
   const p={...m,color,group:g.id,zone:id++,index,target:g.target+index*spacing/2,groupTarget:g.target,spacing:index*spacing,speed:g.speed,enabled:true,used:false,adaptive,leftBias:pick.left};plans.push(p);return p;});groups.push(g);
 }
 // Spread the base traffic across random curve-weighted locations, with occasional pairs.
 const base=quota[0],baseGroups=Math.max(Math.ceil(base/2),Math.min(base,reverse?Math.max(5,Math.round(base*.69)):Math.max(4,Math.round(base*.68))));
 let pairs=base-baseGroups;
 for(let i=0;i<baseGroups;i++){const pair=pairs>0&&(pairs===baseGroups-i||random()<pairs/(baseGroups-i));const c=choose(12,pair,false)||choose(12,pair,true);if(!c)break;add(c,pair?2:1,false);if(pair)pairs--;}
 function sort(){groups.sort((a,b)=>a.target-b.target);plans.sort((a,b)=>a.target-b.target);}
 sort();
 const Heavy=typeof module==='object'&&module.exports?require('./jqd-trucks.js'):globalThis.JQDTrucks;
 const heavy=Heavy.create(P,worldScene,scene,reverse,random);
 const locate=scene.locate;
 function pose(c,d){const p=scene.positionAt(d,lane);return {...c,...p,d,a:scene.routeAt(d).a+Math.PI};}
 function intrusion(s,threshold=.06){return [P.tractor(s),P.trailer(s)].some(b=>P.corners(b).some(p=>locate(p).r<threshold));}
 // Sustained encroachment changes the round's traffic budget. A short accidental
 // crossing is not penalised; stopping/reversing cannot accumulate more distance.
 function adapt(next,d,started){if(!started||next.v<=.5)return;if(riskStation===null){riskStation=d;return;}if(d-riskStation<8)return;const delta=Math.min(12,d-riskStation);riskStation=d;
  const occupied=intrusion(next,-.55);risk=clamp(risk+(occupied?delta/65:-delta/155),0,1);if(occupied)occupiedDistance+=delta;
  tier=occupiedDistance>=112?2:occupiedDistance>=24?1:0;
  if(!tier||plans.length>=quota[tier])return;
  // Schedule real cars ahead, not next to the cab. Prefer left curves in the
  // current travel direction; available straight sections retain nonzero odds.
  while(plans.length<quota[tier]){let n=quota[tier]-plans.length>=2&&random()<.68?2:1;let c=choose(d+85,n===2,true);if(!c&&n===2){n=1;c=choose(d+85,false,true);}if(!c)break;add(c,n,true);adaptiveCount+=n;}
  sort();
 }
 function tick(prev,next,dt,started){if(crashed)return {hit:false,horn:false};clock+=dt;const d=locate(next).s;
  adapt(next,d,started);
  const truckEvent=heavy.tick(prev,next,dt,started,active);if(truckEvent.hit){crashed=true;return {hit:true,horn:false,truckHit:true};}
  const truckBlocks=heavy.blocks();
  for(const g of groups){if(g.used)continue;if(d>g.target+25){g.used=true;for(const p of g.members)p.used=true;continue;}if(!started||d<g.target-(g.adaptive?72:48))continue;
   const gap=Math.max(0,g.target-d),lead=clamp(gap*g.speed/Math.max(3.0,Math.abs(next.v)),24,65),spacing=g.members[g.members.length-1].spacing;
   const ahead=active.filter(c=>c.d>d-20);const safeLead=Math.max(ahead.length?Math.max(...ahead.map(c=>c.d))+18:-Infinity,...truckBlocks.filter(b=>b.rear>d-20).map(b=>b.rear+10));
   const first=Math.min(length+24-spacing,Math.max(d+(g.adaptive?95:18),g.target+lead,safeLead));if(first<safeLead||first<d+(g.adaptive?95:18))continue;
   g.used=true;for(const p of g.members){p.used=true;active.push(pose({...p,lastHorn:-Infinity,spawnAt:first+p.spacing},first+p.spacing));}
  }
  let horn=false,hit=false;const bodies=[P.tractor(next),P.trailer(next)],oldBodies=[P.tractor(prev),P.trailer(prev)];
  active.sort((a,b)=>a.d-b.d);
  for(let i=0;i<active.length;i++){const c=active[i],prior=active[i-1],nextD=Math.min(c.d,Math.max(c.d-c.speed*dt,prior?prior.d+(prior.l+c.l)/2+8:-Infinity,...truckBlocks.filter(b=>b.d<c.d).map(b=>b.rear+c.l/2+3))),n=pose(c,nextD);if(Math.abs(n.d-d)<24&&(bodies.some(b=>P.overlap(b,n))||oldBodies.some(b=>P.overlap(b,n))||bodies.some(b=>P.overlap(b,c)))){hit=true;crashed=true;break;}
   active[i]=n;if(n.d-d>=-4&&n.d-d<=38&&clock-n.lastHorn>2.1&&intrusion(next)){n.lastHorn=clock;horn=true;}}
  active=active.filter(c=>c.d>=-24&&c.d>d-90);return {hit,horn,truckHorn:truckEvent.horn};
 }
 function model(c){const out=[],w=c.w,l=c.l,h=c.h,grade=(scene.routeAt(c.d+1).y-scene.routeAt(c.d-1).y)/2;
  const pt=(r,y,f)=>{const p=P.at(c.x,c.z,c.a,f,r);return {...p,y:c.y+y-grade*f};};
  const face=(v,color)=>out.push({v:v.map(p=>pt(...p)),c:color,depth3D:true});
  const ring=(f,half,y)=>[[-half,y,f],[half,y,f]];
  const quad=(a,b,color)=>face([a[0],a[1],b[1],b[0]],color);
  // Body: six tapered sections, silhouette and bumper share the collision dimensions.
  const xs=[-l*.5,-l*.43,-l*.27,l*.26,l*.43,l*.5], widths=[.40,.48,.5,.5,.48,.40],tops=[.64,.80,.83,.82,.73,.59];
  let bottom=xs.map((f,i)=>ring(f,w*widths[i],.30)),top=xs.map((f,i)=>ring(f,w*widths[i],tops[i]));
  for(let i=0;i<xs.length-1;i++){quad(top[i],top[i+1],tint(c.color,1.08));for(let j=0;j<2;j++)face([bottom[i][j],bottom[i+1][j],top[i+1][j],top[i][j]],tint(c.color,j?.92:.77));}
  quad(bottom[0],top[0],tint(c.color,.75));quad(bottom[5],top[5],tint(c.color,.88));
  const baseRear=ring(l*c.back,w*.455,.81),baseFront=ring(l*c.front,w*.455,.81),roofRear=ring(l*c.roofBack,w*.365,h),roofFront=ring(l*c.roofFront,w*.365,h);
  quad(roofRear,roofFront,tint(c.color,1.13));quad(baseFront,roofFront,'#344b58');quad(baseRear,roofRear,'#3e505a');
  for(let j=0;j<2;j++){face([baseRear[j],baseFront[j],roofFront[j],roofRear[j]],'#354a55');const interp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);const a=interp(baseRear[j],baseFront[j],.48),b=interp(baseRear[j],baseFront[j],.52),d=interp(roofRear[j],roofFront[j],.52),e=interp(roofRear[j],roofFront[j],.48);const sign=j?1:-1;[a,b,d,e].forEach(p=>p[0]+=sign*.006);face([a,b,d,e],tint(c.color,.77));}
  // Headlights, grille and tail lamps (flat plates keep polygon count low).
  for(const f of [-1,1]){const z=f*(l*.5+.002);for(const r of [-1,1]){const a=r*w*.36,b=r*w*.19;face([[a,.45,z],[b,.45,z],[b,.59,z],[a,.59,z]],f>0?'#fff1d0':'#c33129');}face([[-w*.12,.38,z],[w*.12,.38,z],[w*.12,.53,z],[-w*.12,.53,z]],'#242c30');}
  for(const f of [-l*.31,l*.30])for(const side of [-1,1]){const r=side*(w*.44),outer=r+side*w*.06,inner=r-side*w*.06,R=.32,ys=.33;
    const wheel=(a,x,rr=R)=>[x,ys+Math.cos(a)*rr,f+Math.sin(a)*rr];const n=8,cap=[];for(let i=0;i<n;i++){const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n;cap.push(wheel(a,outer));face([wheel(a,outer),wheel(b,outer),wheel(b,inner),wheel(a,inner)],'#212527');}face(cap,'#282d30');face(Array.from({length:8},(_,i)=>wheel(i*Math.PI/4,outer+side*.003,.17)),'#a7adb0');}
  return out;
 }
 return Object.freeze({tick,riskState:()=>({risk,adaptiveCount,occupiedDistance,tier,target:quota[tier],quota:[...quota],reverse}),plan:()=>plans.map(p=>({...p})),truckPlan:heavy.plan,trucks:heavy.trucks,cars:()=>active.map(c=>({...c})),mirrorStamp:()=>active.map(c=>`${c.zone}:${Math.round(c.d*5)}`).join(',')+'|'+heavy.mirrorStamp(),faces:()=>active.flatMap(model).concat(heavy.faces())});
}
function horn(audio){if(!audio||audio.state!=='running')return false;try{const t=audio.currentTime;for(const f of [370,493]){const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.085,t+.035);g.gain.setValueAtTime(.085,t+.24);g.gain.linearRampToValueAtTime(0,t+.30);g.gain.linearRampToValueAtTime(.075,t+.39);g.gain.setValueAtTime(.075,t+.54);g.gain.linearRampToValueAtTime(0,t+.63);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.65);o.onended=()=>{o.disconnect();g.disconnect();};}return true;}catch{return false;}}
return Object.freeze({create,horn,travelScene,LIMITS});
});
