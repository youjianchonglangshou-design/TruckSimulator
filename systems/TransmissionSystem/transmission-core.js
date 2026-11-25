/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6TransmissionCore=api;})(globalThis,function(){'use strict';
function createTransmissionSystemCore(svc){
function syncShiftLever(){let el=svc.$('#shiftLever');el.style.top=svc.shiftTop(svc.gear)+'%';el.setAttribute('aria-valuenow',String(svc.gear));el.setAttribute('aria-valuetext',svc.shiftName(svc.gear)+({1:' 前進檔',0:' 空檔','-1':' 倒車檔'}[svc.gear]));svc.$('#shiftLetter').textContent=svc.shiftName(svc.gear)}
function clearShiftDrag(){let d=svc.shiftDrag;svc.shiftDrag=null;svc.$('#shiftLever').classList.remove('dragging');if(d&&d.el.hasPointerCapture(d.id))d.el.releasePointerCapture(d.id);syncShiftLever()}
function shiftAllowed(){return !svc.coach&&!svc.done&&svc.view!==3&&!svc.$('#mirrorPanel').classList.contains('open')}
function setGear(g,fromCoach=false){if(svc.coach&&!fromCoach)return;if(svc.shiftDrag)clearShiftDrag();if(svc.done||svc.broken||svc.view===3||(svc.$('#mirrorPanel').classList.contains('open')&&g!==0))return;if(!fromCoach&&g!==0&&svc.hand){svc.message("請先解除手煞車");syncShiftLever();return false}if(Math.abs(svc.s.v)>.18&&g!==0&&Math.sign(svc.s.v)!==g){svc.message('請先煞停再切換方向');return}svc.gear=g;document.querySelectorAll('[data-gear]').forEach(b=>{b.classList.toggle('active',+b.dataset.gear===g);b.setAttribute('aria-pressed',String(+b.dataset.gear===g))});syncShiftLever();svc.startAudio();return true}
function shiftPreview(e){let d=svc.shiftDrag;if(!d||d.id!==e.pointerId)return null;let top=svc.P.clamp(d.top+(MobileLandscape.point(e).y-d.startY)/Math.max(1,d.height)*100,19,81);svc.$('#shiftLever').style.top=top+'%';return top}
return Object.freeze({syncShiftLever,clearShiftDrag,shiftAllowed,setGear,shiftPreview});
}
return Object.freeze({createTransmissionSystemCore});
});
