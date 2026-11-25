/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6HornCabin=api;})(globalThis,function(){'use strict';
function createAudioSystemCabin(svc){
function horn(){svc.b.action('horn');if(svc.b.snapshot().muted)return;try{
 const A=window.AudioContext||window.webkitAudioContext;const ctx=svc.ui.audioContext??=(new A());if(ctx.state==='suspended')ctx.resume();
 const t=ctx.currentTime;
 for(const [f,g] of [[138,.10],[173,.07]]){const o=ctx.createOscillator(),gain=ctx.createGain();o.type='sawtooth';o.frequency.value=f;
  gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(g,t+.055);gain.gain.setValueAtTime(g,t+.22);gain.gain.exponentialRampToValueAtTime(.001,t+.45);
  o.connect(gain).connect(ctx.destination);o.start(t);o.stop(t+.46);}
 }catch(e){console.warn('Horn audio unavailable',e)} }
return Object.freeze({horn});
}
return Object.freeze({createAudioSystemCabin});
});
