/* P02: registered cabin providers; preview is deliberately separate from gameplay activation. */
(function(root){'use strict';
function createCatalogue(){const entries=new Map();return Object.freeze({register(id,p){if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(id)||!p||typeof p.buildModel!=='function'&&typeof p.create!=='function')throw Error('invalid cabin provider');if(entries.has(id))throw Error('duplicate cabin provider '+id);entries.set(id,p);},get:id=>entries.get(id),has:id=>entries.has(id)})}
if(typeof module==='object'&&module.exports){module.exports={createCatalogue};return}
const catalogue=createCatalogue();
root.TruckVehicleCabins=Object.freeze({register:catalogue.register,has:catalogue.has,get:catalogue.get,isOpen:()=>false,practiceSnapshot:()=>null});
})(globalThis);
