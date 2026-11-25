/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6RestartCabin=api;})(globalThis,function(){'use strict';
function createRestartSystemCabin(svc){
function create3dRestartButton(){
 const group=new svc.T.Group();group.name='rc28-restart-mount';svc.mounts.root.add(group);
 const silver=new svc.T.MeshPhysicalMaterial({color:'#d7d9de',metalness:.95,roughness:.23,clearcoat:.35,clearcoatRoughness:.28});
 const base=new svc.T.Mesh(new svc.T.CylinderGeometry(.078,.081,.015,56,1,false),silver);
 base.rotation.x=Math.PI/2;base.name='rc28-restart-base';group.add(base);
 const red=new svc.T.MeshBasicMaterial({color:'#e00000',toneMapped:false});
 const cap=new svc.T.Mesh(new svc.T.CylinderGeometry(.067,.069,.024,64,1,false),red);
 cap.rotation.x=Math.PI/2;cap.position.z=.011;cap.name='rc28-3d-restart';group.add(cap);
 const glossCanvas=document.createElement('canvas');glossCanvas.width=512;glossCanvas.height=512;
 const gx=glossCanvas.getContext('2d');gx.clearRect(0,0,512,512);
 const ring=gx.createRadialGradient(200,150,20,256,256,250);ring.addColorStop(0,'rgba(255,255,255,.45)');ring.addColorStop(.22,'rgba(255,255,255,.18)');ring.addColorStop(.5,'rgba(255,255,255,.03)');ring.addColorStop(1,'rgba(255,255,255,0)');
 gx.fillStyle=ring;gx.beginPath();gx.ellipse(184,126,118,58,-.35,0,Math.PI*2);gx.fill();
 gx.fillStyle='rgba(255,255,255,.13)';gx.beginPath();gx.ellipse(256,360,160,58,0,0,Math.PI*2);gx.fill();
 const glossTex=new svc.T.CanvasTexture(glossCanvas);glossTex.colorSpace=svc.T.SRGBColorSpace;
 const gloss=new svc.T.Mesh(new svc.T.CircleGeometry(.064,64),new svc.T.MeshBasicMaterial({map:glossTex,transparent:true,depthWrite:false,toneMapped:false,side:svc.T.DoubleSide}));
 gloss.position.z=.0242;group.add(gloss);gloss.raycast=()=>{};
 const iconCanvas=document.createElement('canvas');iconCanvas.width=512;iconCanvas.height=512;
 const c=iconCanvas.getContext('2d');c.clearRect(0,0,512,512);
 c.strokeStyle='#fffaf8';c.fillStyle='#fffaf8';c.lineWidth=34;c.lineCap='round';c.lineJoin='round';
 c.beginPath();c.arc(256,256,122,-.88*Math.PI,.55*Math.PI,false);c.stroke();
 c.beginPath();c.moveTo(352,127);c.lineTo(421,161);c.lineTo(365,216);c.closePath();c.fill();
 const tex=new svc.T.CanvasTexture(iconCanvas);tex.colorSpace=svc.T.SRGBColorSpace;
 const icon=new svc.T.Mesh(new svc.T.CircleGeometry(.048,48),new svc.T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false,side:svc.T.DoubleSide}));
 icon.position.z=.0248;icon.raycast=()=>{};group.add(icon);
 const hit=new svc.T.Mesh(new svc.T.CylinderGeometry(.076,.076,.035,48),new svc.T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
 hit.rotation.x=Math.PI/2;hit.position.z=.012;hit.name='rc28-3d-restart-hit';group.add(hit);
 svc.physicalButtons.push({name:hit.name,kind:'restart',label:'重新開始本關',mode:'dash',mesh:hit,material:red,
  normalZ:hit.position.z,baseColor:red.color.clone(),baseEmissive:red.emissive?.clone?.()||new svc.T.Color('#000000'),
  baseEmissiveIntensity:red.emissiveIntensity??0,run:()=>svc.action('restart')});
 svc.ui.restart3d=hit;svc.ui.restartGroup=group;applyRestartButtonCalibration();
}
function applyRestartButtonCalibration(){
 const group=svc.ui.restartGroup;if(!group)return;
 const v=svc.displayCalibration.controls.restartButton;
 group.position.set(.12+v.position.x,1.115+v.position.y,-.92+v.position.z);
 group.rotation.set((-10+v.rotation.x)*Math.PI/180,v.rotation.y*Math.PI/180,v.rotation.z*Math.PI/180,'XYZ');
 group.scale.set(v.scale.x,v.scale.y,(v.scale.x+v.scale.y)/2);
 group.updateMatrixWorld(true);
}
return Object.freeze({create3dRestartButton,applyRestartButtonCalibration});
}
return Object.freeze({createRestartSystemCabin});
});
