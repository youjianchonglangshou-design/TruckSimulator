/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6BrakeCore=api;})(globalThis,function(){'use strict';
function createParkingBrakeSystemCore(svc){
function syncParkBrake(){const el=svc.$('#parkBrake'),locked=svc.view===3||svc.$('#mirrorPanel').classList.contains('open');el.classList.toggle('engaged',svc.hand);el.setAttribute('aria-pressed',String(svc.hand));el.disabled=locked||svc.done||svc.broken;svc.$('#parkBrakeText').textContent=svc.broken?'車輛故障 · 已鎖定':svc.hand?(svc.view===3?'手煞車已拉起':locked?'手煞車已拉起':'手煞車已拉起 · 點擊解除'):'手煞車已解除';el.title=svc.broken?'車輛已損壞，請重來':locked?'請先上車或完成調鏡':((globalThis.document?.body?.classList.contains('mobile-game')||!!globalThis.matchMedia?.('(pointer:coarse)')?.matches)?'':'B：')+(svc.hand?'解除手煞車':'拉起手煞車')}
function toggleParkBrake(){if(svc.coach||svc.done||svc.broken||svc.view===3||svc.$('#mirrorPanel').classList.contains('open'))return;svc.hand=!svc.hand;syncParkBrake();svc.message(svc.hand?'手煞車已啟用':'手煞車已解除',false)}
return Object.freeze({syncParkBrake,toggleParkBrake});
}
return Object.freeze({createParkingBrakeSystemCore});
});
