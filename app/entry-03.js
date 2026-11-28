if(globalThis.TruckMusic)window.TruckSharedMusic=TruckMusic.init({onOpen:()=>{window.TruckCabinView?.prepareMusicOpen?.();if($('#mirrorPanel').classList.contains('open'))setMirrorPanel(false);interruptMobileInputs();},onClose:interruptMobileInputs});layoutMusicButton();
// Release captured pointers and keys on viewport/visibility changes; do not reset pose or level.
function interruptMobileInputs(){
 window.TruckMobileTouch?.release();window.TruckMobileCabin?.cancelInput?.();window.TruckCabinView?.cancelInput?.();for(const cancel of cancelMirrorDrags)cancel();
 keys.clear();if(shiftDrag)clearShiftDrag();
 document.querySelectorAll('[data-key].pressed').forEach(e=>e.classList.remove('pressed'));acc=0;last=performance.now();
 if(audio){for(const g of [engGain,alarmGain]){g.gain.cancelScheduledValues(audio.currentTime);g.gain.setValueAtTime(0,audio.currentTime)}}
}
if(MobileLandscape.mobile)window.TruckMobileTouch.install({rect:MobileLandscape.rect,point:MobileLandscape.point,rotated:()=>MobileLandscape.rotated,release:()=>{}});
if(Env){Env.init({pause:interruptMobileInputs,resume:interruptMobileInputs,blocked:()=>MobileLandscape.paused||!!window.TruckSharedMusic?.isOpen()||$('#mirrorPanel').classList.contains('open')});layoutRadar();}MobileLandscape.bind(resize,interruptMobileInputs);TruckPerformance.bindPause(interruptMobileInputs);
