/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6MusicCabin=api;})(globalThis,function(){'use strict';
function paintEmblem(c){const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.fillStyle='#ff0033';x.beginPath();x.roundRect(28,72,c.width-56,c.height-144,61);x.fill();x.fillStyle='#fff';x.beginPath();x.moveTo(214,132);x.lineTo(339,192);x.lineTo(214,252);x.closePath();x.fill();}
function drawYoutubeBadge(c){const src=document.createElement('canvas');src.width=512;src.height=384;paintEmblem(src);const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.save();x.scale(c.width/256,c.height/256);x.fillStyle='#ff0033';x.beginPath();x.roundRect(7,7,242,242,29);x.fill();x.drawImage(src,28,72,456,240,24,70,208,116);x.restore();}
function createMusicPlayerSystemCabin(svc){
function drawYoutube(){
 const d=svc.displaySurfaces.youtube;drawYoutubeBadge(d.canvas);
 d.texture.needsUpdate=true;
}
// A separate, non-interactive texture inside the existing radio screen.
function createWaveSurface(T,parent){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=112;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;texture.generateMipmaps=false;
 const mesh=new T.Mesh(new T.PlaneGeometry(.426,.080),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));
 mesh.name='youtube-playback-wave';mesh.position.set(.060,0,.019);mesh.visible=false;mesh.raycast=()=>{};parent.add(mesh);
 svc.displaySurfaces.youtubeWave={canvas,texture,mesh};
}
let last=-Infinity,wasPlaying=false;
function updateYoutubeWave(ms){
 const d=svc.displaySurfaces.youtubeWave;if(!d)return;
 const playing=!!svc.isYoutubePlaying?.();
 if(!playing){if(wasPlaying){d.canvas.getContext('2d').clearRect(0,0,d.canvas.width,d.canvas.height);d.texture.needsUpdate=true;}d.mesh.visible=false;wasPlaying=false;return;}
 if(wasPlaying&&ms-last<66)return;
 d.mesh.visible=true;wasPlaying=true;last=ms;
 const c=d.canvas,x=c.getContext('2d'),cols=24,rows=12,t=ms/1000;
 x.clearRect(0,0,c.width,c.height);
 for(let i=0;i<cols;i++){
  const h=Math.max(2,Math.min(rows,Math.round(6+3*Math.sin(t*5+i*.55)+2*Math.sin(t*8-i*.91)+1.1*Math.sin(t*11+i*2.3))));
  const xx=8+i*20.5;
  for(let j=0;j<h;j++){const f=j/(rows-1);x.fillStyle=`rgb(${Math.round(20+235*f)},${Math.round(205-175*f)},${Math.round(255-65*f)})`;x.fillRect(xx,103-j*8.4,15,5.1);}
 }
 d.texture.needsUpdate=true;
}
return Object.freeze({drawYoutube,createWaveSurface,updateYoutubeWave});
}
return Object.freeze({createMusicPlayerSystemCabin,drawYoutubeBadge});
});
