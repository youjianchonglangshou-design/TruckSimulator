/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6Mode=api;})(globalThis,function(){'use strict';
function policy(value){const n=Number(value),mode=[0,1,2].includes(n)?n:0;return {mode,radar:mode===0,distance:mode===0,mirrors:mode!==2}}
function createModeSystemCore(svc){
function setDifficulty(value){svc.difficultyMode=policy(value).mode;document.body.classList.toggle('no-electronic-assist',svc.difficultyMode!==0);svc.$('#difficultyMode').value=String(svc.difficultyMode);if(svc.difficultyMode===2&&svc.$('#mirrorPanel').classList.contains('open'))svc.setMirrorPanel(false);if(svc.difficultyMode){if(svc.view===4)svc.setView(0);svc.setRadar(false)}svc.$('#radarToggle').disabled=!!svc.difficultyMode;svc.$('#mirrorSetup').disabled=svc.difficultyMode===2||!!svc.coach;svc.$('#testView').hidden=!!svc.difficultyMode||svc.P.levels[svc.level].theme!=='practice';svc.warningUpdate(performance.now());svc.layoutMirrorHits();svc.hud();}
return Object.freeze({setDifficulty});
}
return Object.freeze({createModeSystemCore,policy});
});
