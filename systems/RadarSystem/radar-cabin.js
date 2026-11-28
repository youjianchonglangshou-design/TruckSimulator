(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckRadarCabin=api;})(globalThis,function(){'use strict';
function createRadarCabin({surface,getRadar,action,position,makeButton,T}){
 let button=null,lastMode=null,lastSource=null,lastRevision;
 function mount(host){if(button)return;button=makeButton(host);button.addEventListener('click',cycle);}
 function cycle(e){e.stopPropagation();action('radarOrientation');}
 function update(s){drawRadar(s);}
 function anchor(s){if(!button)return;const active=s.view===0&&s.radarEnabled&&s.difficultyMode===0;
  button.textContent=s.radarOrientation==='auto'?'AUTO · '+(s.radarResolvedOrientation==='fixed'?'地圖固定':'車頭固定'):s.radarOrientation==='fixed'?'地圖固定':'車頭固定';
  button.style.display=active?'':'none';if(active){
   const mesh=surface.mesh;mesh.updateWorldMatrix(true,false);const v=new T.Vector3(0,.171,0);v.applyMatrix4(mesh.matrixWorld);
   position(button,{visible:true,getWorldPosition(out){return out.copy(v)}});}}
 function unmount(){if(button){button.removeEventListener('click',cycle);button.remove();button=null;}}
function drawRadar(s){
 const d=surface,{canvas:c,texture:tx}=d,H=globalThis.TruckTextTexture;
 const mode=s.radarEnabled&&s.difficultyMode===0?'live':s.difficultyMode!==0?'disabled':'off',source=mode==='live'?getRadar():null,revision=globalThis.TruckRadarSystem?.revision(source);
 if(mode===lastMode&&(mode!=='live'||(source===lastSource&&revision!==undefined&&revision===lastRevision)))return;
 lastMode=mode;lastSource=source;lastRevision=revision;
 const x=H?H.context(c):c.getContext('2d'),[w,h]=H?H.size(c):[c.width,c.height];
 x.fillStyle='#14293a';x.fillRect(0,0,w,h);
 if(mode==='live'){
  if(source && source.width>1 && source.height>1){
   // Existing world-owned 360° canvas. No generated/staged test image.
   x.drawImage(source,0,0,w,h);
  }
 }else{
  x.fillStyle='#446474';x.textAlign='center';x.font='bold 33px "Microsoft JhengHei",sans-serif';
  x.fillText(s.difficultyMode!==0?'目前模式停用俯視輔助':'俯視雷達 OFF',w/2,h/2);
 }
 tx.needsUpdate=true;
}
 return Object.freeze({mount,update,anchor,unmount,dispose:unmount});
}

return Object.freeze({createRadarCabin});
});
