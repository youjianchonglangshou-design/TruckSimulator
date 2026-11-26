/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6Guidance=api;})(globalThis,function(){'use strict';
function createGuidanceSystemCore(svc){
function guidanceTurns(n,state){
 const q=svc.P.levels[n],scene=q.scene;
 const provided=scene?.turnMarkers;
 if(provided){const list=typeof provided==='function'?provided(state):provided;return (Array.isArray(list)?list:[]).filter(m=>m&&[m.x,m.z,m.a].every(Number.isFinite)&&(!m.when||m.when(state)));}
 let list=[];
 if(['alley','factory','construction'].includes(q.theme)&&!scene){
  // These training yards have no public-road intersection: mark the entrance to the approach corridor.
  const entry={alley:-8.8,factory:-9.5,construction:-9.2}[q.theme];
  const p=svc.P.local(n,0,entry);list.push({...p,a:svc.P.angle((q.heading||0)+Math.PI),approach:true});
 }
 return list;
}
function guidanceGoal(n){
 if(svc.P.levels[n].theme==='practice'||svc.P.levels[n].scene?.driveThrough)return null;
 const g=svc.P.goal(n);
 // Match the actual paint: the original tutorial and NS5 use slightly different visual extents.
 if(n<3)return {...g,z:-34.95,w:3.34,l:14};
 if(typeof svc.P.levels[n].scene?.visualGoal==='function')return svc.P.levels[n].scene.visualGoal(g);
 return g;
}
function guidanceGoalVisible(n,state){return svc.P.levels[n].scene?.goalVisible?.(state)??true;}
function guideColor(r,g,b,a=1){return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;}
function guideTag(begin,center){for(let i=begin;i<svc.faces.length;i++)svc.faces[i].guidance=center;}
function guidanceTurnArrow(m,pulse,phase){
 const size=1+.045*(pulse-.5),y=1.34+.14*Math.sin(phase);const start=svc.faces.length;
 const outline=guideColor(76,56,13,.85),front=guideColor(255,185+60*pulse,55+95*pulse,.97),side=guideColor(173+60*pulse,108+65*pulse,18,.96),top=guideColor(255,226+28*pulse,125+80*pulse,.98);
 // A solid flat-sided extruded arrow whose tip follows the outgoing street, not the camera.
 const pts=[[-1.30,-.25],[.24,-.25],[.24,-.58],[1.40,0],[.24,.58],[.24,.25],[-1.30,.25]];
 const a=pts.map(([f,h])=>svc.C(m.x,m.z,m.a,f*size,-.14,y+h*size)),b=pts.map(([f,h])=>svc.C(m.x,m.z,m.a,f*size,.14,y+h*size));
 svc.face(a,front,outline);svc.face(b,front,outline);for(let i=0;i<a.length;i++){let j=(i+1)%a.length;svc.face([a[i],a[j],b[j],b[i]],pts[i][1]+pts[j][1]>0?top:side,outline);}
 guideTag(start,svc.V(m.x,y,m.z));
}
function guidanceDownArrow(g,pulse,phase){
 const p=svc.P.at(g.x,g.z,g.a,Math.min(2.2,g.l*.2)),y=1.52+.14*Math.sin(phase),half=.49,core=.19,top=y+1.56,neck=y+.81,start=svc.faces.length;
 const A=[[-1,-1],[1,-1],[1,1],[-1,1]],ring=(r,h)=>A.map(([a,b])=>svc.C(p.x,p.z,g.a,a*r,b*r,h));
 const large=ring(half,neck),upper=ring(core,top),lower=ring(core,neck),tip=svc.V(p.x,y,p.z),edge=guideColor(22,111,62,.92);
 const colors=[guideColor(66+75*pulse,230+24*pulse,100+68*pulse),guideColor(33+45*pulse,169+65*pulse,75+50*pulse),guideColor(98+65*pulse,241+13*pulse,128+64*pulse),guideColor(48+52*pulse,199+47*pulse,79+60*pulse)];
 for(let i=0;i<4;i++){let j=(i+1)%4;svc.face([large[i],large[j],tip],colors[i],edge);svc.face([lower[i],lower[j],upper[j],upper[i]],colors[i],edge);svc.face([large[i],large[j],lower[j],lower[i]],colors[(i+2)%4],edge);}svc.face(upper,colors[2],edge);
 guideTag(start,svc.V(p.x,y+.78,p.z));
}
function guidanceFrame(g,pulse){
 const center=svc.P.at(g.x,g.z,g.a,g.l/2),glow=guideColor(31,255,111,.10+.23*pulse),edge=guideColor(42+52*pulse,218+37*pulse,73+82*pulse,.78+.20*pulse),core=guideColor(120+92*pulse,249,133+78*pulse,.82+.18*pulse);
 for(let r of [-g.w/2,g.w/2]){const p=svc.P.at(center.x,center.z,g.a,0,r);svc.flat(p.x,p.z,.42,g.l+.20,glow,g.a,.052);svc.flat(p.x,p.z,.18,g.l+.12,edge,g.a,.055);svc.flat(p.x,p.z,.065,g.l+.10,core,g.a,.058);}
 for(let f of [0,g.l]){const p=svc.P.at(g.x,g.z,g.a,f);svc.flat(p.x,p.z,g.w+.42,.42,glow,g.a,.053);svc.flat(p.x,p.z,g.w+.18,.18,edge,g.a,.056);svc.flat(p.x,p.z,g.w+.12,.065,core,g.a,.059);}
}
function placeNico(){
 const g=guidanceGoal(svc.level),q=svc.P.levels[svc.level],N=globalThis.NicoGuide;
 svc.nicoPlacement=g&&N?N.create(g,svc.P.obstacles(svc.level),q.scene?.bounds|| (p=>Math.abs(p.x)<34&&p.z>-36&&p.z<41),svc.P):null;
}
function buildGuidance(now){
 svc.nicoFrameTime=now;
 const prev=svc.faces;svc.faces=[];const phase=now/1000*2*Math.PI/2.2,pulse=.5+.5*Math.sin(phase);
 for(const m of guidanceTurns(svc.level,svc.s))if(Math.hypot(m.x-svc.s.x,m.z-svc.s.z)<110)guidanceTurnArrow(m,pulse,phase);
 const g=guidanceGoal(svc.level);if(g&&guidanceGoalVisible(svc.level,svc.s)&&Math.hypot(g.x-svc.s.x,g.z-svc.s.z)<110){guidanceFrame(g,pulse);if(!svc.nicoPlacement||!globalThis.NicoGuide?.imageAt(now))guidanceDownArrow(g,pulse,phase);}
 if(svc.nicoPlacement&&globalThis.NicoGuide?.imageAt(now))svc.faces.push(...NicoGuide.groundFaces(svc.nicoPlacement,now));
 const result=svc.faces;svc.faces=prev;return result;
}
function guideOccluded(p,c,obstacles){
 for(const o of obstacles){const a=o.a||0,dx=p.x-c.x,dz=p.z-c.z,sn=Math.sin(a),cs=Math.cos(a),h=Number.isFinite(o.h)?o.h:(o.kind==='container'?3.4:3.7);let lo=0,hi=1;
  const axes=[[(c.x-o.x)*cs-(c.z-o.z)*sn,dx*cs-dz*sn,o.w/2],[(c.x-o.x)*sn+(c.z-o.z)*cs,dx*sn+dz*cs,o.l/2],[c.y-h/2,p.y-c.y,h/2]];
  for(const [origin,v,half] of axes){if(Math.abs(v)<1e-9){if(Math.abs(origin)>half){lo=2;break;}}else{const u=(-half-origin)/v,w=(half-origin)/v;lo=Math.max(lo,Math.min(u,w));hi=Math.min(hi,Math.max(u,w));}if(lo>hi)break;}
  if(lo<=hi&&lo<.992&&hi>.008)return true;
 }return false;
}
return Object.freeze({guidanceTurns,guidanceGoal,guidanceGoalVisible,guideColor,guideTag,guidanceTurnArrow,guidanceDownArrow,guidanceFrame,placeNico,buildGuidance,guideOccluded});
}
return Object.freeze({createGuidanceSystemCore});
});
