'use strict';
// Development gate: no official v6 release until all of the engineering spec gates
// have real, independently reviewed evidence. A DEV snapshot is not a release.
const cp=require('node:child_process'),path=require('node:path');const root=path.resolve(__dirname,'..');const check=cp.spawnSync(process.execPath,['tools/build-entry.cjs','--check'],{cwd:root,stdio:'inherit'});if(check.status!==0)process.exit(1);
console.error('OFFICIAL RELEASE BLOCKED: P0/P2-P8 not accepted; real WebGL, full device lifecycle, full regression, performance, deployment and external-service evidence missing.');process.exitCode=1;
