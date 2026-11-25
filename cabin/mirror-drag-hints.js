/* RC30: mirror drag affordances only. No camera, texture, frame cache or stage logic. */
(function(g){'use strict';
const moveIcon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 5v14M5 12h14M9.5 7.5 12 5l2.5 2.5M9.5 16.5 12 19l2.5-2.5M7.5 9.5 5 12l2.5 2.5M16.5 9.5 19 12l-2.5 2.5"/></svg>';
function attach(hit,id){
 if(!hit||hit.querySelector('.cab-mirror-grip'))return;
 const side=id.includes('left')?'left':'right';
 hit.classList.add('cab-mirror-indicator','cab-mirror-indicator-'+side);
 hit.setAttribute('aria-label',(side==='left'?'左':'右')+(id.endsWith('upper')?'上後照鏡':'下廣角鏡')+'，拖曳調整');
 hit.removeAttribute('title'); // no competing browser tooltip or dashed hover frame
 const grip=document.createElement('span');grip.className='cab-mirror-grip';grip.setAttribute('aria-hidden','true');grip.innerHTML=moveIcon;
 const tip=document.createElement('span');tip.className='cab-mirror-tip';tip.setAttribute('aria-hidden','true');tip.textContent='拖曳調整';
 hit.append(grip,tip);
}
g.TruckMirrorDragHints=Object.freeze({attach});
})(window);
