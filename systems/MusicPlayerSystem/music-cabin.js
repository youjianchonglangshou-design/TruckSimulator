/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6MusicCabin=api;})(globalThis,function(){'use strict';
function createMusicPlayerSystemCabin(svc){
function drawYoutube(){
 const d=svc.displaySurfaces.youtube,x=d.canvas.getContext('2d'),c=d.canvas;
 x.clearRect(0,0,c.width,c.height);
 // Keep only the actual YouTube emblem visible on the approved radio mount.
 x.fillStyle='#ff0033';x.beginPath();x.roundRect(28,72,c.width-56,c.height-144,61);x.fill();
 x.fillStyle='#fff';x.beginPath();x.moveTo(214,132);x.lineTo(339,192);x.lineTo(214,252);x.closePath();x.fill();
 d.texture.needsUpdate=true;
}
return Object.freeze({drawYoutube});
}
return Object.freeze({createMusicPlayerSystemCabin});
});
