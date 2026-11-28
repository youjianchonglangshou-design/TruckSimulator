/* Original P07 preview road; not a playable stage. */
(function(g){const M=CarModel;
function environment(isRoad){const b=M.builder();const {quad,face,box}=b;quad([-110,-.012,-150],[110,-.012,-150],[110,-.012,90],[-110,-.012,90],isRoad?'#71858b':'#344654','ground');if(!isRoad){for(let x=-15;x<=15;x++)quad([x-.008,.001,-15],[x+.008,.001,-15],[x+.008,.001,15],[x-.008,.001,15],'#506572');for(let z=-15;z<=15;z++)quad([-15,.001,z-.008],[15,.001,z-.008],[15,.001,z+.008],[-15,.001,z+.008],'#506572');return b.out;}
// Road width 7.2 m, preview vehicle in right lane; stylised JQD-like test scene, not the actual stage.
const center=z=>-1.8+Math.max(0,-z-14)**1.35*.025;for(let z=30;z>-115;z-=2){const a=center(z),c=center(z-2);quad([a-3.6,0,z],[a+3.6,0,z],[c+3.6,0,z-2],[c-3.6,0,z-2],'#41484a');for(const dx of [-3.5,-.09,.09,3.5]){let w=Math.abs(dx)>1?.045:.035;quad([a+dx-w,.005,z],[a+dx+w,.005,z],[c+dx+w,.005,z-2],[c+dx-w,.005,z-2],Math.abs(dx)>1?'#e4e0cf':'#ebc255');}}
for(let z=-9,i=0;z>-100;z-=8,i++){for(const s of [-1,1]){const x=center(z)+s*(5.8+Math.sin(i*1.7)*1.2),h=4.5+Math.sin(i*2)*1.8;const A=[x-s*.4,0,z+5],B=[x-s*.7,0,z-4],C=[x+s*1.3,h,z-3],D=[x+s*1.1,h*.72,z+5],E=[x+s*2.8,h+1,z];face([A,B,C],i%2?'#81877f':'#737b75');face([A,C,D],i%2?'#69736d':'#878c83');face([C,D,E],'#90968b');}}
for(let i=0;i<9;i++){let z=-10-i*9,x=center(z)+4.7;face([[x-1,0,z],[x+1,0,z],[x,3.2,z]],'#41623e');face([[x,0,z-1],[x,3.2,z],[x+1,0,z]],'#345235');}return b.out;}


g.K13PreviewRoad=environment;
})(window);
