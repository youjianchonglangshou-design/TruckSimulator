/* Jiuqudong A / independent preview. World units: metres. All geometry is original,
   reconstructed from user-provided maps and street-view references; no photo billboards. */
(function(root){'use strict';
root.TruckRealScenes.register('jiuqudong',function(P){
 const {at,tractor,trailer,corners,rear}=P;
 const END=2000, MIN=-24, MAX=2024, STEP=2, BRIDGE=[104,154];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
 const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
 const heading=s=>1.32*smooth((s-145)/55)-.14*smooth((s-242)/35)+.16*smooth((s-315)/32)-.18*smooth((s-370)/30)+.16*smooth((s-424)/48)-.12*smooth((s-490)/42)+.14*smooth((s-590)/65)-1.02*smooth((s-744)/56)-.72*smooth((s-824)/55)+.66*smooth((s-884)/64)+.78*smooth((s-1010)/66)-.94*smooth((s-1130)/70)-.34*smooth((s-1200)/46)+.63*smooth((s-1252)/57)-.49*smooth((s-1324)/52)+.37*smooth((s-1402)/50)-.67*smooth((s-1510)/80)+.32*smooth((s-1610)/50)+.66*smooth((s-1710)/110)-.24*smooth((s-1820)/65)+.38*smooth((s-1890)/65)-.30*smooth((s-1960)/40);
 const height=s=>1.25*smooth((s-154)/48)-.18*smooth((s-208)/22)+.42*smooth((s-262)/30)-.82*smooth((s-320)/38)+.53*smooth((s-350)/22)-.35*smooth((s-386)/18)+.85*smooth((s-432)/64)-.56*smooth((s-512)/68)+.9*smooth((s-626)/74)-.52*smooth((s-738)/58)+.95*smooth((s-824)/72)-1.65*smooth((s-948)/90)+.7*smooth((s-1050)/64)-.35*smooth((s-1142)/58)+.72*smooth((s-1210)/60)-.58*smooth((s-1280)/54)+.42*smooth((s-1360)/56)-.94*smooth((s-1430)/70)+.68*smooth((s-1510)/75)+.45*smooth((s-1610)/50)-.65*smooth((s-1720)/100)+.48*smooth((s-1860)/65)-.32*smooth((s-1940)/60);
 const width=()=>10.21;
 const fields=Object.freeze({road:100,edge:100,marks:100,towers:100,cables:100,leftCliff:100,rightCliff:100,rockTexture:100,water:100,banks:100,distant:100});
 const settingsKey="truck-jqd-a-environment-v1";
 const normalize=raw=>Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,Number.isFinite(Number(raw?.[k]))&&raw?.[k]!=null?clamp(Math.round(Number(raw[k])),0,100):v]));
 let params={...fields};
 const setParams=raw=>{params=normalize(raw);try{root.localStorage?.setItem(settingsKey,JSON.stringify(params));}catch{}return {...params};};
 const nodes=[];let x=0,z=MIN;
 for(let s=MIN;s<=MAX;s+=STEP){if(s>MIN){const a=heading(s-STEP/2);x+=Math.sin(a)*STEP;z+=Math.cos(a)*STEP;}nodes.push({s,x,z,y:height(s),a:heading(s),w:width(s)});}
 function frame(s){s=clamp(s,MIN,MAX);let i=Math.min(nodes.length-2,Math.floor((s-MIN)/STEP)),a=nodes[i],b=nodes[i+1],t=(s-a.s)/STEP;return {s,x:mix(a.x,b.x,t),z:mix(a.z,b.z,t),y:mix(a.y,b.y,t),a:heading(s),w:width(s)};}
 function point(s,r=0,y=0){let p=frame(s);return {...at(p.x,p.z,p.a,0,r),y:p.y+y};}
 // The route is monotonic on the diagonal projection, so exact nearest-segment
 // search can stop as soon as the projection lower bound exceeds the best distance.
 const diag=Math.SQRT1_2,projection=nodes.map(n=>(n.x+n.z)*diag);
 function locate(p){let best=Infinity,result=null,pr=(p.x+p.z)*diag,lo=0,hi=nodes.length-1;
  while(lo<hi){let mid=(lo+hi)>>1;if(projection[mid]<pr)lo=mid+1;else hi=mid;}
  const check=i=>{const a=nodes[i],b=nodes[i+1],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz),0,1),xx=p.x-a.x-t*dx,zz=p.z-a.z-t*dz,d=xx*xx+zz*zz;if(d<best){best=d;let s=a.s+t*STEP,ang=heading(s);result={s,r:xx*Math.cos(ang)-zz*Math.sin(ang),w:width(s),d:Math.sqrt(d),long:((p.x-a.x)*dx+(p.z-a.z)*dz)/STEP};}};
  for(let i=Math.min(nodes.length-2,lo-1);i>=0;i--){let gap=Math.max(0,pr-projection[i+1]);if(gap*gap>best)break;check(i);}
  for(let i=Math.max(0,lo);i<nodes.length-1;i++){let gap=Math.max(0,projection[i]-pr);if(gap*gap>best)break;check(i);}return result;
 }
 // Visual support planes: rear/front tractor axles and trailer hitch/bogie.
 const surfaceHeight=p=>frame(locate(p).s).y;
 function terrainPose(s){const h=P.hitch(s),plane=(p,a,y,grade)=>({grade,heightAt:q=>y+grade*((q.x-p.x)*Math.sin(a)+(q.z-p.z)*Math.cos(a))});
  const rear=at(s.x,s.z,s.a,-.58),front=at(s.x,s.z,s.a,3.7),yr=surfaceHeight(rear),yf=surfaceHeight(front),tractor=plane(rear,s.a,yr,(yf-yr)/4.28);
  const bogie=at(h.x,h.z,s.b,-8.7),yh=tractor.heightAt(h),yb=surfaceHeight(bogie),trailer=plane(h,s.b,yh,(yh-yb)/8.7);return {tractor,trailer};}
 // Signed longitudinal gravity, using axle support grades for both articulated bodies.
 // 35/65 is a nominal tractor/trailer mass split, not a measured load.
 function gravityAcceleration(s){const t=terrainPose(s),a=t.tractor.grade,b=t.trailer.grade;return -9.81*(.35*a/Math.hypot(1,a)+.65*b/Math.hypot(1,b)*Math.cos(s.a-s.b));}
 const beyond=q=>q.s===MIN&&q.long<0||q.s===MAX&&q.long>STEP;
 function bounds(p){let q=locate(p);return Math.abs(q.r)<=width()/2+.015&&!beyond(q);}
 const RAIL=[MIN,BRIDGE[1]]; // Include the start buffer so the initial trailer is protected.
 const onRail=d=>d>=RAIL[0]&&d<=RAIL[1];
 // Rails are outside the 10.21 m asphalt clear width; one straight section and
 // short sections through the bend. Collision boxes use the same endpoints.
 const railStops=[MIN,104,144,146,148,150,152,154],railInner=width()/2,railOuter=railInner+.30;
 const railSegments=[];for(let i=0;i<railStops.length-1;i++)for(const side of [-1,1]){const a=point(railStops[i],side*(railInner+.15)),b=point(railStops[i+1],side*(railInner+.15));railSegments.push({x:(a.x+b.x)/2,z:(a.z+b.z)/2,a:Math.atan2(b.x-a.x,b.z-a.z),w:.30,l:Math.hypot(b.x-a.x,b.z-a.z),s0:railStops[i],s1:railStops[i+1]});}
 function fall(s){const h=P.hitch(s);const axles=[{p:at(s.x,s.z,s.a,3.4),a:s.a},{p:at(s.x,s.z,s.a,0),a:s.a},{p:at(h.x,h.z,s.b,-9.2),a:s.b}];return axles.some(({p,a})=>[-1,1].some(side=>{const q=locate(at(p.x,p.z,a,0,side*1.04));return !onRail(q.s)&&Math.abs(q.r)>width()/2+.12&&!beyond(q);}));}
 // Approach and bridge rails collide; after the bridge the visible edge remains open.
 function collision(s){return [tractor(s),trailer(s)].some(o=>{const q=locate(o);if(corners(o).some(p=>beyond(locate(p))))return true;if(q.s<RAIL[0]-o.l-3||q.s>RAIL[1]+o.l+3)return false;return railSegments.some(r=>P.overlap(o,r));});}
 let startStation=0,travelDirection=1;
 function start(){const d=startStation,k=travelDirection,p={...point(d,2.35*k),a:P.angle(heading(d)+(k<0?Math.PI:0)),b:P.angle(heading(d-9*k)+(k<0?Math.PI:0)),v:0,steer:0};delete p.y;return p;}
 function selectStart(d){if(![0,400,800,1200,1600].includes(d))throw RangeError("Invalid JQD start");travelDirection=1;startStation=d;return start();}
 function selectDirection(k){if(k!==1&&k!==-1)throw RangeError("Invalid direction");travelDirection=k;startStation=k===1?0:END;return start();}
 const end=frame(END),goal={x:end.x,z:end.z,a:end.a,w:width(END),l:1,id:'2000m 終點'};
 // Finish marshal only: the existing drive-through completion rule remains unchanged.
 function nicoGoal(){const k=travelDirection,d=k===1?END-6:6;return {...point(d,4.05*k),a:P.angle(heading(d)+(k<0?Math.PI:0)),w:.2,l:1};}
 function nicoBounds(p){const q=locate(p),k=travelDirection;return bounds(p)&&q.r*k>=3.4&&q.r*k<=4.95&&Math.abs(q.s-(k===1?END:0))<=20;}
 function completed(s){return travelDirection===1?locate(rear(s)).s>=END:locate(rear(s)).s<=0;}
 const progress=s=>clamp(locate(s).s,0,END);
 const noise=(a,b=0)=>{let n=Math.sin(a*127.1+b*311.7+17.23)*43758.5453123;return n-Math.floor(n)};
 const col=(base,n)=>'#'+base.map(v=>Math.round(clamp(v+n,0,255)).toString(16).padStart(2,'0')).join('');
 function render({face:emitFace,box,flat,observer,textureFace}){
  // Every solid face in this sloping scene shares the same BSP path. Water remains a below-road background.
  const face=(v,c,solid=true)=>emitFace(v,c,null,false,solid);
  const Q=(a,b,c,d,color,solid=true)=>{if(Math.abs(a.y-b.y)+Math.abs(a.y-c.y)+Math.abs(a.y-d.y)<1e-7)face([a,b,c,d],color,solid);else{face([a,b,c],color,solid);face([a,c,d],color,solid)}};const T=(a,b,c,color)=>face([a,b,c],color);
  const band=(s,t,r1,r2,r3,r4,y,color,solid=true)=>Q(point(s,r1,y),point(t,r2,y),point(t,r3,y),point(s,r4,y),color,solid);
  const span=(s,t,r,y,color,th=.12)=>Q(point(s,r(s)-th/2,y),point(t,r(t)-th/2,y),point(t,r(t)+th/2,y),point(s,r(s)+th/2,y),color);
  // Beams use actual world-space rectangular cross sections; no axis-aligned fake cables.
  function beam(a,b,w,color){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,L=Math.hypot(dx,dy,dz);if(L<.01)return;let ux=dz,uz=-dx,uy=0,N=Math.hypot(ux,uz);if(N<.01){ux=1;uz=0;N=1;}ux=ux/N*w/2;uz=uz/N*w/2;let vx=(dy*uz-dz*uy)/L,vy=(dz*ux-dx*uz)/L,vz=(dx*uy-dy*ux)/L;const ring=p=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>({x:p.x+i*ux+j*vx,y:p.y+i*uy+j*vy,z:p.z+i*uz+j*vz}));let A=ring(a),B=ring(b);for(let i=0;i<4;i++)Q(A[i],A[(i+1)%4],B[(i+1)%4],B[i],color);face(A,color);face(B,color);}
  const tier=observer?.tier||'high',fine=tier==='ultra'||tier==='high',observed=observer?locate(observer).s:0;
  const drawMin=Math.max(MIN,Math.floor((observed-140)/50)*50),drawMax=Math.min(MAX,Math.ceil((observed+220)/50)*50);
  const visibleSpan=(a,b)=>b>=drawMin&&a<=drawMax;
  const pct=k=>params[k]/100, stride=(base,k,max=60)=>Math.min(max,Math.max(base,Math.round(base/Math.max(.08,pct(k)))));
  const keep=(k,a,b=0)=>pct(k)>=1||pct(k)>0&&noise(a,b)<pct(k);
  // Adaptive strips: merge straight runs, keep curved edges within 5 cm of the
  // original 2 m centreline. Road and base water cannot be removed by visual sliders.
  function strips(maxLen,fn,extra=[]){let stops=[MIN,...new Set([...extra,400,424,600,800,824,910,964,1000,1200].filter(x=>x>MIN&&x<MAX)),MAX].sort((a,b)=>a-b);for(let j=0;j<stops.length-1;j++){let s=stops[j],end=stops[j+1];while(s<end){let t=Math.min(end,s+maxLen);while(t-s>STEP){let a=point(s),b=point(t),m=point((s+t)/2),err=Math.hypot(m.x-(a.x+b.x)/2,m.z-(a.z+b.z)/2);const coarseC=s>=824&&!fine;if(err<=(coarseC?.06:.025)&&Math.abs(m.y-(a.y+b.y)/2)<=(coarseC?.025:.015)&&Math.abs(heading(s)-heading(t))<=(coarseC?.08:.055))break;t=s+Math.max(STEP,Math.floor((t-s)/2/STEP)*STEP);}if(visibleSpan(s,t))fn(s,t);s=t;}}}
  // Continuous water on both sides, all the way from start through finish.
  strips(stride(16,'water'),(s,t)=>{const r=u=>u>=92&&u<=210?38:25,l=u=>u>=92&&u<=210?37:23;band(s,t,-l(s),-l(t),r(t),r(s),-6,'#437477',false);},[92,154,210]);
  if(pct('water')>0&&fine)for(let s=MIN;s<MAX;s+=stride(12,'water')){let t=Math.min(s+4,MAX);for(let j=0;j<2;j++){if(!visibleSpan(s,t)||!keep('water',s,j))continue;let rr=(j?1:-1)*(8+noise(s,j)*11);band(s,t,rr,rr+.7,rr+2,rr+1.3,-5.98,'#64928e',false);}}
  // Constant 10.21 m asphalt, no sidewalk or shoulder outside the edge.
  const h=width()/2, roadStep=stride(fine?4:tier==='balanced'?8:16,'road',48);
  const tunnels=[[1270,1302],[1366,1400],[1460,1492]];
  const E0=1660,E1=1710,E2=1850;
  const tunnelCuts=[...tunnels.flat(),1600,E0,E1,E2,2000], inTunnel=d=>tunnels.some(([a,b])=>d>=a&&d<b)||d>=E0&&d<E2;
  const pavement=[];
  strips(roadStep,(s,t)=>{pavement.push([s,t]);band(s,t,-h,-h,h,h,0,(s>=E1&&t<=E2)?(Math.floor((s+t)/28)%2?'#514632':'#5c4c33'):inTunnel((s+t)/2)?'#303233':'#424546');
   // No vertical edge panels after the bridge: they read as a false barrier in the forward view.
   if(t<=RAIL[1]&&pct('edge')>0)for(let side of [-1,1]){let r=side*h;Q(point(s,r,0),point(t,r,0),point(t,r,-.15-1*pct('edge')),point(s,r,-.15-1*pct('edge')),'#71716c');}
  },[RAIL[1],...tunnelCuts]);
  if(pct('marks')>0)for(const [s,t] of pavement){if(s>observed+300||t<observed-250)continue;for(let side of [-1,1])span(s,t,()=>side*(h-.13),.025,s<154?'#b94e52':'#deded0',.105);for(let r of (pct('marks')>=.5?[-.12,.12]:[0]))span(s,t,()=>r,.029,'#e7b849',.105);}
  // Approach and bridge: stone parapet, metal upper rail, and sparse posts. Low tiers
  // use continuous planar strips rather than thousands of small boxes.
  if(visibleSpan(...RAIL))for(const side of [-1,1]){
   const ri=side*railInner,ro=side*railOuter,rm=side*(railInner+.15);
   for(let i=0;i<railStops.length-1;i++){let a=railStops[i],b=railStops[i+1];if(!visibleSpan(a,b))continue;
    for(const r of [ri,ro])Q(point(a,r,0),point(b,r,0),point(b,r,.58),point(a,r,.58),'#a0a39e');
    band(a,b,ri,ri,ro,ro,.58,'#b9bcb4');
    Q(point(a,rm,.91),point(b,rm,.91),point(b,rm,1.04),point(a,rm,1.04),'#b5bdbb');
    if(fine)band(a,b,rm-.045,rm-.045,rm+.045,rm+.045,1.04,'#d0d4cd');
   }
   for(const d of RAIL)if(visibleSpan(d,d))Q(point(d,ri,0),point(d,ro,0),point(d,ro,.58),point(d,ri,.58),'#9b9f99');
   const spacing=fine?2.5:5;for(let d=RAIL[0];d<=RAIL[1]+.001;d+=spacing){if(!visibleSpan(d,d))continue;const a=Math.max(RAIL[0],d-.10),b=Math.min(RAIL[1],d+.10);Q(point(a,rm,.58),point(b,rm,.58),point(b,rm,1.10),point(a,rm,1.10),'#c2c6bf');if(fine)Q(point(d,rm-.085,.58),point(d,rm+.085,.58),point(d,rm+.085,1.10),point(d,rm-.085,1.10),'#a5ada8');}
  }
  // Red suspension portal and converging stays, modelled as 3D members.
  if(pct('towers')>0&&visibleSpan(104,154))for(let tower of [122,146]){let half=width(tower)/2+1.45;for(let side of [-1,1]){let r=side*half;beam(point(tower,r,-1),point(tower,r*.84,13.8),.72,'#bd3539');
    for(let anchor of [105,153])if(Math.abs(anchor-tower)>4&&keep('cables',tower+anchor,side)){beam(point(tower,r*.84,13.6),point(anchor,side*(width(anchor)/2+.65),.2),.17,'#c83a40');}
   }beam(point(tower,-half*.85,9.6),point(tower,half*.85,9.6),.75,'#bb3439');if(pct('towers')>=.5)beam(point(tower,-half*.84,13.5),point(tower,half*.84,13.5),.52,'#b93639');
  }
  // Left/right cliff LOD and textures independently adjustable.
  const textured=(fine||tier==='balanced')&&pct('rockTexture')>0;
  const textures=[];
  // Procedural stone material (not photographs): strata, fracture polygons and mineral speckle.
  if(textureFace&&typeof document!=='undefined'&&textured){for(let k=0;k<4;k++){
   let im=document.createElement('canvas');im.width=im.height=192;let cx=im.getContext('2d'),data=cx.createImageData(192,192);
   const rnd=(x,y)=>noise(x+k*999,y+k*71);function value(x,y,scale){x/=scale;y/=scale;let X=Math.floor(x),Y=Math.floor(y),u=smooth(x-X),v=smooth(y-Y);return mix(mix(rnd(X,Y),rnd(X+1,Y),u),mix(rnd(X,Y+1),rnd(X+1,Y+1),u),v)}
   for(let y=0;y<192;y++)for(let x=0;x<192;x++){let q=(x+y*192)*4,warp=value(x,y,29)*23,stripe=Math.sin((y+x*.27+warp)*.33),v=92+value(x,y,24)*50+value(x,y,7)*30+value(x,y,2)*13+(rnd(x,y)-.5)*17+(stripe>.83?13:stripe<-.88?-19:0);let green=k===3?Math.max(0,(value(x,y,44)-.51)*1.9):0;data.data[q]=v-green*35;data.data[q+1]=v+2-green*12;data.data[q+2]=v-2-green*43;data.data[q+3]=255;}cx.putImageData(data,0,0);
   for(let i=0;i<27;i++){let x=rnd(i,411)*192,y=rnd(i,412)*192;cx.beginPath();cx.moveTo(x,y);for(let j=1;j<5;j++){x+=7+rnd(i,j+51)*14;y+=(rnd(i,j+21)-.57)*17;cx.lineTo(x,y)}cx.strokeStyle='rgba(38,42,40,.37)';cx.lineWidth=1+rnd(i,75)*1.3;cx.stroke();cx.translate(0,1.3);cx.strokeStyle='rgba(203,207,197,.26)';cx.lineWidth=.7;cx.stroke();cx.translate(0,-1.3)}textures.push(im);
  }}
  function stone(a,b,c,d,side,s,j,base,v){const image=textures[Math.floor(noise(s,j+777)*textures.length)];if(!image||Math.abs(s-observed)>(fine?82:58)*pct('rockTexture')||j>2){T(a,b,c,col(base,v));T(a,c,d,col(base,v-9));return;}
   const verts=[{...a,u:0,t:1},{...b,u:1,t:1},{...c,u:1,t:0},{...d,u:0,t:0}];const tri=(i,j,k)=>textureFace(side===-1?[verts[k],verts[j],verts[i]]:[verts[i],verts[j],verts[k]],image,col(base,v),'jqd-rock');tri(0,1,2);tri(0,2,3);
  }
  function cliff(s0,s1,side){const key=side===-1?'leftCliff':'rightCliff';if(!pct(key))return;const ds=stride(fine?6:tier==='balanced'?12:20,key),rows=Math.max(2,Math.ceil((fine?6:3)*pct(key))),grid=[];
   const stations=[];for(let s=s0;s<s1;){stations.push(s);s+=ds;}stations.push(s1);
   for(let s of stations){let line=[];const approach=smooth((s-132)/18),down=smooth((s-206)/14),half=width(s)/2;
    const offset=side===-1?half+mix(mix(8,25,approach),4.2,down):half+mix(mix(17,22,approach),23,down);
    const height=(side===-1?62:70)+noise(s,19)*17;
    for(let j=0;j<=rows;j++){let f=j/rows,r=offset+f*4+(j>1?(noise(s,j+side*37)-.5)*7:0),y=-6+f*height;
     if(side===-1&&s>=220){if(j===0){r=half+4.2;y=-6;}if(j===1&&rows>=3){r=half+3.4;y=4.7;}if(j===2&&rows>=4){r=half-1.3-noise(s,99)*.6;y=6.4+noise(s,20)*2;}if(j>2&&rows>=4)y=9+(j-2)/(rows-2)*(height-9);}
     line.push(point(s,side*r,y));}grid.push({s,line});}
   for(let i=0;i<grid.length-1;i++)if(visibleSpan(grid[i].s,grid[i+1].s))for(let j=0;j<rows;j++){let a=grid[i].line[j],b=grid[i+1].line[j],c=grid[i+1].line[j+1],d=grid[i].line[j+1],n=noise(grid[i].s,j+side*17),v=(n-.5)*28;let moss=noise(grid[i].s,j+99)>.62&&j>2;let base=moss?[73,94,63]:[113,118,115];stone(a,b,c,d,side,grid[i].s,j,base,v);}
  }
  cliff(MIN,424,-1);cliff(MIN,424,1);
  // B: shared seam at 424m, low-cost continuous cross sections. Real overhangs
  // remain in all tiers. Minimum clear vertical height 5.65m across the road.
  function cliffB(side){const key=side===-1?'leftCliff':'rightCliff';if(!pct(key))return;
   const baseRows=Math.max(2,Math.ceil((fine?6:3)*pct(key))),rows=side===-1?Math.max(5,baseRows):baseRows;
   const ds=stride(fine?8:tier==='balanced'?12:20,key),stations=[424];
   for(let d=424;d<MAX;){let step=ds;let next=Math.min(MAX,d+step);for(const cut of [440,480,520,560,600,640,680,720,760,800,824,860,900,910,964,1000,1040,1080,1120,1160,1200,1224,1260,1300,1340,1380,1420,1460,1500,1540,1580,1600,1640,1660,1710,1750,1790,1830,1850,1890,1930,1970,2000])if(cut>d&&cut<next)next=cut;stations.push(next);d=next;}
   function oldProfile(d,j){const f=j/baseRows,offset=side===-1?h+4.2:h+23,H=(side===-1?62:70)+noise(d,19)*17;let r=offset+f*4+(j>1?(noise(d,j+side*37)-.5)*7:0),y=-6+f*H;
    if(side===-1){if(j===0){r=h+4.2;y=-6;}if(j===1&&baseRows>=3){r=h+3.4;y=4.7;}if(j===2&&baseRows>=4){r=h-1.3-noise(d,99)*.6;y=6.4+noise(d,20)*2;}if(j>2&&baseRows>=4)y=9+(j-2)/(baseRows-2)*(H-9);}return [r,y];}
   const grid=stations.map(d=>{const blend=smooth((d-424)/24),H=65+noise(d,19)*14,roof=.30+.70*Math.pow(Math.cos((d-454)*.020),2),lip=5.8+noise(d,31)*.7;const line=[];
    for(let j=0;j<=rows;j++){let k=j/rows*baseRows,k0=Math.floor(k),a=oldProfile(d,k0),b=oldProfile(d,Math.min(baseRows,k0+1));let r=mix(a[0],b[0],k-k0),y=mix(a[1],b[1],k-k0);
     let nr,ny;if(side===-1){const f=j/rows;
      if(j===0){nr=h+.9;ny=-6;}else if(j===1){nr=h+.55;ny=.10;}else if(j===2){nr=h+.65;ny=lip;}else if(j===3){nr=mix(h+.4,-.8,roof);ny=lip+1.0;}else{nr=h+3+(f-.6)*10+(noise(d,j)-.5)*2;ny=12+(j-4)/Math.max(1,rows-4)*(H-12);}
     }else{const f=j/rows;nr=h+19+f*7+(j>0?(noise(d,j+11)-.5)*5:0);ny=-6+H*f;}
     // C is greener and more open, with a concrete rockfall gallery and later bare cliff.
     const c=smooth((d-824)/30),gallery=smooth((d-890)/20)*(1-smooth((d-964)/20)),open=smooth((d-840)/35)*(1-smooth((d-1100)/35));
     if(side===-1){if(j===0)nr=mix(nr,h+1.1,c);if(j===1||j===2)nr=mix(nr,h+1.05,c);if(j===3){nr=mix(nr,h+2.4,c*Math.max(gallery,open));ny=mix(ny,9.2,c*Math.max(gallery,open));}if(j>=4)nr+=c*3;}
     else nr+=c*(7+open*8);
     const dBlend=smooth((d-1200)/32);if(side===-1){if(j===0||j===1||j===2)nr=mix(nr,h+.40,dBlend);if(j===3){nr=mix(nr,h-1.35-noise(d,31)*.45,dBlend);ny=mix(ny,7.1+noise(d,45),dBlend);}}else nr-=dBlend*(8+3*Math.sin(d*.021));
     const eBlend=smooth((d-1600)/34);if(side===-1){nr=mix(nr,h+3.0,eBlend);if(j===3)ny=mix(ny,11,eBlend);}else nr+=eBlend*9;
     line.push(point(d,side*mix(r,nr,blend),mix(y,ny,blend)));}return line;});
   for(let i=0;i<grid.length-1;i++)if(visibleSpan(stations[i],stations[i+1])&&!(stations[i]>=E1&&stations[i+1]<=E2))for(let j=0;j<rows;j++){const d=stations[i],n=noise(d,j+side*17),base=d>=1200?(j>=3&&noise(d,j+99)>.42?[75,94,67]:[108,112,106]):d>=824&&noise(d,j+99)>(j>=2?.28:.72)?[71,99,62]:j>=3&&noise(d,j+99)>.64?[73,94,63]:[113,118,115];stone(grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j+1],side,d,j,base,(n-.5)*28);}
  }
  cliffB(-1);cliffB(1);
  // C: open-sided concrete rockfall gallery. Clear width equals the road; roof
  // clearance is 6.2 m. Solid faces, no closed wall on the river side.
  const G0=910,G1=964,clear=6.2,inner=h+.48,outer=h+1.04;
  function GQ(a,b,c,d,k){const ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,vx=c.x-a.x,vy=c.y-a.y,vz=c.z-a.z,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const len=Math.hypot(nx,ny,nz);if(len>1e-8&&Math.abs(nx*(d.x-a.x)+ny*(d.y-a.y)+nz*(d.z-a.z))/len<1e-7)face([a,b,c,d],k);else Q(a,b,c,d,k);}
  if(visibleSpan(G0,G1)){
   strips(fine?6:12,(a,b)=>{if(a<G0||b>G1)return;
    GQ(point(a,-inner,0),point(b,-inner,0),point(b,-inner,clear),point(a,-inner,clear),'#777a70');
    band(a,b,-outer,-outer,outer,outer,clear,'#454942');
    band(a,b,-outer,-outer,outer,outer,clear+.55,'#8b8d81');
    for(const side of [-1,1])GQ(point(a,side*outer,clear),point(b,side*outer,clear),point(b,side*outer,clear+.55),point(a,side*outer,clear+.55),'#8a8b81');
   },[G0,G1]);
   for(const d of [G0,G1])GQ(point(d,-outer,clear),point(d,outer,clear),point(d,outer,clear+.55),point(d,-outer,clear+.55),'#999b91');
   for(let d=G0+.5;d<G1;d+=9){let a=d-.36,b=d+.36,ri=inner,ro=outer;
    for(let r of [ri,ro])GQ(point(a,r,-6),point(b,r,-6),point(b,r,clear),point(a,r,clear),'#85877b');
    for(let k of [a,b])GQ(point(k,ri,-6),point(k,ro,-6),point(k,ro,clear),point(k,ri,clear),'#74776d');
    // Two-color warning bands are small planar faces; no rail between columns.
    for(let k of [a-.012,b+.012]){GQ(point(k,ri,.45),point(k,ro,.45),point(k,ro,1.65),point(k,ri,1.65),'#d4a937');for(let y=.50;y<1.3;y+=.42)GQ(point(k,ri,y),point(k,ro,y+.25),point(k,ro,y+.43),point(k,ri,y+.18),'#343631');}
   }
  }
  // C forest: sparse triangulated crowns on the slopes, never inside road width.
  for(let d=835;d<MAX;d+=fine?14:36){if(!visibleSpan(d,d)||d>=G0-6&&d<=G1+6||d>=E0-5&&d<=E2+5)continue;
   for(const side of [-1,1]){let r=side*(h+9+noise(d,side)*5),base=side===-1?8:-3,high=base+5+noise(d,19)*5,w=1.9+noise(d,45)*1.3;
    const top=point(d,r,high),a=point(d-3,r-w,base+1),b=point(d+3,r-w,base+1),c=point(d+3,r+w,base+1),e=point(d-3,r+w,base+1);
    T(a,b,top,'#526f42');T(b,c,top,'#3d5835');T(c,e,top,'#587746');T(e,a,top,'#46603c');
   }
  }
  // Large roadside rock in photo 10; keep all of it outside the 10.21 m pavement.
  if(visibleSpan(1046,1056)){const a=point(1046,h+1.4,-.3),b=point(1056,h+1.4,-.3),c=point(1056,h+5.4,-.8),d=point(1046,h+5.4,-.8),e=point(1050,h+3.4,3.9),f=point(1054,h+4.2,3.3);T(a,b,e,'#96968c');T(b,f,e,'#777d77');T(b,c,f,'#82857b');T(c,d,f,'#757a72');T(d,a,e,'#a1a094');T(d,e,f,'#8e9185');}
  // Upslope rockfall net represented by tinted panels and sparse upright posts;
  // not a road-edge guardrail. Keep high on the left rock face.
  for(let d=1080;d<1120;d+=10){if(!visibleSpan(d,d+10))continue;const r=-h-4.6;Q(point(d,r,11),point(d+10,r,11),point(d+10,r,13.0),point(d,r,13.0),'#63766a');Q(point(d,r-.08,10.8),point(d,r+.08,10.8),point(d,r+.08,13.5),point(d,r-.08,13.5),'#3d6250');}

  // D: natural unlined rock tunnels, not concrete galleries. Ring sections are
  // continuous with the road, with no flat image or fabricated black portal.
  // The last entrance is only a preview of E; the drivable test ends at 1600.
  const caveProfile=[[-h-.46,-6],[-h-.46,0],[-h-.46,5.8],[-h*.63,7.3],[0,8.0],[h*.63,7.3],[h+.46,5.8],[h+.46,0],[h+.46,-6]];
  function caveRing(d){return caveProfile.map(([r,y],j)=>point(d,r+(j<=2?-.12*noise(d,j):j>=6?.12*noise(d,j):(noise(d,j)-.5)*.34),y+(j>2&&j<6?(noise(d,j+18)-.5)*.65:0)));}
  function caveOuter(d){return caveProfile.map(([r,y],j)=>point(d,r+(j<4?-2.1-noise(d,j+44)*1.4:j>4?2.1+noise(d,j+44)*1.4:0),y+(j>=2&&j<=6?2.5+noise(d,j+61)*2.0:0)));}
  for(const [a,b] of tunnels){if(!visibleSpan(a,b))continue;
   // A small number of cross sections, sharing identical rings between panels.
   // The cuts follow the same 2m centreline; sharp curves get smaller intervals.
   const ds=fine?6:12;let stations=[a];for(let d=a;d<b;){d=Math.min(b,d+ds);stations.push(d);}
   for(let i=0;i<stations.length-1;i++){let d=stations[i],e=stations[i+1];if(!visibleSpan(d,e))continue;const A=caveRing(d),B=caveRing(e),O=caveOuter(d),N=caveOuter(e);
    for(let j=0;j<A.length-1;j++){let v=(noise(d,j)-.5)*14;let base=a===1608?[69,61,43]:[49,51,47];GQ(A[j],B[j],B[j+1],A[j+1],col(base,v));
     // Exterior buttress only on river-facing wall and top, avoid duplicate inner rock faces.
     if(j>=4&&j<=7){if(textured&&textures.length&&j>=5)stone(O[j],N[j],N[j+1],O[j+1],1,d,1,[102,105,95],v);else GQ(O[j],N[j],N[j+1],O[j+1],col([102,105,95],v));}}
   }
   for(const d of [a,b]){const A=caveRing(d),O=caveOuter(d);for(let j=0;j<A.length-1;j++)GQ(A[j],A[j+1],O[j+1],O[j],col([103,104,94],(noise(d,j)-.5)*30));}
   // Small reflector or amber fixtures; no real-time lights or extra draw passes.
   for(let d=a+4;d<b;d+=12){for(const side of [-1,1]){const r=side*(h+.42);GQ(point(d,r,.65),point(d+.18,r,.65),point(d+.18,r,.84),point(d,r,.84),'#d99b35');}
    if(a===1608)band(d,d+.55,-.30,-.30,.30,.30,7.82,'#e5af61');}
  }
  // Low-cost chevrons before/after cave bends, outside driving surface, no guardrail.
  for(const d of [1220,1242,1338,1516,1538,1560]){if(!visibleSpan(d,d))continue;const r=h+.8;
   GQ(point(d,r-.55,.9),point(d,r+.55,.9),point(d,r+.55,1.95),point(d,r-.55,1.95),'#d6a83a');
   const pt=(rr,yy)=>point(d-.022,r+rr,yy);T(pt(-.38,1.43),pt(.23,1.85),pt(.02,1.43),'#242720');T(pt(-.38,1.43),pt(.02,1.43),pt(.23,1.02),'#242720');
   GQ(point(d,r-.045,-6),point(d,r+.045,-6),point(d,r+.045,.9),point(d,r-.045,.9),'#767c72');}
  // E: open concrete gallery, then a lined amber-lit tunnel. All vertices are
  // world-space geometry; warm baked colours avoid additional light passes.
  // Road remains 10.21m. The gallery's windows and markings are outside it.
  const eProfile=(gallery)=>{const r=h+(gallery?2.35:.55),spring=6.25,rise=gallery?3.2:2.15;return [[-r,-.35],[-r,spring],...Array.from({length:fine?8:4},(_,i)=>{const a=Math.PI*(1-(i+1)/(fine?9:5));return [r*Math.cos(a),spring+rise*Math.sin(a)];}),[r,spring],[r,-.35]];};
  function eRing(d,profile,outer=false){return profile.map(([r,y])=>point(d,r+(outer?Math.sign(r)*.6:0),y+(outer&&y>0?.65:0)));}
  function eShell(start,end,gallery){if(!visibleSpan(start,end))return;
   const profile=eProfile(gallery),edge=profile.at(-1)[0],cuts=[start];for(let d=start;d<end;){d=Math.min(end,d+(fine?6:14));cuts.push(d);}
   for(let i=0;i<cuts.length-1;i++){let a=cuts[i],b=cuts[i+1];if(!visibleSpan(a,b))continue;const A=eRing(a,profile),B=eRing(b,profile);
    for(let j=0;j<A.length-1;j++){if(gallery&&j===A.length-2)continue;
     const base=gallery?(j===0?[120,118,107]:[112,111,102]):j===0||j===A.length-2?[128,99,62]:[110,86,57];
     const c=gallery&&j===0?'#78766b':!gallery&&j===0?'#80633e':col(base,(i%2?3:-4)+(j%2?3:0));GQ(A[j],B[j],B[j+1],A[j+1],c);
    }
   }
   // Visible annular portal, not an opaque plane across the road.
   for(const d of [start,end]){const A=eRing(d,profile),O=eRing(d,profile,true);for(let j=0;j<A.length-1;j++)GQ(A[j],A[j+1],O[j+1],O[j],gallery?'#908e80':'#967a50');}
   if(gallery){for(let d=start;d<end;d+=10){if(!visibleSpan(d,d))continue;let a=d,b=Math.min(end,d+.85),r=edge;
     for(const rr of [r,r+.62])GQ(point(a,rr,-6),point(b,rr,-6),point(b,rr,6.25),point(a,rr,6.25),'#908e80');
     for(const k of [a,b])GQ(point(k,r,-6),point(k,r+.62,-6),point(k,r+.62,6.25),point(k,r,6.25),'#78766b');
     for(const k of [a-.015,b+.015]){GQ(point(k,r,.45),point(k,r+.62,.45),point(k,r+.62,1.7),point(k,r,1.7),'#d9a53b');for(let y=.5;y<1.3;y+=.4)GQ(point(k,r,y),point(k,r+.62,y+.24),point(k,r+.62,y+.39),point(k,r,y+.15),'#36332b');}
    }
    // Exterior painted apron and sparse diagonal hatch, outside driving width.
    for(let d=start;d<end;d+=fine?3:6){let b=Math.min(end,d+2);for(const side of [-1,1]){const r=side*h,rr=side*(edge-.15);Q(point(d,r,.032),point(d+.30,r,.032),point(b,rr,.032),point(b-.30,rr,.032),'#d7d5c9');}}
   }
   for(const [a,b] of pavement){if(a<start||b>end)continue;for(const side of [-1,1]){const r=side*h,rr=side*(edge+(gallery?0:.32));band(a,b,r,r,rr,rr,.007,gallery?'#3d403d':'#77664c');}}
   for(let d=start+5;d<end;d+=fine?9:14){if(!visibleSpan(d,d))continue;for(const side of [-1,1]){const r=side*(gallery?2.8:2.4);span(d,d+.9,()=>r,gallery?8.65:7.85,gallery?'#f3bb64':'#ffce73',.34);}}
  }
  eShell(E0,E1,true);eShell(E1,E2,false);
  // Full annular bulkhead from the wide gallery to the narrower lined arch.
  if(visibleSpan(E1,E1)){const A=eRing(E1,eProfile(false)),B=eRing(E1,eProfile(true));for(let j=0;j<A.length-1;j++)GQ(A[j],A[j+1],B[j+1],B[j],'#8c8066');}
  // Portal lane-control signs are overhead; no bollards inside the 10.21m road.
  if(visibleSpan(E1,E1)){for(const side of [-1,1]){const r=side*2.5,k=E1-.16;GQ(point(k,r-.48,6.35),point(k,r+.48,6.35),point(k,r+.48,7.05),point(k,r-.48,7.05),'#39362d');const c=side<0?'#e64d40':'#54d58b';const f=(x,y)=>point(k-.02,r+x,y);if(side<0){Q(f(-.25,6.48),f(-.17,6.43),f(.25,6.92),f(.17,6.97),c);Q(f(-.25,6.92),f(-.17,6.97),f(.25,6.48),f(.17,6.43),c);}else{Q(f(-.065,6.69),f(.065,6.69),f(.065,6.96),f(-.065,6.96),c);T(f(-.23,6.72),f(.23,6.72),f(0,6.47),c);}}}
  // Distant mountain silhouettes beyond the test boundary, not drivable extensions.
  for(let j=0;j<Math.ceil(4*pct('distant'));j++){let p=point(drawMax,0),a=heading(drawMax),base=at(p.x,p.z,a,70+j*28,(j-1.5)*30);let v=(r,y)=>({...at(base.x,base.z,a,0,r),y});T(v(-75,-5),v(-14,65+j*13),v(25,12),'#899b90');T(v(-14,65+j*13),v(73,-5),v(25,12),'#74877c');}
  // The near cliff mesh itself supplies the rocky foot and overhead strata;
  // no smooth vertical curtain is layered over the textured rock.
  // Rocky banks below the visible road edge and vegetation clusters on the far cliff.
  if(pct('banks')>0)for(let s=MIN;s<MAX;s+=stride(fine?9:24,'banks')){for(let side of [-1,1]){if(!visibleSpan(s,s)||s>=154&&s<=206||!keep('banks',s,side))continue;let r=side*(width(s)/2+3+noise(s,side)*8),p=point(s,r,-5.9);let w=2+noise(s,4)*4;T({x:p.x-w,y:p.y,z:p.z-w},{x:p.x+w,y:p.y,z:p.z-w},{x:p.x,y:p.y+1.4,z:p.z},'#a8a9a3');T({x:p.x+w,y:p.y,z:p.z-w},{x:p.x+w,y:p.y,z:p.z+w},{x:p.x,y:p.y+1.4,z:p.z},'#8b918d');}}
  // Finish line (not a parking bay). Continuation is reserved for the next stage.
  if(visibleSpan(1999.5,2000.1))span(1999.5,2000.1,()=>0,.036,'#f2e4af',width(2000)-.18);
 }
 const scene={environmentFields:fields,environmentParams:()=>({...params}),setEnvironmentParams:setParams,routeAt:frame,positionAt:point,locate,surfaceHeight,terrainPose,gravityAcceleration,name:'12｜花蓮・太魯閣',id:'JQD-A',theme:'jiuqudong',length:END,heading:0,difficulty:4,desc:'慈母橋 ⇄ 九曲洞隧道 · 固定雙向路寬 10.21m，橋後無護欄，落水即失敗',start,selectStart,selectDirection,travelDirection:()=>travelDirection,startStation:()=>startStation,goal:()=>travelDirection===1?({...goal,id:"九曲洞隧道"}):({...frame(0),a:heading(0)+Math.PI,l:1,id:"慈母橋"}),obstacles:()=>[],collision,fall,parked:completed,bounds,render,progress,remaining:s=>Math.max(0,travelDirection===1?END-locate(rear(s)).s:locate(rear(s)).s),goalVisible:()=>false,nicoGoal,nicoBounds,driveThrough:true,guide:s=>{let d=progress(s);if(travelDirection===-1)return `太魯閣｜${Math.round(END-d)} / 2000m · ${d<=154?"前方慈母橋・有欄杆":d>=1710&&d<=1850?"黃光隧道・注意車速":d>=1660&&d<1710?"拱形明隧道・左側開放":d>=1270&&d<=1492?"岩洞山路・注意內輪差":"山路會車・靠右行駛"}`;return `${d<400?"慈母橋":d<800?"峽谷":d<1200?"明隧道":d<1600?"天然岩洞":"九曲洞隧道"}｜${Math.round(d)} / 2000m · ${d<104?'前方慈母橋 · 有欄杆':d<=154?'橋面雙向車道 · 有欄杆':d<206?'橋後右彎微幅上坡，留意內輪差':d<302?'峽谷岩壁路段有起伏，注意貨櫃尾端': d<400?'後段連續彎道有高低差，注意車速':d<744?'貼壁岩頂・右側無護欄，注意內輪差':d<860?'左彎・注意貨櫃內輪差':d<910?'明隧道入口・注意車速':d<964?'明隧道・右側開放':d<1130?'連續山路・注意內輪差':d<1200?'左彎・右側無護欄':d<1270?'左彎・天然岩洞入口':d<1492?'連續岩洞・注意視線及內輪差':d<1584?'峽谷左彎・右側無護欄':d<1660?'前方九曲洞隧道':d<1710?'拱形明隧道・右側開放':d<1850?'黃光隧道・注意車速':'出隧道山路・前方終點'}`;},info:()=>({length:END,travelDirection,bridgeWidth:10.21,roadWidth:10.21,guardrails:true,guardrailRange:[0,RAIL[1]],guardrailBufferRange:RAIL.slice(),bridge:BRIDGE.slice(),openWater:[[154,2000]],stageStarts:[0,400,800,1200,1600],stageE:{range:[1600,2000],estimated:true,gallery:[1660,1710],tunnel:[1710,1850],exitRoad:[1850,2000],clearance:6.25},stageD:{range:[1200,1600],estimated:true,rockTunnels:[[1270,1302],[1366,1400],[1460,1492]],clearance:5.8},stageC:{range:[800,1200],estimated:true,gallery:[910,964],galleryClearance:6.2},stageB:{range:[400,800],estimated:true,roofClearanceDesign:5.8},widthEstimated:false,widthDesignOverride:true,flatRoad:false,gravityEnabled:true,elevationEstimated:true,elevationMarkers:[{range:[0,154],type:'flat',delta:0},{range:[154,206],type:'up',delta:1.25},{range:[206,302],type:'undulating',delta:0.24},{range:[302,400],type:'undulating',delta:-0.17},{range:[400,800],type:'undulating',delta:height(800)-height(400)},{range:[800,1200],type:'undulating',delta:height(1200)-height(800)},{range:[1200,1600],type:'undulating',delta:height(1600)-height(1200)}],waterDepth:6,connection:{...end},reference:'2025-08 user street-view A/B/C/D/E and schematic; B/C/D/E heading, slope and roof are visual estimates'}),signs:()=>[...(params.towers>0?[{...point(122,0,9.65),text:'慈母橋',size:.9}]:[]),{...point(travelDirection===1?1998:2,3.1*travelDirection,2.4),text:'2000m',size:.5}]};
 return scene;
});})(globalThis);
