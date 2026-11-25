if(globalThis.TruckMusic)TruckMusic.init({onOpen:()=>{keys.clear();if(shiftDrag)clearShiftDrag();document.querySelectorAll('[data-key].pressed').forEach(e=>e.classList.remove('pressed'));acc=0;if(audio){for(const g of [engGain,alarmGain]){g.gain.cancelScheduledValues(audio.currentTime);g.gain.setValueAtTime(0,audio.currentTime)}}},onClose:()=>{keys.clear();acc=0;last=performance.now();}});layoutMusicButton();
// Release captured pointers and keys on viewport/visibility changes; do not reset pose or level.
const mobilePointers=new Map();
if(MobileLandscape.mobile){
 document.addEventListener('pointerdown',e=>mobilePointers.set(e.pointerId,e.target),true);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,e=>mobilePointers.delete(e.pointerId),true);
}
function interruptMobileInputs(){
 keys.clear();if(shiftDrag)clearShiftDrag();
 for(const [id,target] of mobilePointers){for(let el=target;el&&el!==document.documentElement;el=el.parentElement){if(el.hasPointerCapture?.(id)){try{el.releasePointerCapture(id)}catch{}el.dispatchEvent(new PointerEvent('pointercancel',{pointerId:id,bubbles:true}));}}}mobilePointers.clear();
 document.querySelectorAll('[data-key].pressed').forEach(e=>e.classList.remove('pressed'));acc=0;last=performance.now();
 if(audio){for(const g of [engGain,alarmGain]){g.gain.cancelScheduledValues(audio.currentTime);g.gain.setValueAtTime(0,audio.currentTime)}}
}
// Native ranges normally understand CSS transforms. In simulated landscape explicitly map drag positions to logical X.
for(const range of document.querySelectorAll('input[type=range]')){
 let active=null;function updateRange(e){const r=MobileLandscape.rect(range),p=MobileLandscape.point(e),min=+range.min||0,max=+range.max||100,step=+range.step||1;let f=P.clamp((p.x-r.left)/Math.max(1,r.width),0,1);if(getComputedStyle(range).direction==='rtl')f=1-f;range.value=String(P.clamp(min+Math.round((max-min)*f/step)*step,min,max));range.dispatchEvent(new Event('input',{bubbles:true}));}
 range.addEventListener('pointerdown',e=>{if(!MobileLandscape.rotated||range.disabled)return;e.preventDefault();active=e.pointerId;range.setPointerCapture(e.pointerId);updateRange(e)});
 range.addEventListener('pointermove',e=>{if(active===e.pointerId){e.preventDefault();updateRange(e)}});
 range.addEventListener('pointerup',e=>{if(active===e.pointerId){updateRange(e);active=null}});
 for(const t of ['pointercancel','lostpointercapture'])range.addEventListener(t,e=>{if(active===e.pointerId)active=null});
}
// A touch immediately after a range gesture may suppress the synthesized click.
for(const button of document.querySelectorAll('[data-probe-zero]'))button.addEventListener('pointerup',e=>{if(MobileLandscape.mobile&&e.pointerType==='touch'&&probeAllowed()){const r=button.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){keys.delete('1');keys.delete('3');setProbeDegrees(0)}}});
if(Env){Env.init({pause:interruptMobileInputs,resume:interruptMobileInputs,blocked:()=>MobileLandscape.paused||!!document.querySelector('#truckMusicDialog')?.open||$('#mirrorPanel').classList.contains('open')});layoutRadar();}MobileLandscape.bind(resize,interruptMobileInputs);TruckPerformance.bindPause(interruptMobileInputs);
