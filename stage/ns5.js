/* Truck Simulator v4.0 | NS5 — independent real-world stage. Metres/radians. */
(function(root){'use strict';
root.TruckRealScenes.register('ns5',function({angle,at,hitch,rear,tractor,trailer,corners,overlap,advance}){
// NS5: route from Chengde Rd Sec. 7 toward Tamsui, right onto Gongguan Rd, then left into No. 391.
// Measured: 12.43 m road, 76.63 m approach, 5.57 m clear corridor, 97.55 m length.
// Approximation: orthogonal junctions, approach road paved bounds and building heights.
// The narrow lane cannot accommodate perpendicular backing. Parallel left-side unloading only.
const ns5={roadWidth:12.43,approachLength:76.63,corridorWidth:5.57,corridorLength:97.55,mainNorth:10.5,mainSouth:-2};
const half=ns5.roadWidth/2, low=ns5.approachLength-ns5.corridorWidth/2, high=ns5.approachLength+ns5.corridorWidth/2;
const rect=(x1,x2,z1,z2,h,kind)=>({x:(x1+x2)/2,z:(z1+z2)/2,w:x2-x1,l:z2-z1,a:0,h,kind});
const ns5Base=[rect(-115,-half,10.5,low,31,'building'),rect(-115,-half,high,116,2.3,'fence'),rect(half,100,10.5,116,15,'opposite'),rect(-115,-9.5,-4,-2,.25,'median'),rect(9.5,100,-4,-2,.25,'median'),rect(-115,-half,-30,-12.2,.18,'southcurb'),rect(half,100,-30,-12.2,.18,'southcurb'),rect(-115,-97.55,low,high,2.3,'endwall'),rect(-115,100,116,130,3,'boundary')];
const ns5Start={x:52,z:4.5,a:-Math.PI/2,b:-Math.PI/2,v:0,steer:0};
const ns5Goal={x:-53.55,z:75.63,a:-Math.PI/2,id:'NS5-01',w:3.15,l:18.1};
const ns5Bounds=p=>p.x>=-115&&p.x<=100&&p.z>=-30&&p.z<=130;
function ns5Hit(s){if(Math.abs(angle(s.a-s.b))>76*Math.PI/180)return true;return [tractor(s),trailer(s)].some(r=>corners(r).some(p=>!ns5Bounds(p))||ns5Base.some(o=>overlap(r,o)));}
function ns5Parked(s){const r=rear(s);return Math.abs(r.x-ns5Goal.x)<.6&&Math.abs(r.z-ns5Goal.z)<.35&&Math.abs(angle(s.b-ns5Goal.a))<.063&&Math.abs(angle(s.a-s.b))<.12&&Math.abs(s.v)<.12;}
// Inputs use the same arrow keys / Shift micro-throttle / brake and 60 Hz step as normal play.
const ns5Controls=[[1407,0,1,0.28,false],[224,1,1,0.28,false],[11,0,1,0.28,false],[6,-1,1,0.28,false],[21,0,1,0.28,false],[108,1,1,0.28,false],[307,0,1,0.28,false],[56,-1,1,0.28,false],[797,0,1,0.28,false],[655,0,1,0.28,false],[285,-1,1,0.28,false],[336,0,1,0.28,false],[201,0,1,0.28,false],[31,-1,1,0.28,false],[217,0,1,0.28,false],[37,1,1,0.28,false],[1294,0,1,0.28,false],[30,0,1,0,true],[420,0,-1,0.28,false],[20,0,-1,0,true]];
function ns5Witness(){let s={...ns5Start},path=[s];for(const [ticks,steer,gear,throttle,brake] of ns5Controls)for(let i=0;i<ticks;i++){s=advance(s,{steer,gear,throttle,brake},1/60);path.push(s)}return path;}
function ns5Guide(s){if(s.z<10.5)return '承德路七段往淡水方向行駛 · 公館路右轉';if(s.z<66)return '沿公館路直行 · 前方左轉 391 號卸貨區';if(s.x>-16)return '左轉入場 · 淨寬 5.57 m，留意拖板內輪差';return '左側月台平行停靠 · 前進超過標線後微速倒車修正';}
function renderNS5({flat,box,localBox,street,missionRoute='in'}){
 flat(-7.5,50,215,165,'#b9b8ae',0,0);
 flat(-7.5,4.25,12.5,215,'#465158',Math.PI/2,.013);
 flat(0,(10.5+116)/2,12.43,116-10.5,'#465158',0,.014);
 flat((-97.55-half)/2,76.63,5.57,97.55-half,'#505c60',Math.PI/2,.015);
 flat(-7.5,-8,8.4,215,'#465158',Math.PI/2,.017);
 // A four-way intersection: the south leg connects through the divider opening.
 flat(0,-21.1,12.43,17.8,'#465158',0,.018);flat(0,3.1,19,30.6,'#465158',0,.019);
 for(const [a,b] of [[-115,-9.5],[9.5,100]])flat((a+b)/2,-3,2,b-a,'#728851',Math.PI/2,.021);
 for(let x=-110;x<100;x+=5){if(Math.abs(x)>11){flat(x,-8,.11,2.8,'#e9e6d9',Math.PI/2,.026);if(street)street.tree(x,-3,.78);else{box(x,-3,.22,.22,2.8,0,'#766e5e');box(x,-3,1.8,2.0,1.9,2.2,'#587c4a')}}}
 // Markings and stop lines on all four approaches, leaving the central square clear.
 for(let x=-5.5;x<5.8;x+=.85){flat(x,-14.0,.44,2.3,'#eeeae0',0,.035);}
 for(let z=-11.7;z<10.2;z+=.92){if(z>-4&&z<-2)continue;for(let x of [-9.2,9.2])flat(x,z,.51,2.4,'#eeeae0',Math.PI/2,.035);}
 for(let x of [-12,12]){flat(x,4.25,12.3,.18,'#f2f0e6',Math.PI/2,.034);flat(x,-8,8.15,.18,'#f2f0e6',Math.PI/2,.034);}
 flat(0,14.2,12.3,.20,'#eeeae0',0,.035);flat(0,-16.3,12.3,.20,'#eeeae0',0,.035);
 if(street){street.roadArrow(23,6,-Math.PI/2);street.roadArrow(-23,-8,Math.PI/2);street.roadArrow(2.9,-21,0);street.roadArrow(-3,21,Math.PI);street.signal(10.1,10.8,Math.PI,7.5);street.signal(-10.2,-12.4,0,7.4);street.signal(-9.4,11.0,-Math.PI/2,6);street.signal(9.4,-12.5,Math.PI/2,6);street.mountain(0,154,240,25);}
 
 // Street lane markings, double yellow and intersection crosswalks; no raised geometry in the road.
 for(let x=-112;x<100;x+=6){if(Math.abs(x)>9){flat(x,4.4,.12,3.4,'#eee9d7',Math.PI/2,.025);flat(x,8.0,.12,3.4,'#eee9d7',Math.PI/2,.025)}}
 for(let z=14;z<116;z+=4){if(Math.abs(z-76.63)>4.8){flat(-.12,z,.095,3.2,'#e2bc60',0,.025);flat(.12,z,.095,3.2,'#e2bc60',0,.025)}flat(6.12,z,.12,3.7,'#b64e44',0,.026);if(Math.abs(z-76.63)>3.2)flat(-6.12,z,.12,3.7,'#b64e44',0,.026)}
 for(let x=-5.5;x<5.8;x+=.85)flat(x,12.4,.44,2,'#e6e6de',0,.035);
 for(let x=-95;x<-7;x+=4){flat(x,low+.08,.10,3.7,'#dcb85d',Math.PI/2,.033);flat(x,high-.08,.10,3.7,'#dcb85d',Math.PI/2,.033)}
 for(const o of ns5Base){const color={building:'#777c6d',fence:'#c5d0d0',opposite:'#a59a8c',median:'#718054',southcurb:'#e3d5b9',endwall:'#617984',boundary:'#a1aaa7'}[o.kind];if(o.kind==='median'){box(o.x,-3,o.w,2,.16,0,color,0,true);continue}if(o.kind==='southcurb'){box(o.x,o.z,o.w,o.l,o.h,0,color,0,true);if(street){for(let x=o.x-o.w/2+8;x<o.x+o.w/2-2;x+=14)street.tree(x,-16,1.1);}continue;}
 if(street&&o.kind==='building'){street.building(o.x-o.w/2,o.x+o.w/2,10.5,27.0,31,{south:['fubon',8],east:'fubonCorner',north:['fubon',8],west:'fubon'});street.building(o.x-o.w/2,o.x+o.w/2,27.0,low,31,{south:['fubon',8],east:['fubon',4],north:['fubon',8],west:['fubon',4]}); // Photo-based appearance; dimensions are estimated above ground.
 }else if(street&&o.kind==='opposite'){street.building(o.x-o.w/2,o.x+o.w/2,o.z-o.l/2,o.z+o.l/2,o.h,{west:['office',7],south:['office',6],east:['office',7],north:['office',6]});continue;}else box(o.x,o.z,o.w,o.l,o.h,0,color,0,true);if(o.kind==='building'){for(let x=-111;x<-half-2;x+=4.5){if(!street)for(let y=4.6;y<22;y+=2.7)box(x,low+.035,3.55,.06,.96,y,'#b1bcb9');if(x>-78&&x<-39){box(x,low-.001,3.5,.015,3.5,.18,'#3f4847');box(x,low-.05,3.5,.10,.35,3.75,'#c5c9bd')}}}if(o.kind==='fence'){for(let x=-112;x<-half;x+=3.2){box(x,high+.04,.10,.08,2.3,0,'#c5d7d9',0,true)}}if(o.kind==='opposite'){for(let z=14;z<114;z+=5)for(let y=1.7;y<15;y+=2.7)box(half-.03,z,.06,3.5,1.28,y,'#475f68')}}
 // Brick gateway posts, canopy and legal parking bay visual details remain outside the clear width.
 for(let z of [low-.12,high+.12])box(-half-.18,z,.32,.24,1.6,0,'#b9784f',0,true);
 for(let x=-77;x<=-41;x+=4)box(x,low-1.25,3.8,2.4,.14,4.25,'#65766b');
 const x=ns5Goal.x,z=ns5Goal.z,L=17.0,ww=3.0;
 // The truck points west, rear stop line at x; bay follows the left loading platform.
 const bayZ=ns5Goal.z,bayColor=missionRoute==='out'?'#d2bf81':'#64e6b0';for(let side of [-1,1])flat(x-L/2,bayZ+side*ww/2,.10,L,bayColor,Math.PI/2,.047);for(let xEdge of [x,x-L])flat(xEdge,bayZ,.10,ww,bayColor,0,.048);
 for(let u=x-L+.5;u<x;u+=.9)flat(u,bayZ,.055,.42,'#a5d7ba',Math.PI/2,.048);
 // Real scene side-loading bay sign above wall, positioned outside driveable corridor.
 box(x-L/2,low+.09,4.2,.1,.65,4.35,'#287568');
}
const sceneNS5={name:'10｜北投・NS5',difficulty:6,id:'NS5',theme:'ns5',heading:-Math.PI/2,desc:'承德路七段右轉公館路，再左轉進卸貨區，左側平行停靠',dimensions:ns5,
 start:()=>({...ns5Start}),goal:()=>({...ns5Goal}),obstacles:()=>ns5Base,collision:ns5Hit,parked:ns5Parked,bounds:ns5Bounds,render:renderNS5,guide:ns5Guide,witness:ns5Witness,coach:()=>ns5Controls.map(c=>c.slice()),
 info:()=>({target:'NS5-01',occupied:[],dimensions:ns5}),signs:()=>[{x:ns5Goal.x-8.5,y:4.68,z:low+.16,text:'NS5-01',size:.48}]};

sceneNS5.turnMarkers=state=>{const list=[];if(state.z<15&&state.x>-8)list.push({x:1.1,z:5.2,a:0});if(state.z>=15&&state.x>-8)list.push({x:-1.1,z:ns5.approachLength||76.63,a:-Math.PI/2});return list;};
sceneNS5.visualGoal=g=>({...g,w:3.0,l:17.0});
sceneNS5.goalVisible=state=>state.x<-7&&state.z>65;
sceneNS5.mission=Object.freeze({road:"承德路七段（公館路口）",stars:[6,6,5,6],dockForwardFlip:true,exitMarkers:[{x:0,z:76.63,a:Math.PI,when:s=>s.z>62},{x:1.1,z:5.2,a:Math.PI/2,when:s=>s.z<20}]});
return sceneNS5;
});
})(globalThis);
