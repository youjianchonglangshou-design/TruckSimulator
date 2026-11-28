/* One game host, interchangeable player dynamics. No DOM, rendering or game loop. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.TruckVehicleSession=api})(globalThis,function(){'use strict';
function passenger({base,geometry,mission,stages,physics,pack,spec}){
 let current=null,index=-1;
 const definition=()=>typeof spec==='function'?spec():spec;
 function rebuild(n){const scene=geometry.levels[n].scene,q=mission.get(n);current=stages.create(definition(),geometry,pack,physics,n,{sharedScene:scene,sharedRound:true,direction:scene?.travelDirection?.()||1,station:scene?.startStation?.()||0,route:q?.route,missionDirection:q?.direction});index=n;if(current.collision(current.start()))throw Error('車種起始位置有碰撞：'+current.stage.name);return current;}
 const atLevel=n=>index===n&&current?current:rebuild(n);
 const mark=s=>({...s,b:s.a,passenger:true});
 function body(s){const d=definition(),p=geometry.at(s.x,s.z,s.a,d.wheelbase/2);return {...p,a:s.a,w:d.width,l:d.length,h:d.height};}
 function rear(s){const d=definition();return geometry.at(s.x,s.z,s.a,(d.wheelbase-d.length)/2);}
 function terrain(s,n=index){const scene=geometry.levels[n]?.scene;if(!scene?.surfaceHeight)return null;const e=atLevel(n),q=e.terrain(s),y=scene.surfaceHeight(s),plane={grade:q.grade,heightAt:p=>y+q.grade*((p.x-s.x)*Math.sin(s.a)+(p.z-s.z)*Math.cos(s.a))};return {tractor:plane,trailer:plane};}
 return Object.freeze({...base,kind:'passenger',spec:definition,rebuild,start:n=>mark(atLevel(n).start()),advance:(s,input,dt)=>mark(atLevel(index).advance(s,input,dt)),collision:(s,n)=>atLevel(n).collision(s),parked:(s,n)=>atLevel(n).parked(s),distance:(s,n)=>atLevel(n).distance(s),goal:n=>atLevel(n).stage.goal,tractor:body,trailer:body,bodies:s=>[body(s)],hitch:s=>geometry.at(s.x,s.z,s.a,definition().wheelbase/2),rear,terrain,fall:(s,n)=>atLevel(n).fall(s)});
}
return Object.freeze({passenger});});
