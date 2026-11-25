if(globalThis.TruckMusic)TruckMusic.init({onOpen:()=>{window.TruckMobileTouch?.release();keys.clear();if(shiftDrag)clearShiftDrag();document.querySelectorAll('[data-key].pressed').forEach(e=>e.classList.remove('pressed'));acc=0;if(audio){for(const g of [engGain,alarmGain]){g.gain.cancelScheduledValues(audio.currentTime);g.gain.setValueAtTime(0,audio.currentTime)}}},onClose:()=>{keys.clear();acc=0;last=performance.now();}});layoutMusicButton();
// Release captured pointers and keys on viewport/visibility changes; do not reset pose or level.
function interruptMobileInputs(){
 window.TruckMobileTouch?.release();
 keys.clear();if(shiftDrag)clearShiftDrag();
 document.querySelectorAll('[data-key].pressed').forEach(e=>e.classList.remove('pressed'));acc=0;last=performance.now();
 if(audio){for(const g of [engGain,alarmGain]){g.gain.cancelScheduledValues(audio.currentTime);g.gain.setValueAtTime(0,audio.currentTime)}}
}
if(MobileLandscape.mobile)window.TruckMobileTouch.install({rect:MobileLandscape.rect,point:MobileLandscape.point,rotated:()=>MobileLandscape.rotated,release:()=>{}});
if(Env){Env.init({pause:interruptMobileInputs,resume:interruptMobileInputs,blocked:()=>MobileLandscape.paused||!!document.querySelector('#truckMusicDialog')?.open||$('#mirrorPanel').classList.contains('open')});layoutRadar();}MobileLandscape.bind(resize,interruptMobileInputs);TruckPerformance.bindPause(interruptMobileInputs);
