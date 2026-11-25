/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6RadarUI=api;})(globalThis,function(){'use strict';
function createRadarSystemCore(svc){
function layoutRadar(){const dock=svc.$('#radarDock'),g=svc.dashboardGeometry(),mobile=g.touch,help=MobileLandscape.rect(svc.$('.help')),pedal=MobileLandscape.rect(svc.$('.pedals'));let right=help.width>0?svc.W-help.left+10:12;let bottom=9;if(mobile){right=Math.max(8,svc.W-pedal.left+7);if(svc.W-right-dock.offsetWidth<g.right+4){right=9;bottom=Math.max(8,svc.H-pedal.top+7)}}if(!mobile&&svc.W-right-dock.offsetWidth<g.right+5)right=8;Object.assign(dock.style,{right:right+'px',bottom:bottom+'px'});}
function setRadar(open){svc.radarEnabled=!!open&&!svc.difficultyMode;svc.$('#radarScreen').hidden=!svc.radarEnabled;svc.$('#radarToggle').classList.toggle('active',svc.radarEnabled);svc.$('#radarToggle').setAttribute('aria-pressed',String(svc.radarEnabled));svc.$('#radarToggle').textContent='俯視雷達 · '+(svc.radarEnabled?'開':'關');svc.$('#radarOrientation').hidden=!svc.radarEnabled;updateRadarOrientationLabel()}
function mapRender(){updateRadarOrientationLabel();svc.radarSystem.draw({canvas:svc.$('#radarCanvas'),vehicle:svc.s,gear:svc.gear,level:svc.level,nearGap:svc.nearGap,nicoPlacement:svc.nicoPlacement,DPR:svc.DPR,enabled:svc.radarEnabled,difficultyMode:svc.difficultyMode,now:performance.now(),interval:TruckPerformance.visuals.radarInterval,P:svc.P,orderedCorners:svc.orderedCorners,roadBounds:svc.roadBounds});}
function radarOrientationCycle(){svc.radarSystem.cycle();mapRender();updateRadarOrientationLabel();return svc.radarSystem.mode();}
function updateRadarOrientationLabel(){const el=svc.$('#radarOrientation');if(el){el.textContent=svc.radarSystem.mode()==='auto'?'AUTO · '+(svc.radarSystem.orientation(svc.gear)==='fixed'?'地圖固定':'車頭固定'):svc.radarSystem.mode()==='fixed'?'地圖固定':'車頭固定';}}
return Object.freeze({layoutRadar,setRadar,mapRender,radarOrientationCycle,updateRadarOrientationLabel});
}
return Object.freeze({createRadarSystemCore});
});
