/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6AudioCore=api;})(globalThis,function(){'use strict';
function createAudioSystemCore(svc){
function startAudio(){if(svc.muted)return;try{if(!svc.audio){let AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;svc.audio=new AC();svc.engine=svc.audio.createOscillator();svc.engine.type='triangle';svc.engGain=svc.audio.createGain();svc.engGain.gain.value=.025;svc.engine.connect(svc.engGain);svc.engGain.connect(svc.audio.destination);svc.engine.start();svc.alarm=svc.audio.createOscillator();svc.alarm.type='sine';svc.alarm.frequency.value=850;svc.alarmGain=svc.audio.createGain();svc.alarmGain.gain.value=0;svc.alarm.connect(svc.alarmGain);svc.alarmGain.connect(svc.audio.destination);svc.alarm.start()}if(svc.audio.state==='suspended')svc.audio.resume().catch(()=>{})}catch{}}
return Object.freeze({startAudio});
}
return Object.freeze({createAudioSystemCore});
});
