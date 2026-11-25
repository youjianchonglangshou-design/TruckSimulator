(function(g){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(Math.max(a,b),n));
function overlap(a,b){return Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-b.y)<(a.h+b.h)/2}
function arrange(items,w,h,gear,cfg={touchTarget:44,controlScale:1.5,doorGap:4}){
 const valid=items.filter(i=>i.visible&&Number.isFinite(i.x)&&Number.isFinite(i.y)&&Number.isFinite(i.w)&&Number.isFinite(i.h));
 const size=valid.map(i=>({...i,w:Math.min(72,Math.max(cfg.touchTarget,i.w*cfg.controlScale)),h:Math.min(56,Math.max(cfg.touchTarget,i.h*cfg.controlScale))}));
 const doors=size.filter(i=>i.mode==='door').sort((a,b)=>a.x-b.x);
 if(doors.length>1){const total=doors.reduce((sum,d)=>sum+d.w,0)+cfg.doorGap*(doors.length-1);let left=clamp(doors.reduce((sum,d)=>sum+d.x,0)/doors.length-total/2,4,w*.27-total-4);for(const d of doors){d.x=left+d.w/2;left+=d.w+cfg.doorGap;}}
 for(const i of size){i.x=clamp(i.x,i.w/2+3,w-i.w/2-3);i.y=clamp(i.y,i.h/2+3,h-i.h/2-3);if(i.kind==='parking'&&gear&&overlap(i,gear)){const right=gear.x+gear.w/2+i.w/2+5,left=gear.x-gear.w/2-i.w/2-5;i.x=right+i.w/2<w?right:clamp(left,i.w/2+3,w-i.w/2-3);}}
 return size;
}
const api={arrange,overlap};if(typeof module==='object'&&module.exports)module.exports=api;else g.TruckMobileLayout=api;
})(globalThis);
