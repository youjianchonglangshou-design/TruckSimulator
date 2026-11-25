(function(root){
// Three.js ShapeGeometry uses XY model units as UVs. Its mirror-pane UVs
// span negative fractions instead of [0,1], cropping almost the entire image.
// Correct a CLONE of the four reflective faces; no RC15 housing/camera moves.
function normalizeMirrorUV(geometry){
 const pos=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
 if(!pos||!uv||pos.count!==uv.count)throw Error('3D mirror pane is missing position/UV attributes');
 let loX=Infinity,hiX=-Infinity,loY=Infinity,hiY=-Infinity;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);
  loX=Math.min(loX,x);hiX=Math.max(hiX,x);loY=Math.min(loY,y);hiY=Math.max(hiY,y);}
 const w=Math.max(1e-8,hiX-loX),h=Math.max(1e-8,hiY-loY);
 for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)-loX)/w,(pos.getY(i)-loY)/h);
 uv.needsUpdate=true;return geometry;
}
root.TruckRenderGeometry=Object.freeze({normalizeMirrorUV});
})(globalThis);
