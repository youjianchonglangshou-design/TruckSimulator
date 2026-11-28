/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6BrakeCabin=api;})(globalThis,function(){'use strict';
function drawParkingArtwork(x,w,h){
  x.fillStyle='#101010';x.strokeStyle='#101010';x.lineWidth=10;
  x.beginPath();x.arc(116,h/2,78,0,Math.PI*2);x.stroke();
  x.font='bold 118px Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('P',116,h/2+6);
  x.font='bold 145px "Microsoft JhengHei","Noto Sans CJK TC",sans-serif';x.fillText('手剎車',545,h/2+8);
  if(!(globalThis.document?.body?.classList.contains('mobile-game')||!!globalThis.matchMedia?.('(pointer:coarse)')?.matches)){x.font='bold 125px Arial,sans-serif';x.fillText('B',930,h/2+7);}
}
function createParkingBrakeSystemCabin(svc){
let brakeState=null,brakeCalibration=svc.brakeAdjustment.normalize(svc.brakeAdjustment.defaults);
function getCalibration(){return svc.brakeAdjustment.normalize(brakeCalibration);}
function create3dParkingBrake(){
 const part=svc.mounts.parts.get('gear-selector')?.content;
 if(!part)throw Error('RC15 gear-selector-model not found');
 const w=.266,h=.056,r=.011,shape=new svc.T.Shape();
 shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);
 shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
 shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
 shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
 shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const geo=new svc.T.ExtrudeGeometry(shape,{depth:.010,bevelEnabled:true,bevelThickness:.0025,bevelSize:.0025,bevelSegments:3,curveSegments:12});
 const material=new svc.T.MeshStandardMaterial({color:'#637d8f',metalness:.14,roughness:.59,emissive:'#000000',emissiveIntensity:0});
 const mesh=new svc.T.Mesh(geo,material);mesh.name='shifter-3d-parking-brake';
 // RC6: the RC5 button lay below the silver fascia (-.051Z) and outside
 // the normal view below the bottom frame. Keep the approved pedestal
 // stationary; move ONLY the new parking switch onto its exposed lower lip.
 // Local Z is the upward-facing direction because the selector mount is
 // tilted -89.5 degrees around X in the approved equipment layout.
 mesh.position.set(.003,-.210,.007);part.add(mesh);
}
function applyParkingBrakeCalibration(value){
 brakeCalibration=svc.brakeAdjustment.normalize(value);
 const mesh=svc.local('shifter-3d-parking-brake');if(!mesh)return;
 const {position:p,rotation:r,scale}=brakeCalibration;
 mesh.position.set(p.x,p.y,p.z);
 mesh.rotation.set(r.x*Math.PI/180,r.y*Math.PI/180,r.z*Math.PI/180,'XYZ');
 mesh.scale.setScalar(scale);
 const button=svc.physicalButtons.find(x=>x.mesh===mesh);
 if(button){button.normalZ=p.z;svc.setPhysicalFeedback(button,svc.physicalPressed?.button===button?2:svc.physicalHover===button?1:0)}
}
function update3dParkingBrake(engaged){
 if(engaged===brakeState)return;brakeState=engaged;
 const button=svc.physicalButtons.find(o=>o.name==='shifter-3d-parking-brake');if(!button)return;
 button.baseColor?.set(engaged?'#b52a35':'#637d8f');
 button.baseEmissive?.set(engaged?'#682126':'#000000');
 button.baseEmissiveIntensity=engaged?.12:0;
 svc.setPhysicalFeedback(button,svc.physicalPressed?.button===button?2:svc.physicalHover===button?1:0);
}
return Object.freeze({getCalibration,create3dParkingBrake,applyParkingBrakeCalibration,update3dParkingBrake});
}
return Object.freeze({createParkingBrakeSystemCabin,drawParkingArtwork});
});
