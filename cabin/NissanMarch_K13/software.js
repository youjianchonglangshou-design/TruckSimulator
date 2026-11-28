/* CPU rasterizer: near-plane clipped true 3D triangles, per-pixel depth buffer.
   Same model/eye/FOV as GPU path; no image-based substitute. */
function softwareRender(ctx,W,H,sky,eye,target,fov,environment,model,wire){
 const M=CarModel,scale=Math.min(1,960/W,540/H),w=Math.max(1,Math.round(W*scale)),h=Math.max(1,Math.round(H*scale));
 const off=document.createElement('canvas');off.width=w;off.height=h;const c=off.getContext('2d'),img=c.createImageData(w,h),pixels=img.data,depth=new Float32Array(w*h);
 const bg=sky.map(v=>Math.round(v*255));for(let i=0;i<pixels.length;i+=4){pixels[i]=bg[0];pixels[i+1]=bg[1];pixels[i+2]=bg[2];pixels[i+3]=255;}
 const z=M.norm(M.sub(target,eye)),x=M.norm(M.cross(z,[0,1,0])),y=M.cross(x,z),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),f=h/2/Math.tan(fov*Math.PI/360),near=.025;
 const cam=v=>{const q=M.sub(v,eye);return [dot(q,x),dot(q,y),dot(q,z)];};
 function clip(v){const out=[];for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length],A=a[2]>=near,B=b[2]>=near;if(A)out.push(a);if(A!==B){const t=(near-a[2])/(b[2]-a[2]);out.push(a.map((n,j)=>n+(b[j]-n)*t));}}return out;}
 const proj=v=>[w/2+f*v[0]/v[2],h/2-f*v[1]/v[2],1/v[2]];
 const edge=(a,b,x,y)=>(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);
 function tri(a,b,c,col){let area=edge(a,b,c[0],c[1]);if(Math.abs(area)<1e-6)return;if(area<0){[b,c]=[c,b];area=-area;}const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));for(let iy=y0;iy<=y1;iy++){let u=edge(b,c,x0+.5,iy+.5),v=edge(c,a,x0+.5,iy+.5),t=edge(a,b,x0+.5,iy+.5);for(let ix=x0;ix<=x1;ix++,u-=c[1]-b[1],v-=a[1]-c[1],t-=b[1]-a[1]){if(u<0||v<0||t<0)continue;const d=(u*a[2]+v*b[2]+t*c[2])/area,i=iy*w+ix;if(d>=depth[i]){depth[i]=d;let p=i*4;pixels[p]=col[0];pixels[p+1]=col[1];pixels[p+2]=col[2];}}}}
 const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));function face(q){const v=clip(q.v.map(cam)).map(proj);for(let i=1;i<v.length-1;i++)tri(v[0],v[i],v[i+1],rgb(q.c));}
 environment.forEach(face);model.forEach(face);if(wire){function line(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],steps=Math.min(10000,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));for(let j=0;j<=steps;j++){const t=j/(steps||1),X=Math.round(a[0]+dx*t),Y=Math.round(a[1]+dy*t);if(X<0||X>=w||Y<0||Y>=h)continue;const d=a[2]+(b[2]-a[2])*t,i=Y*w+X;if(d>=depth[i]*.995){pixels[i*4]=16;pixels[i*4+1]=30;pixels[i*4+2]=43;}}}for(const q of model){const v=clip(q.v.map(cam)).map(proj);for(let i=0;i<v.length;i++)line(v[i],v[(i+1)%v.length]);}}
 c.putImageData(img,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(off,0,0,W,H);
}
