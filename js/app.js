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
 song:{t:'S',sub:'song',title:'SONG',d:'Sequence order, audio and MIDI export, takes and saved setups.'},
 slicer:{os:1,title:'SLICE BRAIN',d:'Chop intelligence.'},store:{os:1,title:'PACK STORE',d:'Packs and plans.'},factory:{os:1,title:'PACK FACTORY',d:'AI sample packs.'},build:{os:1,title:'SONG BUILDER',d:'Loop a part, play the next part, NEXT PART.'},kit:{os:1,title:'KIT FORGE',d:'Build your own kits from the cuts.'},tower:{os:1,title:'KEY TOWER',d:'Three stacked keyboards.'},launch:{os:1,title:'LAUNCH',d:'Every pattern on one console.'},guide:{os:1,title:'GUIDE',d:'Lessons, the button book and the demo.'}};
const T2P={A:'chop',P:'live',C:'arrange',D:'keys',E:'parts',G:'groups'};
let cur='start',routing=false,lastSong='';
const engineTab=window.tab;
const loaded=()=>!$('app').hidden;
/* pads, keys and transport keys work everywhere except where the computer keyboard plays something else */
window.psKeysOK=()=>loaded()&&cur!=='keys'&&cur!=='live'&&cur!=='tower'&&cur!=='guide'&&!document.body.classList.contains('coach');

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
 if(p!=='start'&&p!=='guide'&&p!=='factory'&&p!=='store'&&!loaded()){p='start';note('Load a song first. Every unit opens up after that.')}
 const prev=cur;
 routing=true;try{
  const P=PAGES[p];$('pgStart').hidden=p!=='start';$('app').classList.toggle('off',p==='start'||!!P.os);
  if(P.t==='S'){if($('tS').hidden)engineTab('S');showSub(P.sub);$('psHead').innerHTML=headFor(p)}
  else if(P.t){engineTab(P.t);const pane=$('t'+P.t);if(pane)ensureHead(pane,p)}
 }finally{routing=false}
 cur=p;softKeys(p);$$('a[data-page],button[data-page]').forEach(a=>a.classList.toggle('on',a.dataset.page===p));$('scrMode').textContent=PAGES[p].title;document.body.classList.remove('modesopen');
 if(location.hash!=='#'+p)history.replaceState(null,'','#'+p);document.title=PAGES[p].title+' · DJ Beat Creator';if(!opts.keepScroll)$('scrBody').scrollTop=0;if(window.OS)OS.page(p,prev)}
window.goPage=goPage;window.curPage=()=>cur;
window.tab=function(t){engineTab(t);if(routing)return;
 if(t==='S'){if(!PAGES[cur]||PAGES[cur].t!=='S')goPage('pads');else goPage(cur,{keepScroll:true})}else if(T2P[t])goPage(T2P[t])};
function note(t){const st=$('st');if(st)st.textContent=t}

/* ---- physical controls: move the studio's controls onto the body ---- */
function mountHW(){
 const mv=(id,slot)=>{const el=$(id),s=$(slot);if(el&&s&&el.parentNode!==s)s.appendChild(el)};
 mv('psGrid','padsSlot');mv('psBanks','banksSlot');mv('psPats','seqSlot');
 const TO=['psRec','hwOvd','psStop','psPlay','hwPst','psTap'],tr=$('transport');if(tr&&TO.every(id=>$(id))&&[...tr.children].map(c=>c.id).join()!==TO.join())TO.forEach(id=>tr.appendChild($(id)));
 ['gRec','gRecT'].forEach(id=>mv(id,'hwRecSlot'));
 ['nrB','nrS','psKeys','psChd','psUndo'].forEach(id=>mv(id,'padFn'));
 mv('psPos','scrPos');
 const lab={psRec:'REC',psStop:'STOP',psPlay:'PLAY',psTap:'TAP TEMPO',nrB:'NOTE REPEAT',psKeys:'16 LEVELS',psChd:'CHORD',psUndo:'UNDO',gRec:'REC'};
 for(const[id,t]of Object.entries(lab)){const el=$(id);if(el&&!el.dataset.hw){el.dataset.hw=1;el.classList.add('hwb');el.title=el.textContent.trim();if(!el.querySelector('.led'))el.insertAdjacentHTML('afterbegin','<i class="led"></i>');[...el.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});el.append(t)}}
 const pb=$('padBlank');if(pb)pb.hidden=!!($('psGrid')&&$('psGrid').children.length)}
/* the studio rewrites some labels while it runs; keep the printed ones */
function keepLabels(){[['psPlay','PLAY'],['gRec','REC']].forEach(([id,t])=>{const el=$(id);if(el&&el.dataset.hw&&!el.textContent.endsWith(t)){[...el.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});el.append(t)}})}

/* ---- Q-link knobs: drag up/down, scroll, arrow keys, or double-click to reset ---- */
function knobs(){$$('.knob').forEach(k=>{const id=k.dataset.for,min=+k.dataset.min,max=+k.dataset.max,step=+k.dataset.step,def=+k.dataset.def;
 const inp=()=>$(id),val=()=>{const i=inp();return i?+i.value:def};
 const show=()=>{const v=val(),f=Math.max(0,Math.min(1,(v-min)/(max-min)));k.querySelector('.kcap').style.setProperty('--a',(-135+270*f)+'deg');k.querySelector('.kv').textContent=id==='psFk'?(v===0?'OFF':v<0?'LP '+(-v):'HP '+v):id==='psBpm'?v.toFixed(1):v+'%'};
 const set=v=>{const i=inp();if(!i){note('Load a song to use the knobs.');return}v=Math.round(Math.max(min,Math.min(max,v))/step)*step;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));show()};
 let drag=null;
 k.addEventListener('pointerdown',e=>{e.preventDefault();k.setPointerCapture(e.pointerId);drag={y:e.clientY,v:val()};k.classList.add('turn');const i=inp();if(i)setDataTarget(i)});
 k.addEventListener('pointermove',e=>{if(!drag)return;set(drag.v+(drag.y-e.clientY)*((max-min)/180)*(e.shiftKey?.2:1))});
 const end=()=>{drag=null;k.classList.remove('turn')};k.addEventListener('pointerup',end);k.addEventListener('pointercancel',end);
 k.addEventListener('wheel',e=>{e.preventDefault();set(val()-Math.sign(e.deltaY)*step*2)},{passive:false});
 k.addEventListener('dblclick',()=>set(def));k.tabIndex=0;k.setAttribute('role','slider');k.setAttribute('aria-label',(k.querySelector('.kl')||{textContent:k.dataset.label||k.dataset.for}).textContent);
 k.addEventListener('keydown',e=>{const up=e.key==='ArrowUp'||e.key==='ArrowRight',dn=e.key==='ArrowDown'||e.key==='ArrowLeft';if(up||dn){e.preventDefault();e.stopPropagation();set(val()+(up?step:-step))}});
 show();k._show=show})}
const refreshKnobs=()=>$$('.knob').forEach(k=>k._show&&k._show());


/* ---- MPC soft keys: the bar along the bottom of the screen, different for every mode ---- */
const SOFT={
 start:[['LOAD SONG','@f'],['DEMO BEAT','#demo'],['BUILD ALL','#psMagicGo'],['BRAIN',()=>goPage('brain')],['PROGRAM',()=>goPage('pads')]],
 chop:[['SHORTEST','@cyc:minl'],['LONGEST','@cyc:maxl'],['PADS','@prog'],['◀ SLICES','@pg-'],['SLICES ▶','@pg+'],['½×','#half'],['2×','#dbl'],['RESET','#rst'],['▶ ORIGINAL','#pa'],['▶ NEW','#pr'],['WAV','#dw']],
 parts:[['ALL','#eall'],['SEPARATE','#esep'],['BUILD TRACK','#ebuild'],['▶ / ■','#eplay'],['WAV','#ewav'],['STEMS ZIP','#ezip']],
 groups:[['ANALYZE','#grun'],['UNDO','#gud'],['REDO','#grd'],['FIND SIMILAR','#gsim'],['SAVE','#gsave'],['GROUPS ZIP','#gexp']],
 sounds:[['CHAIN','#psChain'],['DROP CHAIN','#psChainGo'],['DROP NOTHING','#psDesel'],['ADD FILE','#psAdd'],['FILL BANK','#psFillGo']],
 pads:[['PADS','@prog'],['◀ SLICES','@pg-'],['SLICES ▶','@pg+'],['PLAY','#psPadCard .mb[data-m=play]'],['ARRANGE','#psPadCard .mb[data-m=arr]'],['EDIT','#psPadCard .mb[data-m=edit]'],['PICK SOUND','#pePick'],['TUNE TO KEY','#peKey'],['CLEAR PAD','#peClr']],
 sequence:[['SMART BEAT','#psGen'],['QUANTIZE','#psQn'],['CLEAR','#psPClr'],['FOLLOW','#psFol']],
 brain:[['BUILD ALL','#psMagicGo'],['ANALYZE','#bbAn'],['WRITE SONG','#bbSong'],['→ PATTERN','#bbPat'],['◀ VAR','#bbVm'],['VAR ▶','#bbVp'],['PACKS','#bbPk']],
 live:[['DRUMS','#bd'],['CHOPS','#bc'],['GROUPS','#bg'],['◀ PAGE','#np'],['PAGE ▶','#nx'],['KIT ZIP','#kx']],
 keys:[['◀ SOUND','#zpp'],['SOUND ▶','#zpn'],['OCT −','#zo1'],['OCT +','#zo2'],['HOLD','#zhd'],['SNAP','#zsn'],['LOAD SOUND','#zpk']],
 dj:[['STOP LOOPS','#psDeckX'],['KILL LOW','#psDJ .dk[data-k=lo]'],['KILL MID','#psDJ .dk[data-k=mi]'],['KILL HIGH','#psDJ .dk[data-k=hi]'],['DRUMS OFF','#psDJ .dk[data-k=drum]'],['MUSIC OFF','#psDJ .dk[data-k=mus]'],['PRINT','#psPrint']],
 arrange:[['PRODUCE','#ag'],['▶ PLAY','#apl'],['WAV','#xw2'],['MP3','#xm2'],['MIDI','#xi2']],
 song:[['SONG MODE','#psSongM'],['+ ADD SEQ','#psSongAdd'],['CLEAR SONG','#psSongClr'],['WAV','#psXwav'],['MIDI','#psXmid'],['SAVE SETUP','#psSv']]};
function softKeys(p){const f=$('scrFoot');f.textContent='';(SOFT[p]||[]).forEach(([t,a])=>{if(a==='@f'){const l=document.createElement('label');l.className='sk';l.htmlFor='f';l.textContent=t;f.appendChild(l);return}if(a==='@prog'||a==='@pg-'||a==='@pg+'){const b=document.createElement('button');b.className='sk cyc';b.dataset.hw=a;b.dataset.t=t;b.onclick=()=>{const H=window.DBC_HW;if(!H||!loaded())return;if(a==='@prog')H.prog(H.info().prog==='chop'?'kit':'chop');else H.page(a==='@pg-'?-1:1);softSync();hwSync()};f.appendChild(b);return}
 if(typeof a==='string'&&a.startsWith('@cyc:')){const id=a.slice(5),b=document.createElement('button');b.className='sk cyc';b.dataset.cyc=id;b.dataset.t=t;b.title='Tap for the next setting. With SHIFT on, goes back.';b.onclick=()=>cycle(id,b);f.appendChild(b);cycLabel(b);return}const b=document.createElement('button');b.className='sk';b.textContent=t;if(typeof a==='string')b.dataset.sel=a;
 b.onclick=()=>{if(typeof a==='function')return a();const el=document.querySelector(a);if(el&&!el.disabled)el.click();setTimeout(softSync,60)};f.appendChild(b)});softSync()}
const shortOpt=t=>t.replace(' note','').replace('Never (keep whole)','OFF').replace(' beats',' BEATS').replace(' beat',' BEAT').replace(' bars',' BARS').replace(' bar',' BAR').toUpperCase();
function cycLabel(b){const el=$(b.dataset.cyc);if(!el)return;b.innerHTML='<small>'+b.dataset.t+'</small>'+shortOpt(el.selectedOptions[0].text)}
function cycle(id,b){const el=$(id);if(!el)return;const back=window.DBC_HW&&DBC_HW.info().shift;el.selectedIndex=(el.selectedIndex+(back?-1:1)+el.options.length)%el.options.length;el.dispatchEvent(new Event('change',{bubbles:true}));cycLabel(b);oled((id==='minl'?'SHORTEST SLICE ':'SPLIT SLICES LONGER THAN ')+shortOpt(el.selectedOptions[0].text))}
function softSync(){$$('#scrFoot .sk.cyc[data-cyc]').forEach(cycLabel);const H=window.DBC_HW,I=H&&loaded()?H.info():null;$$('#scrFoot .sk[data-hw]').forEach(b=>{const a=b.dataset.hw;if(!I){b.disabled=true;return}if(a==='@prog'){b.disabled=false;b.innerHTML='<small>PADS PLAY</small>'+(I.prog==='chop'?'CHOP':'KIT')}else{b.innerHTML=b.dataset.t;b.disabled=I.prog!=='chop'||(a==='@pg-'?I.page<=0:I.page>=I.pages-1)}});$$('#scrFoot .sk').forEach(b=>{if(!b.dataset.sel)return;const el=document.querySelector(b.dataset.sel);b.disabled=!el||el.disabled;b.classList.toggle('on',!!(el&&el.classList.contains('on')))})}

/* ---- DATA wheel and −/+: change whichever value you touched last ---- */
let DATA_T=null;
function setDataTarget(el){if(!el)return;DATA_T=el;$('dataT').textContent=labelOf(el)}
function labelOf(el){const kn=document.querySelector('.knob[data-for="'+el.id+'"]'),k=kn&&kn.querySelector('.kl');if(k)return k.textContent;if(kn&&kn.dataset.label)return kn.dataset.label;const l=el.closest('label');let t=l?[...l.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim():'';
 return(t||el.title||el.getAttribute('aria-label')||el.id||'VALUE').replace(/\s+/g,' ').slice(0,18).toUpperCase()}
function dataStep(dir){let el=DATA_T&&document.contains(DATA_T)?DATA_T:$('psBpm');if(!el||!loaded()){note('Load a song, then touch any value on the screen to change it with the wheel.');return}
 if(el.tagName==='SELECT'){const i=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+dir));if(i===el.selectedIndex)return;el.selectedIndex=i;el.dispatchEvent(new Event('change',{bubbles:true}));oled(labelOf(el)+' → '+el.options[i].text);return}
 if(el.type==='checkbox'){el.checked=dir>0;el.dispatchEvent(new Event('change',{bubbles:true}));oled(labelOf(el)+(el.checked?' ON':' OFF'));return}
 const st=+el.step||1,mn=el.min!==''?+el.min:-1e9,mx=el.max!==''?+el.max:1e9;let v=Math.round(Math.max(mn,Math.min(mx,(+el.value||0)+dir*st))/st)*st;v=+v.toFixed(3);
 el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));oled(labelOf(el)+' '+v);refreshKnobs()}
let oledT=null;function oled(t){const m=$('projMeta');m.dataset.flash=1;m.textContent=t;clearTimeout(oledT);oledT=setTimeout(()=>{delete m.dataset.flash;status()},1600)}
function jog(){const J=$('jog'),cap=$('jogCap');let ang=0,last=null,acc=0;const ctr=()=>{const r=J.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};
 const turn=d=>{ang+=d;cap.style.transform='rotate('+ang+'rad)';acc+=d;const st=Math.PI/10;while(acc>st){acc-=st;dataStep(1)}while(acc<-st){acc+=st;dataStep(-1)}};
 J.addEventListener('pointerdown',e=>{e.preventDefault();J.setPointerCapture(e.pointerId);const[cx,cy]=ctr();last=Math.atan2(e.clientY-cy,e.clientX-cx);J.classList.add('turn')});
 J.addEventListener('pointermove',e=>{if(last==null)return;const[cx,cy]=ctr(),a=Math.atan2(e.clientY-cy,e.clientX-cx);let d=a-last;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;last=a;turn(d)});
 const end=()=>{last=null;acc=0;J.classList.remove('turn')};J.addEventListener('pointerup',end);J.addEventListener('pointercancel',end);
 J.addEventListener('wheel',e=>{e.preventDefault();turn((e.deltaY<0?1:-1)*Math.PI/9.9)},{passive:false});
 J.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowRight'){e.preventDefault();dataStep(1)}if(e.key==='ArrowDown'||e.key==='ArrowLeft'){e.preventDefault();dataStep(-1)}});
 $('hwMinus').onclick=()=>dataStep(-1);$('hwPlus').onclick=()=>dataStep(1);
 document.addEventListener('focusin',e=>{const t=e.target;if(t.closest&&t.closest('#scrBody')&&t.matches('input[type=number],input[type=range],select,input[type=checkbox]'))setDataTarget(t)});
 document.addEventListener('pointerdown',e=>{const t=e.target;if(t.closest&&t.closest('#scrBody')&&t.matches&&t.matches('input[type=number],input[type=range],select'))setDataTarget(t)},true)}

/* ---- MPC function keys ---- */
function hwKeys(){$('scrProg').onclick=()=>{const H=window.DBC_HW;if(!H||!loaded())return;H.prog(H.info().prog==='chop'?'kit':'chop');hwSync();softSync()};const H=()=>window.DBC_HW,need=()=>{if(!loaded()){note('Load a song first.');return false}if(window.DBC)DBC.ensure();return true};
 $('hwOvd').onclick=()=>{if(need())H().overdub()};$('hwPst').onclick=()=>{if(need())H().playStart()};
 const latch=(id,k,on,off)=>{$(id).onclick=()=>{if(!need())return;const v=!H().info()[k];H().set(k,v);oled(v?on:off);hwSync()}};
 latch('hwShift','shift','SHIFT held: pads note-repeat','SHIFT released');latch('hwErase','erase','ERASE: press a pad to erase its hits','ERASE off');
 latch('hwFull','full','FULL LEVEL: every hit at full velocity','FULL LEVEL off');
 $('hwMute').onclick=()=>{if(!need())return;const i=H().info();if(i.shift){H().clearMutes();H().set('shift',false);oled('All pads unmuted');hwSync();return}H().set('mute',!i.mute);oled(!i.mute?'PAD MUTE: press pads to mute or unmute them':'PAD MUTE off');hwSync()};
 $('hwCopy').onclick=()=>{if(need())oled(H().copy())};$('hwTC').onclick=()=>{if(need())oled(H().tc())};
 const mi=$('hwMasterIn');mi.addEventListener('input',()=>{if(window.DBC_HW)DBC_HW.master(mi.value)})}
function hwSync(){const H=window.DBC_HW;if(!H)return;const i=H.info();
 [['hwShift','shift'],['hwErase','erase'],['hwFull','full'],['hwMute','mute']].forEach(([id,k])=>$(id).classList.toggle('on',!!i[k]));
 $('hwOvd').classList.toggle('on',i.rec&&i.playing);$('hwMute').classList.toggle('has',i.mutes>0);
 $('scrProg').textContent=i.prog==='chop'?'CHOP':'KIT';$('scrProg').classList.toggle('kit',i.prog!=='chop');
 $('scrInfo').textContent='SEQ '+String(i.pat).padStart(2,'0')+' · BANK '+i.bank+(i.prog==='chop'?' · SLICES '+(i.page*128+'ABCDEFGH'.indexOf(i.bank)*16+1)+'–'+(i.page*128+'ABCDEFGH'.indexOf(i.bank)*16+16):'')+' · TC '+i.tc+(i.mutes?' · '+i.mutes+' MUTED':'');
 const bl=document.querySelector('#bankGrp .hwl');if(bl)bl.textContent=i.prog==='chop'?'PAD BANK · CHOP PROGRAM'+(i.pages>1?' · PAGE '+(i.page+1)+'/'+i.pages:''):'PAD BANK · KIT PROGRAM';
 $('scrRec').hidden=!i.rec;$('scrTake').hidden=!i.take}

/* ---- display + song changes ---- */
function status(){const on=loaded();$$('.mode').forEach(a=>{if(a.dataset.page!=='start')a.classList.toggle('dim',!on)});$$('.next a').forEach(a=>a.classList.toggle('off',!on));
 keepLabels();if(!on)return;
 let nm='',cnt=0;const bpm=+($('bpm')||{}).value||0;try{nm=fname;cnt=slices.length}catch(e){}
 const cam=window.DBC?DBC.cam():'',kt=window.DBC?DBC.keyText():'';
 $('projName').textContent=(nm||'UNTITLED').toUpperCase();if(!$('projMeta').dataset.flash)$('projMeta').textContent=bpm.toFixed(1)+' BPM · '+(kt||'finding key')+(cam?' · '+cam:'')+' · '+cnt+' slices';
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

function init(){buildSubs();dnd();knobs();mountHW();jog();hwKeys();
 /* loading feedback: mirror the engine's status into the drop zone, the display and a message */
 const st=$('st'),lm=$('loadMsg');new MutationObserver(()=>{const t=st.textContent;if(/^(Loading|Decoding|Analyzing)/.test(t)){lm.textContent=t;lm.className='busy';$('projMeta').dataset.flash=1;$('projMeta').textContent=t.toUpperCase();document.body.classList.add('loading')}
  else if(/^Could not/.test(t)){lm.textContent=t;lm.className='err';delete $('projMeta').dataset.flash;document.body.classList.remove('loading');if(cur!=='start')goPage('start')}
  else if(document.body.classList.contains('loading')){document.body.classList.remove('loading');lm.textContent='';lm.className='';delete $('projMeta').dataset.flash}}).observe(st,{childList:true,characterData:true,subtree:true});
 const hint=$('psHint');if(hint)new MutationObserver(()=>{const t=hint.textContent.trim();if(t&&!(window.__sayT&&Date.now()-window.__sayT<4000))note(t)}).observe(hint,{childList:true,characterData:true,subtree:true});
 setInterval(()=>{hwSync();softSync()},250);
 const pick=$('gPick');if(pick){$('screen').insertBefore(pick,$('scrBody'));$$('[data-t]',pick).forEach(b=>{const m={A:'chop',P:'live',D:'keys',E:'parts',G:'groups',S:'sounds'};b.onclick=e=>{e.stopPropagation();goPage(m[b.dataset.t])}})}
 const pf=$('psPerf');if(pf)pf.hidden=true;const gt=$('gToast');if(gt)$('screen').appendChild(gt);
 $('menuBtn').onclick=()=>document.body.classList.toggle('modesopen');$('scrim').onclick=()=>document.body.classList.remove('modesopen');
 $$('a[data-page],button[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(!a.classList.contains('off'))goPage(a.dataset.page)}));
 addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(p&&p!==cur)goPage(p)});
 new MutationObserver(status).observe($('app'),{attributes:true,attributeFilter:['hidden']});
 setInterval(status,1000);status();
 const want=location.hash.slice(1);goPage(PAGES[want]&&loaded()?want:'start')}
init();
})();
