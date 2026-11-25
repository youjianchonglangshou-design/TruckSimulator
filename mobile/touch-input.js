(function(g){'use strict';
let api=null,controller=null,owners=new Map(),ranges=new Map();
function release(){for(const [id,owner] of [...owners]){owners.delete(id);try{owner.dispatchEvent(new PointerEvent('pointercancel',{pointerId:id,bubbles:true}));if(owner.hasPointerCapture?.(id))owner.releasePointerCapture(id)}catch{}}ranges.clear();api?.release();}
function install(host){if(controller)return;api=host;controller=new AbortController();const opt={signal:controller.signal,capture:true};
function rangeValue(el,e){const r=host.rect(el),p=host.point(e),min=+el.min||0,max=+el.max||100,step=+el.step||1;let f=Math.max(0,Math.min(1,(p.x-r.left)/Math.max(1,r.width)));if(getComputedStyle(el).direction==='rtl')f=1-f;el.value=String(Math.max(min,Math.min(max,min+Math.round((max-min)*f/step)*step)));el.dispatchEvent(new Event('input',{bubbles:true}));}
document.addEventListener('pointerdown',e=>{owners.set(e.pointerId,e.target);if(host.rotated()&&e.target.matches('input[type=range]:not(:disabled)')&&![...ranges.values()].includes(e.target)){e.preventDefault();ranges.set(e.pointerId,e.target);e.target.setPointerCapture(e.pointerId);rangeValue(e.target,e)}},opt);
document.addEventListener('pointermove',e=>{const el=ranges.get(e.pointerId);if(el){e.preventDefault();rangeValue(el,e)}},opt);
for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>{const el=ranges.get(e.pointerId);if(el&&type==='pointerup')rangeValue(el,e);ranges.delete(e.pointerId);owners.delete(e.pointerId)},opt);
}
g.TruckMobileTouch={install,release,diagnostics:()=>({installed:!!controller,pointers:owners.size})};
})(window);
