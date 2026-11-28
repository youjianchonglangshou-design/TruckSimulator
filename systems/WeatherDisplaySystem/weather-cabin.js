/* RC35 production implementation, migrated with an explicit capability list. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckV6WeatherCabin=api;})(globalThis,function(){'use strict';
function createWeatherDisplaySystemCabin(svc){
let previousWeather="",pillar=null;
function rotate(ms){if(pillar?.hanger)pillar.hanger.rotation.y=-.57+ms*2*Math.PI/pillar.rotationPeriodMs;}
function restoreContext(){if(pillar)pillar.texture.needsUpdate=true;}
function createPillarHud(){
 const H=globalThis.TruckTextTexture,c=H?H.canvas(512,700):document.createElement('canvas');if(!H){c.width=512;c.height=700;}const texture=new svc.T.CanvasTexture(c);
 texture.colorSpace=svc.T.SRGBColorSpace;if(H)H.configure(svc.T,texture);else{texture.minFilter=svc.T.LinearFilter;texture.magFilter=svc.T.LinearFilter;}
 const hanger=new svc.T.Group();hanger.name='rc27-weather-hanging-pivot';hanger.position.set(1.53,1.92,-1.45);
 hanger.rotation.y=-.57;svc.shell.add(hanger);
 const w=.255,h=.355,rad=.012,top=h/2,eyeY=top-.028;
 const shape=new svc.T.Shape();
 shape.moveTo(-w/2+rad,-h/2);shape.lineTo(w/2-rad,-h/2);
 shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+rad);
 shape.lineTo(w/2,top-rad);shape.quadraticCurveTo(w/2,top,w/2-rad,top);
 shape.lineTo(-w/2+rad,top);shape.quadraticCurveTo(-w/2,top,-w/2,top-rad);
 shape.lineTo(-w/2,-h/2+rad);shape.quadraticCurveTo(-w/2,-h/2,-w/2+rad,-h/2);
 const hole=new svc.T.Path();hole.absarc(0,eyeY,.010,0,Math.PI*2,true);shape.holes.push(hole);
 const geometry=svc.normalizeMirrorUV(new svc.T.ShapeGeometry(shape,12));
 const faceMat=new svc.T.MeshBasicMaterial({map:texture,transparent:true,side:svc.T.FrontSide,toneMapped:false,depthWrite:false});
 const card=new svc.T.Group();card.name='rc27-weather-card';card.position.y=-.48;hanger.add(card);
 const front=new svc.T.Mesh(geometry,faceMat);front.name='cabin-right-A-pillar-environment-HUD';front.position.z=.004;card.add(front);
 const back=new svc.T.Mesh(geometry.clone(),faceMat);back.rotation.y=Math.PI;back.position.z=-.004;card.add(back);
 const ringMat=new svc.T.MeshStandardMaterial({color:'#cfdae5',metalness:.7,roughness:.3,side:svc.T.DoubleSide});
 for(const side of [-1,1]){const eyelet=new svc.T.Mesh(new svc.T.RingGeometry(.010,.015,32),ringMat);
  eyelet.position.set(0,eyeY,side*.006);card.add(eyelet);}
 const length=.48-eyeY;
 const cord=new svc.T.Mesh(new svc.T.CylinderGeometry(.0028,.0028,length,10),new svc.T.MeshStandardMaterial({color:'#ecf2fa',metalness:.16,roughness:.6}));
 cord.name='rc27-weather-hanging-cord';cord.position.y=-length/2;hanger.add(cord);
 const cap=new svc.T.Mesh(new svc.T.SphereGeometry(.009,12,8),ringMat);hanger.add(cap);
 pillar={canvas:c,texture,mesh:front,hanger,card,cord,rotationPeriodMs:90000};
}
function updatePillar(s){
 if(!pillar||!s.environment)return;
 const time=s.environment.time,weather=s.environment.weather,key=time+'|'+weather;
 if(key===previousWeather)return;previousWeather=key;
 const {canvas:c,texture:tx}=pillar,x=globalThis.TruckTextTexture?.context(c)||c.getContext('2d');
 x.clearRect(0,0,512,700);
 x.fillStyle='#102b3be6';x.beginPath();x.roundRect(12,15,488,670,36);x.fill();
 x.strokeStyle='#6ab6be';x.lineWidth=9;x.stroke();
 const night=time==='night',evening=time==='dusk',dawn=time==='dawn';
 x.fillStyle=night?'#b8c9eb':evening?'#ffc286':dawn?'#ffdaac':'#ffe39c';
 x.beginPath();x.arc(168,212,76,0,Math.PI*2);x.fill();
 if(weather!=='sun'){
  x.fillStyle='#d5e5ef';x.beginPath();x.arc(238,225,78,0,Math.PI*2);x.arc(313,210,87,0,Math.PI*2);x.roundRect(180,210,214,93,36);x.fill();
 }
 if(weather==='rain'){
  x.strokeStyle='#7ce1fb';x.lineWidth=14;x.lineCap='round';
  for(let i=0;i<4;i++){x.beginPath();x.moveTo(166+i*65,345);x.lineTo(140+i*65,409);x.stroke()}
 }
 const timeZH={dawn:'清晨',day:'白天',dusk:'傍晚',night:'黑夜'},wxZH={sun:'晴天',cloud:'陰天',rain:'下雨'};
 x.fillStyle='#f0fcff';x.font='bold 69px "Microsoft JhengHei", "Noto Sans CJK TC",sans-serif';x.textAlign='center';
 x.fillText(timeZH[time]||'白天',256,528);x.font='bold 61px "Microsoft JhengHei", "Noto Sans CJK TC",sans-serif';
 x.fillText(wxZH[weather]||'晴天',256,624);tx.needsUpdate=true;
}
function updateWeather(s){if(!s.environment)return;
 const t=s.environment.time,w=s.environment.weather;
 const times={dawn:'清晨',day:'白天',dusk:'傍晚',night:'黑夜'};
 const weathers={sun:'晴天',cloud:'陰天',rain:'下雨'};
 svc.ui.weatherText.textContent=`${times[t]||'白天'}・${weathers[w]||'晴天'}`;
 svc.ui.weather.querySelector('.wx-rain').style.display=w==='rain'?'':'none';
 svc.ui.weather.querySelector('.wx-cloud').style.display=w==='sun'?'none':'';
 svc.ui.weather.querySelector('.wx-sun').style.opacity=t==='night'?'.3':'1';
}
return Object.freeze({rotate,restoreContext,createPillarHud,updatePillar,updateWeather});
}
return Object.freeze({createWeatherDisplaySystemCabin});
});
