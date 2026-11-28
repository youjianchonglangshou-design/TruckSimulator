(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckRadarSystem=api;})(globalThis,function(){'use strict';
const revisions=new WeakMap();
function revision(canvas){return canvas?(revisions.get(canvas)||0):undefined;}
function createRadarSystem(){
 let selected='auto',lastAuto='heading',last=0;
 function orientation(gear){if(gear===1)lastAuto='heading';else if(gear===-1)lastAuto='fixed';return selected==='auto'?lastAuto:selected;}
 function cycle(){selected=({auto:'heading',heading:'fixed',fixed:'auto'})[selected];last=-Infinity;return selected;}
 function setMode(mode){if(!['auto','heading','fixed'].includes(mode))return false;selected=mode;last=-Infinity;return true;}
 function draw({canvas:el,vehicle:s,gear,level,nearGap,nicoPlacement,DPR,enabled,difficultyMode,now,interval,P,orderedCorners,roadBounds,bodies,size}){
  const yaw=orientation(gear)==='fixed'?0:s.a;
  if(!enabled||difficultyMode||now-last<interval)return;last=now;
  const w=size?.width??el.clientWidth,h=size?.height??el.clientHeight;
if(!w||!h)return;const d=Math.min(2,DPR);if(el.width!==Math.round(w*d)||el.height!==Math.round(h*d)){el.width=Math.round(w*d);el.height=Math.round(h*d)}const c=el.getContext('2d');c.setTransform(d,0,0,d,0,0);c.fillStyle='#111f26';c.fillRect(0,0,w,h);const scale=Math.min(w/36,h/46),origin=P.at(s.x,s.z,yaw,-6),co=Math.cos(yaw),si=Math.sin(yaw),pt=p=>[w/2+((p.x-origin.x)*co-(p.z-origin.z)*si)*scale,h/2-((p.x-origin.x)*si+(p.z-origin.z)*co)*scale];function poly(o,fill,stroke){const v=orderedCorners(o).map(pt);c.beginPath();c.moveTo(...v[0]);v.slice(1).forEach(a=>c.lineTo(...a));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}}c.save();c.beginPath();c.rect(0,0,w,h);c.clip();for(let x=0;x<w;x+=4)for(let y=0;y<h;y+=4){const p=P.at(origin.x,origin.z,yaw,(h/2-y-2)/scale,(x+2-w/2)/scale);if(roadBounds(p)){c.fillStyle='#30434b';c.fillRect(x,y,4,4)}}for(const o of P.obstacles(level))poly(o,'#71818a','#82959b');if(P.levels[level].theme!=='practice'){const g=P.goal(level),p=P.at(g.x,g.z,g.a,g.l/2);poly({...p,a:g.a,w:g.w,l:g.l},'#135c4933','#65ffa8');const q=pt(p);if(q[0]<4||q[0]>w-4||q[1]<4||q[1]>h-4){const ex=P.clamp(q[0],7,w-7),ey=P.clamp(q[1],14,h-7),a=Math.atan2(q[1]-h/2,q[0]-w/2);c.save();c.translate(ex,ey);c.rotate(a);c.beginPath();c.moveTo(5,0);c.lineTo(-4,-4);c.lineTo(-4,4);c.closePath();c.fillStyle='#65ffa8';c.fill();c.restore()}}const shapes=bodies?bodies.map(r=>[r,'#e7f2ef']):[[P.trailer(s),'#ba633f'],[P.tractor(s),'#e7f2ef']];for(const [r,col] of shapes)poly(r,col,'#e0e9de');if(nearGap<=1.5){c.strokeStyle=nearGap<=.3?'#ff3e49':'#ffb459';c.lineWidth=1.5;for(const [r] of shapes)poly({...r,w:r.w+.6,l:r.l+.6},null,c.strokeStyle)}if(nicoPlacement&&!nicoPlacement.hidden){const q=pt(nicoPlacement);c.fillStyle='#64ffb1';c.beginPath();c.arc(q[0],q[1],2,0,Math.PI*2);c.fill()}c.restore();revisions.set(el,(revisions.get(el)||0)+1)}
 return Object.freeze({orientation,cycle,setMode,mode:()=>selected,draw,resetFrame:()=>{last=-Infinity}});
}

return Object.freeze({createRadarSystem,revision});
});
