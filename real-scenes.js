/* Truck Simulator real-world scenes v2.8 | 2026-11-19
 * Add a scene by appending a descriptor to the returned array. IDs must be unique.
 * Hooks: start(), goal(), obstacles(), collision(state), parked(state), bounds(point),
 * render({flat,box,localBox,containerBody}), guide(state), optional randomize(), info(),
 * witness() and signs(). All geometry is in metres, radians. Existing game physics
 * is passed into this factory. Scene file is loaded fresh on each page opening.
 * Keep the body and obstacle geometry in sync. Validate a complete control path first.
 */
(function(root){'use strict';
function createRealScenes({angle,at,hitch,rear,tractor,trailer,corners,overlap,advance}){
const ns2={mainWidth:8,mainLength:65.41,alleyLength:72.79,yardLength:48.04,yardDepth:24.58,alleyWidth:9,wallZ:60.5,northZ:85.08,bayX:[9.6,14,18.4,22.8,27.2,31.6,36],pitch:4.4,stopZ:61.3};
const ns2Main=[[1.2, 0.59], [1.2, 0.59], [1.2, 0.0], [1.2, -0.4], [1.2, -0.2], [1.2, -0.2], [1.2, -0.2], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, -0.2], [1.2, -0.2], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.4], [1.2, -0.2], [1.2, -0.2], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.2], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, -0.2], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.4], [1.2, 0.59], [1.2, 0.59], [1.2, 0.2], [1.2, 0.59], [1.2, 0.59], [1.2, 0.59], [1.2, 0.59], [1.2, 0.2], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.0], [1.2, 0.59], [1.2, 0.59], [1.2, -0.4], [1.2, -0.4]], ns2Prefix=[[1.05, -0.4], [1.05, -0.2], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.0], [1.05, 0.4], [1.05, 0.4], [1.05, 0.59], [1.05, 0.59], [1.05, 0.59], [1.05, 0.59], [1.05, 0.59], [1.05, 0.2], [1.05, 0.2], [1.05, 0.2], [1.05, 0.2], [1.05, 0.2]], ns2Plans=[[[0.9393783100340918, -0.005220927082313467], [4.162982591349962, -0.4219092272777431], [10.484924471309931, -0.5894546302777554], [3.2130845900427483, 0.5899999990688344], [-2.0794584205685545, -0.5899999772257655], [-1.0000641684675586, -0.0013825245186502343], [-1.0272253236581863, -0.5899999999999829], [-0.984369780401905, 0.5887863809776753], [-0.9980371045918867, -0.0004504272505707695]], [[5.6559721079447, 0.04807015299291282], [4.47681797595708, -0.4420614313657821], [11.06141868865469, -0.5899999457959128], [3.4576070417587146, 0.5631334271834694], [-2.1299320476313626, -0.5899975057217014], [-1.132522711265269, -0.19519016606648118], [-1.3188523316704437, -0.5735849432137324], [-1.1944576024233884, 0.5590756268130856], [-1.0167319707252718, -0.0057728438630110495]], [[10.16487970023539, 0.08915932665453861], [4.862887898578959, -0.543461114021985], [11.466134322154469, -0.5590777551918713], [3.5671866804999213, 0.5607174499983962], [-2.284053112536927, -0.589359173867449], [-0.6331261363325521, -0.20096233500085203], [-1.506019913659483, -0.5733150724801958], [-1.3814516982415146, 0.5779668891989089], [-0.9553215801290234, 0.07718929957313882]], [[14.421646546179174, 0.08494320514961698], [5.124883060656713, -0.5580337045512959], [11.668593826341777, -0.5424105819664454], [3.868042022839104, 0.5585098924812315], [-2.4060365571977207, -0.589882776768832], [-0.5791154239215744, -0.20963266475968714], [-1.496480117167256, -0.3744308237575003], [-1.46328804540368, 0.5550063667976144], [-0.712713954427766, 0.1903982228248692]], [[18.6917688832437, 0.06980102132985509], [5.309451194121759, -0.5481858938134156], [11.836351695039623, -0.5326369862655941], [3.986564184799746, 0.5573109674876799], [-2.386909775660958, -0.5895711024465043], [-0.5805808027649663, -0.202568142696179], [-1.4879336209386378, -0.36490889725440795], [-1.5049681726513109, 0.5709755757516176], [-0.6900060389939697, 0.2812869243074265]], [[22.81835926142947, 0.05790536956437547], [5.49970411797407, -0.521352744080656], [12.00865442697035, -0.5285333906997336], [4.06397866271613, 0.5563648911174327], [-2.3633682495372863, -0.5892673805713284], [-0.6177388780876575, -0.19699417143035738], [-1.4817498044731674, -0.3574456421107148], [-1.5362994156500531, 0.5689422463411145], [-0.6573700452564648, 0.38014057893028463]], [[27.181545898964945, 0.0482204891233183], [5.559745676505988, -0.5149182258640829], [12.064706422247342, -0.5242682906397179], [4.104125680559198, 0.5552650059867278], [-2.3492903001728926, -0.5888981681604282], [-0.6164511049150961, -0.19526738365376814], [-1.4740964262870662, -0.35487121710054065], [-1.559186500405445, 0.5702408813533283], [-0.6624370419319829, 0.40328128810457314]]];
let ns2Target=0,ns2Occupied=[],ns2Eligible=[],ns2Layout=null,ns2VerifiedLayouts=null;
const ns2Start={x:58,z:-4.4,a:-Math.PI/2,b:-Math.PI/2,v:0,steer:0};
const ns2Base=[[-15,55,21,100,10,'shops'],[-17,1.5,14,3,1,'corner'],[26.27,32.25,43.54,56.5,29,'glass'],[28.27,2,39.54,4,.25,'sidewalk'],[26.27,97.54,43.54,24.92,8,'shed'],[59.02,72.79,21.96,24.58,4,'guard'],[59,32.25,22,56.5,16,'office'],[59,2,22,4,.25,'sidewalk']].map(([x,z,w,l,h,kind])=>({x,z,w,l,h,kind,a:0}));
const ns2Truck=i=>({x:ns2.bayX[i],z:69.9,w:2.55,l:17.2,h:3.85,kind:'parkedtruck',a:0,bay:i});
function ns2Bounds(p){return p.x>=-24&&p.x<=76&&p.z>=-8&&p.z<=105;}
function ns2StaticHit(s,obs=ns2Base,pad=0){if(Math.abs(angle(s.a-s.b))>76*Math.PI/180)return true;for(let r of [tractor(s),trailer(s)]){r={...r,w:r.w+2*pad,l:r.l+2*pad};if(corners(r).some(p=>!ns2Bounds(p))||obs.some(o=>overlap(r,o)))return true;}return false;}
function ns2Goal(i){return {x:ns2.bayX[i],z:ns2.stopZ,a:0,id:`NS2-${String(i+1).padStart(2,'0')}`,w:3.6,l:14};}
function ns2Parked(s,i){let r=rear(s),g=ns2Goal(i);return Math.abs(r.x-g.x)<.43&&Math.abs(r.z-g.z)<.6&&Math.abs(angle(s.b))<.063&&Math.abs(angle(s.a-s.b))<.12&&Math.abs(s.v)<.12;}
function ns2Witness(i){let s={...ns2Start},path=[s];for(let [d,st] of [...ns2Main,...ns2Prefix,...ns2Plans[i]]){let m=Math.max(1,Math.ceil(Math.abs(d)/.08)),v=Math.sign(d);if(!v)continue;for(let k=0;k<m;k++){s=advance({...s,v,steer:st},{gear:v,throttle:1/(v===1?7:2.65),steer:st/.59},Math.abs(d)/m);path.push(s);}}path[path.length-1]={...s,v:0};return path;}
function ns2Verify(){return ns2.bayX.map((_,i)=>{const path=ns2Witness(i),valid=ns2Parked(path.at(-1),i)&&!path.some(s=>ns2StaticHit(s));const eligible=valid?ns2.bayX.map((_,j)=>j).filter(j=>i!==j&&!path.some(s=>ns2StaticHit(s,[ns2Truck(j)],.22))):[];return {i,valid,eligible};});}
function ns2Randomize(rng=Math.random){const choices=(ns2VerifiedLayouts??=ns2Verify()).filter(x=>x.valid);if(!choices.length)throw Error('NS2 no verified path');let chosen=choices[Math.min(choices.length-1,Math.floor(rng()*choices.length))];ns2Target=chosen.i;ns2Eligible=chosen.eligible.slice();let candidates=ns2Eligible.slice();for(let i=candidates.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}const count=Math.min(candidates.length,Math.floor(rng()*4));ns2Occupied=candidates.slice(0,count);ns2Layout={target:ns2Target+1,eligible:ns2Eligible.map(i=>i+1),occupied:ns2Occupied.map(i=>i+1)};return ns2Layout;}
function ns2Obstacles(){return ns2Base.concat(ns2Occupied.map(ns2Truck));}

function renderNS2({flat,box,localBox,containerBody}){const D=ns2;
// Asphalt and pavement boundaries, in metres, registered to collision geometry.
flat(26,40,112,142,'#b8b7ad',0,0);flat((76-24)/2,-4,8,100,'#535e65',Math.PI/2,.012);flat(0,52.5,9,105,'#62696a',0,.014);flat(26.27,72.79,43.54,24.58,'#777c79',0,.016);flat(4.5,2,8,8,'#777c79',0,.015);
flat(26,-9.1,2.2,100,'#a1a59a',Math.PI/2,.018);flat(26,-9.1,1.62,100,'#647e49',Math.PI/2,.020);flat(26,-15,8,100,'#535e65',Math.PI/2,.015);
for(let x=-22;x<76;x+=5){flat(x,-4,.12,2.8,'#e9e6d9',Math.PI/2,.024);flat(x,-8,.12,4.9,'#debd63',Math.PI/2,.026);flat(x,-.12,.10,4.8,'#e0c160',Math.PI/2,.026);if(Math.abs(x)>8)box(x,-9.1,.24,.24,3.0,0,'#71665a');if(Math.abs(x)>8)box(x,-9.1,2.0,2.0,1.7,2.1,'#54734a');}
for(let z=6;z<105;z+=4){flat(0,z,.12,2.1,'#e0c675',0,.03);flat(-4.4,z,.10,3.9,'#e1ba58',0,.03);if(z<59||z>86)flat(4.4,z,.10,3.9,'#e1ba58',0,.03);}
// Crosswalk at the T junction; yellow keep-clear box across the gate.
for(let x=-3.8;x<4.5;x+=.88)flat(x,3.1,.44,2.5,'#e6e4dd',0,.04);
for(let z=60.8;z<85;z+=2.8){flat(3.3,z,.10,6.2,'#d8b65c',Math.PI/4,.04);flat(3.3,z,.10,6.2,'#d8b65c',-Math.PI/4,.04);}
for(let o of ns2Obstacles()){let {x,z,w,l,h,kind}=o;if(kind==='parkedtruck'){let col=['#889da6','#aa4f36','#777e61','#b4b5ae'][o.bay%4];containerBody(x,z-2.15,0,12.2,col,1.13);box(x,z+5.6,2.50,5.8,2.65,.9,'#b5bcc0',0,true);box(x,z+8.52,2.12,.07,.86,2.48,'#304c5b');box(x,z,2.45,16.7,.25,.64,'#303a3e');for(let f of [-6,-5,2.4,6.7])for(let side of [-1,1])localBox(x,z,0,f,side*1.08,.36,.88,.78,0,'#262d30');continue;}
let color={shops:'#a48674',glass:'#7e9ea5',shed:'#b4b2a2',guard:'#9ba7a9',office:'#8b969d',sidewalk:'#bab8ac',corner:'#999e99'}[kind];box(x,z,w,l,h,0,color,0,true);
if(kind==='shops'){for(let f=-l/2+2;f<l/2;f+=4){localBox(x,z,0,f,w/2+.022,.045,3.2,2.55,.20,'#575b58');for(let y=3.1;y<h-1;y+=2.5)localBox(x,z,0,f,w/2+.03,.055,2.1,1.14,y,'#405761');}}
if(kind==='glass'||kind==='office'){for(let f=-l/2+1.5;f<l/2;f+=3.0)for(let y=1.1;y<h-.9;y+=2.6)localBox(x,z,0,f,-w/2-.024,.05,2.75,1.78,y,'#478b92');for(let r=-w/2+1.5;r<w/2;r+=3)for(let y=2;y<h-1;y+=2.6)localBox(x,z,0,-l/2-.026,r,2.6,.06,1.72,y,'#48898e');}
if(kind==='shed'){for(let f=-l/2+.7;f<l/2;f+=.9)localBox(x,z,0,f,-w/2-.025,.045,.10,h-.3,.12,'#8e9690');for(let r=-w/2+2;r<w/2;r+=4)localBox(x,z,0,-l/2-.03,r,2.0,.05,1.5,1.7,'#46565b');}
if(kind==='guard'){box(x,z,w+.18,l+.18,.22,h,'#5c7061');for(let f=-l/2+2;f<l/2;f+=4)localBox(x,z,0,f,-w/2-.025,.04,2.7,1.0,1.8,'#3d535b');}}
// Seven loading doors on north-facing wall of the building, seven distinct bay outlines.
for(let i=0;i<7;i++){let x=D.bayX[i],target=ns2Layout.target===i+1,used=ns2Layout.occupied.includes(i+1),color=target?'#67e8ad':'#d2bf81';box(x,D.wallZ+.045,3.12,.08,3.9,.16,'#3e474b');for(let y=.32;y<3.9;y+=.29)box(x,D.wallZ+.10,2.95,.035,.035,y,'#87918e');box(x,D.wallZ+.12,3.3,.14,.16,.10,'#262e31');box(x,D.wallZ+.14,2.45,.14,.57,4.25,target?'#237e62':'#355768');for(let side of [-1,1])flat(x+side*1.8,D.stopZ+7,.10,14,color,0,.045);flat(x,D.stopZ,3.6,.13,color,0,.047);if(target)for(let z=D.stopZ+.5;z<D.stopZ+14;z+=.75)flat(x,z,.05,.38,'#a1d7b9',0,.048);}
// Painted gate threshold and street details outside the driving corridor.
for(let z=7;z<58;z+=8){box(-4.62,z,.13,.13,3.05,0,'#5e6868');box(-4.62,z,.45,.19,.14,2.85,'#c0c5bd');}
for(let z=7;z<57;z+=5){box(-5.1,z,.6,1.65,.55,0,'#343b3b');box(-5.1,z+.4,.45,.5,.45,.45,'#738087');}

}
const sceneNS2={name:'09｜三重・興德路藍天大樓 NS2',id:'NS2',theme:'ns2',heading:0,desc:'興德路右轉 131 巷，再右轉進卸貨區，倒入指定碼頭',dimensions:ns2,
 start:()=>({...ns2Start}),goal:()=>ns2Goal(ns2Target),obstacles:ns2Obstacles,collision:s=>ns2StaticHit(s,ns2Obstacles()),parked:s=>ns2Parked(s,ns2Target),bounds:ns2Bounds,
 randomize:ns2Randomize,info:()=>ns2Layout,verify:ns2Verify,witness:()=>ns2Witness(ns2Target),render:renderNS2,
 signs:()=>ns2.bayX.map((x,i)=>({x,y:4.54,z:ns2.wallZ+.23,text:String(i+1).padStart(2,'0'),size:.36})),
 guide:s=>s.z<4?'沿興德路西行，於 131 巷右轉':s.z<58?'沿興德路 131 巷直行約 73 公尺':s.x<4.5?'右轉進入藍天大樓卸貨區':'前進調整位置，再倒入指定碼頭'};
// NS5: route from Chengde Rd Sec. 7 toward Tamsui, right onto Gongguan Rd, then left into No. 391.
// Measured: 12.43 m road, 76.63 m approach, 5.57 m clear corridor, 97.55 m length.
// Approximation: orthogonal junctions, approach road paved bounds and building heights.
// The narrow lane cannot accommodate perpendicular backing. Parallel left-side unloading only.
const ns5={roadWidth:12.43,approachLength:76.63,corridorWidth:5.57,corridorLength:97.55,mainNorth:10.5,mainSouth:-2};
const half=ns5.roadWidth/2, low=ns5.approachLength-ns5.corridorWidth/2, high=ns5.approachLength+ns5.corridorWidth/2;
const rect=(x1,x2,z1,z2,h,kind)=>({x:(x1+x2)/2,z:(z1+z2)/2,w:x2-x1,l:z2-z1,a:0,h,kind});
const ns5Base=[rect(-115,-half,10.5,low,23,'building'),rect(-115,-half,high,116,2.3,'fence'),rect(half,100,10.5,116,15,'opposite'),rect(-115,100,-30,-2,.25,'median'),rect(-115,-97.55,low,high,2.3,'endwall'),rect(-115,100,116,130,3,'boundary')];
const ns5Start={x:52,z:4.5,a:-Math.PI/2,b:-Math.PI/2,v:0,steer:0};
const ns5Goal={x:-53.55,z:75.63,a:-Math.PI/2,id:'NS5-01',w:3.15,l:18.1};
const ns5Bounds=p=>p.x>=-115&&p.x<=100&&p.z>=-30&&p.z<=130;
function ns5Hit(s){if(Math.abs(angle(s.a-s.b))>76*Math.PI/180)return true;return [tractor(s),trailer(s)].some(r=>corners(r).some(p=>!ns5Bounds(p))||ns5Base.some(o=>overlap(r,o)));}
function ns5Parked(s){const r=rear(s);return Math.abs(r.x-ns5Goal.x)<.6&&Math.abs(r.z-ns5Goal.z)<.35&&Math.abs(angle(s.b-ns5Goal.a))<.063&&Math.abs(angle(s.a-s.b))<.12&&Math.abs(s.v)<.12;}
// Inputs use the same arrow keys / Shift micro-throttle / brake and 60 Hz step as normal play.
const ns5Controls=[[1407,0,1,0.28,false],[224,1,1,0.28,false],[11,0,1,0.28,false],[6,-1,1,0.28,false],[21,0,1,0.28,false],[108,1,1,0.28,false],[307,0,1,0.28,false],[56,-1,1,0.28,false],[797,0,1,0.28,false],[655,0,1,0.28,false],[285,-1,1,0.28,false],[336,0,1,0.28,false],[201,0,1,0.28,false],[31,-1,1,0.28,false],[217,0,1,0.28,false],[37,1,1,0.28,false],[1294,0,1,0.28,false],[30,0,1,0,true],[420,0,-1,0.28,false],[20,0,-1,0,true]];
function ns5Witness(){let s={...ns5Start},path=[s];for(const [ticks,steer,gear,throttle,brake] of ns5Controls)for(let i=0;i<ticks;i++){s=advance(s,{steer,gear,throttle,brake},1/60);path.push(s)}return path;}
function ns5Guide(s){if(s.z<10.5)return '承德路七段往淡水方向行駛 · 公館路右轉';if(s.z<66)return '沿公館路直行 · 前方左轉 391 號卸貨區';if(s.x>-16)return '左轉入場 · 淨寬 5.57 m，留意拖板內輪差';return '左側月台平行停靠 · 前進超過標線後微速倒車修正';}
function renderNS5({flat,box,localBox}){
 flat(-7.5,50,215,165,'#b9b8ae',0,0);
 flat(-7.5,4.25,12.5,215,'#555e63',Math.PI/2,.013);
 flat(0,(10.5+116)/2,12.43,116-10.5,'#616a6e',0,.014);
 flat((-97.55-half)/2,76.63,5.57,97.55-half,'#737b7b',Math.PI/2,.015);
 flat(-7.5,-8,8.4,215,'#59646a',Math.PI/2,.017);flat(-7.5,-3,2,215,'#728851',Math.PI/2,.018);for(let x=-110;x<100;x+=5){flat(x,-8,.11,2.8,'#e9e6d9',Math.PI/2,.025);if(Math.abs(x)>11){box(x,-3,.22,.22,2.8,0,'#766e5e');box(x,-3,1.8,2.0,1.9,2.2,'#587c4a')}}
 // Street lane markings, double yellow and intersection crosswalks; no raised geometry in the road.
 for(let x=-112;x<100;x+=6){if(Math.abs(x)>9){flat(x,4.4,.12,3.4,'#eee9d7',Math.PI/2,.025);flat(x,8.0,.12,3.4,'#eee9d7',Math.PI/2,.025)}}
 for(let z=14;z<116;z+=4){if(Math.abs(z-76.63)>4.8){flat(-.12,z,.095,3.2,'#e2bc60',0,.025);flat(.12,z,.095,3.2,'#e2bc60',0,.025)}flat(6.12,z,.12,3.7,'#b64e44',0,.026);if(Math.abs(z-76.63)>3.2)flat(-6.12,z,.12,3.7,'#b64e44',0,.026)}
 for(let x=-5.5;x<5.8;x+=.85)flat(x,12.4,.44,2,'#e6e6de',0,.035);
 for(let x=-95;x<-7;x+=4){flat(x,low+.08,.10,3.7,'#dcb85d',Math.PI/2,.033);flat(x,high-.08,.10,3.7,'#dcb85d',Math.PI/2,.033)}
 for(const o of ns5Base){const color={building:'#777c6d',fence:'#a7adb0',opposite:'#a59a8c',median:'#718054',endwall:'#969b91',boundary:'#a1aaa7'}[o.kind];if(o.kind==='median'){box(o.x,-3,o.w,2,.16,0,color,0,true);continue}box(o.x,o.z,o.w,o.l,o.h,0,color,0,true);if(o.kind==='building'){for(let x=-111;x<-half-2;x+=4.5){for(let y=4.6;y<22;y+=2.7)box(x,low+.035,3.55,.06,.96,y,'#b1bcb9');if(x>-78&&x<-39){box(x,low-.001,3.5,.015,3.5,.18,'#3f4847');box(x,low-.05,3.5,.10,.35,3.75,'#c5c9bd')}}}if(o.kind==='fence'){for(let x=-112;x<-half;x+=3.2){box(x,high+.04,.10,.08,2.3,0,'#717c7d')}}if(o.kind==='opposite'){for(let z=14;z<114;z+=5)for(let y=1.7;y<15;y+=2.7)box(half-.03,z,.06,3.5,1.28,y,'#475f68')}}
 // Brick gateway posts, canopy and legal parking bay visual details remain outside the clear width.
 for(let z of [low-.12,high+.12])box(-half-.18,z,.32,.24,1.6,0,'#a66e53');
 for(let x=-77;x<=-41;x+=4)box(x,low-1.25,3.8,2.4,.14,4.25,'#65766b');
 const x=ns5Goal.x,z=ns5Goal.z,L=17.0,ww=3.0;
 // The truck points west, rear stop line at x; bay follows the left loading platform.
 const bayZ=ns5Goal.z;for(let side of [-1,1])flat(x-L/2,bayZ+side*ww/2,.10,L,'#64e6b0',Math.PI/2,.047);for(let xEdge of [x,x-L])flat(xEdge,bayZ,.10,ww,'#64e6b0',0,.048);
 for(let u=x-L+.5;u<x;u+=.9)flat(u,bayZ,.055,.42,'#a5d7ba',Math.PI/2,.048);
 // Real scene side-loading bay sign above wall, positioned outside driveable corridor.
 box(x-L/2,low+.09,4.2,.1,.65,4.35,'#287568');
}
const sceneNS5={name:'10｜北投 NS5',id:'NS5',theme:'ns5',heading:-Math.PI/2,desc:'承德路七段右轉公館路，再左轉進卸貨區，左側平行停靠',dimensions:ns5,
 start:()=>({...ns5Start}),goal:()=>({...ns5Goal}),obstacles:()=>ns5Base,collision:ns5Hit,parked:ns5Parked,bounds:ns5Bounds,render:renderNS5,guide:ns5Guide,witness:ns5Witness,
 info:()=>({target:'NS5-01',occupied:[],dimensions:ns5}),signs:()=>[{x:ns5Goal.x-8.5,y:4.68,z:low+.16,text:'NS5-01',size:.48}]};
return [sceneNS2,sceneNS5];
}
root.TruckRealScenes={version:'2.8',create:createRealScenes};
})(globalThis);
