/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6MusicLayout=api;})(globalThis,function(){'use strict';
function createMusicPlayerSystemCore(svc){
function layoutMusicButton(){const btn=svc.$('#truckMusicButton');if(!btn)return;const sh=MobileLandscape.rect(svc.$('#shifter')),touch=MobileLandscape.mobile,gap=touch?8:Math.min(20,Math.max(12,svc.W*.01));let x=sh.right+gap,y=sh.bottom-btn.offsetHeight-(touch?3:7),bw=btn.offsetWidth,bh=btn.offsetHeight;const blockers=['#radarDock','.pedals','.steering','.help'].map(q=>MobileLandscape.rect(svc.$(q))).filter(r=>r.width&&r.height);x=Math.min(x,svc.W-bw-8);for(let i=0;i<blockers.length+1;i++){let moved=false;for(const r of blockers){if(x<r.right+5&&x+bw>r.left-5&&y<r.bottom+5&&y+bh>r.top-5){y=r.top-bh-6;moved=true}}if(!moved)break}Object.assign(btn.style,{left:x+'px',right:'auto',bottom:'auto',top:Math.max(0,y)+'px'});}
return Object.freeze({layoutMusicButton});
}
return Object.freeze({createMusicPlayerSystemCore});
});
