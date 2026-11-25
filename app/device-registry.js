(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TruckDeviceRegistry=api;})(globalThis,function(){'use strict';
function createRegistry(report=console.error){const entries=new Map();function register(name,device,{critical=false}={}){if(entries.has(name))throw Error('duplicate device '+name);entries.set(name,{device,critical,failed:false});}
function invoke(name,method,...args){const entry=entries.get(name);if(!entry)throw Error('unknown device '+name);if(entry.failed&&method!=='unmount'&&method!=='dispose')return;try{return entry.device[method]?.(...args)}catch(error){entry.failed=true;report({device:name,method,error});if(entry.critical)throw error;}}
function remove(name){if(!entries.has(name))return;try{invoke(name,'unmount')}finally{entries.delete(name)}}
function status(){return Object.fromEntries([...entries].map(([name,e])=>[name,{critical:e.critical,failed:e.failed}]))}return Object.freeze({register,invoke,remove,status});}
return Object.freeze({createRegistry});});
