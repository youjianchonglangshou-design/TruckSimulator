/* TruckSimulator cabin music v1.0 — local files only; Spotify is an external link. */
(function(root){
'use strict';
function init({onOpen=()=>{},onClose=()=>{}}={}){
  const button=document.createElement('button');button.id='truckMusicButton';button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');button.innerHTML='<span aria-hidden="true">♫</span> Spotify・音樂';button.title='開啟車載音樂 / Spotify';
  const dialog=document.createElement('dialog');dialog.id='truckMusicDialog';dialog.setAttribute('aria-labelledby','truckMusicTitle');dialog.innerHTML=`
  <header class="music-header"><div><small>TRUCK AUDIO SYSTEM</small><h2 id="truckMusicTitle">車載音樂</h2></div><button type="button" id="musicClose" aria-label="關閉音樂視窗" autofocus>×</button></header>
  <div class="music-body"><section class="music-service"><div class="music-service-title"><span class="music-note" aria-hidden="true">♫</span><div><h3>Spotify</h3><p>使用官方播放器聆聽你的收藏與歌單。</p></div></div>
  <a id="musicSpotifyLink" href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">開啟 Spotify 官方播放器 ↗</a><p class="music-muted">在獨立視窗或分頁登入、選歌及播放，再返回遊戲。登入完全由 Spotify 處理。</p></section>
  <section class="music-local"><h3>我的音樂 <small>本機播放</small></h3><div class="music-file-row"><label class="music-pick" for="musicFiles">＋ 加入音樂</label><input id="musicFiles" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac" multiple><button type="button" id="musicClear">清空</button></div>
  <div id="musicNow" aria-live="polite">尚未加入歌曲</div><audio id="musicAudio" controls preload="metadata"></audio><div class="music-actions"><button type="button" id="musicPrev">⏮ 上一首</button><button type="button" id="musicNext">下一首 ⏭</button><button type="button" id="musicLoop" aria-pressed="true">循環：開</button></div><div id="musicQueue" role="list" aria-label="本機播放清單"></div><p id="musicStatus" class="music-muted" role="status">音樂不會上傳。關閉視窗仍可播放，重新整理後需再選檔。</p></section></div>
  <footer>選歌時暫停模擬；關閉視窗後繼續駕駛。</footer>`;
  document.body.append(button,dialog);const q=id=>dialog.querySelector('#'+id),audio=q('musicAudio'),files=q('musicFiles'),queue=q('musicQueue'),status=q('musicStatus');let list=[],index=-1,loop=true,generation=0;
  audio.volume=.35;
  function render(){q('musicNow').textContent=index<0?'尚未加入歌曲':list[index].name;queue.replaceChildren();list.forEach((t,i)=>{const row=document.createElement('button');row.type='button';row.className='music-track';row.setAttribute('role','listitem');row.textContent=(i===index?'▶ ':'')+t.name;row.title=t.name;row.classList.toggle('selected',i===index);row.addEventListener('click',()=>load(i,true));queue.append(row)});q('musicPrev').disabled=q('musicNext').disabled=q('musicClear').disabled=!list.length;button.classList.toggle('music-playing',!audio.paused&&index>=0);button.title=!audio.paused&&index>=0?'正在播放：'+list[index].name:'開啟車載音樂 / Spotify';}
  function load(i,play){if(i<0||i>=list.length)return;const gen=++generation;index=i;audio.src=list[i].url;status.textContent='關閉視窗後，音樂仍會繼續播放。';render();if(play)audio.play().catch(()=>{if(gen===generation)status.textContent='未能自動播放，請按播放鍵；若仍無法播放，請換一個音訊格式。'});}
  function move(d){if(!list.length)return;load((index+d+list.length)%list.length,true)}
  files.addEventListener('change',()=>{const items=Array.from(files.files||[]);for(const file of items)list.push({name:file.name,url:URL.createObjectURL(file)});files.value='';if(items.length&&index<0)load(0,false);render()});
  q('musicClear').addEventListener('click',()=>{generation++;audio.pause();audio.removeAttribute('src');audio.load();list.forEach(t=>URL.revokeObjectURL(t.url));list=[];index=-1;status.textContent='已清空本機清單。';render()});q('musicPrev').onclick=()=>move(-1);q('musicNext').onclick=()=>move(1);q('musicLoop').onclick=()=>{loop=!loop;q('musicLoop').textContent='循環：'+(loop?'開':'關');q('musicLoop').setAttribute('aria-pressed',String(loop))};
  audio.addEventListener('ended',()=>{if(index+1<list.length)load(index+1,true);else if(loop&&list.length)load(0,true);else render()});for(const ev of ['play','pause','ended'])audio.addEventListener(ev,render);audio.addEventListener('error',()=>{if(index>=0)status.textContent='此檔案無法播放，請選擇其他音訊格式。'});
  button.onclick=()=>{if(dialog.open)return;onOpen();dialog.showModal();button.setAttribute('aria-expanded','true')};q('musicClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{button.setAttribute('aria-expanded','false');onClose();button.blur()});
  // The link intentionally never embeds or controls Spotify. A browser may use a tab instead of a window.
  q('musicSpotifyLink').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});});
  render();return {isOpen:()=>dialog.open};
}
root.TruckMusic={init};
})(globalThis);
