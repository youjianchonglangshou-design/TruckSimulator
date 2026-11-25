/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6InstrumentCabin=api;})(globalThis,function(){'use strict';
function createInstrumentSystemCabin(svc){
function drawSpeedometer(ctx,speed){
 // Original game's 0..30 km/h speed-dial language, redrawn in the same
 // transparent RC15 instrument texture, without creating another bezel.
 const cx=285,cy=306,r=202,start=.75*Math.PI,end=2.25*Math.PI;
 const value=svc.cl(Math.abs(Number(speed)||0)/30,0,1);
 ctx.save();ctx.lineCap='round';
 ctx.beginPath();ctx.arc(cx,cy,r,start,end,false);ctx.lineWidth=16;ctx.strokeStyle='#4b6372';ctx.stroke();
 if(value>0){ctx.shadowColor='#5bdccb';ctx.shadowBlur=19;ctx.beginPath();ctx.arc(cx,cy,r,start,start+(end-start)*value,false);ctx.lineWidth=17;ctx.strokeStyle='#69e2c8';ctx.stroke();ctx.shadowBlur=0;}
 for(let i=0;i<=15;i++){
  const a=start+(end-start)*i/15,major=i%5===0;
  const r0=r+(major?8:10),r1=r+(major?31:22);
  ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);
  ctx.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);
  ctx.lineWidth=major?5:3;ctx.strokeStyle=major?'#c4dbe0':'#789aa6';ctx.stroke();
  if(major){ctx.font='bold 37px system-ui';ctx.fillStyle='#d1dce2';ctx.textAlign='center';ctx.textBaseline='middle';
   const lr=r-35;ctx.fillText(String(i*2),cx+Math.cos(a)*lr,cy+Math.sin(a)*lr)}
 }
 ctx.restore();
}
function drawInstrument(s){
 const speedGear=svc.displaySurfaces.speedGear,hitsTime=svc.displaySurfaces.hitsTime,ctx=speedGear.canvas.getContext('2d'),c=speedGear.canvas;
 ctx.clearRect(0,0,c.width,c.height);
 // No extra full rectangular frame or background: the approved RC15 recessed
 // panel is already behind this transparent canvas and owns its housing.
 drawSpeedometer(ctx,s.speed);
 ctx.fillStyle='#f4fcff';ctx.textAlign='center';ctx.font='bold 156px system-ui';ctx.fillText(String(Math.round(s.speed)).padStart(2,'0'),285,354);
 ctx.fillStyle='#bdd8e4';ctx.font='bold 44px system-ui';ctx.fillText('km/h',285,420);
 ctx.fillStyle='#a0eadb';ctx.font='bold 46px system-ui';ctx.fillText('GEAR  '+({1:'D',0:'N','-1':'R'}[s.gear]||'N'),285,546);
 speedGear.texture.needsUpdate=true;
 const right=hitsTime.canvas.getContext('2d'),rc=hitsTime.canvas;
 right.clearRect(0,0,rc.width,rc.height);
 right.save();right.translate(-604,0);
 const ctxRight=right;
 ctxRight.strokeStyle='#527080';ctxRight.lineWidth=3;ctxRight.beginPath();ctxRight.moveTo(606,58);ctxRight.lineTo(606,585);ctxRight.stroke();
 ctxRight.textAlign='left';ctxRight.fillStyle='#bcd7e2';ctxRight.font='bold 42px "Microsoft JhengHei",sans-serif';
 ctxRight.fillText('用時',640,130);ctxRight.fillText('碰撞次數',640,380);
 ctxRight.fillStyle='#f0fbff';ctxRight.font='bold 78px system-ui';ctxRight.fillText(`${String(Math.floor(s.elapsed/60)).padStart(2,'0')}:${String(Math.floor(s.elapsed)%60).padStart(2,'0')}`,640,239);
 ctxRight.fillStyle=s.hits>=7?'#ffb79b':'#f0fbff';ctxRight.fillText(`${s.hits}/10`,640,489);
 right.restore();hitsTime.texture.needsUpdate=true;
 for(const [id,label,value] of [
  ['angle','聯結角',`${Math.round(s.angle)}°`],
  ['distance',s.coupling?'銜接距離':s.mission?.route==='out'?'迄點距離':'後端距離',s.distance===null?'—':s.distance.toFixed(1)+' m']
 ]){
  const d=svc.displaySurfaces[id],x=d.canvas.getContext('2d');x.clearRect(0,0,d.canvas.width,d.canvas.height);
  d.mesh.visible=s.difficultyMode===0&&s.view===0;
  if(!d.mesh.visible)continue;
  x.fillStyle='#152a40';x.fillRect(0,0,d.canvas.width,d.canvas.height);
  x.fillStyle='#b6d4e0';x.textAlign='center';x.font='bold 72px "Microsoft JhengHei",sans-serif';x.fillText(label,d.canvas.width/2,82);
  x.fillStyle=id==='angle'&&Math.abs(Math.round(s.angle))>=45?'#ff6f70':'#f4ffff';x.font='bold 130px system-ui';x.fillText(value,d.canvas.width/2,210);
  d.texture.needsUpdate=true;
 }
}
return Object.freeze({drawSpeedometer,drawInstrument});
}
return Object.freeze({createInstrumentSystemCabin});
});
