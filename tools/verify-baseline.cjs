'use strict';
// P0 immutable baseline verification only. This is NOT the final P8 release gate.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function verify(root,manifest){
 root=path.resolve(root);if(!manifest||manifest.schema!==1||!manifest.files||typeof manifest.files!=='object'||Array.isArray(manifest.files)||Object.keys(manifest.files).length!==manifest.fileCount)throw Error('invalid baseline manifest');
 for(const [name,digest] of Object.entries(manifest.files)){
  if(!name||name.includes('\\')||name.includes(':')||name.includes('\0')||name.split('/').some(s=>!s||s==='.'||s==='..')||!/^\w[\s\S]*$/.test(name)||!(/^[a-f0-9]{64}$/.test(digest)))throw Error('invalid baseline path or digest: '+name);
 }
 const actual=new Map();
 function walk(dir,prefix=''){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
   const name=prefix+ent.name,file=path.join(dir,ent.name);
   if(ent.isSymbolicLink())throw Error('symbolic link forbidden: '+name);
   if(ent.isDirectory())walk(file,name+'/');else if(ent.isFile())actual.set(name,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));else throw Error('unsupported file type: '+name);
  }
 }
 if(fs.lstatSync(root).isSymbolicLink())throw Error('symbolic link forbidden: root');walk(root);
 const modified=[],missing=[],added=[];
 for(const [name,digest] of Object.entries(manifest.files))if(!actual.has(name))missing.push(name);else if(actual.get(name)!==digest)modified.push(name);
 for(const name of actual.keys())if(!Object.hasOwn(manifest.files,name))added.push(name);
 for(const arr of [modified,missing,added])arr.sort();return {ok:!modified.length&&!missing.length&&!added.length,expected:manifest.fileCount,actual:actual.size,modified,missing,added};
}
module.exports={verify};
if(require.main===module){try{const [root,manifestPath=path.join(__dirname,'baseline.json')]=process.argv.slice(2);if(!root)throw Error('usage: node verify-baseline.cjs PROJECT_DIR [MANIFEST]');const result=verify(root,JSON.parse(fs.readFileSync(manifestPath,'utf8')));console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1}catch(e){console.error(e.message);process.exitCode=1}}
