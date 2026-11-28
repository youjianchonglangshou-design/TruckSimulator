/* TruckSimulator DEV.17-P09-RC10 exterior geometry conversion, units metres.
   Original: app/game-host.js buildTruckGeometry, containerBody, wheel; core/physics.js hitch.
   +Z forward, +Y up; no road-shadow planes, no photo textures. */
(function(g){'use strict';
const defaults=Object.freeze({widthScale:1,heightScale:1,lengthScale:1});
const fields=[['widthScale','全車寬度倍率'],['heightScale','全車高度倍率'],['lengthScale','全車長度倍率']].map(([key,label])=>({key,label,min:.75,max:1.25,step:.01,value:1}));
function shade(c,k){const n=parseInt(c.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(Math.min(255,v*k)).toString(16).padStart(2,'0')).join('')}
function build(values={}){const p={...defaults,...values},parts=[];for(const k of Object.keys(defaults))if(!Number.isFinite(p[k])||p[k]<=0)throw Error('Invalid '+k);
const X=p.widthScale,Y=p.heightScale,Z=p.lengthScale;
function add(id,name,geometry,pos,size,color,rotation=[0,0,0]){parts.push({id,name,geometry,position:[pos[0]*X,pos[1]*Y,pos[2]*Z],size:geometry==='cylinder'?[size[0]*Y,size[1]*X,size[2]*Z]:[size[0]*X,size[1]*Y,size[2]*Z],rotation,color,roughness:.86,metalness:0});}
function box(id,name,f,r,w,l,h,y,c){add(id,name,'box',[r,y+h/2,f],[w,h,l],c);}
function wheel(id,name,f,r,dual){const half=dual?.26:.17;add(id,name,'cylinder',[r,.53,f],[1.02,half*2,1.02],'#25282a',[0,0,90]);add(id+'-rim',name+' 輪圈','cylinder',[r+Math.sign(r)*(half+.012),.53,f],[.52,.024,.52],'#8b969b',[0,0,90]);}
box('tractor-chassis','車頭底盤',1.65,0,2.25,6.35,.35,.8,'#28383f');
for(const r of [-.96,.96])for(const f of [0,-1.16])wheel('tractor-rear-'+(r<0?'l':'r')+'-'+(f===0?'1':'2'),'車頭後軸輪胎',f,r,true);
for(const r of [-1.04,1.04])wheel('tractor-front-'+(r<0?'l':'r'),'車頭前軸輪胎',3.7,r,false);
box('cab-lower','車頭下車身',(1.65+4.9)/2,0,2.48,4.9-1.65,1.43,1.02,'#d9e0e2');
box('cab-upper','車頭上車身',(1.65+4.605)/2,0,2.48,4.605-1.65,1.35,2.44,'#e5e8e7');
box('windshield','前擋風玻璃',4.62,0,2.23,.055,.87,2.77,'#294b5b');
for(const r of [-1.249,1.249]){const k=r<0?'l':'r';box('cab-window-'+k,'側窗',3.75,r,.035,1.35,.91,2.78,'#335767');box('cab-quarter-'+k,'後側窗',2.44,r,.035,.75,.85,2.81,'#3a5967');box('cab-handle-'+k,'車門把手',3.37,r,.045,.55,.07,2.25,'#5f6d73');box('cab-mirror-'+k,'後照鏡',4.41,r*1.23,.22,.3,.59,2.7,'#24333b');box('cab-step-'+k,'踏板',2.93,r,.08,1.65,.13,.88,'#9ba3a3');}
box('cab-grille','前水箱護罩',4.92,0,2.32,.12,.72,1.5,'#2c3b42');
for(let i=0,y=1.58;y<2.2;i++,y+=.13)box('cab-grille-bar-'+i,'水箱護罩橫條',4.98,0,1.52,.03,.055,y,'#9ba8a9');
for(const r of [-.93,.93])box('cab-lamp-'+(r<0?'l':'r'),'前車燈',4.99,r,.37,.055,.25,1.45,'#f4e9bd');
box('cab-bumper','前保險桿',4.96,0,2.46,.16,.3,1.08,'#626f73');
const h=.35;const tb=(id,n,f,r,w,l,ht,y,c)=>box(id,n,h+f,r,w,l,ht,y,c);
tb('trailer-chassis','拖車底盤',-5.5,0,2.5,13.3,.29,.85,'#303b40');
for(const f of [-7.55,-8.7,-9.85])for(const r of [-1.03,1.03])wheel('trailer-wheel-'+(r<0?'l':'r')+'-'+[-7.55,-8.7,-9.85].indexOf(f),'拖車輪胎',h+f,r,true);
for(const r of [-.82,.82])tb('trailer-leg-'+(r<0?'l':'r'),'拖車支撐腳',-2.2,r,.16,.16,.7,.13,'#56616a');
const cc=-6.05,len=12.2,c='#b64d32',y=1.13,cb=(id,n,f,r,w,l,ht,yy,col)=>tb(id,n,cc+f,r,w,l,ht,yy,col);
cb('container-body','貨櫃箱體',0,0,2.44,len,2.61,y,c);
for(const r of [-1,1])for(let i=0,f=-len/2+.19;f<len/2-.12;i++,f+=.37)cb('container-rib-'+(r<0?'l':'r')+'-'+i,'貨櫃側壁波紋',f,r*1.229,.045,.065,2.38,y+.11,shade(c,.77));
for(const f of [-len/2+.035,len/2-.035]){const k=f<0?'rear':'front',s=f<0?-1:1;cb('container-door-'+k,'貨櫃端面',f,0,2.35,.08,2.47,y+.065,shade(c,.91));for(const [i,r] of [-.94,-.30,.30,.94].entries())cb('container-rod-'+k+'-'+i,'端面鎖桿',f+s*.047,r,.045,.05,2.38,y+.11,'#a7a2a0');cb('container-seam-'+k,'端面門縫',f+s*.08,0,.03,.045,2.45,y+.08,'#292f31');for(const r of [-.55,.55])cb('container-handle-'+k+'-'+(r<0?'l':'r'),'端面把手',f+s*.09,r,.33,.055,.07,y+.85,'#bfc0b7');}
for(const r of [-1.19,1.19])for(const [i,yy] of [y+.035,y+2.51].entries())cb('container-rail-'+(r<0?'l':'r')+'-'+i,'貨櫃上下邊梁',0,r,.075,len,.08,yy,shade(c,.65));
tb('trailer-bumper','貨櫃後保險桿',-12.15,0,2.55,.14,.22,.83,'#b2b7b9');
for(const r of [-1.05,1.05])tb('trailer-lamp-'+(r<0?'l':'r'),'拖車尾燈',-12.24,r,.32,.08,.18,.95,'#cc4b32');
for(const side of [-1,1]){let k=side<0?'l':'r';for(let i=0;i<4;i++)tb('trailer-reflector-'+k+'-'+i,'紅白反光板',-11.9+i*.32,side*1.24,.045,.23,.085,1.25,i%2?'#f0eee2':'#c93f32');tb('trailer-marker-'+k,'貨櫃後角標記',-11.98,side*1.24,.05,.12,.17,3.47,'#edc064');}
return parts;}
const model={id:'truck-exterior',name:'聯結車｜原版外觀',reference:[],note:'直接轉換 TruckSimulator 原始幾何；公尺、Y向上、+Z車頭。非實車量測。',fields,build};
g.ModelingKitModels=[model];
// Standalone integration: no Studio/UI/DOM dependency.
g.TruckExterior3D=Object.freeze({version:'1.0.0',defaults,buildParts:build,create(T,values={}){const root=new T.Group();root.name='TruckExterior3D';for(const p of build(values)){const geo=p.geometry==='cylinder'?new T.CylinderGeometry(.5,.5,1,32):new T.BoxGeometry(1,1,1);const mat=new T.MeshStandardMaterial({color:p.color,roughness:p.roughness,metalness:p.metalness});const m=new T.Mesh(geo,mat);m.name=p.id;m.position.fromArray(p.position);m.rotation.set(...p.rotation.map(a=>a*Math.PI/180));m.scale.fromArray(p.size);root.add(m);}root.updateMatrixWorld(true);return root;},dispose(root){root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});root.clear();}});
})(globalThis);
