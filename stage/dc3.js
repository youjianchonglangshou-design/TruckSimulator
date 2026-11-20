/* Truck Simulator v3.8 | DC3 — independent real-world stage. Metres/radians. */
(function(root){'use strict';
root.TruckRealScenes.register('dc3',function({angle,at,hitch,rear,tractor,trailer,corners,overlap,advance}){
const rect=(x1,x2,z1,z2,h,kind)=>({x:(x1+x2)/2,z:(z1+z2)/2,w:x2-x1,l:z2-z1,a:0,h,kind});
// DC3: Fuxing 3rd Rd -> left turn Keji 1st Rd -> right into logistics yard.
// Source map measurements (metres): 76.49 / 21.41 / 261.90 / 9.20 / 48.93.
// Street-view entrance arrow has no numerical width: 12.0 m is an estimate, not a survey.
// Yard frontage, 4.4 m pitch and parking island depth are also estimates.
// All occupied bays are filtered against an actual 60 Hz steering/braking replay.
const dc3={mainLength:76.49,mainWidth:21.41,streetLength:261.90,streetWidth:9.20,entryToWall:48.93,gateWidth:12,apronHalfWidth:27,parkingDepth:17,bayPitch:4.4,bayZ:[15.4,11,6.6,2.2,-2.2,-6.6,-11,-15.4],stopX:48.13};
const dc3Start={x:-76.49,z:-267.2,a:Math.PI/2,b:Math.PI/2,v:0,steer:0};
const dc3Prefix=[[72.28999999999999, 0.0], [9.42477796076938, -0.5525843502907141], [35.0, 0.0], [222.69993165039463, 0.0], [9.424777960769381, 0.552584350290714], [14.199931650395229, 0.0]],dc3Plans=[[[6.802075117996336, -0.17345455254444375], [11.278228098490326, 0.5889998346439369], [9.647923391367568, 0.36811704600638223], [7.775360681019786, -0.428342035503568], [-7.215551649982837, -0.1644992129616443], [-8.390707152696356, 0.1927685702456334], [-9.462302234590776, 0.08092367841208781], [-10.446327433315368, -0.5438915029907024]], [[8.275205119933412, -0.06014968120707248], [10.288169069930278, 0.5854753868206811], [8.743885451895858, 0.41745381889402133], [7.3286780919586585, -0.45300350769138475], [-6.557319381624853, -0.08134031213400422], [-6.475323996823948, 0.2054145515360203], [-7.7017111694906255, -0.02388303388002942], [-9.450132464448876, -0.5365860806930437]], [[6.886887228532215, 0.015222258836803879], [11.01538224887954, 0.5132004949228783], [9.546970829391292, 0.4408990432869541], [7.752812634240117, -0.44344266758951173], [-6.464880305763477, -0.09834907466947074], [-6.051309587096645, 0.17665540768105703], [-6.436875518229118, 0.03516386641729275], [-9.13911059338594, -0.5137781897005554]], [[8.49194301742291, 0.1534363099038745], [9.96203914115997, 0.4091545282319257], [9.894117955834616, 0.4873750630787639], [7.6329035639501255, -0.4530226578140555], [-5.88244401706759, -0.06316824700532159], [-5.262702892478136, 0.15479624458434696], [-5.677920458393135, 0.012197707046161797], [-8.42110218609156, -0.53411343925449]], [[6.828312227421761, 0.043742633454824015], [13.417602811617373, 0.43001670834354866], [13.385067287267447, 0.3200227353308952], [8.215270338381508, -0.4216819182533872], [-6.571881493390615, -0.23842258208725264], [-5.717556262197078, 0.17982466462107194], [-5.7222973657183225, 0.13206864914838795], [-7.287724940895651, -0.565270911315293]], [[8.852895829521541, 0.07275412669384076], [11.17478316239014, 0.3558130580540212], [11.181262370721099, 0.4903754178326974], [6.098081088772259, -0.2500753158514406], [6.029979421240808, -0.30771956920192506], [-4.398163595263974, 0.12157957601453193], [-5.038150438338474, -0.11899480887334457], [-5.371627990871406, -0.3585747951765078], [-5.766667896201492, -0.3723521048504393]], [[11.81081557868267, 0.09739078041741003], [11.93196074474959, 0.3378178645186974], [11.698202032994915, 0.4805219872726414], [6.594687399686792, -0.19009290507467183], [6.487086319517108, -0.33280149972421713], [-3.8008238061169286, 0.14187350964867693], [-4.269234342873406, -0.18300112875026198], [-5.390619372864658, -0.4435225277832916], [-5.157797400581416, -0.16964113386398091]], [[9.659445154610541, 0.19690892786998923], [9.799159326361423, -0.4810833634306927], [10.467345981911668, -0.5022622428547753], [7.912962998813744, 0.4391721255275557], [-7.1986664089033505, 0.17136963493733037], [-9.335676353820805, -0.22350817320471966], [-9.52117311451902, -0.07005462998829041], [-12.26020845407282, 0.5751786644064597]]];
const dc3Rects=[[-110.0, -4.6, -251.19499999999996, 110.0], [-110.0, -4.6, -320.0, -272.60499999999996], [4.6, 100.0, -320.0, -272.60499999999996], [4.6, 17.0, -251.19499999999996, -6.0], [4.6, 17.0, 6.0, 110.0], [17.0, 100.0, 27.0, 110.0], [17.0, 100.0, -251.19499999999996, -27.0], [48.93, 100.0, -27.0, 27.0], [-110.0, -7.0, -262.28, -261.52], [6.6, 100.0, -262.28, -261.52]];
const dc3Base=dc3Rects.map((r,i)=>rect(...r,i===7?22:i>=8?.25:.16,i===7?'warehouse':i>=8?'median':'curb'));
const dc3Bounds=p=>p.x>=-110&&p.x<=100&&p.z>=-320&&p.z<=110;
let dc3Target=0,dc3Occupied=[],dc3Layout=null,dc3Verified=null;
const dc3Goal=i=>({x:dc3.stopX,z:dc3.bayZ[i],a:-Math.PI/2,id:`DC3-${String(i+1).padStart(2,'0')}`,w:3.6,l:17.2});
const dc3Vehicle=(bay,type)=>{let len=type==='container'?17.2:8;return {x:dc3.stopX-len/2,z:dc3.bayZ[bay],a:-Math.PI/2,w:2.55,l:len,h:type==='container'?3.85:3.55,kind:'dc3parked',bay,type};};
// DC3 obstacles are axis-aligned (0 or -PI/2). The SAT below is the same four-axis test
// as overlap(), expressed without allocating corner arrays on every frame.
function dc3Hit(s,obs=dc3Base,pad=0){if(Math.abs(angle(s.a-s.b))>76*Math.PI/180)return true;for(const r of [tractor(s),trailer(s)]){let sn=Math.sin(r.a),cs=Math.cos(r.a),as=Math.abs(sn),ac=Math.abs(cs),w=r.w/2+pad,l=r.l/2+pad,ex=w*ac+l*as,ez=w*as+l*ac;if(r.x-ex < -110||r.x+ex>100||r.z-ez < -320||r.z+ez>110)return true;for(const o of obs){let ow=(o.a===0?o.w:o.l)/2,ol=(o.a===0?o.l:o.w)/2,dx=r.x-o.x,dz=r.z-o.z;if(Math.abs(dx)>=ow+ex||Math.abs(dz)>=ol+ez)continue;if(Math.abs(dx*sn+dz*cs)>=l+ow*as+ol*ac||Math.abs(dx*cs-dz*sn)>=w+ow*ac+ol*as)continue;return true;}}return false;}
function dc3Parked(s,i){let g=dc3Goal(i),r=rear(s);return Math.abs(r.x-g.x)<.6&&Math.abs(r.z-g.z)<.43&&Math.abs(angle(s.b-g.a))<.063&&Math.abs(angle(s.a-s.b))<.12&&Math.abs(s.v)<.12;}
// Turn at a standstill before each segment. Integrate the original acceleration and brake rates.
// Steering commands use only -1/0/+1, so the verified sweep is achievable with arrow-key pulses.
function dc3Coach(i){let s={...dc3Start},commands=[],dt=1/60,segments=[...dc3Prefix,...dc3Plans[i]];
 function next(input,g,t,b){return advance(s,{steer:input,gear:g,throttle:t,brake:b},dt)}
 function add(u,g,t,b){const last=commands.at(-1);if(last&&last[1]===u&&last[2]===g&&last[3]===t&&last[4]===b)last[0]++;else commands.push([1,u,g,t,b]);s=next(u,g,t,b);}
 for(const [d,st] of segments){let g=Math.sign(d),dist=Math.abs(d),vmax=g<0?.742:Math.abs(st)>.1?1.2:dist>40?4.2:2.15;
  for(let i=0;i<100&&Math.abs(s.steer-st)>.014;i++){let u=[-1,0,1].reduce((a,b)=>Math.abs(next(a,g,0,true).steer-st)<Math.abs(next(b,g,0,true).steer-st)?a:b);add(u,g,0,true);}
  function distance(n,t){let v=0,d=0;for(let k=0;k<n;k++){let nv=Math.min(t,v+(g===1?1.7:1.25)*dt);d+=(v+nv)*.5*dt;v=nv;}while(v>0){let nv=Math.max(0,v-5*dt);d+=(v+nv)*.5*dt;v=nv;}return d;}
  let n=Math.max(1,Math.ceil(dist/vmax*60));while(distance(n,vmax)<dist)n++;let lo=0,hi=vmax;for(let k=0;k<36;k++){let mid=(lo+hi)/2;if(distance(n,mid)<dist)lo=mid;else hi=mid;}
  const throttle=(lo+hi)/2/(g===1?7:2.65);let err=0;
  function pulse(t,b){let best,bestErr,bestCost=Infinity;for(let u of [-1,0,1]){let q=next(u,g,t,b),delta=(s.v+q.v)*.5*dt,ne=err+delta*(Math.tan(q.steer)-Math.tan(st));let cost=Math.abs(ne)+.01*Math.abs(q.steer-st)+Math.max(Math.abs(q.steer-st)-.027,0)*10;if(cost<bestCost){bestCost=cost;best=u;bestErr=ne;}}err=bestErr;add(best,g,t,b);}
  for(let k=0;k<n;k++)pulse(throttle,false);while(Math.abs(s.v)>1e-8)pulse(0,true);
 }
 return commands;
}
function dc3Witness(i){let s={...dc3Start},path=[s];for(let [n,steer,gear,throttle,brake] of dc3Coach(i))for(let j=0;j<n;j++){s=advance(s,{steer,gear,throttle,brake},1/60);path.push(s);}return path;}
function dc3Verify(){return dc3.bayZ.map((_,i)=>{let commands=dc3Coach(i),s={...dc3Start},path=[s];for(let [n,steer,gear,throttle,brake] of commands)for(let k=0;k<n;k++){s=advance(s,{steer,gear,throttle,brake},1/60);path.push(s);}let valid=dc3Parked(s,i)&&!path.some(p=>dc3Hit(p));let eligible=[];if(valid)for(let j=0;j<8;j++){if(i===j)continue;for(let type of ['truck','container']){let o=dc3Vehicle(j,type);if(!path.some(p=>dc3Hit(p,[o],.25)))eligible.push({bay:j+1,type});}}return {i,valid,eligible,commands};});}
function dc3Randomize(rng=Math.random){let choices=(dc3Verified??=dc3Verify()).filter(v=>v.valid);if(choices.length!==8)throw Error('DC3 path validation failed: '+choices.length+'/8');let q=choices[Math.min(choices.length-1,Math.floor(rng()*choices.length))];dc3Target=q.i;let bays=[...new Set(q.eligible.map(o=>o.bay))];for(let i=bays.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[bays[i],bays[j]]=[bays[j],bays[i]];}let count=Math.min(bays.length,Math.floor(rng()*5));dc3Occupied=bays.slice(0,count).map(bay=>{let types=q.eligible.filter(o=>o.bay===bay);return {...types[Math.min(types.length-1,Math.floor(rng()*types.length))]};});dc3Layout={target:q.i+1,eligible:q.eligible.map(o=>({...o})),occupied:dc3Occupied.map(o=>({...o})),dimensions:{...dc3,bayZ:dc3.bayZ.slice()}};return dc3Layout;}
const dc3Obstacles=()=>dc3Base.concat(dc3Occupied.map(o=>dc3Vehicle(o.bay-1,o.type)));
function dc3Guide(s){if(s.z<-251.3)return '沿復興三路行駛 · 路口左轉科技一路';if(s.x<4.6&&s.z<-10)return '科技一路直行約 262 公尺 · 前方右轉 DC3';if(s.x<17)return '注意入口兩側植栽 · 右轉進入 DC3';return '先前進調整角度，再倒入指定碼頭';}
function renderDC3({flat,box,localBox,containerBody}){
 const D=dc3,M=-D.streetLength,HW=D.streetWidth/2,HM=D.mainWidth/2,Y=D.apronHalfWidth,P=D.parkingDepth;
 // Road surfaces and the driveway/apron; same metric geometry as collision rectangles.
 flat(-5,-105,220,440,'#a9aaa0',0,0);flat(-5,M,D.mainWidth,210,'#5f666b',Math.PI/2,.011);flat(0,(M+110)/2,D.streetWidth,110-M,'#676c6c',0,.014);flat(0,M,D.streetWidth,D.mainWidth,'#62696c',0,.018);
 flat((HW+P)/2,0,D.gateWidth,P-HW,'#7e807d',Math.PI/2,.016);flat((P+D.entryToWall)/2,0,D.entryToWall-P,Y*2,'#858985',0,.016);
 for(let x=-105;x<100;x+=5)if(Math.abs(x)>7){for(let z of [M-4.1,M+4.1])flat(x,z,.11,3,'#ece9dc',Math.PI/2,.026);}
 for(let z=M+HM+2;z<110;z+=5){if(Math.abs(z)>7)flat(0,z,.11,2.9,'#e1bd65',0,.024);flat(-HW+.09,z,.1,4.9,'#ab5047',0,.025);if(Math.abs(z)>D.gateWidth/2+1)flat(HW-.09,z,.1,4.9,'#ab5047',0,.025);}
 for(let x=-4;x<4.5;x+=.8)flat(x,M+HM-1.4,.43,2.3,'#ece9dc',0,.035);
 for(let z=M-HM+.65;z<M+HM;z+=.9){flat(-8,z,.44,2.7,'#e3e0d6',Math.PI/2,.035);flat(8,z,.44,2.7,'#e3e0d6',Math.PI/2,.035);}
 // Physical edges, divider, warehouse. Buildings set back from the red curb.
 for(const o of dc3Base){if(o.kind==='warehouse'){// A raised upper volume and recessed dark loading bays instead of painted doors on a solid wall.
   box(o.x,o.z,o.w,o.l,o.h-4.60,4.60,'#acb4b5',0,true);box(o.x+.55,o.z,o.w-1.1,o.l,4.60,0,'#495256',0,true);
   for(let k=0;k<7;k++){let zz=(D.bayZ[k]+D.bayZ[k+1])/2;box(D.entryToWall+.26,zz,.52,.92,4.60,0,'#9ca4a6',0,true);}
   for(let side of [-1,1]){let zz=side*(Y+17.25)/2;box(D.entryToWall+.26,zz,.52,Y-17.25,4.6,0,'#a6aeb0',0,true);}
   continue;}let c=o.kind==='median'?'#c4b988':'#bebfb6';box(o.x,o.z,o.w,o.l,o.h,0,c,0,true);}
 for(let x=-100;x<95;x+=14){if(Math.abs(x)<15)continue;for(let side of [-1,1]){let z=M+side*(HM+8),h=8+((Math.abs(x)|0)%4)*3;box(x,z,12,12,h,.16,side<0?'#a48d80':'#a9aba0',0,true);for(let r=-4;r<=4;r+=4)for(let yy=2;yy<h-1;yy+=3)box(x+r,z-side*6.04,2.2,.07,1.3,yy,'#47606a');}}
 for(let z=M+25;z<-37.6;z+=25){for(let side of [-1,1]){let x=side*14,h=9+((Math.round(z/25)+12)%4)*3;box(x,z,14,21,h,.16,side<0?'#a3aaa8':'#a69c90',0,true);for(let f=-7;f<=7;f+=4.5)for(let y=3;y<h-1;y+=3)box(x-side*7.04,z+f,.07,2.7,1.25,y,'#4e6870');}}
 // Short guardrails, curbside lighting, planted parking islands (kept outside the swept path).
 for(let side of [-1,1]){let x=side*(HW+.35);for(let z=M+22;z<105;z+=21){if(side===1&&Math.abs(z)<10)continue;box(x,z,.14,.14,4.2,.16,'#77817d');box(x-side*.35,z,.75,.22,.14,4.2,'#b1b7b0');}}
 for(let side of [-1,1]){let z0=side*16.5;box((HW+P)/2,z0,P-HW,21,.13,.16,'#6f874c');for(let z=7;z<27;z+=4){let zz=side*z;box(HW+1.5,zz,.22,.22,2.8,.25,'#69533b');box(HW+1.5,zz,2.3,2.7,2.1,2.65,'#557846');box(P-.35,zz,.65,3.8,.7,.26,'#637d42');}
  // The street-view passenger-car parking strip sits outside the actual driveway/apron.
  for(let z=9;z<25;z+=3.05){let zz=side*z,x=12.2,c=['#536874','#aab0b1','#62646c','#ad6a5c'][Math.floor(z)%4];box(x,zz,1.82,4.3,.7,.48,c,Math.PI/2,true);box(x,zz,1.6,2.15,.62,1.15,'#52646c',Math.PI/2,true);for(let f of [-1.3,1.25])for(let r of [-.8,.8])localBox(x,zz,Math.PI/2,f,r,.26,.65,.6,.16,'#252c30');}}
 // Trees, low industrial fences and red shop awnings outside the drivable bound.
 for(let z=M+32;z<-34;z+=23){for(let side of [-1,1]){let x=side*(HW+1.2);if(side===1&&z<-140)continue;box(x,z,.23,.23,3.1,.16,'#75634c');box(x,z,2.5,2.9,2.2,2.65,'#587849');}}
 for(let x=-95;x<-14;x+=13){box(x,M-HM-1.05,6,.12,.65,2.45,'#866c4d');box(x,M-HM-1.1,6,1.6,.16,2.23,'#7e5650');}
 // Facade detail facing Keji Rd, 8 doors numbered left to right when entering.
 const wx=D.entryToWall;for(let z=-25;z<=25;z+=3.8)for(let y=6.1;y<22;y+=3.05)box(wx-.04,z,.06,2.9,1.18,y,'#607883',0,true);
 for(let i=0;i<8;i++){let z=D.bayZ[i],target=i===dc3Target,c=target?'#63e8af':'#d6c58d';box(wx+.11,z,.07,3.48,3.9,.48,'#303d44');for(let r of [-1.71,1.71])box(wx+.04,z+r,.13,.19,4.08,.2,'#5e6c70');box(wx+.015,z,.16,3.75,.22,.24,'#b8a179');box(wx+.07,z,.15,3.7,.21,4.31,'#8b9698');box(wx-.14,z,.16,2.4,.55,4.48,target?'#218064':'#3a5965');for(let side of [-1,1])flat(D.stopX-8.6,z+side*1.8,.10,17.2,c,Math.PI/2,.045);flat(D.stopX,z,.12,3.6,c,0,.046);if(target)for(let x=D.stopX-17;x<D.stopX;x+=.8)flat(x,z,.055,.39,'#9ddcc0',Math.PI/2,.048);}
 // Stored trucks and container semitrailers match the exact collision footprint and orientation.
 for(const o of dc3Obstacles().filter(q=>q.kind==='dc3parked')){let {x,z,a,l,bay,type}=o,paint=['#e6ded8','#426d87','#b1bdc0','#b56f64'][bay%4],bodyLength=type==='container'?12.2:5.1;box(x,z,2.43,l-.12,.30,.63,'#323b40',a);if(type==='container'){let p=at(x,z,a,-(l-bodyLength)/2);containerBody(p.x,p.z,a,bodyLength,paint,1.05);}else localBox(x,z,a,-(l-bodyLength)/2,0,2.43,bodyLength,2.38,1.05,paint,true);
  let cabL=type==='container'?4.6:2.65;localBox(x,z,a,l/2-cabL/2,0,2.44,cabL,2.74,.77,type==='container'?'#d9dfdf':'#ecece5',true);localBox(x,z,a,l/2-.035,0,2.18,.05,.83,2.35,'#314c5c');for(let f of [l/2-.95,-l/2+1.7,...(type==='container'?[-l/2+2.9,-l/2+4.1]:[])])for(let side of [-1,1])localBox(x,z,a,f,side*1.05,.41,.83,.82,0,'#252c30');}
 // Signal posts visible at the first intersection; always green only as a static game decoration.
 box(-6.7,M-HM-.35,.25,.25,5.8,.16,'#73817f');box(-2.7,M-HM-.35,8,.25,.22,5.8,'#73817f');box(-2,M-HM-.35,2.05,.32,.48,5.42,'#252e32');box(-1.43,M-HM-.17,.32,.045,.32,5.5,'#4fbe80');
}
const sceneDC3={name:'11｜桃園・DC3',difficulty:5,id:'DC3',theme:'dc3',heading:-Math.PI/2,desc:'復興三路左轉科技一路，再右轉進 DC3，倒入指定碼頭',dimensions:dc3,start:()=>({...dc3Start}),goal:()=>dc3Goal(dc3Target),obstacles:dc3Obstacles,collision:s=>dc3Hit(s,dc3Obstacles()),parked:s=>dc3Parked(s,dc3Target),bounds:dc3Bounds,randomize:dc3Randomize,info:()=>dc3Layout,verify:()=>dc3Verify().map(({i,valid,eligible})=>({i,valid,eligible})),witness:()=>dc3Witness(dc3Target),coach:()=>((dc3Verified??=dc3Verify())[dc3Target].commands.map(c=>c.slice())),render:renderDC3,guide:dc3Guide,signs:()=>dc3.bayZ.map((z,i)=>({x:dc3.entryToWall-.25,y:4.76,z,text:String(i+1).padStart(2,'0'),size:.47}))};

sceneDC3.turnMarkers=state=>{const list=[],M=-(dc3.streetLength||261.9);if(state.z<M+11&&state.x<8)list.push({x:-1.3,z:M-4.1,a:0});if(state.z>=M+11&&state.x<12)list.push({x:0,z:-1.0,a:Math.PI/2});return list;};
sceneDC3.goalVisible=state=>state.x>4.6&&Math.abs(state.z)<30;
sceneDC3.coachActualSteering=true;
return sceneDC3;
});
})(globalThis);
