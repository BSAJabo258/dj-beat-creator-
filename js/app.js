/* DJ Beat Creator — app shell: pages, navigation, drag-and-drop loading.
   The engine (engine.js) and studio (studio.js) bind to element ids, so pages are made
   by showing and moving existing panels, never by re-creating them. Audio state survives
   every page change because this is one document. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const PAGES={
 start:{t:null,title:'Start',d:'Load a song to work with. It never leaves your device.'},
 chop:{t:'A',title:'Chop',d:'Find the tempo and the hits, then fix any cut points by tapping the waveform.'},
 parts:{t:'E',title:'Parts',d:'Split a stretch of the song into drums, bass, vocals and melody, then rebuild it.'},
 groups:{t:'G',title:'Groups',d:'Gather slices that sound alike into named groups you can audition and export.'},
 sounds:{t:'S',sub:'sounds',title:'Sounds',d:'Every slice, take and added file. Tap to hear, tap a pad to load it, or let smart fill load a whole bank.'},
 pads:{t:'S',sub:'pads',title:'Pads',d:'Eight banks of sixteen pads. Play, record over the loop, rearrange and edit.'},
 sequence:{t:'S',sub:'sequence',title:'Sequence',d:'Draw hits on the grid, or let Smart Beat write a pattern from your pads.'},
 brain:{t:'S',sub:'brain',title:'Beat Brain',d:'Reads your kits, then writes full songs and drafts sound packs from them.'},
 live:{t:'P',title:'Live',d:'Play the song as drum pads and three keyboard layers.'},
 keys:{t:'D',title:'Keys',d:'Play any sound across a piano, locked to the song’s key.'},
 dj:{t:'S',sub:'dj',title:'DJ',d:'Hot cues, loops and beat-synced effects for performing the track.'},
 arrange:{t:'C',title:'Arrange',d:'Turn the song into a new arrangement automatically.'},
 song:{t:'S',sub:'song',title:'Song & export',d:'Put patterns in order, export audio and MIDI, and keep your takes and saved setups.'}};
const T2P={A:'chop',P:'live',C:'arrange',D:'keys',E:'parts',G:'groups'};
let cur='start',routing=false,lastSong='';
const engineTab=window.tab;
const loaded=()=>!$('app').hidden;

/* ---- build studio sub-pages out of the existing cards ---- */
function buildSubs(){const S=$('tS');const mk=n=>{const d=document.createElement('div');d.className='sub';d.dataset.sub=n;d.hidden=true;return d};
 const subs={};['pads','dj','sequence','sounds','brain','song'].forEach(n=>{subs[n]=mk(n);S.appendChild(subs[n])});
 const put=(n,ids)=>ids.forEach(id=>{const el=$(id);if(el)subs[n].appendChild(el)});
 put('pads',['psPadCard','psEd']);put('dj',['psDJ']);put('sequence',['psSeqCard']);put('sounds',['psBinCard']);put('brain',['psMagic','psBrain']);
 const tk=$('gTakes');if(tk){tk.hidden=false;subs.song.appendChild(tk)}put('song',['psSongCard','psSaveCard']);
 const g=$('guide');['psGuide','psKeysCard'].forEach(id=>{const el=$(id);if(el&&g){el.classList.remove('px');g.appendChild(el)}});
 const h=document.createElement('header');h.className='phead';h.id='psHead';S.insertBefore(h,S.firstChild)}
function showSub(n){$$('#tS > .sub').forEach(d=>d.hidden=d.dataset.sub!==n);const pc=$('psPadCard');if(n==='dj')$('tS').querySelector('[data-sub=dj]').prepend(pc);else $('tS').querySelector('[data-sub=pads]').prepend(pc);
 if(n==='pads'||n==='dj')window.dispatchEvent(new Event('resize'))}
/* ---- page headers for engine panes ---- */
function headFor(p){const P=PAGES[p];return '<h1>'+P.title+'</h1><p>'+P.d+'</p>'}
function ensureHead(pane,p){let h=pane.querySelector(':scope > .phead');if(!h){h=document.createElement('header');h.className='phead';pane.prepend(h)}h.innerHTML=headFor(p)}
/* ---- router ---- */
function goPage(p,opts){opts=opts||{};if(!PAGES[p])p='start';
 if(p!=='start'&&!loaded()){p='start';note('Load a song first, then every page opens up.')}
 routing=true;try{
  $('pgStart').hidden=p!=='start';$('app').classList.toggle('off',p==='start');
  const P=PAGES[p];
  if(P.t==='S'){if($('tS').hidden)engineTab('S');showSub(P.sub);$('psHead').innerHTML=headFor(p)}
  else if(P.t){engineTab(P.t);const pane=$('t'+P.t);if(pane)ensureHead(pane,p)}
  else{if(!$('tS').hidden)engineTab('A');$('app').classList.add('off')}
 }finally{routing=false}
 cur=p;$$('[data-page]').forEach(a=>a.classList.toggle('on',a.dataset.page===p));document.body.classList.remove('navopen');
 if(location.hash!=='#'+p)history.replaceState(null,'','#'+p);document.title=PAGES[p].title+' · DJ Beat Creator';if(!opts.keepScroll)window.scrollTo(0,0)}
window.goPage=goPage;
window.tab=function(t){engineTab(t);if(routing)return;
 if(t==='S'){if(!PAGES[cur]||PAGES[cur].t!=='S')goPage('pads',{});else goPage(cur,{keepScroll:true})}else if(T2P[t])goPage(T2P[t])};
function note(t){const st=$('st');if(st)st.textContent=t}
/* ---- top bar + rail status ---- */
function status(){const on=loaded();$$('[data-page]').forEach(a=>{if(a.dataset.page!=='start')a.classList.toggle('off',!on)});$$('.next a').forEach(a=>a.classList.toggle('off',!on));
 if(!on)return;const bpm=+($('bpm')||{}).value||0,n=(window.slices||[]).length;
 let nm='';try{nm=fname}catch(e){}$('projName').textContent=nm||'Untitled';
 let key='';try{if(PL&&PL.sl)key=' · '+NN[PL.root]+(PL.scale==='min'?' minor':PL.scale==='maj'?' major':'')}catch(e){}
 let cnt=0;try{cnt=slices.length}catch(e){}
 $('projMeta').textContent=bpm.toFixed(1)+' BPM · '+cnt+' slices'+key;
 const cam=window.DBC?DBC.cam():'',kt=window.DBC?DBC.keyText():'';$('sKey').textContent=kt?kt.replace(' minor','m').replace(' major',''):'—';$('sCam').textContent=cam||'—';if(cam)$('projMeta').textContent+=' · '+cam;
 if(nm&&nm!==lastSong){lastSong=nm;if(window.DBC)setTimeout(()=>DBC.autoSetup(),400)}
 $('nChop').textContent=cnt||'';$('sBpm').textContent=bpm?bpm.toFixed(1):'—';$('sSl').textContent=cnt||'—';
 try{$('sBars').textContent=bars.length}catch(e){}
 $('startStats').hidden=false}
/* ---- load by drag and drop anywhere ---- */
function dnd(){const dz=$('drop');let depth=0;
 const over=on=>dz.classList.toggle('over',on);
 addEventListener('dragenter',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files')){depth++;over(true);e.preventDefault()}});
 addEventListener('dragleave',()=>{if(--depth<=0){depth=0;over(false)}});
 addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files'))e.preventDefault()});
 addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files[0];depth=0;over(false);if(!f)return;e.preventDefault();
  if(!/^audio\//.test(f.type)&&!/\.(m4a|mp3|wav|flac|ogg|aac)$/i.test(f.name)){note('That file is not audio. Drop a WAV, MP3, M4A, FLAC or OGG.');return}
  f.arrayBuffer().then(b=>load(b,f.name))})}
/* ---- wiring ---- */
function init(){buildSubs();dnd();
 // top bar controls come from the studio's global recorder
 const tr=$('topRec');['gRec','gRecT'].forEach(id=>{const el=$(id);if(el)tr.appendChild(el)});
 const tl=$('takesLink');tl.onclick=()=>goPage('song');
 const pick=$('gPick');if(pick){$('main').insertBefore(pick,$('pages'));$$('[data-t]',pick).forEach(b=>{const m={A:'chop',P:'live',D:'keys',E:'parts',G:'groups',S:'sounds'};b.onclick=e=>{e.stopPropagation();goPage(m[b.dataset.t])}})}
 $('menuBtn').onclick=()=>document.body.classList.toggle('navopen');$('scrim').onclick=()=>document.body.classList.remove('navopen');
 $$('a[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(!a.classList.contains('off'))goPage(a.dataset.page)}));
 addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(p&&p!==cur)goPage(p)});
 new MutationObserver(()=>{status();if(loaded()&&cur==='start'&&!$('startStats').dataset.seen){$('startStats').dataset.seen=1}}).observe($('app'),{attributes:true,attributeFilter:['hidden']});
 setInterval(status,1500);status();
 const want=location.hash.slice(1);goPage(PAGES[want]&&want!=='start'&&loaded()?want:'start')}
init();
})();
