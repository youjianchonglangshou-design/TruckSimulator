/* Truck Simulator v3.9 | real-world stage registry
 * Add a stage filename here, then create that JS in this directory.
 * Each stage registers its own factory with TruckRealScenes.register(slug, factory).
 * Order here defines menu order. IDs must be unique.
 */
(function(root){'use strict';
const files=Object.freeze(['ns2.js','ns5.js','dc3.js','jiuqudong.js']);
const factories=new Map(),errors=[];
root.TruckRealScenes={version:'3.9',files,errors,
 register(slug,factory){if(typeof factory!=='function'||factories.has(slug))throw Error('Duplicate or invalid stage: '+slug);factories.set(slug,factory);},
 create(physics){
  errors.length=0;const scenes=[],ids=new Set();
  for(const file of files){try{
   const make=factories.get(file.replace(/\.js$/,''));if(!make)throw Error('Stage not loaded');
   const q=make(physics);
   if(!q||typeof q.name!=='string'||typeof q.id!=='string'||!['start','goal','obstacles','collision','parked','bounds','render'].every(k=>typeof q[k]==='function')||ids.has(q.id))throw Error('Invalid/duplicate stage descriptor');
   ids.add(q.id);scenes.push(q);
  }catch(e){errors.push(file);console.warn('Real stage could not load: '+file,e);}}
  return scenes;
 }
};
})(globalThis);
