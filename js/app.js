/* DJ Beat Creator — the instrument shell.
   The screen shows one mode at a time. Pads, pad banks, transport, sequence buttons and
   Q-link knobs are physical controls on the body: they stay put and keep working in every mode.
   The engine (engine.js) and studio (studio.js) bind to element ids, so controls are moved
   into the body, never re-created. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const PAGES={
 start:{t:null,title:'MAIN',d:'Load a song. The tempo, key and every hit are found for you and the pads light up.'},
 chop:{t:'A',title:'CHOP',d:'Tempo and hit detection. Tap the waveform to add or remove a cut.'},
 parts:{t:'E',title:'STEMS',d:'Split a stretch of the song into drums, bass, vocals and melody, then rebuild it.'},
 groups:{t:'G',title:'GROUPS',d:'Slices that sound alike, gathered into groups you can audition and export.'},
 sounds:{t:'S',sub:'sounds',title:'BROWSE',d:'Every slice, take and added file. Tap to hear, then tap a pad to load it.'},
 pads:{t:'S',sub:'pads',title:'PROGRAM',d:'Edit the selected pad, change how the pads behave, rearrange them.'},
 sequence:{t:'S',sub:'sequence',title:'STEP SEQ',d:'Draw hits on the grid for the current sequence.'},
 brain:{t:'S',sub:'brain',title:'BRAIN',d:'Presets, numbered variations, full-song writing and smart sound packs.'},
 live:{t:'P',title:'LIVE',d:'Drum pads plus lead, chord and bass keyboard layers.'},
 keys:{t:'D',title:'KEYS',d:'Any sound on a piano, locked to the song’s key.'},
 dj:{t:'S',sub:'dj',title:'DJ',d:'Hot cues, loops, rolls, echo, gate, filter and kills.'},
 arrange:{t:'C',title:'ARRANGE',d:'A new arrangement of the song, built for you.'},
 song:{t:'S',sub:'song',title:'SONG',d:'Sequence order, audio and MIDI export, takes and saved setups.'}};
const T2P={A:'chop',P:'live',C:'arrange',D:'keys',E:'parts',G:'groups'};
let cur='start',routing=false,lastSong='';
const engineTab=window.tab;
const loaded=()=>!$('app').hidden;
/* pads, keys and transport keys work everywhere except where the computer keyboard plays something else */
window.psKeysOK=()=>loaded()&&cur!=='keys'&&cur!=='live';

/* ---- studio sub-pages made from the existing cards ---- */
function buildSubs(){const S=$('tS');const mk=n=>{const d=document.createElement('div');d.className='sub';d.dataset.sub=n;d.hidden=true;return d};
 const subs={};['pads','dj','sequence','sounds','brain','song'].forEach(n=>{subs[n]=mk(n);S.appendChild(subs[n])});
 const put=(n,ids)=>ids.forEach(id=>{const el=$(id);if(el)subs[n].appendChild(el)});
 put('pads',['psPadCard','psTr','psEd']);put('dj',['psDJ']);put('sequence',['psSeqCard']);put('sounds',['psBinCard']);put('brain',['psMagic','psBrain']);
 const tk=$('gTakes');if(tk){tk.hidden=false;subs.song.appendChild(tk)}put('song',['psSongCard','psSaveCard']);
 const g=$('guide');['psGuide','psKeysCard'].forEach(id=>{const el=$(id);if(el&&g){el.classList.remove('px');g.appendChild(el)}});
 const h=document.createElement('header');h.className='phead';h.id='psHead';S.insertBefore(h,S.firstChild)}
function showSub(n){$$('#tS > .sub').forEach(d=>d.hidden=d.dataset.sub!==n)}
const headFor=p=>'<h1>'+PAGES[p].title+'</h1><p>'+PAGES[p].d+'</p>';
function ensureHead(pane,p){let h=pane.querySelector(':scope > .phead');if(!h){h=document.createElement('header');h.className='phead';pane.prepend(h)}h.innerHTML=headFor(p)}

/* ---- modes ---- */
function goPage(p,opts){opts=opts||{};if(!PAGES[p])p='start';
 if(p!=='start'&&!loaded()){p='start';note('Load a song first. Every mode opens up after that.')}
 routing=true;try{
  $('pgStart').hidden=p!=='start';$('app').classList.toggle('off',p==='start');
  const P=PAGES[p];
  if(P.t==='S'){if($('tS').hidden)engineTab('S');showSub(P.sub);$('psHead').innerHTML=headFor(p)}
  else if(P.t){engineTab(P.t);const pane=$('t'+P.t);if(pane)ensureHead(pane,p)}
 }finally{routing=false}
 cur=p;$$('[data-page]').forEach(a=>a.classList.toggle('on',a.dataset.page===p));$('scrMode').textContent=PAGES[p].title;document.body.classList.remove('modesopen');
 if(location.hash!=='#'+p)history.replaceState(null,'','#'+p);document.title=PAGES[p].title+' · DJ Beat Creator';if(!opts.keepScroll)$('scrBody').scrollTop=0}
window.goPage=goPage;
window.tab=function(t){engineTab(t);if(routing)return;
 if(t==='S'){if(!PAGES[cur]||PAGES[cur].t!=='S')goPage('pads');else goPage(cur,{keepScroll:true})}else if(T2P[t])goPage(T2P[t])};
function note(t){const st=$('st');if(st)st.textContent=t}

/* ---- physical controls: move the studio's controls onto the body ---- */
function mountHW(){
 const mv=(id,slot)=>{const el=$(id),s=$(slot);if(el&&s&&el.parentNode!==s)s.appendChild(el)};
 mv('psGrid','padsSlot');mv('psBanks','banksSlot');mv('psPats','seqSlot');
 ['psRec','psStop','psPlay','psTap'].forEach(id=>mv(id,'transport'));
 ['gRec','gRecT'].forEach(id=>mv(id,'hwRecSlot'));
 ['nrB','nrS','psKeys','psChd','psUndo'].forEach(id=>mv(id,'padFn'));
 mv('psPos','scrPos');
 const lab={psRec:'REC',psStop:'STOP',psPlay:'PLAY',psTap:'TAP TEMPO',nrB:'NOTE REPEAT',psKeys:'KEYS',psChd:'CHORD',psUndo:'UNDO',gRec:'REC'};
 for(const[id,t]of Object.entries(lab)){const el=$(id);if(el&&!el.dataset.hw){el.dataset.hw=1;el.classList.add('hwb');el.title=el.textContent.trim();if(!el.querySelector('.led'))el.insertAdjacentHTML('afterbegin','<i class="led"></i>');[...el.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});el.append(t)}}
 const pb=$('padBlank');if(pb)pb.hidden=!!($('psGrid')&&$('psGrid').children.length)}
/* the studio rewrites some labels while it runs; keep the printed ones */
function keepLabels(){[['psPlay','PLAY'],['gRec','REC']].forEach(([id,t])=>{const el=$(id);if(el&&el.dataset.hw&&!el.textContent.endsWith(t)){[...el.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});el.append(t)}})}

/* ---- Q-link knobs: drag up/down, scroll, arrow keys, or double-click to reset ---- */
function knobs(){$$('.knob').forEach(k=>{const id=k.dataset.for,min=+k.dataset.min,max=+k.dataset.max,step=+k.dataset.step,def=+k.dataset.def;
 const inp=()=>$(id),val=()=>{const i=inp();return i?+i.value:def};
 const show=()=>{const v=val(),f=(v-min)/(max-min);k.querySelector('.kcap').style.setProperty('--a',(-135+270*f)+'deg');k.querySelector('.kv').textContent=id==='psFk'?(v===0?'OFF':v<0?'LP '+(-v):'HP '+v):id==='psBpm'?v.toFixed(1):v+'%'};
 const set=v=>{const i=inp();if(!i){note('Load a song to use the knobs.');return}v=Math.round(Math.max(min,Math.min(max,v))/step)*step;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));show()};
 let drag=null;
 k.addEventListener('pointerdown',e=>{e.preventDefault();k.setPointerCapture(e.pointerId);drag={y:e.clientY,v:val()};k.classList.add('turn')});
 k.addEventListener('pointermove',e=>{if(!drag)return;set(drag.v+(drag.y-e.clientY)*((max-min)/180)*(e.shiftKey?.2:1))});
 const end=()=>{drag=null;k.classList.remove('turn')};k.addEventListener('pointerup',end);k.addEventListener('pointercancel',end);
 k.addEventListener('wheel',e=>{e.preventDefault();set(val()-Math.sign(e.deltaY)*step*2)},{passive:false});
 k.addEventListener('dblclick',()=>set(def));k.tabIndex=0;k.setAttribute('role','slider');k.setAttribute('aria-label',k.querySelector('.kl').textContent);
 k.addEventListener('keydown',e=>{const up=e.key==='ArrowUp'||e.key==='ArrowRight',dn=e.key==='ArrowDown'||e.key==='ArrowLeft';if(up||dn){e.preventDefault();e.stopPropagation();set(val()+(up?step:-step))}});
 show();k._show=show})}
const refreshKnobs=()=>$$('.knob').forEach(k=>k._show&&k._show());

/* ---- display + song changes ---- */
function status(){const on=loaded();$$('.mode').forEach(a=>{if(a.dataset.page!=='start')a.classList.toggle('dim',!on)});$$('.next a').forEach(a=>a.classList.toggle('off',!on));
 keepLabels();if(!on)return;
 let nm='',cnt=0;const bpm=+($('bpm')||{}).value||0;try{nm=fname;cnt=slices.length}catch(e){}
 const cam=window.DBC?DBC.cam():'',kt=window.DBC?DBC.keyText():'';
 $('projName').textContent=(nm||'UNTITLED').toUpperCase();$('projMeta').textContent=bpm.toFixed(1)+' BPM · '+(kt||'finding key')+(cam?' · '+cam:'')+' · '+cnt+' slices';
 $('sBpm').textContent=bpm?bpm.toFixed(1):'—';$('sSl').textContent=cnt||'—';try{$('sBars').textContent=bars.length}catch(e){}
 $('sKey').textContent=kt?kt.replace(' minor','m').replace(' major',''):'—';$('sCam').textContent=cam||'—';$('startStats').hidden=false;
 if(nm&&nm!==lastSong){lastSong=nm;if(window.DBC){DBC.ensure();mountHW();setTimeout(()=>{DBC.autoSetup().then(()=>{mountHW();refreshKnobs()})},300)}}
 mountHW();refreshKnobs()}

/* ---- drop a song anywhere on the machine ---- */
function dnd(){const dz=$('drop');let depth=0;const over=on=>{dz.classList.toggle('over',on);document.body.classList.toggle('dropping',on)};
 const isFiles=e=>e.dataTransfer&&[...e.dataTransfer.types].includes('Files');
 addEventListener('dragenter',e=>{if(isFiles(e)){depth++;over(true);e.preventDefault()}});
 addEventListener('dragleave',()=>{if(--depth<=0){depth=0;over(false)}});
 addEventListener('dragover',e=>{if(isFiles(e))e.preventDefault()});
 addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files[0];depth=0;over(false);if(!f)return;e.preventDefault();
  if(!/^audio\//.test(f.type)&&!/\.(m4a|mp3|wav|flac|ogg|aac)$/i.test(f.name)){note('That file is not audio. Drop a WAV, MP3, M4A, FLAC or OGG.');return}
  note('Loading '+f.name+'…');f.arrayBuffer().then(b=>load(b,f.name))})}

function init(){buildSubs();dnd();knobs();mountHW();
 const pick=$('gPick');if(pick){$('screen').insertBefore(pick,$('scrBody'));$$('[data-t]',pick).forEach(b=>{const m={A:'chop',P:'live',D:'keys',E:'parts',G:'groups',S:'sounds'};b.onclick=e=>{e.stopPropagation();goPage(m[b.dataset.t])}})}
 const pf=$('psPerf');if(pf)pf.hidden=true;const gt=$('gToast');if(gt)$('screen').appendChild(gt);
 $('menuBtn').onclick=()=>document.body.classList.toggle('modesopen');$('scrim').onclick=()=>document.body.classList.remove('modesopen');
 $$('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(!a.classList.contains('off'))goPage(a.dataset.page)}));
 addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(p&&p!==cur)goPage(p)});
 new MutationObserver(status).observe($('app'),{attributes:true,attributeFilter:['hidden']});
 setInterval(status,1000);status();
 const want=location.hash.slice(1);goPage(PAGES[want]&&loaded()?want:'start')}
init();
})();
