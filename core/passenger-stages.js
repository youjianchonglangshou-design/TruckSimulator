/* P06: independent passenger session over original stage factories and shared scene geometry. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.TruckPassengerStages=api})(globalThis,function(){'use strict';
function create(spec,P,pack,pass,index,options={}){
 const original=P.levels[index];if(!original)throw RangeError('unknown shared stage');
 // A separate instance is essential: random bays and direction cannot mutate the suspended truck session.
 const scene=original.scene?(options.sharedScene||pack.create(P).find(x=>x.id===original.id)):null;if(original.scene&&!scene)throw Error('shared stage missing');
 const level={...original,scene},mountain=!!scene?.driveThrough,practice=level.theme==='practice',direction=options.direction===-1?-1:1;
 if(!options.sharedRound){if(scene?.randomize)scene.randomize(options.random||Math.random);if(mountain){scene.selectDirection(direction);if(direction===1&&options.station)scene.selectStart(options.station)}}
 const originalStart=scene?scene.start():P.start(index),dock=scene?scene.goal():P.goal(index),route=scene?.mission&&options.route==='out'?'out':'in',missionDirection=scene?.mission&&options.missionDirection==='reverse'?'reverse':'forward';
 if(scene?.mission&&!scene.mission.stars[(route==='out'?2:0)+(missionDirection==='reverse'?1:0)])throw Error('此任務組合不可選擇');
 // Same original mission road target; no articulated coupling is involved.
 const roadCenter=P.at(originalStart.x,originalStart.z,originalStart.a,-3.3),goal=route==='out'?{...P.at(roadCenter.x,roadCenter.z,originalStart.a,-11),a:originalStart.a,w:4,l:22,id:scene.mission.road}:dock;
 const obstacles=scene?scene.obstacles():P.obstacles(index);
 const bounds=({NS2:{minX:-24,maxX:76,minZ:-8,maxZ:105},NS5:{minX:-115,maxX:100,minZ:-30,maxZ:130},DC3:{minX:-110,maxX:100,minZ:-320,maxZ:110}})[level.id]|| (mountain?{minX:-3000,maxX:3000,minZ:-3000,maxZ:3000}:{minX:-34,maxX:34,minZ:-36,maxZ:41});
 const project=(p,g)=>{const x=p.x-g.x,z=p.z-g.z;return {f:x*Math.sin(g.a)+z*Math.cos(g.a),r:x*Math.cos(g.a)-z*Math.sin(g.a)}};
 const at=(s,f,r=0)=>P.at(s.x,s.z,s.a,f,r),rear=s=>at(s,(spec.wheelbase-spec.length)/2),body=s=>({...at(s,spec.wheelbase/2),a:s.a,w:spec.width,l:spec.length});
 const roadBounds=p=>scene?scene.bounds(p):p.x>=bounds.minX&&p.x<=bounds.maxX&&p.z>=bounds.minZ&&p.z<=bounds.maxZ;
 const info=scene?.info?.()||null,rail=mountain?info.guardrailBufferRange:null;
 const fall=s=>mountain&&(scene.fallWheels?scene.fallWheels([0,spec.wheelbase].map(f=>({p:at(s,f),a:s.a,halfTrack:spec.track/2}))):[0,spec.wheelbase].some(f=>[-1,1].some(side=>{const q=scene.locate(at(s,f,side*spec.track/2));return q.s>rail[1]&&Math.abs(q.r)>q.w/2+.12;})));
 const boundary=p=>{if(!mountain)return roadBounds(p);const q=scene.locate(p);return q.s<=rail[1]?roadBounds(p):!(q.s>=scene.length+24&&q.long>2);};
 let terrainPose,terrainValue;const terrain=s=>{if(terrainPose===s)return terrainValue;if(!mountain)return {height:0,grade:0};const y=scene.surfaceHeight(s),grade=(scene.surfaceHeight(at(s,spec.wheelbase))-y)/spec.wheelbase;terrainPose=s;return terrainValue={height:y+grade*spec.wheelbase/2,grade};};
 let start={x:originalStart.x,z:originalStart.z,a:originalStart.a};
 if(scene?.mission){const c=route==='out'?P.at(dock.x,dock.z,dock.a,spec.length/2+.15):at(start,spec.wheelbase/2),a=P.angle((route==='out'?dock.a:start.a)+((missionDirection==='reverse')!==(route==='out'&&!!scene.mission.dockForwardFlip)?Math.PI:0));start={...P.at(c.x,c.z,a,-spec.wheelbase/2),a};}
 if(scene?.mission&&route==='out')level.scene={...scene,render:svc=>scene.render({...svc,missionRoute:route})};
 const engine=pass.create(spec,{bounds,obstacles,start,boundary,bodyCollision:mountain&&scene.collisionBodies?(b=>scene.collisionBodies([b])):null,fall,gravity:s=>{const grade=terrain(s).grade;return -9.81*grade/Math.hypot(1,grade)}},P);
 const stage=Object.freeze({index,id:level.id,name:level.name,theme:level.theme,scene,goal,info,mountain,practice,direction,route,missionDirection,level,roadBounds});
 const distance=s=>practice?null:mountain?Math.max(0,direction===1?scene.length-scene.locate(rear(s)).s:scene.locate(rear(s)).s):route==='out'?Math.hypot(body(s).x-P.at(goal.x,goal.z,goal.a,goal.l/2).x,body(s).z-P.at(goal.x,goal.z,goal.a,goal.l/2).z):project(rear(s),goal).f;
 const parked=s=>!s.broken&&!practice&&!engine.collision(s)&&(mountain?distance(s)<=0:(Math.abs(s.v)<.12&&(route==='out'||Math.abs(P.angle(s.a-goal.a))<.063&&Math.abs(project(rear(s),goal).f)<.6&&Math.abs(project(rear(s),goal).r)<.35)&&P.corners(body(s)).every(p=>{const q=project(p,goal);return q.f>=-.05&&q.f<=goal.l+.01&&Math.abs(q.r)<=goal.w/2;})));
 // Traffic uses the original articulated model for AI and the passenger rectangle only for the player.
 let traffic=null;const trafficAPI=options.trafficAPI;
 function resetTraffic(){if(mountain&&trafficAPI){const player=s=>s.b===undefined;traffic=trafficAPI.create({...P,tractor:s=>player(s)?body(s):P.tractor(s),trailer:s=>player(s)?body(s):P.trailer(s)},scene,options.random||Math.random);}}
 resetTraffic();
 function advance(s,input,dt){if(s.completed||s.broken)return {...s};let next=engine.advance(s,input,dt);if(traffic&&!next.broken){const ev=traffic.tick(s,next,dt,Math.abs(next.v)>.01||next.elapsed>1&&next.gear!==0);if(ev.hit)next={...s,v:0,gear:0,elapsed:next.elapsed,hits:Math.min(10,s.hits+1),contact:true,broken:true,trafficCollision:true};}if(!options.sharedRound&&parked(next))next={...next,v:0,gear:0,completed:true};return next;}
 return Object.freeze({...engine,stage,advance,distance,parked,fall,terrain,roadBounds,get traffic(){return traffic},resetTraffic,trafficFaces:()=>traffic?.faces()||[],guide:s=>practice?'空地自由練習':mountain?`安全通過 2000m｜剩餘 ${Math.round(distance(s))} m`:route==='out'?`沿原道路駛離，停入 ${goal.id} 綠框`:scene?.guide?.({...s,b:s.a})?.replace(/貨櫃|拖板/g,'車身')||`倒入 ${goal.id} 指定停靠區`});
}
return Object.freeze({create});});
