/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6CoachCabin=api;})(globalThis,function(){'use strict';
function createCoachSystemCabin(svc){
function updateCoach(s){
 const coach=s.coach;svc.ui.coachBar.hidden=!coach;
 if(!coach)return;
 const names={playing:'播放中',paused:'暫停',complete:'示範完成',error:'示範停止'};
 svc.ui.coachStatus.textContent='教練示範｜'+(names[coach]||coach)+` ${Math.round((s.coachTicks||0)/Math.max(1,s.coachTotal||1)*100)}%`;
 svc.$('cabCoachPause').textContent=coach==='paused'?'繼續':'暫停';svc.$('cabCoachPause').disabled=coach!=='playing'&&coach!=='paused';
 const speed=svc.$('cabCoachSpeed');if(document.activeElement!==speed)speed.value=String(s.coachSpeed||1);
}
return Object.freeze({updateCoach});
}
return Object.freeze({createCoachSystemCabin});
});
