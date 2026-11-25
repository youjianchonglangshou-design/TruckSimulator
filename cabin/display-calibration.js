/* RC11: confirmed RC10 display placement + separate icon-only calibration. */
(function(g){'use strict';
const KEY='truckSimulator.RC30.displayCalibration.v6';
const names={hudBase:'HUD 基座｜整組位置／角度／尺寸',speedGear:'17｜速度／檔位',hitsTime:'28/29｜碰撞／用時',angle:'18｜聯結角',distance:'19｜後端距離',radar:'30｜360°俯視圖',youtube:'21-1｜YouTube LOGO'};
const controlNames={
 'control-switch-1':'車門｜設定圖示', 'control-switch-2':'車門｜選關圖示', 'control-switch-3':'車門｜下車圖示',
 'wheel-button-pad-left':'方向盤｜車燈圖示', 'wheel-button-pad-right':'方向盤｜雨刷圖示',
 'wheel-button-pad-left-lower':'方向盤｜遠光圖示','wheel-button-pad-right-lower':'方向盤｜模式圖示',
 'steering-wheel-center-badge':'方向盤｜喇叭圖示',radarToggle:'30-1｜俯視圖 3D 開關',restartButton:'重來｜3D 按鈕'};
const approved={"schema":"TruckSimulator3DDisplayCalibration","version":"2.1","coordinateSpace":"display-parent local offsets","units":{"position":"Three.js parent-local delta","rotation":"degrees XYZ","scale":"relative x/y multiplier"},"components":{"instrument":{"position":{"x":0.03,"y":0.015,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.4,"y":1}},"angle":{"position":{"x":0.5,"y":-0.075,"z":-0.055},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.7,"y":1.7}},"distance":{"position":{"x":0.5,"y":0.03,"z":-0.055},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.7,"y":1.7}},"radar":{"position":{"x":0,"y":-0.01,"z":-0.045},"rotation":{"x":0.5,"y":2,"z":-0.5},"scale":{"x":1.02,"y":1.01}},"youtube":{"position":{"x":-0.04,"y":0.01,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":0.95,"y":1.7}},"hudBase":{"position":{"x":-0.05,"y":0,"z":0},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.16,"y":1}},"speedGear":{"position":{"x":-0.5,"y":0.5,"z":-0.5},"rotation":{"x":2,"y":0,"z":0},"scale":{"x":1.3,"y":1.3}},"hitsTime":{"position":{"x":-0.01,"y":-0.02,"z":-0.03},"rotation":{"x":0,"y":0,"z":0},"scale":{"x":1.4,"y":1.4}}},"controls":{"iconSizes":{"control-switch-1":0.7,"control-switch-2":0.7,"control-switch-3":0.7,"wheel-button-pad-left":0.7,"wheel-button-pad-right":0.7,"wheel-button-pad-left-lower":0.7,"wheel-button-pad-right-lower":0.7,"steering-wheel-center-badge":0.7},"radarToggle":{"position":{"x":0,"y":0.085,"z":-0.03},"rotation":{"x":0.5,"y":-1.5,"z":0},"scale":{"x":1,"y":1}},"restartButton":{"position":{"x":0.01,"y":-0.015,"z":0},"rotation":{"x":-33.5,"y":-3.5,"z":0},"scale":{"x":0.6,"y":0.6}}}};
const blank=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1}});
// Preserve the existing combined 'instrument' transform as the invisible legacy
// anchor. New displays calibrate relative to it and do not shift the RC24 image.
const defaults=JSON.parse(JSON.stringify(approved.components));
const iconDefaults={"control-switch-1":0.7,"control-switch-2":0.7,"control-switch-3":0.7,"wheel-button-pad-left":0.7,"wheel-button-pad-right":0.7,"wheel-button-pad-left-lower":0.7,"wheel-button-pad-right-lower":0.7,"steering-wheel-center-badge":0.7};
const controlDefaults={iconSizes:iconDefaults,radarToggle:{"position":{"x":0,"y":0.085,"z":-0.03},"rotation":{"x":0.5,"y":-1.5,"z":0},"scale":{"x":1,"y":1}},restartButton:{"position":{"x":0.01,"y":-0.015,"z":0},"rotation":{"x":-33.5,"y":-3.5,"z":0},"scale":{"x":0.6,"y":0.6}}};
const clamp=(v,lo,hi,fallback)=>v===undefined||v===null||v===''||!Number.isFinite(+v)?fallback:Math.max(lo,Math.min(hi,+v));
function planeNormalize(v,baseline){
 const position={},rotation={},scale={};
 for(const a of ['x','y','z']){position[a]=clamp(v?.position?.[a],-.55,.55,baseline.position[a]);rotation[a]=clamp(v?.rotation?.[a],-50,50,baseline.rotation[a]);}
 for(const a of ['x','y'])scale[a]=clamp(v?.scale?.[a],.4,1.8,baseline.scale[a]);
 return {position,rotation,scale};
}
function normalize(raw){
 const src=raw?.components||raw||{},components={},controls={iconSizes:{},radarToggle:null,restartButton:null};
 for(const id of Object.keys(defaults))components[id]=planeNormalize(src[id],defaults[id]);
 for(const id of Object.keys(iconDefaults))controls.iconSizes[id]=clamp(raw?.controls?.iconSizes?.[id],.4,1.35,iconDefaults[id]);
 controls.radarToggle=planeNormalize(raw?.controls?.radarToggle,controlDefaults.radarToggle);
 controls.restartButton=planeNormalize(raw?.controls?.restartButton,controlDefaults.restartButton);
 return {schema:'TruckSimulator3DDisplayCalibration',version:'2.1',coordinateSpace:'display-parent local offsets',
  units:{position:'Three.js parent-local delta',rotation:'degrees XYZ',scale:'relative x/y multiplier'},components,controls};
}
const storage=()=>{try{return g.localStorage||localStorage}catch{return null}};
function load(){try{return normalize(JSON.parse(storage()?.getItem(KEY)||'null'))}catch{return normalize()}}
function save(value){const v=normalize(value);try{storage()?.setItem(KEY,JSON.stringify(v))}catch{}return v}
function exportJSON(value){return JSON.stringify(normalize(value),null,2)+'\n'}
g.TruckDisplayCalibration={KEY,names,controlNames,defaults,controlDefaults,normalize,load,save,exportJSON};
})(window);
