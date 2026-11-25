/* P03.12: ONE vehicle master color; interior automatically follows at 82% RGB brightness.
 * No mesh, camera, geometry, mirror or approved equipment transforms are changed here.
 */
(function(global){'use strict';
const VERSION='2.3.13-P03.13-RC14';
const DARKEN=0.18;
// These are material color ANCHORS from the original approved shell/model,
// not the user's chosen default.  Keep them fixed for consistent shading.
const ORIGINAL_ANCHORS={shell:'#a9b5c8',interior:'#a9b9c9'};
const DEFAULT={schema:'TruckCabinPaint',version:VERSION,shell:'#4c5667'};
const STORAGE_KEY='TruckCabinP0313SingleColorPaint';
const ORIGINAL={
  shell:{head:'#a9b5c8',roof:'#949fb1',frame:'#a5b2c4',door:'#9aa8bb',dash:'#899aaf',panel:'#a1b0c4',trim:'#c1cad8'},
  interior:{body:'#9eacbc',bodySoft:'#b9c6d3',upper:'#aab9c9',unified:'#a9b9c9',bezel:'#77879a'}
};
function normalize(hex){if(typeof hex!=='string'||!/^#[0-9a-fA-F]{6}$/.test(hex))throw Error('請使用六位 HEX 顏色，例如 #a9b5c8');return hex.toLowerCase()}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))}
function toHex(a){return '#'+a.map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('')}
function brightness(a){return a[0]*.2126+a[1]*.7152+a[2]*.0722}
function darker(hex){return toHex(rgb(normalize(hex)).map(x=>x*(1-DARKEN)))}
function shadedColor(original,base,newColor){
 original=normalize(original);base=normalize(base);newColor=normalize(newColor);
 if(newColor===base)return original;
 const shade=brightness(rgb(original))/Math.max(1,brightness(rgb(base)));
 return toHex(rgb(newColor).map(x=>x*shade));
}
function validateLayout(o){
 // Previous versions exported two independent colors. Accept those files,
 // but deliberately ignore the old interior value: it is now always derived.
 if(!o||o.schema!=='TruckCabinPaint'||!o.shell)throw Error('不是車身調色 JSON');
 return {schema:'TruckCabinPaint',version:VERSION,shell:normalize(o.shell),interior:darker(o.shell),autoInteriorDarken:DARKEN};
}
function create(shell,mounts,approved=DEFAULT){
 let layout=validateLayout(approved),shellRef=shell,mountRef=mounts;
 function applyGroup(root,group,anchor,color){
  const mats=root?.userData?.paintMaterials;
  if(!mats)return false;
  for(const [name,base] of Object.entries(ORIGINAL[group])){
   const mat=mats[name];if(mat?.color?.set){mat.color.set(shadedColor(base,anchor,color));mat.needsUpdate=true}
  }
  return true;
 }
 function apply(){applyGroup(shellRef,'shell',ORIGINAL_ANCHORS.shell,layout.shell);applyGroup(mountRef,'interior',ORIGINAL_ANCHORS.interior,layout.interior)}
 function set(section,value){if(section!=='shell')throw Error('僅需選擇車身主色，車艙基座色會自動生成');layout=validateLayout({schema:'TruckCabinPaint',shell:value});apply();return layout.shell}
 function get(){return {...layout}}
 function importLayout(input){layout=validateLayout(input);apply();return get()}
 function setTargets(nextShell,nextMounts){shellRef=nextShell;mountRef=nextMounts;apply()}
 function applyShell(newShell){shellRef=newShell;applyGroup(shellRef,'shell',ORIGINAL_ANCHORS.shell,layout.shell)}
 function reset(){layout=validateLayout(approved);apply();return get()}
 function save(){try{if(!global.localStorage)return false;global.localStorage.setItem(STORAGE_KEY,JSON.stringify(layout));return true}catch(_){return false}}
 function loadSaved(){try{const raw=global.localStorage?.getItem(STORAGE_KEY);if(!raw)return false;importLayout(JSON.parse(raw));return true}catch(_){return false}}
 apply();return {set,get,importLayout,setTargets,applyShell,reset,save,loadSaved};
}
global.TruckCabinPaint={DEFAULT,VERSION,DARKEN,STORAGE_KEY,normalize,darker,shadedColor,validateLayout,create};
})(window);
