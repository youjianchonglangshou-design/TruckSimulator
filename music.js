/* TruckSimulator v5.3.1 | YouTube Playlist integration (preserves v1.1.1 player engine). */
(function(root){
'use strict';
const ytIcon='<svg class="youtube-logo" viewBox="0 0 48 34" width="27" height="21" aria-hidden="true" focusable="false"><rect x="1" y="1" width="46" height="32" rx="9" fill="#ff0033"/><path d="M20 9.5 32 17 20 24.5Z" fill="#fff"/></svg>';
function init({onOpen=()=>{},onClose=()=>{}}={}){
  const button=document.createElement('button');
  button.id='truckMusicButton';button.type='button';
  button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-label','YouTube 車載音樂');
  button.title='YouTube Music：開啟播放清單';
  button.innerHTML=ytIcon+'<span class="youtube-label">YouTube Music</span>';
  const backdrop=document.createElement('div');backdrop.id='truckMusicBackdrop';
  backdrop.setAttribute('aria-hidden','true');
  const dialog=document.createElement('section');dialog.id='truckMusicDialog';
  dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label','YouTube 車載音樂');
  dialog.setAttribute('aria-hidden','true');
  const frame=document.createElement('iframe');frame.id='truckYoutubeFrame';
  frame.title='YouTube Playlist 播放器';
  frame.src='youtube-player/index.html?truckEmbed=1'+(window.TruckMobileMusic?'&device=mobile':'');
  frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
  frame.setAttribute('allowtransparency','true');
  frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  frame.setAttribute('loading','eager');
  dialog.append(frame);
  // A file:// page cannot provide YouTube's required HTTP Referer. Display a useful
  // instruction instead of leaving the playlist importer spinning for 25 seconds.
  if(location.protocol==='file:'){
    const notice=document.createElement('div');notice.id='truckMusicFileNotice';
    notice.innerHTML='<div class="file-note-box"><h2>本機 YouTube 清單需要 HTTP 網址</h2><p>目前是直接開啟 index.html（file://）。YouTube 可能拒絕沒有 HTTP 來源的播放清單。請改用專案內的一鍵啟動檔：</p><code>Start_TruckSimulator_YouTube.bat</code><p>執行後會自動開啟 127.0.0.1 的模擬器。GitHub Pages 網頁版也能直接使用。</p><button type="button" id="truckMusicFileClose">關閉</button></div>';
    dialog.append(notice);
  }
  document.body.append(button,backdrop,dialog);
  let open=false;
  window.TruckMobileMusic?.attach(frame,()=>open);
  function show(){
    if(open)return;
    onOpen();open=true;
    dialog.classList.add('is-open');backdrop.classList.add('is-open');
    dialog.setAttribute('aria-hidden','false');
    button.setAttribute('aria-expanded','true');
    try{if(window.TruckMobileMusic)window.TruckMobileMusic.open(frame);else frame.contentWindow.postMessage({type:'truck-youtube-open'},'*')}catch(_){}
  }
  function hide(){
    if(!open)return;
    open=false;dialog.classList.remove('is-open');backdrop.classList.remove('is-open');
    dialog.setAttribute('aria-hidden','true');
    button.setAttribute('aria-expanded','false');
    onClose();button.blur();
    /* IMPORTANT: do not remove/reload/display:none the iframe, or pause its playback. */
  }
  dialog.querySelector('#truckMusicFileClose')?.addEventListener('click',hide);
  button.addEventListener('click',show);
  backdrop.addEventListener('click',hide);
  document.addEventListener('keydown',e=>{if(open&&e.key==='Escape'){hide();}});
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow)return;
    if(window.TruckMobileMusic&&location.protocol!=='file:'&&event.origin!==location.origin)return;
    if(event.data && event.data.type==='truck-youtube-close')hide();
  });
  return {open:show,close:hide,button,dialog,frame,isOpen:()=>open};
}
root.TruckMusic={init};
})(globalThis);
