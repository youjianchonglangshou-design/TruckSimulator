/* RC8 approved FIXED 3D parking-brake calibration. Model-local position, Euler degrees, uniform scale.
   This module does NOT touch RC15 shell, camera, physics, or mounts JSON. */
(function(root,factory){
 const lib=factory();if(typeof module==='object'&&module.exports)module.exports=lib;
 if(root)root.TruckBrakeAdjustment=lib;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const storageKey='TruckSimulator_RC7_ParkingBrake_LocalCalibration';
 const defaults=Object.freeze({position:Object.freeze({x:.003,y:-.21,z:.007}),rotation:Object.freeze({x:0,y:0,z:0}),scale:.95});
 const fields={
  'position.x':[-.55,.55,.001],'position.y':[-.55,.55,.001],'position.z':[-.25,.40,.001],
  'rotation.x':[-180,180,.5],'rotation.y':[-180,180,.5],'rotation.z':[-180,180,.5],
  'scale':[.35,2.5,.01]
 };
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 function normalize(value){
  const src=value&&typeof value==='object'?value:{};
  const result={position:{},rotation:{},scale:1};
  for(const [key,[min,max,step]] of Object.entries(fields)){
   const [group,axis]=key.split('.');
   const fallback=axis?defaults[group][axis]:defaults[group];
   const raw=axis?src[group]?.[axis]:src[group];
   const number=typeof raw==='number'?raw:typeof raw==='string'&&raw.trim()?Number(raw):NaN;
   const safe=Number.isFinite(number)?number:fallback;
   const val=Math.round(clamp(safe,min,max)*1000)/1000;
   if(axis)result[group][axis]=val;else result[group]=val;
  }
  return result;
 }
 function exportJSON(value){
  const v=normalize(value);
  return JSON.stringify({schema:'TruckSimulatorParkingBrakeCalibration',version:'1.0',
   coordinateSpace:'gear-selector-model local',
   units:{position:'Three.js model units',rotation:'degrees XYZ',scale:'uniform multiplier'},
   position:v.position,rotation:v.rotation,scale:v.scale},null,2)+'\n';
 }
 return Object.freeze({defaults,fields,storageKey,normalize,exportJSON});
});
