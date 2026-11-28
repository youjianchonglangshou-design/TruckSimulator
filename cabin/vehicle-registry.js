/* P01: vehicle catalogue, pending selection and isolated preference stores. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckVehicleRegistry=api;})(globalThis,function(){'use strict';
const PREFIX='TruckSimulator:vehicles:v1:',SELECTED=PREFIX+'selected';
const truck={id:'truck',name:'聯結車',kind:'articulated',ready:true,physics:'truck',cabin:'legacy',spec:{maxForwardSpeed:25.2,maxReverseSpeed:9.54},config:{},mirrorDefaults:{left:{yaw:4,pitch:-4},right:{yaw:4,pitch:-4},leftWide:{yaw:28,pitch:8},rightWide:{yaw:28,pitch:8}}};
function clone(v){return JSON.parse(JSON.stringify(v))}function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v)}return v}
function createRegistry(storage){const entries=new Map(),cache=new Map();let active='truck';
 function read(k){if(cache.has(k))return cache.get(k);try{return storage?.getItem(k)??null}catch{return null}}
 function write(k,v){try{if(storage){storage.setItem(k,v);cache.delete(k);return true}}catch{}cache.set(k,v);return false}
 function remove(k){try{if(storage){storage.removeItem(k);cache.delete(k);return true}}catch{}cache.set(k,null);return false}
 function register(raw){if(!raw||!(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/).test(raw.id)||typeof raw.name!=='string'||!raw.name||typeof raw.ready!=='boolean'||typeof raw.physics!=='string'||!raw.spec||!raw.config)throw Error('invalid vehicle descriptor');if(entries.has(raw.id))throw Error('duplicate vehicle '+raw.id);for(const [k,r] of Object.entries(raw.config)){if(!Number.isFinite(raw.spec[k])||!Array.isArray(r)||r.length!==2||!r.every(Number.isFinite)||r[0]>raw.spec[k]||r[1]<raw.spec[k])throw Error('invalid vehicle config '+k)}const d=freeze(clone(raw));entries.set(d.id,d);return d}
 function get(id){const d=entries.get(id);if(!d)throw Error('unknown vehicle '+id);return d}
 function selectedId(){const id=read(SELECTED);return entries.has(id)?id:active}
 function select(id){get(id);const persisted=write(SELECTED,id);return {selected:id,active,persisted}}
 function canDrive(id){return get(id).ready===true}
 // P01 intentionally has no live switch. The only installed gameplay provider is the truck.
 function activate(id){if(!canDrive(id))throw Error('vehicle not ready for gameplay: '+id);active=id;select(id);return get(active)}
 function storageFor(id){get(id);const key=k=>{if(typeof k!=='string'||!k||k.startsWith(PREFIX))throw Error('invalid settings key');return id==='truck'?k:PREFIX+id+':'+k};if(id==='truck')return Object.freeze({getItem:k=>storage.getItem(key(k)),setItem:(k,v)=>storage.setItem(key(k),String(v)),removeItem:k=>storage.removeItem(key(k))});return Object.freeze({getItem:k=>read(key(k)),setItem:(k,v)=>write(key(k),String(v)),removeItem:k=>remove(key(k))})}
 function getSettings(id){const d=get(id),s={...d.spec};let raw;try{raw=JSON.parse(storageFor(id).getItem('vehicle-config')||'{}')}catch{}for(const [k,[min,max]] of Object.entries(d.config)){const v=raw?.[k];if(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max)s[k]=v}return s}
 function saveSettings(id,patch){const d=get(id),s=getSettings(id);for(const [k,v] of Object.entries(patch)){const r=d.config[k];if(!r||typeof v!=='number'||!Number.isFinite(v)||v<r[0]||v>r[1])throw Error('invalid vehicle setting '+k);s[k]=v}return storageFor(id).setItem('vehicle-config',JSON.stringify(Object.fromEntries(Object.keys(d.config).map(k=>[k,s[k]]))))}
 function resetSettings(id){return storageFor(id).removeItem('vehicle-config')}
 register(truck);return Object.freeze({register,get,list:()=>[...entries.values()],selectedId,activeId:()=>active,select,canDrive,activate,storageFor,getSettings,saveSettings,resetSettings});
}
const definitions=new Map();function define(raw){const d=createRegistry(null).register(raw);if(definitions.has(d.id))throw Error('duplicate vehicle '+d.id);definitions.set(d.id,d);return d}
function createRegisteredRegistry(storage){const r=createRegistry(storage);for(const d of definitions.values())r.register(d);return r}
return Object.freeze({createRegistry,define,createRegisteredRegistry});});
