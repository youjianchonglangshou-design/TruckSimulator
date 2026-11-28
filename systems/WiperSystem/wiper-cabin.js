/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6WiperCabin=api;})(globalThis,function(){'use strict';
function createWiperSystemCabin(svc){
let wiperVertices=null,wiperProjectionKey="",wiperProjection=null,preview=null,polygon=null;
function mount(host){if(preview)return; preview=document.createElementNS('http://www.w3.org/2000/svg','svg');preview.id='cabWiperHitPreview';preview.setAttribute('hidden','');preview.setAttribute('aria-hidden','true');preview.setAttribute('preserveAspectRatio','none');
 polygon=document.createElementNS('http://www.w3.org/2000/svg','polygon');polygon.setAttribute('fill','transparent');polygon.setAttribute('pointer-events','fill');preview.append(polygon);host.append(preview);
}
function unmount(){preview?.remove();preview=polygon=wiperVertices=wiperProjection=null;wiperProjectionKey="";}
function surface(){return polygon;}
function wiperHitCorners(){
 const button=svc.physicalButtons.find(x=>x.kind==='wiper');if(!button)return null;
 // Preserve the initial exact silhouette throughout the small press animation.
 if(svc.physicalPressed?.button===button&&wiperProjection)return wiperProjection;
 const mesh=button.mesh,geo=mesh.geometry;
 mesh.updateWorldMatrix(true,false);svc.camera.updateMatrixWorld();
 if(!wiperVertices){
  const a=geo.getAttribute?.('position');const unique=new Map();
  if(a){for(let i=0;i<a.count;i++){const v=new svc.T.Vector3(a.getX(i),a.getY(i),a.getZ(i));unique.set(`${v.x},${v.y},${v.z}`,v)}}
  else return null; // no fabricated input region if geometry is unavailable
  wiperVertices=[...unique.values()];
 }
 const key=mesh.matrixWorld.elements&&svc.camera.matrixWorld.elements&&svc.camera.projectionMatrix?.elements
  ?[...mesh.matrixWorld.elements,...svc.camera.matrixWorld.elements,...svc.camera.projectionMatrix.elements].join(','):null;
 if(key&&key===wiperProjectionKey)return wiperProjection;
 const points=wiperVertices.map(v=>v.clone().applyMatrix4(mesh.matrixWorld).project(svc.camera));
 wiperProjection=points.every(p=>p.z>-1&&p.z<1)?svc.interactionCal.convexHull(points):null;
 if(wiperProjection?.length<3)wiperProjection=null;
 wiperProjectionKey=key;return wiperProjection;
}
function updateWiperHitPreview(s){
 const svg=preview;if(!svg)return;
 if(s.view!==0||svc.ui.modal?.classList.contains('open')){svg.setAttribute('hidden','');return;}
 const corners=wiperHitCorners();if(!corners){svg.setAttribute('hidden','');return;}
 svg.removeAttribute('hidden');
 const viewBox=`0 0 ${svc.worldW} ${svc.worldH}`,points=corners.map(p=>`${(p.x+1)*svc.worldW/2},${(1-p.y)*svc.worldH/2}`).join(' ');
 if(svg.getAttribute('viewBox')!==viewBox)svg.setAttribute('viewBox',viewBox);
 if(polygon.getAttribute('points')!==points)polygon.setAttribute('points',points);
}
function wiperTarget(e){
 if(e.target!==polygon||preview.hasAttribute('hidden')||!document.body.classList.contains('cabin3d-ready')||!svc.mounts?.root.visible||svc.ui.modal?.classList.contains('open')||svc.b.snapshot().view!==0||window.TruckSharedMusic?.isOpen())return null;
 return svc.physicalButtons.find(x=>x.kind==='wiper')||null;
}
return Object.freeze({mount,unmount,surface,wiperHitCorners,updateWiperHitPreview,wiperTarget});
}
return Object.freeze({createWiperSystemCabin});
});
