/* NICO settings preview: camera and parking-lot renderer ported from nico/index.html.
 * Shares decoded original NicoGuide frames. Preview-only camera state and animation clock.
 * No game camera, vehicle, guide placement or render-loop changes. */
(function(root){'use strict';
function resize(c){const r=c.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);let w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return [w,h];}
function camera(a,d,e,w,h){let x=Math.sin(a)*d,z=Math.cos(a)*d,y=e,dy=1.05-y,L=Math.hypot(d,dy);let fx=-x/L,fy=dy/L,fz=-z/L,rx=Math.cos(a),rz=-Math.sin(a);let ux=-rz*fy,uy=rz*fx-rx*fz,uz=rx*fy;return{x,y,z,fx,fy,fz,rx,rz,ux,uy,uz,w,h,f:Math.min(w*.95,h*1.10)};}
function cp(p,c){let x=p[0]-c.x,y=p[1]-c.y,z=p[2]-c.z;return[x*c.rx+z*c.rz,x*c.ux+y*c.uy+z*c.uz,x*c.fx+y*c.fy+z*c.fz]}
function pr(p,c){return [c.w/2+p[0]*c.f/p[2],(c.cy??c.h*.43)-p[1]*c.f/p[2]]}
function clip(poly,c){let arr=poly.map(p=>cp(p,c)),out=[];for(let i=0;i<arr.length;i++){let a=arr[i],b=arr[(i+1)%arr.length],ia=a[2]>.12,ib=b[2]>.12;if(ia)out.push(a);if(ia!==ib){let t=(.12-a[2])/(b[2]-a[2]);out.push(a.map((x,j)=>x+(b[j]-x)*t))}}return out}
function polygon(ctx,p,c,col){let v=clip(p,c);if(v.length<3)return;ctx.beginPath();for(let i=0;i<v.length;i++){let [x,y]=pr(v[i],c);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fillStyle=col;ctx.fill()}
function line(ctx,a,b,c,col,width=1){let p=cp(a,c),q=cp(b,c);if(p[2]<.12&&q[2]<.12)return;if(p[2]<.12){let t=(.12-p[2])/(q[2]-p[2]);p=p.map((x,j)=>x+(q[j]-x)*t)}if(q[2]<.12){let t=(.12-q[2])/(p[2]-q[2]);q=q.map((x,j)=>x+(p[j]-x)*t)}let A=pr(p,c),B=pr(q,c);ctx.beginPath();ctx.moveTo(...A);ctx.lineTo(...B);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke()}
function rect(ctx,c,x1,z1,x2,z2,col,y=.012){polygon(ctx,[[x1,y,z1],[x2,y,z1],[x2,y,z2],[x1,y,z2]],c,col)}
const faces=[];function box(x,y,z,w,h,d,colors){let A=[x-w/2,y,z-d/2],B=[x+w/2,y,z-d/2],C=[x+w/2,y,z+d/2],D=[x-w/2,y,z+d/2],E=[A[0],y+h,A[2]],F=[B[0],y+h,B[2]],G=[C[0],y+h,C[2]],H=[D[0],y+h,D[2]];[[A,B,F,E],[B,C,G,F],[C,D,H,G],[D,A,E,H],[E,F,G,H]].forEach((p,i)=>faces.push({p,col:colors[i%colors.length]}))}
box(0,0,-32,52,11,7,['#596970','#6a797e','#89999f','#63747a','#b1b9bb']);for(let x=-22;x<=22;x+=5.5){box(x,0,-28.42,3.6,4.3,.12,['#24333c','#35444c','#394b54','#35444c','#43545c']);box(x,4.6,-28.29,3.8,.22,.3,['#a1b2b6']);for(let k=1;k<5;k++)box(x,k*.75,-28.34,3.4,.035,.09,['#788992']);}box(0,5.5,-28.2,52,.24,1.2,['#55666e','#41545c','#5b7078','#41545c','#83949a']);for(let x=-23;x<=23;x+=4)box(x,7.1,-28.43,2.5,1.35,.12,['#55717d','#607985','#4e6c78']);
function draw(cvs,a,d,e,phase,img){let [w,h]=resize(cvs),ctx=cvs.getContext('2d'),c=camera(a,d,e,w,h);
// A tighter preview lens compensates for the smaller embedded viewport.
// Cap magnification against the complete transparent sprite, even at near/high camera settings.
if(img){const foot=cp([0,0,0],c),k=.00443,ax=187,ay=519,z=foot[2],top=foot[1]+ay*k,bottom=-foot[1]+(img.naturalHeight-ay)*k;
 const optical=c.f*1.55,widthLimit=(w*.45)*z/(Math.max(ax,img.naturalWidth-ax)*k);
 const original=Math.min(optical,top>0?(h*.43-h*.05)*z/top:Infinity,bottom>0?(h*.52)*z/bottom:Infinity,widthLimit);
 // Keep the old framing at and above 3.5 m. Closer than that, center the
 // complete sprite in the available viewport rather than clipping its hands.
 const near=Math.max(0,Math.min(1,(3.5-d)/1.5));
 const close=Math.min(optical,.92*h*z/(img.naturalHeight*k),widthLimit);
 c.f=original+near*(Math.max(original,close)-original);
 if(near>0){const minY=.04*h+top*c.f/z,maxY=.96*h-bottom*c.f/z;c.cy=Math.max(minY,Math.min(h*.43,maxY));}
}
ctx.save();ctx.clearRect(0,0,w,h);let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#83adc5');sky.addColorStop(.72,'#d3e2e4');sky.addColorStop(1,'#e2e8e2');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);rect(ctx,c,-250,-250,250,250,'#7a8689',0);for(let x=-40;x<=40;x+=4)line(ctx,[x,.005,-60],[x,.005,60],c,'#657377',1);for(let z=-60;z<=60;z+=4)line(ctx,[-45,.006,z],[45,.006,z],c,'#657377',1);for(let i=-2;i<=2;i++){let x=3.7+i*3.8;rect(ctx,c,x-1.8,-5.8,x-1.72,6.2,'#d7c28e');rect(ctx,c,x+1.72,-5.8,x+1.8,6.2,'#d7c28e');rect(ctx,c,x-1.8,-5.8,x+1.8,-5.72,'#d7c28e')}
// Parking marker is a world-space outline; only the target breathes.
let pulse=.62+.38*(.5+.5*Math.sin(phase*.9+performance.now()/350));{let rgb=`rgba(98,255,166,${pulse})`;rect(ctx,c,1.9,-5.8,2.00,6.2,rgb);rect(ctx,c,5.40,-5.8,5.50,6.2,rgb);rect(ctx,c,1.9,-5.8,5.50,-5.70,rgb);rect(ctx,c,1.9,6.10,5.50,6.20,rgb);rect(ctx,c,2.0,-5.7,5.4,6.1,'rgba(64,240,136,.065)')}
let ring=[];for(let i=0;i<48;i++){let t=i/48*Math.PI*2;ring.push([.66*Math.cos(t),.02,.40*Math.sin(t)])}polygon(ctx,ring,c,'rgba(20,33,38,.25)');for(let i=0;i<48;i++){let t=i/48*2*Math.PI,u=(i+1)/48*2*Math.PI;line(ctx,[.77*Math.cos(t),.025,.49*Math.sin(t)],[.77*Math.cos(u),.025,.49*Math.sin(u)],c,`rgba(111,255,178,${pulse})`,Math.max(1,w/650))}
const items=faces.map(f=>({...f,z:f.p.reduce((n,p)=>n+cp(p,c)[2],0)/4}));items.push({person:true,z:cp([0,1,0],c)[2]});items.sort((a,b)=>b.z-a.z);for(let item of items){if(!item.person){polygon(ctx,item.p,c,item.col);continue}if(!img||!img.complete||!img.naturalWidth)continue;
// Cylindrical billboard. World feet stay fixed. Transparent frames share one anchor.
let k=.00443,anchorX=187,anchorY=519,topY=anchorY*k;let center=cp([0,0,0],c),foot=pr(center,c);const unit=c.f/center[2];let dw=img.naturalWidth*k*unit,dh=img.naturalHeight*k*unit;ctx.drawImage(img,foot[0]-anchorX*k*unit,foot[1]-topY*unit,dw,dh);}
ctx.restore();}

const css=`
#cabModal .nico-preview-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0}
#cabModal .nico-preview-layout canvas.nico-preview-canvas{position:relative;inset:auto;display:block;width:100%;height:auto;aspect-ratio:16/10;min-width:0;border:1px solid #7fb2b87a;border-radius:8px;background:#26373e}
#cabModal .nico-preview-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px;min-width:0}
#cabModal .nico-preview-heading{display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px;margin-left:5px;color:#d8e9e9;font-size:11px;font-weight:600;line-height:1.5}
#cabModal .nico-preview-heading small{font-size:11px;color:#8de1d7;font-weight:400;white-space:nowrap}
#cabModal .nico-preview-controls label{display:grid;grid-template-columns:5.3em minmax(0,1fr) 3.8em;gap:6px;font-size:12px;align-items:center;min-width:0}
#cabModal .nico-preview-controls input[type=range]{width:100%;min-width:0;max-width:none;margin:0;accent-color:#78e2d0;touch-action:pan-y}
#cabModal .nico-preview-controls output{text-align:right;color:#a2e5d9;white-space:nowrap;font-variant-numeric:tabular-nums}
@media(max-width:750px){#cabModal .nico-preview-controls{gap:7px 8px}#cabModal .nico-preview-controls label{font-size:11px;grid-template-columns:5em minmax(0,1fr) 3.5em;gap:4px}}
@media(max-width:480px){#cabModal .nico-preview-controls label{grid-template-columns:minmax(0,1fr) auto;gap:3px 4px}#cabModal .nico-preview-controls label input[type=range]{grid-row:2;grid-column:1/-1}#cabModal .nico-preview-controls label output{grid-row:1;grid-column:2}#cabModal .nico-preview-heading{margin-left:0}}
`;
const cameraSettings={angle:0,dist:5.5,eye:2.1};
function mount(parent,guide){
 const doc=parent.ownerDocument,make=(p,tag,cls,text)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;p.append(el);return el;};
 const style=make(parent,'style');style.textContent=css;
 const layout=make(parent,'div','nico-preview-layout');
 const canvas=make(layout,'canvas','nico-preview-canvas');canvas.setAttribute('aria-label','NICO 真人揮手即時預覽');canvas.setAttribute('role','img');
 const controls=make(layout,'div','nico-preview-controls');
 const tabTitle=parent.closest('.cab-settings-section')?.querySelector('.cab-tab-title');
 const title=make(tabTitle||parent,'span','nico-preview-heading','視角與動畫測試');make(title,'small',null,`${guide.frameCount} 幀 · ${guide.defaults.fps} fps`);
 let speed=guide.getWaveSpeed(),phase=0,last=0,lastDraw=-Infinity,raf=0,active=false,disposed=false,observer;
 function render(){const index=Math.floor(phase)%guide.frameCount;const img=guide.previewFrame(index);draw(canvas,cameraSettings.angle*Math.PI/180,cameraSettings.dist,cameraSettings.eye,phase,img);if(img)canvas.dataset.frame=String(index);}
 function tick(t){raf=0;if(disposed||!active||!layout.isConnected)return;if(last)phase=(phase+Math.min(.1,(t-last)/1000)*guide.defaults.fps*speed)%guide.frameCount;last=t;if(t-lastDraw>=32){render();lastDraw=t}raf=requestAnimationFrame(tick);}
 function toggle(on){if(disposed)return;active=on;if(!on){if(raf)cancelAnimationFrame(raf);raf=0;last=0;return;}if(!raf){last=0;lastDraw=-Infinity;raf=requestAnimationFrame(tick);}}
 const defs=[['angle','cabNicoAngle','環繞角度',-180,180,1,v=>Math.round(v)+'°'],['eye','cabNicoEye','視角高度',1.5,3.3,.1,v=>v.toFixed(1)+' m'],['dist','cabNicoDistance','觀察距離',2,25,.1,v=>v.toFixed(1)+' m'],['speed','cabNicoWaveSpeed','揮手速度',guide.waveSpeedRange.min,guide.waveSpeedRange.max,guide.waveSpeedRange.step,v=>v.toFixed(1)+'×']];
 for(const [key,id,label,min,max,step,fmt] of defs){const row=make(controls,'label',key==='speed'?'cab-nico-wave':'nico-preview-row');row.htmlFor=id;make(row,'span',null,label);const slider=make(row,'input');slider.id=id;slider.type='range';slider.min=String(min);slider.max=String(max);slider.step=String(step);slider.value=String(key==='speed'?speed:cameraSettings[key]);slider.setAttribute('aria-label',label);const value=make(row,'output',null,fmt(Number(slider.value)));value.htmlFor=id;slider.addEventListener('input',()=>{let v=Number(slider.value);if(key==='speed'){speed=guide.setWaveSpeed(v);v=speed;slider.value=String(v);}else cameraSettings[key]=v;value.textContent=fmt(v);if(active)render();});}
 // Only render when the canvas itself is inside the card's visible scroll region.
 if(typeof IntersectionObserver==='function'){observer=new IntersectionObserver(entries=>toggle(entries.some(e=>e.isIntersecting)),{root:parent.closest('.cab-dialog-body')||null});observer.observe(canvas);}else toggle(true);
 return Object.freeze({dispose(){if(disposed)return;toggle(false);disposed=true;observer?.disconnect();layout.remove();title.remove();style.remove();}});
}
root.TruckNicoPreview=Object.freeze({mount});
})(globalThis);
