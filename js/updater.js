/* BC-16 UPDATER — the app keeps itself current from its GitHub repository.
   Version: a content hash of the app's own files, written by tools/build-single.py into version.json
   (and into the single-file build as window.BC16_VERSION).
   On start and every 30 minutes it reads version.json from the repository's main branch.
   - Running from the live site (GitHub Pages): a service worker loads every file network-first, so a reload
     is always the newest build; the UPDATE key reloads.
   - Running from a downloaded file or an embedded preview: the UPDATE key opens the live app, or downloads the
     newest single file. Projects travel with you as .bc16 files (PROJECT ARCHIVE). */
(()=>{
"use strict";
const REPO='BSAJabo258/dj-beat-creator-',BRANCH='main';
const RAW='https://raw.githubusercontent.com/'+REPO+'/'+BRANCH+'/';
const LIVE='https://'+REPO.split('/')[0].toLowerCase()+'.github.io/'+REPO.split('/')[1]+'/';
const $=id=>document.getElementById(id);
const onLive=location.href.startsWith(LIVE);
const U={local:window.BC16_VERSION||null,remote:null,state:'idle'};
window.BC16_UPDATE=U;

/* service worker: only on the live site (https) */
if(onLive&&'serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{})}

function key(){let g=$('updGrp');if(g)return g;const top=$('hwTop');if(!top)return null;
 g=document.createElement('div');g.id='updGrp';g.className='hwgrp';g.hidden=true;
 g.innerHTML='<span class="hwl">SYSTEM</span><button class="hwb" id="osUpd" data-help="osUpd" title="A newer BC-16 is on GitHub"><i class="led"></i>UPDATE</button>';
 const kref=$('krefGrp');(kref||top.lastElementChild).after(g);$('osUpd').onclick=apply;return g}
async function localVersion(){if(U.local)return U.local;if(!/^https?:/.test(location.protocol))return null;
 try{const r=await fetch('version.json',{cache:'no-store'});if(r.ok){U.local=(await r.json()).v}}catch(e){}return U.local}
async function check(){U.state='checking';
 try{const lv=await localVersion();const r=await fetch(RAW+'version.json?'+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();U.remote=j.v;U.notes=j.notes||'';
  U.state=lv&&j.v&&j.v!==lv?'ready':'current';}catch(e){U.state='offline'}
 const g=key();if(g)g.hidden=U.state!=='ready';const b=$('osUpd');if(b)b.classList.toggle('on',U.state==='ready');return U.state}
async function apply(){const say=window.OS&&OS.say||(()=>{});
 if(onLive){say('Updating to the newest BC-16…');try{const reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update()}catch(e){}location.reload();return}
 const ask=window.OS&&OS.ask;
 const pick=await choose();if(pick==='live'){window.open(LIVE,'_blank','noopener');say('The live BC-16 opened in a new tab. Bring projects across with PROJECT ARCHIVE → save a .bc16 file, then open it there.')}
 else if(pick==='file'){say('Downloading the newest BC-16…');try{const r=await fetch(RAW+'dist/DJ_Beat_Creator.html',{cache:'no-store'});const t=await r.text();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/html'}));a.download='DJ_Beat_Creator.html';document.body.append(a);a.click();a.remove();say('Saved DJ_Beat_Creator.html: open it to run the newest version.')}catch(e){window.open(RAW.replace('raw.githubusercontent.com','github.com').replace('/'+BRANCH+'/','/blob/'+BRANCH+'/')+'dist/DJ_Beat_Creator.html','_blank','noopener');say('Download blocked here: the file opened on GitHub instead.')}}}
function choose(){return new Promise(res=>{const d=document.createElement('div');d.id='askD';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
 d.innerHTML='<div class="askc"><div class="plate"><i class="pled"></i><b class="pn">SYSTEM UPDATE</b><span class="pm">'+(U.remote||'')+'</span><span class="vent"></span></div><p>A newer BC-16 is on GitHub'+(U.notes?': '+String(U.notes).replace(/[<>&]/g,'')+'':'')+'. How do you want it?</p><div class="askb"><button class="hwb" data-u="live"><i class="led"></i>OPEN THE LIVE APP</button><button class="hwb" data-u="file"><i class="led"></i>DOWNLOAD THE FILE</button><button class="hwb" data-u=""><i class="led"></i>LATER</button></div></div>';
 document.body.append(d);d.onclick=e=>{const b=e.target.closest('[data-u]');if(!b&&e.target!==d)return;d.remove();res(b?b.dataset.u:'')}})}
window.BC16_checkUpdate=check;
setTimeout(check,2500);setInterval(check,30*60*1000);
})();
