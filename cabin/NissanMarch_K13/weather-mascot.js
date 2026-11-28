/* K13 dashboard mascot: original environment state, real reusable 3D geometry. */
(function(g,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.K13WeatherMascot=api;})(globalThis,function(){'use strict';
const palette=Object.freeze({
 dawn:{ray:'#f77c78',sun:'#ffcc9d',cloud:'#f595c0',light:'#ff8ab7'},
 day:{ray:'#f6aa08',sun:'#ffce4b',cloud:'#e6eff6',light:'#8be7ff'},
 dusk:{ray:'#f67d1e',sun:'#ffc06b',cloud:'#e5a18d',light:'#ffad35'},
 night:{ray:'#559aff',sun:'#a4caff',cloud:'#72b3ff',light:'#4797ff'}
});
function create(T,root){
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.62,metalness:.03,...extra});
 const base=mat('#52687c',{metalness:.34}),dark=mat('#193745',{metalness:.18}),glass=mat('#507b91',{transparent:true,opacity:.30,depthWrite:false,roughness:.22}),light=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),sun=mat(0xffffff),ray=mat(0xffffff),cloud=mat(0xffffff),ink=new T.MeshBasicMaterial({color:'#392b39'}),pink=new T.MeshBasicMaterial({color:'#f58c9f'}),tear=mat('#44c8ff',{roughness:.28,emissive:'#149cd1',emissiveIntensity:.22});
 const group=(p,name)=>{const o=new T.Group();o.name=name;p.add(o);return o};
 const mesh=(p,name,geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.name=name;o.position.set(x,y,z);o.raycast=()=>{};p.add(o);return o};
 const cyl=(p,n,m,r1,r2,h,y)=>mesh(p,n,new T.CylinderGeometry(r1,r2,h,24),m,0,y,0);
 cyl(root,'weather-standing-base',base,.038,.046,.012,.006);
 cyl(root,'weather-base-rim',dark,.033,.038,.004,.014);
 cyl(root,'weather-time-light',light,.030,.030,.004,.018);
 cyl(root,'weather-pedestal',glass,.021,.024,.034,.037);
 cyl(root,'weather-light-core',light,.013,.015,.031,.040);
 cyl(root,'weather-pedestal-cap',base,.023,.021,.006,.057);
 const head=group(root,'weather-mascot-head');head.position.y=.087;head.rotation.y=-.18;
 const sphere=new T.SphereGeometry(1,18,12);
 const ball=(p,n,m,x,y,z,sx,sy,sz)=>{const o=mesh(p,n,sphere,m,x,y,z);o.scale.set(sx,sy,sz);return o};
 const sh=group(head,'weather-sun-head'),ch=group(head,'weather-cloud-head');
 ball(sh,'weather-sun-face',sun,0,0,0,.031,.031,.025);
 const rg=new T.CylinderGeometry(.002,.0095,.021,10);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,o=mesh(sh,'weather-sun-ray-'+i,rg,ray,Math.sin(a)*.031,Math.cos(a)*.031,0);o.rotation.z=-a;o.scale.z=.72;}
 ball(ch,'weather-cloud-center',cloud,0,.004,0,.028,.030,.025);
 for(const side of [-1,1])ball(ch,'weather-cloud-lobe-'+side,cloud,side*.020,-.006,0,.021,.020,.020);
 ball(ch,'weather-cloud-lower',cloud,0,-.012,.001,.030,.014,.020);
 // Real 3D raised strokes and cheeks. No reference image or texture used.
 const stroke=(p,n,coords,r=.0017)=>mesh(p,n,new T.TubeGeometry(new T.CatmullRomCurve3(coords.map(([x,y,z=.027])=>new T.Vector3(x,y,z))),8,r,6,false),ink,0,0,0);
 const face={};for(const w of ['sun','cloud','rain'])face[w]=group(head,'weather-face-'+w);
 for(const side of [-1,1]){
  const x=side*.012;
  stroke(face.sun,'smile-eye-'+side,[[x-.005,.004,.025],[x-.002,.009,.027],[x+.002,.009,.027],[x+.005,.004,.025]]);
  ball(face.sun,'cheek-'+side,pink,side*.019,-.004,.022,.0045,.0025,.0015);
  stroke(face.cloud,'flat-brow-'+side,[[x-.006,.006,.027],[x,.006,.028],[x+.006,.006,.027]],.0016);
  ball(face.cloud,'half-lidded-eye-'+side,ink,x,.003,.027,.0038,.0035,.0016);
  stroke(face.rain,'cry-eye-'+side,[[x+side*.005,.010,.026],[x,.004,.028],[x+side*.005,.000,.027]],.0018);
  const d=ball(face.rain,'tear-'+side,tear,side*.017,-.009,.027,.0035,.0065,.0028);d.rotation.z=side*.18;
  const drip=ball(face.rain,'rain-drop-'+side,tear,side*.032,-.030,.008,.004,.008,.0035);drip.rotation.z=-side*.15;
 }
 stroke(face.sun,'smile-mouth',[[-.009,-.008,.026],[-.005,-.013,.026],[0,-.014,.026],[.005,-.013,.026],[.009,-.008,.026]],.0018);
 stroke(face.cloud,'flat-mouth',[[-.005,-.010,.026],[0,-.010,.027],[.005,-.010,.026]],.0015);
 const frown=new T.Shape();frown.moveTo(-.008,-.014);frown.quadraticCurveTo(0,.002,.008,-.014);frown.quadraticCurveTo(0,-.010,-.008,-.014);mesh(face.rain,'cry-mouth',new T.ShapeGeometry(frown,8),ink,0,0,.027);
 let last='';function update(environment){const t=environment?.time,w=environment?.weather;if(!Object.hasOwn(palette,t)||!Object.hasOwn(face,w))return false;const k=t+'|'+w;if(k===last)return false;last=k;const c=palette[t];sun.color.set(c.sun);ray.color.set(c.ray);cloud.color.set(c.cloud);light.color.set(c.light);sh.visible=w==='sun';ch.visible=w!=='sun';for(const n of Object.keys(face))face[n].visible=n===w;root.userData.weatherKey=k;return true;}
 const rotationPeriodMs=90000,rotationBaseY=-.18;
 root.rotation.y=rotationBaseY;
 function rotate(ms){if(Number.isFinite(ms))root.rotation.y=rotationBaseY+ms*2*Math.PI/rotationPeriodMs;}
 update({time:'day',weather:'sun'});return Object.freeze({update,rotate});
}
return Object.freeze({create});});
