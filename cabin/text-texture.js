/* Fixed-resolution cabin graphics. RC5 records existing text operations for CSS3D,
 * without changing the original drawing coordinates or standalone preview path. */
(function(g){'use strict';
 const logical=new WeakMap(),records=new WeakMap();let capturing=false;
 const queries=new Set(['measureText','getTransform','getImageData','isPointInPath','isPointInStroke','createLinearGradient','createRadialGradient','createConicGradient','createPattern','getContextAttributes']);
 function canvas(w,h,dynamic=false){const c=document.createElement('canvas');const scale=dynamic?1.5:2;c.width=Math.round(w*scale);c.height=Math.round(h*scale);logical.set(c,[w,h]);if(capturing){const bg=document.createElement('canvas');bg.width=w;bg.height=h;records.set(c,{c,bg,w,h,texts:[],ops:[],active:false,revision:0,uploadVersion:-1,signature:null});}return c;}
 function size(c){return logical.get(c)||[c.width,c.height];}
 function context(c){const [w,h]=size(c),x=c.getContext('2d');x.setTransform(c.width/w,0,0,c.height/h,0,0);const r=records.get(c);if(!r)return x;const b=r.bg.getContext('2d');b.setTransform(r.bg.width/w,0,0,r.bg.height/h,0,0);if(r.proxy)return r.proxy;
  const point=(a,y)=>{const m=b.getTransform();return [(m.a*a+m.c*y+m.e)*w/r.bg.width,(m.b*a+m.d*y+m.f)*h/r.bg.height]};
  function erase(a,y,ww,hh){const p=point(a,y),q=point(a+ww,y+hh);r.texts=r.texts.filter(t=>!(t.x>=Math.min(p[0],q[0])&&t.x<=Math.max(p[0],q[0])&&t.y>=Math.min(p[1],q[1])&&t.y<=Math.max(p[1],q[1])));r.revision++;}
  function style(){return [b.fillStyle,b.strokeStyle,b.lineWidth,b.globalAlpha,b.globalCompositeOperation,b.shadowColor,b.shadowBlur,b.lineCap,b.lineJoin].map(a=>typeof a==='object'?'gradient':a);}
  r.proxy=new Proxy(b,{get(target,k){if(k==='canvas')return c;const value=target[k];if(typeof value!=='function')return value;return (...args)=>{
   if(queries.has(k))return value.apply(target,args);
   if(k==='fillText'){
    const [txt,a,y,maxWidth]=args,p=point(a,y),m=b.measureText(String(txt));const t={text:String(txt),x:p[0],y:p[1],font:b.font,align:b.textAlign,baseline:b.textBaseline,color:String(b.fillStyle),alpha:b.globalAlpha,shadow:b.shadowColor,blur:b.shadowBlur,shadowX:b.shadowOffsetX,shadowY:b.shadowOffsetY,width:Math.min(m.width,maxWidth??Infinity),ascent:m.fontBoundingBoxAscent??m.actualBoundingBoxAscent,descent:m.fontBoundingBoxDescent??m.actualBoundingBoxDescent};
    r.texts.push(t);r.revision++;if(!r.active)x.fillText(...args);return;
   }
   if(k==='clearRect'||(k==='fillRect'&&b.globalAlpha===1&&typeof b.fillStyle==='string'&&!b.fillStyle.startsWith('rgba')&&b.fillStyle!=='transparent'))erase(...args);
   if(k==='drawImage'){r.texts=[];r.revision++;r.imageDirty=true;}
   if(!['save','restore','setTransform','resetTransform','translate','rotate','scale','transform'].includes(k)){r.ops.push([k,args.map(a=>typeof a==='object'?'object':a),style(),Array.from([b.getTransform().a,b.getTransform().b,b.getTransform().c,b.getTransform().d,b.getTransform().e,b.getTransform().f])]);}
   const result=value.apply(target,args);if(!r.active)x[k](...args);return result;
  };},set(target,k,v){target[k]=v;if(!r.active)x[k]=v;return true;}});return r.proxy;
 }
 function configure(T,texture,dynamic=false){texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.generateMipmaps=true;texture.anisotropy=dynamic?1:4;return texture;}
 function enableCapture(){capturing=true;}
 function disableCapture(){capturing=false;}
 function record(c){return records.get(c);}
 function background(T,t){const r=record(t.image);if(!r)return null;if(!r.texture){r.texture=configure(T,new T.CanvasTexture(r.bg),true);r.texture.colorSpace=t.colorSpace;r.active=true;t.addEventListener('dispose',()=>r.texture?.dispose());r.uploads=1;}
  if(r.uploadVersion!==t.version){const sig=JSON.stringify(r.ops);if(r.uploadVersion!==-1&&(r.imageDirty||(r.ops.length&&sig!==r.signature))){r.texture.needsUpdate=true;r.uploads++;}if(r.ops.length)r.signature=sig;r.ops=[];r.imageDirty=false;r.uploadVersion=t.version;}
  return r;
 }
 function full(r,t){if(r.fullRevision===r.revision&&r.fullUpload===r.uploadVersion)return;const x=r.c.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,r.c.width,r.c.height);x.drawImage(r.bg,0,0,r.c.width,r.c.height);x.setTransform(r.c.width/r.w,0,0,r.c.height/r.h,0,0);for(const a of r.texts){x.font=a.font;x.fillStyle=a.color;x.textAlign=a.align;x.textBaseline=a.baseline;x.globalAlpha=a.alpha;x.shadowColor=a.shadow;x.shadowBlur=a.blur;x.shadowOffsetX=a.shadowX;x.shadowOffsetY=a.shadowY;x.fillText(a.text,a.x,a.y);}x.restore();t.needsUpdate=true;r.fullRevision=r.revision;r.fullUpload=t.version;r.uploadVersion=t.version;}
 g.TruckTextTexture=Object.freeze({canvas,size,context,configure,enableCapture,disableCapture,record,background,full});
})(globalThis);
