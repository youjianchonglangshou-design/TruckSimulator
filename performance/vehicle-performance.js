/* Instance-owned vehicle quality settings; delegates adaptive policy to GamePerformanceKit. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.TruckVehiclePerformance=api})(globalThis,function(){'use strict';
const key='vehicle-performance',labels={auto:'AUTO 自動',ultra:'極高',high:'高',balanced:'均衡',safe:'省電',emergency:'最低'};
function create({kitAPI,store,env=globalThis,clock,looks,mobileHint=false}){
 let raw={};try{raw=JSON.parse(store.getItem(key)||'{}')||{}}catch{}
 let quality=Object.hasOwn(labels,raw.quality)?raw.quality:'auto',threshold=Number.isInteger(raw.threshold)&&raw.threshold>=8&&raw.threshold<=30?raw.threshold:12,hud=raw.hud===true;
 // Keep K13's events and persistence away from the legacy truck singleton.
 const kit=kitAPI.create({env:{window:{innerWidth:env.innerWidth,innerHeight:env.innerHeight,devicePixelRatio:env.devicePixelRatio,performance:env.performance,matchMedia:env.matchMedia?.bind(env),console:env.console},navigator:env.navigator,document:env.document},clock,storage:store,namespace:'vehicle',targetFps:30,fpsThreshold:threshold,mobileHint});
 let revision=0,tier=kit.state.tierId;const unsub=kit.subscribe(s=>{if(tier!==s.tierId){tier=s.tierId;revision++}});
 function persist(){try{return store.setItem(key,JSON.stringify({quality,threshold,hud}))!==false}catch{return false}}
 function apply(){kit.setMode(quality==='auto'?'auto':'manual',quality==='auto'?undefined:quality)}apply();
 function setQuality(v){if(!Object.hasOwn(labels,v))return false;quality=v;apply();return persist()}
 function setThreshold(v){if(!Number.isFinite(+v)||v===''||v===null)return false;threshold=Math.max(8,Math.min(30,Math.round(+v)));kit.setFpsThreshold(threshold);return persist()}
 function setHud(v){hud=v===true;return persist()}
 function reset(){quality='auto';threshold=12;hud=false;kit.setFpsThreshold(threshold);apply();return persist()}
 function resolution(w,h,dpr=1){const budget=kit.state.mobile?3000000:7600000;return Math.max(.5,Math.min(1.5,dpr||1,Math.sqrt(budget/(Math.max(1,w)*Math.max(1,h)))))}
 function status(){return {mode:kit.state.mode,tier:kit.state.tierId,quality,threshold,hud,fps:kit.fps,revision,mobile:kit.state.mobile}}
 return {kit,status,setQuality,setThreshold,setHud,reset,resolution,visuals:()=>({...looks[kit.state.tierId]}),frame:(now,playing)=>kit.frame(now,{isPlaying:playing}),dispose(){unsub();kit.destroy()}};
}
return Object.freeze({create,labels});});
