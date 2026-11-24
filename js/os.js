/* BC-16 STUDIO OS
   The machine is a rack of studio gear. The side rail switches units; each unit is its own piece of equipment.
   Two strips never change: the meter bridge on top (song, save, output, take record, help) and the
   transport bar on the bottom (record, play, stop, patterns, undo, back). Pads, banks and Q-link knobs
   sit in the PAD MATRIX unit, which docks beside the units that need it.
   This file only rearranges and adds; the engine (engine.js) and studio (studio.js) keep their element ids. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const el=(tag,props,html)=>{const e=document.createElement(tag);if(props)for(const[k,v]of Object.entries(props)){if(k==='class')e.className=v;else if(k.startsWith('data-'))e.setAttribute(k,v);else e[k]=v}if(html!=null)e.innerHTML=html;return e};
const API=()=>window.DBC_OS,ready=()=>!!(API()&&API().ready()&&!$('app').hidden);
const LSg=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const BL='ABCDEFGH',NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],nn=m=>NN[((m%12)+12)%12]+(Math.floor(m/12)-1);
const say=t=>{window.__sayT=Date.now();const s=$('st');if(s)s.textContent=t};
const go=p=>window.goPage&&goPage(p);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= the units ================= */
const I={
 home:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/><path d="M8 15h8"/>',
 chop:'<path d="M2 12h3l2-7 3 14 3-10 2 6 2-3h5"/><path d="M12 3v2M12 19v2"/>',
 kit:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>',
 pads:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
 seq:'<rect x="2" y="9" width="3.5" height="6" rx="1"/><rect x="7.5" y="9" width="3.5" height="6" rx="1"/><rect x="13" y="9" width="3.5" height="6" rx="1"/><rect x="18.5" y="9" width="3.5" height="6" rx="1"/><path d="M2 5h20"/>',
 keys:'<rect x="2" y="4" width="20" height="16" rx="1.5"/><path d="M6.5 4v10M11 4v10M15.5 4v10M2 9h20"/>',
 song:'<path d="M3 6h7M12 6h9M3 12h4M9 12h12M3 18h11M16 18h5"/>',
 live:'<rect x="3" y="3" width="8" height="8" rx="1.5"/><path d="M6 5.5l3 1.5-3 1.5z"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
 lab:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
 brain:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
 lib:'<path d="M4 4v16M8 4v16M12 5l4 15M17 4h3v16h-3z"/>',
 proj:'<path d="M4 4h12l4 4v12H4z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
 guide:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v14h-7"/>'};
const GROUPS=[
 {id:'home',l:'DECK',st:'01 SOURCE',pages:['start']},{id:'lib',l:'LIBRARY',pages:['factory','store']},
 {id:'chop',l:'CHOP',st:'02 SAMPLE',pages:['chop','slicer']},{id:'lab',l:'LAB',pages:['sounds','parts','groups']},
 {id:'kit',l:'KITS',st:'03 INSTRUMENTS',pages:['kit']},{id:'pads',l:'PADS',pages:['pads']},{id:'seq',l:'SEQ',pages:['sequence']},{id:'keys',l:'KEYS',pages:['tower','keys','live']},
 {id:'live',l:'LIVE',st:'04 PERFORM',pages:['launch','dj']},
 {id:'song',l:'SONG',st:'05 ARRANGE',pages:['build','song','arrange']},{id:'brain',l:'BRAIN',pages:['brain']},
 {id:'proj',l:'PROJECT',st:'06 FINISH',pages:['project']},{id:'guide',l:'GUIDE',pages:['guide']}];
const UNITS={
 start:{g:'home',n:'TAPE DECK',m:'TD-1',c:'#29e3ff',c2:'#7a5cff',d:'Load a song. Tempo, key and every hit are found for you.'},
 chop:{g:'chop',n:'SAMPLER',m:'CS-1',c:'#29e3ff',c2:'#00ffa3',d:'Set how the song is cut. The PAD MATRIX plays the cuts in order.'},
 slicer:{g:'chop',n:'SLICE BRAIN',m:'SX-1',c:'#29e3ff',c2:'#ff3df2',d:'Which chop fits this song, what every cut is, and how good it is.'},
 kit:{g:'kit',n:'KIT FORGE',m:'KF-2',c:'#ff8a1f',c2:'#ff2e6e',d:'Build your own kits: pick a slot, hold a cut, it lands.'},
 pads:{g:'pads',n:'DRUM MACHINE',m:'PM-16',c:'#ff3df2',c2:'#7a5cff',d:'Play and program the pads. Switch CHOP / KIT program.'},
 sequence:{g:'seq',n:'STEP SEQUENCER',m:'SQ-8',c:'#b6ff3b',c2:'#29e3ff',d:'Draw hits on the grid of the current pattern.'},
 tower:{g:'keys',n:'KEY TOWER',m:'KT-3',c:'#9b6bff',c2:'#ff3df2',d:'Three stacked keyboards, each with its own sound and octave.'},
 keys:{g:'keys',n:'PIANO',m:'KP-1',c:'#9b6bff',c2:'#29e3ff',d:'One sound across a piano, locked to the key.'},
 live:{g:'keys',n:'LAYER RIG',m:'LR-4',c:'#9b6bff',c2:'#ff8a1f',d:'Drum pads plus lead, chord and bass layers.'},
 build:{g:'song',n:'SONG BUILDER',m:'SB-16',c:'#ffd23e',c2:'#ff3df2',d:'Loop a part, play the next part over it, press NEXT PART. Repeat until the song is done.'},
 song:{g:'song',n:'SONG ARRANGER',m:'SA-8',c:'#ffd23e',c2:'#ff8a1f',d:'Put patterns in order and export the song.'},
 arrange:{g:'song',n:'AUTO PRODUCER',m:'AP-1',c:'#ffd23e',c2:'#ff3df2',d:'A new arrangement of the whole song, built for you.'},
 launch:{g:'live',n:'LAUNCH CONSOLE',m:'LC-8',c:'#ff315c',c2:'#ff8a1f',d:'All 8 patterns on one console. Tap to launch at the end of the bar loop.'},
 dj:{g:'live',n:'DJ MIXER',m:'DX-2',c:'#ff315c',c2:'#29e3ff',d:'Hot cues, loops, rolls, kills and filter.'},
 sounds:{g:'lab',n:'SOUND BROWSER',m:'SB-1',c:'#3d8bff',c2:'#29e3ff',d:'Every slice, take and added file.'},
 parts:{g:'lab',n:'STEM SPLITTER',m:'SS-4',c:'#3d8bff',c2:'#b6ff3b',d:'Split a stretch into drums, bass, vocals and melody.'},
 groups:{g:'lab',n:'SOUND SORTER',m:'GS-1',c:'#3d8bff',c2:'#ff3df2',d:'Slices that sound alike, gathered into groups.'},
 brain:{g:'brain',n:'BEAT BRAIN',m:'BB-9',c:'#ff6ad5',c2:'#7a5cff',d:'Presets, variations, full songs and smart kits.'},
 factory:{g:'lib',n:'PACK FACTORY',m:'PF-1',c:'#00e5a0',c2:'#29e3ff',d:'AI-generated sample packs in any genre, saved to your own library.'},
 store:{g:'lib',n:'PACK STORE',m:'PS-3',c:'#00e5a0',c2:'#ffd23e',d:'Free starter packs, premium drops and memberships.'},
 project:{g:'proj',n:'PROJECT MANAGER',m:'PM-1',c:'#7dd3fc',c2:'#ffd23e',d:'Reopen projects, versions, project files with audio, duplicate.'},
 floor:{g:'floor',n:'STUDIO FLOOR',m:'BC-16',c:'#29e3ff',c2:'#ff3df2',d:'Every machine in its place. Tap one to walk up to it.'},
 guide:{g:'guide',n:'STUDIO MANUAL',m:'OS',c:'#5effc8',c2:'#29e3ff',d:'Lessons, the button book and a demo that plays itself.'}};
const WITH_DECK=new Set(['chop','pads','sequence','launch','dj','sounds','build']);

/* ================= build the rack ================= */
function plate(name,model,id,extra){return '<div class="plate"'+(id?' data-panel="'+id+'"':'')+'><i class="pled"></i><b class="pn">'+name+'</b><span class="pm">'+model+'</span>'+(extra||'')+'<span class="vent"></span><span class="zm"><button class="zb" data-z="-1" title="Zoom out" aria-label="Zoom out">−</button><button class="zb" data-z="0" title="Fill the stage with this unit" aria-label="Focus this unit">⤢</button><button class="zb" data-z="1" title="Zoom in" aria-label="Zoom in">+</button></span></div>'}
function build(){
 document.body.classList.add('os');
 const dev=$('device'),top=$('hwTop');
 /* rail */
 const rail=el('nav',{id:'rail','aria-label':'Studio units'});
 rail.innerHTML='<div class="brand" aria-hidden="true"><b>BC</b><span>16</span></div>'+GROUPS.map((g,i)=>(g.st?'<span class="rst">'+g.st+'</span>':'')+'<button class="rb" data-grp="'+g.id+'" data-help="rail-'+g.id+'" title="'+g.l+(i<10?' (Alt+'+((i+1)%10)+')':'')+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+I[g.id]+'</svg><span>'+g.l+'</span><i class="rled"></i></button>').join('')+'<div class="rsp"></div><button class="rb sm" id="osCoach" data-help="osCoach" title="Coach on/off"><b>☰</b><span>COACH</span><i class="rled"></i></button><button class="rb sm" id="osExplain" data-help="osExplain" title="Explain mode (?)"><b>?</b><span>EXPLAIN</span><i class="rled"></i></button>';
 dev.prepend(rail);
 rail.addEventListener('click',e=>{const b=e.target.closest('.rb[data-grp]');if(!b)return;const g=GROUPS.find(x=>x.id===b.dataset.grp);const last=LSg('bc16:last:'+g.id,g.pages[0]);go(g.pages.includes(last)?last:g.pages[0])});
 /* meter bridge */
 const ol=$('oled');ol.insertAdjacentHTML('beforeend','<span id="osLine" aria-live="polite"></span>');
 const vu=el('div',{id:'vuGrp',class:'hwgrp'},'<span class="hwl">OUTPUT</span><div id="vu" data-help="vu"><canvas id="vuC" width="236" height="92"></canvas></div>');
 const kref=el('div',{id:'krefGrp',class:'hwgrp'},'<span class="hwl">KEYS</span><button class="hwb" id="osKeys" data-help="osKeys" title="Every keyboard shortcut (Shift+K)"><i class="led"></i>SHORTCUTS</button>');
 const save=el('div',{id:'saveGrp',class:'hwgrp'},'<span class="hwl">SETUP</span><button class="hwb" id="osSave" data-help="osSave"><i class="led"></i>SAVE</button>');
 top.insertBefore(vu,$('loadGrp'));$('loadGrp').after(save);save.after(kref);
 $('loadGrp').querySelector('.hwl').textContent='SONG';
 /* stage */
 const stage=el('main',{id:'stage'});
 const sub=el('div',{id:'subBar'},'<button class="stab back" id="subBack" data-help="osBack">◀ <span>BACK</span></button><div id="unitTag"><i></i><b id="unitName"></b><span id="unitModel"></span><em id="unitDesc"></em></div><div id="subTabs" role="tablist"></div><button class="stab nextu" id="subNext" data-help="subNext" hidden></button>');
 stage.append(sub);
 const sw=$('screenWrap');sw.insertAdjacentHTML('afterbegin',plate('SAMPLER','CS-1','screen'));sw.classList.add('unit');stage.append(sw);
 const deck=el('section',{id:'deck',class:'unit'});deck.innerHTML=plate('PAD MATRIX','PM-16','deck','<button id="deckProg" class="pchip" data-help="scrProg">CHOP</button>');
 ['knobGrp','bankGrp','padsSlot','fnGrp','dataGrp'].forEach(id=>{const x=$(id);if(x)deck.append(x)});stage.append(deck);
 const kg=deck.querySelector('#knobGrp');if(kg){kg.insertAdjacentHTML('beforeend','<div class="autoBar" data-help="autoBar"><span>AUTOMATION</span><div class="seg" id="autoSeg"><button data-m="off">OFF</button><button data-m="read">READ</button><button data-m="write">WRITE</button></div><button class="chip" id="autoClr">CLEAR</button><i id="autoDot"></i></div>');kg.querySelector('#autoSeg').onclick=e=>{const b=e.target.closest('[data-m]');if(!b||!need())return;API().autoMode(b.dataset.m);autoSync();say(b.dataset.m==='write'?'WRITE: press PLAY and move FILTER, PUMP or SWING. The moves record into the pattern as automation.':b.dataset.m==='read'?'READ: the pattern plays back its knob moves.':'Automation off: knobs stay where you leave them.')};kg.querySelector('#autoClr').onclick=()=>{if(!need())return;API().autoClear();say('Automation cleared from P'+(API().pat()+1)+'. UNDO brings it back.')}}
 const bs=deck.querySelector('#banksSlot');if(bs){bs.insertAdjacentHTML('beforebegin','<button class="hwb sq bstep" id="bankPrev" data-help="bankStep" title="Previous bank (←)"><i class="led"></i>◀</button>');bs.insertAdjacentHTML('afterend','<button class="hwb sq bstep" id="bankNext" data-help="bankStep" title="Next bank (→)"><i class="led"></i>▶</button>');bs.parentElement.classList.add('bankrow');deck.querySelector('#bankPrev').onclick=()=>{if(need()){const b=API().bankStep(-1);say('Pad bank '+BL[b]+'.')}};deck.querySelector('#bankNext').onclick=()=>{if(need()){const b=API().bankStep(1);say('Pad bank '+BL[b]+'.')}}}
 stage.append(buildKit(),buildTower(),buildLaunch(),buildGuide(),buildBuilder(),buildFactory(),buildStore(),buildSlicer(),buildProject());
 /* transport bar */
 const bar=el('footer',{id:'tbar'});
 const pat=el('div',{id:'patGrp',class:'hwgrp'},'<span class="hwl">PATTERN</span><div id="patDeck"><button class="hwb sq" id="osPatPrev" data-help="osPatPrev" title="Previous pattern (Shift+←)"><i class="led"></i>◀</button><div id="patLcd" data-help="patLcd"><b id="patNum">P01</b><span id="patInfo">—</span><i id="patProg"><u></u></i></div><button class="hwb sq" id="osPatNext" data-help="osPatNext" title="Next pattern (Shift+→)"><i class="led"></i>▶</button></div>');
 pat.querySelector('#patDeck').append($('seqSlot'));
 pat.querySelector('#patDeck').insertAdjacentHTML('beforeend','<button class="hwb sq" id="osPatHalf" data-help="osPatHalf" title="Show P1–P8 or P9–P16"><i class="led"></i>9–16</button><button class="hwb" id="osPatDup" data-help="osPatDup"><i class="led"></i>COPY ▶</button><button class="hwb" id="osPatClr" data-help="osPatClr"><i class="led"></i>CLEAR</button><button class="hwb np" id="osNext" data-help="osNext"><i class="led"></i>NEXT PART ▶</button>');
 const ed=el('div',{id:'editGrp',class:'hwgrp'},'<span class="hwl">EDIT</span><div><button class="hwb" id="osUndo" data-help="osUndo"><i class="led"></i>UNDO</button><button class="hwb" id="osBack" data-help="osBack" title="Back to the last unit (`)"><i class="led"></i>◀ BACK</button></div>');
 bar.append($('trGrp'),pat,ed);
 dev.append(stage,bar);
 ['ctlL','ctlR'].forEach(id=>{const x=$(id);if(x)x.hidden=true});
 const gt=$('gToast');if(gt){document.body.append(gt);let tt=null;new MutationObserver(()=>{if(gt.hidden)return;clearTimeout(tt);tt=setTimeout(()=>{gt.hidden=true},9000)}).observe(gt,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden']})}
 /* coach / explain layers */
 document.body.insertAdjacentHTML('beforeend','<div id="coach" hidden><div id="spot"></div><div id="ccard" role="dialog" aria-live="polite"><div class="cbar"><i id="cprog"></i></div><small id="cstep"></small><h3 id="ctitle"></h3><p id="ctext"></p><div class="cbtn"><button id="cprev">◀ Back</button><button id="cexit">Exit</button><button id="cplay" class="conly">❚❚ Pause</button><button id="cnext" class="p">Next ▶</button></div><div class="crow conly"><button id="cvoice">🔊 Voice on</button><select id="cWho" aria-label="Narrator"><option value="0">Studio voice (soft)</option><option value="1">My device’s voice</option></select><select id="cRate" aria-label="Narration speed"><option value="0.75">Very slow</option><option value="0.88">Slow and clear</option><option value="1">Normal</option><option value="1.15">Faster</option></select><select id="cChap" aria-label="Jump to chapter"></select></div></div><div id="ghost"><i></i></div></div><div id="xbub" hidden><b></b><p></p><small>Explain mode is on: buttons explain themselves instead of acting. Press ? or Esc to turn it off.</small></div>');
 /* status line mirror */
 const st=$('st');const mirror=()=>{$('osLine').textContent=st.textContent};new MutationObserver(mirror).observe(st,{childList:true,characterData:true,subtree:true});mirror();
 /* wiring */

 $('osPatPrev').onclick=()=>patStep(-1);$('osPatHalf').onclick=()=>{PH.manual=PH.half?0:1;PH.half=PH.manual;PH.t=Date.now();halfSync()};$('osNext').onclick=()=>nextPart();$('osPatNext').onclick=()=>patStep(1);
 $('osPatDup').onclick=()=>{if(!need())return;const t=API().dupPat();say(t<0?'All 8 patterns have hits. Clear one first.':'Copied into P'+(t+1)+' and switched to it. Change it to make a variation.')};
 $('osPatClr').onclick=async()=>{if(!need())return;const P=API().pat();if(!API().pats()[P].hits){say('P'+(P+1)+' is already empty.');return}if(!await ask('Clear every hit in pattern P'+(P+1)+'? UNDO brings it back.'))return;API().clearPat();say('Cleared P'+(P+1)+'. Press UNDO to bring it back.')};
 $('osKeys').onclick=keysOverlay;
 $('osUndo').onclick=()=>{if(need())API().undo()};
 $('osBack').onclick=back;$('subBack').onclick=back;
 document.body.insertAdjacentHTML('beforeend','<button id="focusExit" hidden>✕ Show all units</button>');$('focusExit').onclick=()=>{const u=$$('#stage .unit.focus')[0];if(u)zoom(u,0)};
 $('deckProg').onclick=()=>{const b=$('scrProg');if(b)b.click()};
 stage.addEventListener('click',e=>{const z=e.target.closest('.zb');if(!z)return;const u=z.closest('.unit');zoom(u,+z.dataset.z)});
 stage.addEventListener('dblclick',e=>{const p=e.target.closest('.plate');if(p&&!e.target.closest('button'))zoom(p.closest('.unit'),0)});
 $('osExplain').onclick=()=>explain(!document.body.classList.contains('explain'));$('osCoach').onclick=()=>coachToggle(!CO.on);
}
const fnameSafe=()=>{try{return fname}catch(e){return'this song'}};
function need(){if(!ready()){say('Load a song first: press LOAD on the meter bridge, or try the demo beat on the TAPE DECK.');return false}if(window.DBC)DBC.ensure();return true}

/* ================= zoom and focus ================= */
function zoomKey(u){return'bc16:zoom:'+document.body.dataset.pg+':'+u.id}
function zoom(u,d){if(!u)return;if(d===0){const on=!u.classList.contains('focus');$$('#stage .unit.focus').forEach(x=>x.classList.remove('focus'));u.classList.toggle('focus',on);document.getElementById('stage').classList.toggle('focusing',on);$('focusExit').hidden=!on;say(on?'Focused on '+u.querySelector('.pn').textContent+'. Press ⤢ again to bring the other units back.':'All units back on the stage.');return}
 let z=LSg(zoomKey(u),1);z=Math.round(Math.max(.6,Math.min(1.6,z+d*.1))*10)/10;LSs(zoomKey(u),z);applyZoom(u);say(u.querySelector('.pn').textContent+' zoom '+Math.round(z*100)+'%')}
function applyZoom(u){const z=LSg(zoomKey(u),1),b=u.querySelector(':scope > :not(.plate)')?u:null;u.style.setProperty('--uz',z);u.classList.toggle('zoomed',z!==1)}

/* ================= pages ================= */
let curP='start',hist=[];
function page(p,prev){curP=p;const U=UNITS[p]||UNITS.start;const g=GROUPS.find(x=>x.pages.includes(p))||{id:'floor',pages:['floor']};
 if(prev&&prev!==p)leave(prev,p);if(p!=='kit')pickFrom=null;if(prev&&prev!==p&&!backing){hist.push(prev);if(hist.length>30)hist.shift()}backing=false;
 LSs('bc16:last:'+g.id,p);
 const B=document.body;B.dataset.pg=p;B.dataset.grp=g.id;B.style.setProperty('--acc',U.c);B.style.setProperty('--acc2',U.c2);B.classList.toggle('deck',WITH_DECK.has(p));
 $$('#rail .rb[data-grp]').forEach(b=>b.classList.toggle('on',b.dataset.grp===g.id));{const h=$('osHome');if(h)h.classList.toggle('on',p==='floor')}
 $('unitName').textContent=U.n;$('unitModel').textContent=U.m;$('unitDesc').textContent=U.d;
 const tabs=$('subTabs');tabs.textContent='';if(g.pages.length>1)g.pages.forEach(q=>{const b=el('button',{class:'stab'+(q===p?' on':''),role:'tab'},'<i></i>'+UNITS[q].n);b.onclick=()=>go(q);tabs.append(b)});
 const sp=$('screenWrap').querySelector('.plate');sp.querySelector('.pn').textContent=U.n;sp.querySelector('.pm').textContent=U.m;
 $$('#stage .unit').forEach(u=>{u.classList.remove('focus');applyZoom(u)});$('stage').classList.remove('focusing');$('focusExit').hidden=true;
 if((p==='sequence'||p==='launch'||p==='build')&&ready()&&API().song().follow&&!API().playing())API().followCur();if(p==='kit')kitRender();if(p==='build')buildRender();if(p==='factory')pfRender();if(p==='store')storeRender();if(p==='slicer')slicerRender();if(p==='project')projRender();if(p==='start')resumeOffer();if(p==='tower')towerRender();if(p==='launch')launchRender();if(p==='guide')guideRender();
 {const fi=FLOW.findIndex(f=>f[0]===p),nx=FLOW[fi+1],sn=$('subNext');sn.hidden=fi<0||!nx;if(nx){sn.innerHTML='<small>STEP '+(fi+1)+' OF '+FLOW.length+'</small> NEXT: '+UNITS[nx[0]].n+' ▶';sn.onclick=()=>go(nx[0])}}
 $('osBack').disabled=!hist.length;const pb=hist[hist.length-1];$('subBack').hidden=!pb;if(pb)$('subBack').querySelector('span').textContent=(UNITS[pb]||{n:'BACK'}).n;
 if(coach&&coach.mode==='tour')setTimeout(coachPlace,80);CO.last=null;CO.sig='';coachRender()}
let backing=false;
function back(){const p=hist.pop();if(!p){say('Nothing to go back to yet.');return}backing=true;go(p)}

/* ================= pattern deck ================= */
function patStep(d){if(!need())return;const A=API(),N=A.nPats(),q=A.queued(),c=q!=null?q:A.pat();const n=(c+d+N)%N;A.selPat(n);say(A.playing()?'P'+(n+1)+' plays when the current pattern finishes. Press again to keep stepping.':'Now on pattern P'+(n+1)+'.')}
function patSync(){const A=API();if(!A||!ready()){$('patNum').textContent='P--';$('patInfo').textContent='NO SONG';return}
 let P,ps;try{P=A.pat();ps=A.patMeta()}catch(e){return}const q=A.queued(),info=ps[P];
 $('patNum').textContent='P'+String(P+1).padStart(2,'0')+(q!=null?' → P'+String(q+1).padStart(2,'0'):'');
 $('patInfo').textContent=info.bars+' BAR'+(info.bars>1?'S':'')+' · '+info.hits+' HITS'+(A.rec()?' · REC':'');
 $('patProg').firstChild.style.width=(A.playing()?A.pos()*100:0)+'%';$('patLcd').classList.toggle('q',q!=null);$('patLcd').classList.toggle('rec',A.rec());
 if(curP==='launch')launchSync(ps,P,q);autoSync();if(curP==='build')buildSync();halfAuto(q!=null?q:P)}
const PH={half:0,manual:null,t:0};
function autoSync(){const A=API();if(!A||!$('autoSeg'))return;let m='read',n=0;try{m=A.autoMode();const L=A.autoLanes();n=Object.values(L).reduce((a,x)=>a+(x?x.length:0),0)}catch(e){}$$('#autoSeg [data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===m));const d=$('autoDot');d.className=m==='write'&&A.playing()?'w':n?'h':'';d.title=n+' automation points in this pattern'}
function halfAuto(c){const h=c>=8?1:0;if(PH.manual!=null&&Date.now()-PH.t<6000)return;PH.manual=null;if(h!==PH.half){PH.half=h;halfSync()}}
function halfSync(){$$('#psPats .bkb').forEach((b,i)=>b.classList.toggle('ph',Math.floor(i/8)!==PH.half));$('osPatHalf').lastChild.textContent=PH.half?'1–8':'9–16'}

/* ================= VU meter ================= */
let vuL=0,vuPk=0,vuPkT=0,vuBG=null,vuLast=-1,vuT=0;
function vuFace(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f3e6c1');g.addColorStop(1,'#d8c79a');x.fillStyle=g;x.fillRect(0,0,W,H);
 const cx=W/2,cy=H*1.55,R=H*1.28;x.lineWidth=2;for(let i=0;i<=10;i++){const a=-Math.PI/2+(-0.62+1.24*i/10);x.strokeStyle=i>=8?'#c3262e':'#2a2620';const r0=R-(i%2?8:13);x.beginPath();x.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);x.stroke()}
 x.strokeStyle='#c3262e';x.lineWidth=4;x.beginPath();x.arc(cx,cy,R+2,-Math.PI/2+.62*.6,-Math.PI/2+.62);x.stroke();x.fillStyle='#2a2620';x.font='600 13px "Martian Mono",monospace';x.textAlign='center';x.fillText('VU',cx,H*.78);return c}
function vuDraw(ts){if(document.hidden)return;if(ts-vuT<33)return;vuT=ts;const c=$('vuC');if(!c||!c.offsetParent)return;let lv=[0,0];try{if(API())lv=API().level()}catch(e){}
 const db=20*Math.log10(Math.max(1e-5,lv[0]*1.414)),f=Math.max(0,Math.min(1,(db+30)/33));vuL+=(f-vuL)*(f>vuL?.45:.12);
 const pk=lv[1];if(pk>.97){vuPk=1;vuPkT=ts}else if(ts-vuPkT>900)vuPk=0;$('vu').classList.toggle('pk',!!vuPk);
 const q=Math.round(vuL*400);if(q===vuLast)return;vuLast=q;const x=c.getContext('2d'),W=c.width,H=c.height;if(!vuBG)vuBG=vuFace(W,H);x.drawImage(vuBG,0,0);
 const cx=W/2,cy=H*1.55,R=H*1.28,a=-Math.PI/2-0.66+1.32*vuL;x.strokeStyle='#111';x.lineWidth=2.2;x.beginPath();x.moveTo(cx+Math.cos(a)*(R*.42),cy+Math.sin(a)*(R*.42));x.lineTo(cx+Math.cos(a)*(R+4),cy+Math.sin(a)*(R+4));x.stroke()}

/* ================= KIT FORGE ================= */
const KF={bank:0,armed:0,page:0,per:16,filt:'all',list:null,key:''};
function buildKit(){const u=el('section',{id:'osKit',class:'unit'});
 u.innerHTML='<div class="kfwrap"><div class="kfrack" id="kfRack">'+plate('KIT RACK','KR-16','kfRack')+
 '<div class="kfbody"><div class="kfbanks" id="kfBanks" data-help="kfBanks"></div><div class="kfslots" id="kfSlots" data-help="kfSlots"></div>'+
 '<div class="kfauto" data-help="kfAuto"><span class="hwl">AUTO-FILL</span><div class="kfsrow"><select id="kfHow"><option value="roles">MPC drum layout (kick, snare, hats, percs, tones)</option><option value="best">Best cuts, highest score first</option><option value="order">Cuts in order from this library page</option><option value="tonal">Best tonal stabs (for melodies)</option><option value="loops">Loops (2 beats and longer)</option></select><label class="sbchk"><input type="checkbox" id="kfRep"> replace</label><button class="hwb np" id="kfFill"><i class="led"></i>FILL</button></div><label class="sbchk"><input type="checkbox" id="kfRoles" checked> show MPC roles on empty slots</label></div><div class="kfsug" id="kfSug" data-help="kfSug"></div>'+
 '<div class="kfact"><button class="hwb np" id="kfDone" hidden><i class="led"></i>◀ DONE, BACK TO PADS</button><button class="hwb" id="kfClr" data-help="kfClr"><i class="led"></i>CLEAR SLOT</button><button class="hwb" id="kfClrB" data-help="kfClrB"><i class="led"></i>CLEAR BANK</button><button class="hwb" id="kfPads" data-help="kfPads"><i class="led"></i>PLAY ON PADS ▶</button></div>'+
 '<div class="kfsave" data-help="kfSave"><span class="hwl">MY KITS</span><div class="kfsrow"><input id="kfName" placeholder="Kit name, e.g. Flint knock" maxlength="32"><button class="hwb" id="kfSv"><i class="led"></i>SAVE KIT</button></div><div id="kfList"></div></div></div></div>'+
 '<div class="kflib" id="kfLib">'+plate('CUT LIBRARY','CL-640','kfLib')+
 '<div class="kfbody"><div class="kfnav"><button class="hwb sq" id="kfFirst" title="First page"><i class="led"></i>⏮</button><button class="hwb sq" id="kfPrev" data-help="kfPrev" title="Previous page (PgUp)"><i class="led"></i>◀</button><div class="kflcd" id="kfLcd" data-help="kfLcd"><b></b><span></span></div><button class="hwb sq" id="kfNext" data-help="kfPrev" title="Next page (PgDn)"><i class="led"></i>▶</button><button class="hwb sq" id="kfLast" title="Last page"><i class="led"></i>⏭</button><select id="kfPer" title="Cuts per page" data-help="kfPer"><option value="16">16 / page</option><option value="32">32 / page</option><option value="64">64 / page</option></select></div>'+
 '<div class="kffilt" id="kfFilt" data-help="kfFilt"></div><div class="kfcuts" id="kfCuts" data-help="kfCuts"></div><p class="kfhint" id="kfHint">Tap a cut to hear it. Hold it, or drag it, to drop it into the lit slot.</p></div></div></div>';
 return u}
function kitList(){const A=API();const n=A.nSlices(),key=n+'|'+KF.filt+'|'+fnameSafe();if(KF.list&&KF.key===key)return KF.list;const L=[];for(let i=0;i<n;i++){const s=A.slice(i);if(!s)continue;if(KF.filt==='all'||(KF.filt==='tone'?(s.kind==='tone'||s.tonal):s.kind===KF.filt))L.push(i)}KF.list=L;KF.key=key;KF.page=Math.min(KF.page,Math.max(0,Math.ceil(L.length/KF.per)-1));return L}
function kitWire(){
 $('kfFilt').innerHTML=[['all','ALL'],['kick','KICK'],['snare','SNARE'],['hat','HAT'],['tone','TONE']].map(([f,t])=>'<button class="chip" data-f="'+f+'">'+t+'</button>').join('');
 $('kfFilt').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;KF.filt=b.dataset.f;KF.page=0;KF.list=null;kitRender()};
 $('kfPer').onchange=e=>{KF.per=+e.target.value;KF.page=0;kitRender()};
 const pg=d=>{const L=kitList(),N=Math.max(1,Math.ceil(L.length/KF.per));KF.page=d==='f'?0:d==='l'?N-1:Math.max(0,Math.min(N-1,KF.page+d));kitRender()};
 $('kfPrev').onclick=()=>pg(-1);$('kfNext').onclick=()=>pg(1);$('kfFirst').onclick=()=>pg('f');$('kfLast').onclick=()=>pg('l');KF.pg=pg;
 $('kfBanks').onclick=e=>{const b=e.target.closest('button');if(!b)return;KF.bank=+b.dataset.b;API().setBank(KF.bank);kitArmNext(true);kitRender()};
 $('kfClr').onclick=()=>{if(!need())return;API().clear(KF.bank,KF.armed);kitRender();say('Cleared slot '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+'. UNDO brings it back.')};
 $('kfClrB').onclick=async()=>{if(!need())return;if(!await ask('Clear all 16 slots in kit bank '+BL[KF.bank]+'? UNDO brings them back.'))return;API().clearBank(KF.bank);KF.armed=0;kitRender()};
 KF.roles=true;$('kfRoles').onchange=e=>{KF.roles=e.target.checked;kitRender()};$('kfFill').onclick=()=>autoFill($('kfHow').value,$('kfRep').checked);
 holdable($('kfSug'),'.kc',(t)=>API().hear({k:'slice',ci:+t.dataset.ci}),(t)=>kitDrop(+t.dataset.ci,KF.armed),{drag:(t,slot)=>kitDrop(+t.dataset.ci,+slot.dataset.j),target:'#kfSlots .ks'});
 $('kfDone').onclick=()=>{const f=pickFrom&&pickFrom.from;pickFrom=null;if(f)go(f);else back()};
 $('kfPads').onclick=()=>{if(!need())return;API().setProg('kit');API().setBank(KF.bank);go('pads');say('The PAD MATRIX now plays kit bank '+BL[KF.bank]+' (KIT program).')};
 $('kfSv').onclick=()=>{if(!need())return;const n=$('kfName').value.trim()||('Kit '+BL[KF.bank]+' '+new Date().toLocaleDateString());if(!API().kit(KF.bank).some(Boolean)){say('Bank '+BL[KF.bank]+' is empty. Load some slots first.');return}API().saveKit(n,KF.bank);$('kfName').value='';kitRender();say('Saved “'+n+'”. Tap it under MY KITS to load it into any bank.')};
 $('kfList').onclick=async e=>{const x=e.target.closest('.kdel'),b=e.target.closest('.kload');if(x){if(await ask('Delete the saved kit “'+x.dataset.n+'”?')){API().delKit(x.dataset.n);kitRender()}return}if(b){if(!need())return;API().loadKit(b.dataset.n,KF.bank);kitRender();say('Loaded “'+b.dataset.n+'” into bank '+BL[KF.bank]+'.')}};
 /* slots: tap = choose (and hear); the lit slot is where the next cut lands */
 holdable($('kfSlots'),'.ks',(t)=>{KF.armed=+t.dataset.j;API().hear({k:'kit',b:KF.bank,j:KF.armed});kitRender()},(t)=>{KF.armed=+t.dataset.j;kitRender();say('Slot '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+' is lit. Now hold a cut in the CUT LIBRARY.')});
 /* cuts: tap = hear, hold = drop into the lit slot, drag = drop on any slot */
 holdable($('kfCuts'),'.kc',(t)=>{API().hear({k:'slice',ci:+t.dataset.ci});$$('#kfCuts .kc.aud').forEach(x=>x.classList.remove('aud'));t.classList.add('aud')},(t)=>kitDrop(+t.dataset.ci,KF.armed),{drag:(t,slot)=>kitDrop(+t.dataset.ci,+slot.dataset.j),target:'#kfSlots .ks'});
}
function kitDrop(ci,j){if(!need())return;if(!API().put(ci,KF.bank,j))return;const s=API().slice(ci);const was=j;say('Cut '+s.name+' → slot '+BL[KF.bank]+String(j+1).padStart(2,'0')+'.'+(pickFrom?' Press ◀ BACK to return to the pads, or keep filling.':''));KF.armed=j;kitArmNext(false);kitRender();const sl=$('kfSlots').querySelector('[data-j="'+was+'"]');if(sl){sl.classList.add('land');setTimeout(()=>sl.classList.remove('land'),700)}}
function kitArmNext(fromStart){const K=API().kit(KF.bank);const order=[...Array(16).keys()];const start=fromStart?0:KF.armed+1;for(let k=0;k<16;k++){const j=(start+k)%16;if(!K[j]){KF.armed=j;return}}}
let pickFrom=null;
function pick(b,j){pickFrom={b,j,from:curP};KF.bank=b;KF.armed=j;go('kit');say('Choosing a sound for pad '+BL[b]+String(j+1).padStart(2,'0')+'. Page through the CUT LIBRARY, tap to hear, hold the one you want.')}
function kitRender(){if(!ready()){$('kfSlots').innerHTML='<p class="empty">Load a song to forge kits from its cuts.</p>';$('kfCuts').textContent='';return}
 const A=API(),K=A.kit(KF.bank);
 $('kfBanks').innerHTML=BL.split('').map((L,b)=>{const n=A.kit(b).filter(Boolean).length;return'<button class="bkx'+(b===KF.bank?' on':'')+(n?' has':'')+'" data-b="'+b+'">'+L+'<small>'+n+'/16</small></button>'}).join('');
 $('kfSlots').innerHTML=[12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3].map(j=>{const p=K[j];return'<button class="ks'+(p?'':' emp')+(j===KF.armed?' arm':'')+'" data-j="'+j+'" style="--pc:'+(p?p.col:'#555')+'"><span class="kn">'+BL[KF.bank]+String(j+1).padStart(2,'0')+'</span><span class="knm">'+(p?esc(p.name):(KF.roles?ROLES[j][0]:'EMPTY'))+'</span></button>'}).join('');
 const L=kitList(),N=Math.max(1,Math.ceil(L.length/KF.per)),from=KF.page*KF.per,ids=L.slice(from,from+KF.per);
 $('kfLcd').querySelector('b').textContent=L.length?'CUTS '+(from+1)+'–'+Math.min(L.length,from+KF.per):'NO CUTS';$('kfLcd').querySelector('span').textContent='PAGE '+(KF.page+1)+'/'+N+' · '+L.length+' '+(KF.filt==='all'?'TOTAL':KF.filt.toUpperCase());
 $('kfPrev').disabled=$('kfFirst').disabled=KF.page<=0;$('kfNext').disabled=$('kfLast').disabled=KF.page>=N-1;
 $$('#kfFilt .chip').forEach(b=>b.classList.toggle('on',b.dataset.f===KF.filt));
 const bpm=+($('bpm')||{}).value||90;$('kfCuts').dataset.per=KF.per;
 $('kfCuts').innerHTML=ids.map(ci=>{const s=A.slice(ci),bt=s.dur*bpm/60;return'<button class="kc" data-ci="'+ci+'" style="--pc:'+s.col+'"><canvas width="120" height="40"></canvas><b>#'+(ci+1)+'</b><span>'+(s.kind||'cut').toUpperCase()+(s.tonal&&s.midi!=null?' · '+nn(Math.round(s.midi)):'')+'</span><em>'+(bt<1?bt.toFixed(2):bt.toFixed(1))+' BT</em></button>'}).join('')||'<p class="empty">No cuts match this filter.</p>';
 $$('#kfCuts .kc').forEach(c=>wave(c.querySelector('canvas'),A.slice(+c.dataset.ci)));
 const ks=A.kits();$('kfList').innerHTML=ks.length?ks.map(n=>'<span class="kchip"><button class="kload" data-n="'+esc(n)+'">'+esc(n)+'</button><button class="kdel" data-n="'+esc(n)+'" aria-label="Delete '+esc(n)+'">×</button></span>').join(''):'<em>No saved kits for this song yet. Build a bank, name it, press SAVE KIT.</em>';
 $('kfDone').hidden=!pickFrom;kitSuggest();$('kfHint').textContent='Lit slot: '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+'. Tap a cut to hear it. Hold it (½ s) or drag it onto a slot to drop it in. The next empty slot lights up by itself.'}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function wave(cv,s){if(!cv||!s)return;try{const d=chs[0],x=cv.getContext('2d'),W=cv.width,H=cv.height,len=s.e-s.s,st=Math.max(1,Math.floor(len/W));x.clearRect(0,0,W,H);x.fillStyle=s.col;x.globalAlpha=.9;
 let mx=0;for(let i=s.s;i<s.e;i+=st)mx=Math.max(mx,Math.abs(d[i]||0));const k=mx>0?(H/2-2)/mx:1;
 for(let px=0;px<W;px++){let lo=0,hi=0;const a=s.s+Math.floor(px*len/W),b=Math.min(s.e,a+Math.ceil(len/W));for(let i=a;i<b;i+=Math.max(1,Math.floor((b-a)/24))){const v=d[i]||0;if(v<lo)lo=v;if(v>hi)hi=v}x.fillRect(px,H/2-hi*k,1,Math.max(1,(hi-lo)*k))}}catch(e){}}
/* tap / hold / drag on grid children */
function holdable(root,sel,tap,hold,dd){let T=null;
 root.addEventListener('pointerdown',e=>{const t=e.target.closest(sel);if(!t||e.button>0)return;if(document.body.classList.contains('explain'))return;e.preventDefault();
  T={t,x:e.clientX,y:e.clientY,held:false,drag:null,id:e.pointerId};t.classList.add('press');
  T.tm=setTimeout(()=>{if(!T||T.drag)return;T.held=true;t.classList.remove('press');t.classList.add('held');setTimeout(()=>t.classList.remove('held'),500);hold(t)},450)});
 addEventListener('pointermove',e=>{if(!T||e.pointerId!==T.id||T.held||!dd)return;const dx=e.clientX-T.x,dy=e.clientY-T.y;
  if(!T.drag&&Math.hypot(dx,dy)>10){clearTimeout(T.tm);T.drag=el('div',{class:'dragghost'},T.t.innerHTML);document.body.append(T.drag);T.t.classList.remove('press')}
  if(T.drag){T.drag.style.transform='translate('+(e.clientX-40)+'px,'+(e.clientY-30)+'px)';$$(dd.target).forEach(s=>s.classList.remove('over'));const o=document.elementFromPoint(e.clientX,e.clientY);const s=o&&o.closest(dd.target);if(s)s.classList.add('over')}});
 const end=e=>{if(!T||e.pointerId!==T.id)return;clearTimeout(T.tm);T.t.classList.remove('press');
  if(T.drag){T.drag.remove();$$(dd.target).forEach(s=>s.classList.remove('over'));const o=document.elementFromPoint(e.clientX,e.clientY),s=o&&o.closest(dd.target);if(s&&e.type==='pointerup')dd.drag(T.t,s)}
  else if(!T.held&&e.type==='pointerup')tap(T.t);T=null};
 addEventListener('pointerup',end);addEventListener('pointercancel',end);
 root.addEventListener('contextmenu',e=>{if(e.target.closest(sel))e.preventDefault()});
 root.addEventListener('keydown',e=>{const t=e.target.closest(sel);if(!t)return;if(e.key==='Enter'&&e.shiftKey){e.preventDefault();hold(t)}else if(e.key===' '||e.key==='Enter'){e.preventDefault();tap(t)}})}

/* ================= KEY TOWER ================= */
const TW={tiers:[{oct:2,i:0,vol:.9,hold:false,mute:false,stack:false},{oct:3,i:1,vol:.85,hold:false,mute:false,stack:false},{oct:4,i:2,vol:.85,hold:false,mute:false,stack:false}],lock:true,labels:true,midi:0,list:[],key:'',built:'',ons:new Map()};
const ZROW='zsxdcvgbhnjm,l.;/',QROW='q2w3er5t6y7ui9o0p';
function buildTower(){const u=el('section',{id:'osTower',class:'unit'});
 u.innerHTML=plate('KEY TOWER','KT-3','osTower','<span class="pchip ro" id="twKey" data-help="twKey">KEY —</span>')+
 '<div class="twtop"><button class="hwb" id="twLock" data-help="twLock"><i class="led"></i>SCALE LOCK</button><button class="hwb" id="twLab" data-help="twLab"><i class="led"></i>KEY LABELS</button><span class="twmidi" id="twMidi" data-help="twMidi">MIDI: not connected</span><span class="twrec" data-help="twRec">Press <b>REC</b> then <b>PLAY</b> in the transport bar to record the keys into the pattern.</span></div>'+
 '<div class="tiers" id="twTiers"></div>';
 return u}
function towerList(){const A=API();const key=A.nSlices()+'|'+fnameSafe()+'|'+BL.split('').map((_,b)=>A.kit(b).filter(Boolean).length).join(',');if(TW.key===key)return TW.list;
 const L=[];for(let b=0;b<8;b++)A.kit(b).forEach((p,j)=>{if(p)L.push({src:{k:'kit',b,j},name:'KIT '+BL[b]+String(j+1).padStart(2,'0')+' '+p.name,tonal:p.midi!=null})});
 const T=[],O=[];for(let i=0;i<A.nSlices();i++){const s=A.slice(i);if(!s)continue;(s.tonal?T:O).push({src:{k:'slice',ci:i},name:'CUT #'+(i+1)+' '+(s.kind||'').toUpperCase()+(s.tonal&&s.midi!=null?' ('+nn(Math.round(s.midi))+')':''),tonal:s.tonal,midi:s.midi})}
 const full=[...T,...L.filter(x=>x.tonal),...L.filter(x=>!x.tonal),...O.filter(x=>x.name.includes('TONE')),...O.filter(x=>!x.name.includes('TONE'))];
 if(TW.key.split('|')[1]!==fnameSafe()){const lo=[...T].sort((a,b)=>(a.midi||60)-(b.midi||60));TW.tiers[0].i=Math.max(0,full.indexOf(lo[0]||full[0]));TW.tiers[1].i=Math.min(full.length-1,Math.max(0,full.indexOf(T[Math.floor(T.length/2)]||full[1])));TW.tiers[2].i=Math.min(full.length-1,Math.max(0,full.indexOf(T[T.length-1]||full[2])))}
 TW.list=full;TW.key=key;return full}
function towerRender(){const box=$('twTiers');if(!ready()){box.innerHTML='<p class="empty">Load a song: its tonal cuts and your kit pads become the tower’s sounds.</p>';return}
 const A=API(),L=towerList(),root=A.root(),steps=A.scaleSteps();$('twKey').textContent='KEY '+NN[root]+' '+(A.scale()||'').toUpperCase();
 $('twLock').classList.toggle('on',TW.lock);$('twLab').classList.toggle('on',TW.labels);
 const w=box.clientWidth||1100,octs=Math.max(1,Math.min(4,Math.floor((w-340)/(7*40)))),sig=octs+'|'+TW.labels+'|'+TW.lock+'|'+root+'|'+A.scale()+'|'+TW.tiers.map(t=>t.oct+':'+t.i+':'+t.hold+':'+t.mute+':'+t.stack).join(',')+'|'+L.length+'|'+TW.midi;
 if(TW.built===sig)return;TW.built=sig;
 box.innerHTML=[2,1,0].map(ti=>{const T=TW.tiers[ti],s=L[T.i],map=ti===0?ZROW:ti===1?QROW:'';
  let keys='',blk='',wi=0;const base=12*(T.oct+1),n=octs*12+1,wcount=octs*7+1;
  for(let k=0;k<n;k++){const m=base+k,pc=k%12,isB=[1,3,6,8,10].includes(pc),inS=steps.includes((((m-root)%12)+12)%12),lab=TW.labels&&map[k]?map[k].toUpperCase():'',dim=TW.lock&&!inS?' off':'';
   if(!isB){keys+='<button class="tww'+dim+(inS?' ins':'')+'" data-m="'+m+'" tabindex="-1"><span>'+(pc===0?nn(m):'')+'</span><kbd>'+lab+'</kbd></button>';wi++}
   else blk+='<button class="twb'+dim+(inS?' ins':'')+'" data-m="'+m+'" tabindex="-1" style="left:calc('+(wi/wcount*100)+'% - var(--bw)/2)"><kbd>'+lab+'</kbd></button>'}
  return'<div class="tier'+(T.mute?' muted':'')+'" data-t="'+ti+'" style="--wn:'+wcount+'">'+
   '<div class="twl" data-help="twLeft"><b class="tn">TIER '+(ti+1)+'</b><div class="tlcd" title="'+esc(s?s.name:'')+'">'+esc(s?s.name:'NO SOUND')+'</div><div class="trow"><button class="hwb sq" data-a="s-"><i class="led"></i>◀</button><span class="tlab">SOUND</span><button class="hwb sq" data-a="s+"><i class="led"></i>▶</button></div><div class="trow"><button class="hwb sq" data-a="o-"><i class="led"></i>−</button><span class="tlab">C'+T.oct+'</span><button class="hwb sq" data-a="o+"><i class="led"></i>+</button></div></div>'+
   '<div class="twkb" data-t="'+ti+'">'+keys+blk+'</div>'+
   '<div class="twr" data-help="twRight"><label class="tvol">VOL<input type="range" min="0" max="1" step=".01" value="'+T.vol+'" data-a="vol"></label><button class="hwb'+(T.hold?' on':'')+'" data-a="hold"><i class="led"></i>HOLD</button><button class="hwb'+(T.stack?' on':'')+'" data-a="stack"><i class="led"></i>STACK</button><button class="hwb'+(T.mute?' on':'')+'" data-a="mute"><i class="led"></i>MUTE</button><button class="hwb'+(TW.midi===ti?' on':'')+'" data-a="midi"><i class="led"></i>MIDI IN</button></div></div>'}).join('')}
function towerWire(){const box=$('twTiers');
 $('twLock').onclick=()=>{TW.lock=!TW.lock;towerRender();say(TW.lock?'Scale lock on: only notes in the song’s key light up and play.':'Scale lock off: every key plays.')};
 $('twLab').onclick=()=>{TW.labels=!TW.labels;towerRender()};
 box.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.tagName==='INPUT')return;const ti=+b.closest('.tier').dataset.t,T=TW.tiers[ti],a=b.dataset.a,L=TW.list;
  if(a==='s-'||a==='s+'){T.i=(T.i+(a==='s+'?1:-1)+L.length)%L.length;API().hear(L[T.i].src);say('Tier '+(ti+1)+' plays '+L[T.i].name+'.')}
  else if(a==='o-'||a==='o+')T.oct=Math.max(0,Math.min(7,T.oct+(a==='o+'?1:-1)));
  else if(a==='hold'){T.hold=!T.hold;say(T.hold?'Tier '+(ti+1)+' HOLD: notes ring out the whole cut.':'Tier '+(ti+1)+': notes stop when you let go.')}
  else if(a==='stack'){T.stack=!T.stack;say(T.stack?'Tier '+(ti+1)+' is stacked: play any stacked tier and all of them sound together.':'Tier '+(ti+1)+' unstacked.')}
  else if(a==='mute')T.mute=!T.mute;else if(a==='midi'){TW.midi=ti;midiInit();say('MIDI keyboard plays tier '+(ti+1)+'.')}
  towerRender()});
 box.addEventListener('input',e=>{if(e.target.dataset.a==='vol')TW.tiers[+e.target.closest('.tier').dataset.t].vol=+e.target.value});
 /* touch / mouse with glide */
 const P=new Map();
 const keyAt=(x,y)=>{const o=document.elementFromPoint(x,y);return o&&o.closest('#twTiers .twkb .tww,#twTiers .twkb .twb')};
 const velOf=(k,y)=>{const r=k.getBoundingClientRect();return Math.max(.35,Math.min(1,.4+.6*(y-r.top)/r.height))};
 box.addEventListener('pointerdown',e=>{const k=e.target.closest('.twkb .tww,.twkb .twb');if(!k||document.body.classList.contains('explain'))return;e.preventDefault();try{k.releasePointerCapture(e.pointerId)}catch(er){}const id='p'+e.pointerId;P.set(e.pointerId,k);tOn(id,k,velOf(k,e.clientY))});
 addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;const k=keyAt(e.clientX,e.clientY),o=P.get(e.pointerId);if(k&&k!==o){const id='p'+e.pointerId;tOff(id);P.set(e.pointerId,k);tOn(id,k,velOf(k,e.clientY))}});
 const up=e=>{if(!P.has(e.pointerId))return;tOff('p'+e.pointerId);P.delete(e.pointerId)};addEventListener('pointerup',up);addEventListener('pointercancel',up);
 /* computer keys: tier 1 on Z row, tier 2 on Q row */
 addEventListener('keydown',e=>{if(curP!=='tower'||e.repeat||e.metaKey||e.ctrlKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();let ti=-1,o=ZROW.indexOf(k);if(o>=0)ti=0;else{o=QROW.indexOf(k);if(o>=0)ti=1}if(ti<0)return;e.preventDefault();
  const m=12*(TW.tiers[ti].oct+1)+o,kb=$$('#twTiers .twkb[data-t="'+ti+'"] [data-m="'+m+'"]')[0];if(kb)tOn('k'+k,kb,.85)});
 addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(TW.ons.has('k'+k))tOff('k'+k)})}
function tOn(id,k,vel){if(!need())return;if(k.classList.contains('off'))return;tOff(id);const ti=+k.closest('.twkb').dataset.t,m=+k.dataset.m;tNote(id,ti,m,vel,k)}
function tNote(id,ti,m,vel,k){const T=TW.tiers[ti],hs=[],ks=[];const tiers=T.stack?TW.tiers.map((x,i)=>i).filter(i=>i===ti||TW.tiers[i].stack):[ti];
 tiers.forEach(i=>{const X=TW.tiers[i];if(X.mute)return;const s=TW.list[X.i];if(!s)return;const mm=m+12*(X.oct-T.oct);const h=API().noteOn(s.src,mm,vel*X.vol,X.hold);if(h)hs.push(h);const kk=i===ti?k:$$('#twTiers .twkb[data-t="'+i+'"] [data-m="'+mm+'"]')[0];if(kk){kk.classList.add('on');ks.push(kk)}});
 TW.ons.set(id,{hs,ks})}
function tOff(id){const o=TW.ons.get(id);if(!o)return;o.hs.forEach(h=>API().noteOff(h));o.ks.forEach(k=>k.classList.remove('on'));TW.ons.delete(id)}
let MIDI=null;
function midiInit(){if(MIDI!==null||!navigator.requestMIDIAccess){if(!navigator.requestMIDIAccess)$('twMidi').textContent='MIDI: this browser has no Web MIDI';return}MIDI=false;
 navigator.requestMIDIAccess().then(acc=>{MIDI=acc;const hook=()=>{let n=0;acc.inputs.forEach(inp=>{n++;inp.onmidimessage=ev=>{const[st,d1,d2]=ev.data,c=st&0xf0;if(c===0x90&&d2>0){const ti=TW.midi,kb=$$('#twTiers .twkb[data-t="'+ti+'"] [data-m="'+d1+'"]')[0];if(!ready())return;tOff('m'+d1);tNote('m'+d1,ti,d1,d2/127,kb||document.createElement('i'))}else if(c===0x80||(c===0x90&&d2===0))tOff('m'+d1)}});$('twMidi').textContent=n?'MIDI: '+n+' input'+(n>1?'s':'')+' → tier '+(TW.midi+1):'MIDI: no keyboard found'};hook();acc.onstatechange=hook}).catch(()=>{$('twMidi').textContent='MIDI: permission refused'})}

/* ================= LAUNCH CONSOLE ================= */
function buildLaunch(){const u=el('section',{id:'osLaunch',class:'unit'});
 u.innerHTML=plate('LAUNCH CONSOLE','LC-8','osLaunch')+'<div class="lcbody"><div class="clips" id="lcClips" data-help="lcClips"></div>'+
 '<div class="lcrow"><button class="hwb" id="lcPlay" data-help="lcPlay"><i class="led"></i>▶ PLAY / ■ STOP</button><button class="hwb" id="lcSong" data-help="lcSong"><i class="led"></i>+ ADD TO SONG</button><button class="hwb" id="lcPads" data-help="scrProg"><i class="led"></i>PADS: CHOP</button><span class="lchint">Tap a pattern to play it. While playing, it starts when the current one finishes (it blinks while it waits). Keys <kbd>F1</kbd>–<kbd>F12</kbd> or <kbd>Shift</kbd>+<kbd>1</kbd>–<kbd>8</kbd> launch too.</span></div></div>';
 return u}
function launchWire(){$('lcClips').onclick=e=>{const c=e.target.closest('.clip');if(!c||!need())return;launch(+c.dataset.i)};
 $('lcPlay').onclick=()=>{if(!need())return;(API().playing()?$('psStop'):$('psPlay')).click()};
 $('lcSong').onclick=()=>{if(!need())return;const b=$('psSongAdd');if(b){b.click();say('Added P'+(API().pat()+1)+' to the song order. See it on SONG → SONG ARRANGER.')}};
 $('lcPads').onclick=()=>{const b=$('scrProg');if(b)b.click()}}
function launch(i){const A=API();A.selPat(i);if(!A.playing()){$('psPlay').click();say('Playing P'+(i+1)+'.')}else say('P'+(i+1)+' is queued: it starts when the current pattern finishes.')}
function launchRender(){if(!ready()){$('lcClips').innerHTML='<p class="empty">Load a song to launch its patterns.</p>';return}const A=API();
 $('lcClips').innerHTML=A.pats().map(p=>'<button class="clip'+(p.hits?' has':'')+'" data-i="'+p.i+'"><b>P'+(p.i+1)+'</b><span>'+p.bars+' BAR'+(p.bars>1?'S':'')+' · '+p.hits+' HITS</span><canvas width="200" height="56"></canvas><i class="cbar"><u></u></i>'+(p.i<12?'<kbd>F'+(p.i+1)+'</kbd>':'')+'</button>').join('');
 LC_SIG='';launchSync(A.pats(),A.pat(),A.queued())}
let LC_SIG='';
function launchSync(ps,P,q){const A=API(),sig=ps.map(p=>p.hits+'/'+p.bars).join(',');if(sig!==LC_SIG){LC_SIG=sig;ps=A.pats();$$('#lcClips .clip').forEach((c,i)=>{const p=ps[i];c.classList.toggle('has',!!p.hits);c.querySelector('span').textContent=p.bars+' BAR'+(p.bars>1?'S':'')+' · '+p.hits+' HITS';const cv=c.querySelector('canvas'),x=cv.getContext('2d');x.clearRect(0,0,200,56);
  p.ev.forEach(e=>{const r=e.pg==='chop'?(e.ci%16):e.p;x.fillStyle=getComputedStyle(document.body).getPropertyValue('--acc')||'#f35';x.globalAlpha=.85;x.fillRect(e.t/(p.bars*4)*196+2,2+r*3.3,3,3)})})}
 $$('#lcClips .clip').forEach((c,i)=>{const pl=A.playing()&&i===P;c.classList.toggle('play',pl);c.classList.toggle('q',q===i);c.classList.toggle('cur',!A.playing()&&i===P);c.querySelector('.cbar u').style.width=(pl?A.pos()*100:0)+'%'});
 const lp=$('lcPads');try{lp.lastChild.textContent='PADS: '+(A.prog()==='chop'?'CHOP':'KIT')}catch(e){}}

/* ================= SONG BUILDER: loop a part, play the next part over it, NEXT PART, repeat ================= */
const SB={sel:-1,carry:LSg('bc16:carry','all'),sig:''};
function buildBuilder(){const u=el('section',{id:'osBuild',class:'unit'});
 u.innerHTML=plate('SONG BUILDER','SB-16','osBuild')+'<div class="sbbody">'+
 '<ol class="sbhow" data-help="sbHow"><li><b>Loop a part</b>Pick or play the loop for this part.</li><li><b>Play over it</b>Arm REC, play the part that goes there.</li><li><b>NEXT PART</b>Carries the loop into a new part.</li><li><b>Channels</b>Turn sounds on or off for this part.</li><li><b>Play the song</b>From the top, or from any part.</li></ol>'+
 '<div class="sbtop"><div class="sblcd" id="sbLcd" data-help="sbLcd"><b id="sbPart">NO PART YET</b><span id="sbInfo">Load a song, then press LOOP THIS PART.</span><i><u id="sbProg"></u></i></div>'+
 '<div class="sbctl"><button class="hwb sq" id="sbPrev" data-help="sbPrev" title="Previous part"><i class="led"></i>◀</button><button class="hwb" id="sbLoop" data-help="sbLoop"><i class="led"></i>⟲ LOOP THIS PART</button><button class="hwb" id="sbRec" data-help="psRec"><i class="led"></i>● REC</button><button class="hwb np big" id="sbNext" data-help="osNext"><i class="led"></i>NEXT PART ▶</button><button class="hwb sq" id="sbFwd" data-help="sbPrev" title="Next part in the song"><i class="led"></i>▶</button></div></div>'+
 '<div class="sbrow" data-help="sbCarry"><span class="hwl">NEXT PART STARTS WITH</span><div class="seg" id="sbCarry"><button data-c="all">THE WHOLE LOOP</button><button data-c="on">ONLY CHANNELS THAT ARE ON</button><button data-c="none">NOTHING (BLANK)</button></div><label class="sbchk" data-help="sbFollow"><input type="checkbox" id="sbFollow"> Pads follow the part (each part brings back the bank it was made with)</label></div>'+
 '<div class="sbchan" data-help="sbChan"><div class="sbh"><span class="hwl">CHANNELS IN THIS PART</span><span class="sbbars">LENGTH <select id="sbBars"><option value="1">1 bar</option><option value="2">2 bars</option><option value="4">4 bars</option><option value="8">8 bars</option></select></span><button class="chip" id="sbAllOn">ALL ON</button><button class="chip" id="sbAllOff">ALL OFF</button><button class="chip" id="sbPads">SET PADS = CURRENT BANK</button></div><div class="chans" id="sbChans"></div></div>'+
 '<div class="sbtpl" id="sbTplRow" data-help="sbTpl"><span class="hwl">SONG STRUCTURE</span><div class="kfsrow"><select id="sbTpl"><option value="classic">Classic: intro · verse · hook · verse · hook · bridge · hook · outro</option><option value="trap">Trap: intro · hook · verse · hook · verse · hook · outro</option><option value="flip">Chop flip: intro · verse · verse · hook · verse · hook · outro</option><option value="short">Short: intro · verse · hook · outro</option></select><select id="sbSrc" title="Which sounds Beat Brain writes with"><option value="all">Sounds: all kit banks</option>'+'ABCDEFGH'.split('').map((L,i)=>'<option value="'+i+'">Sounds: kit bank '+L+'</option>').join('')+'</select><label class="sbchk"><input type="checkbox" id="sbWrite" checked> write the parts from my sounds</label><button class="hwb np" id="sbLay"><i class="led"></i>LAY IT OUT</button></div></div>'+
 '<div class="sbsong" data-help="sbSong"><div class="sbh"><span class="hwl">THE SONG, PART BY PART</span><button class="chip" id="sbAdd">+ ADD CURRENT PATTERN</button><button class="chip" id="sbClear">CLEAR ORDER</button></div><div class="parts" id="sbParts"></div>'+
 '<div class="sbedit" id="sbEdit"><span id="sbSelT">Tap a part to select it.</span><button class="hwb sq" data-e="l" title="Move earlier"><i class="led"></i>◀</button><button class="hwb sq" data-e="r" title="Move later"><i class="led"></i>▶</button><button class="hwb" data-e="d"><i class="led"></i>⧉ REPEAT</button><button class="hwb" data-e="x"><i class="led"></i>✕ REMOVE</button><button class="hwb" data-e="lp"><i class="led"></i>⟲ LOOP IT</button><button class="hwb" data-e="pf"><i class="led"></i>▶ PLAY FROM HERE</button></div>'+
 '<div class="sbsmart" id="sbSmart" data-help="sbSmart"><span class="hwl">SMART EDIT · SELECTED PART</span><div class="kfsrow"><select id="sbSec">'+SECS.map(x=>'<option value="'+x+'">'+x.toUpperCase()+'</option>').join('')+'</select><button class="hwb np" data-x="write"><i class="led"></i>✎ WRITE AS THIS</button><button class="hwb" data-x="take"><i class="led"></i>⟳ NEW TAKE</button><button class="hwb" data-x="name"><i class="led"></i>LABEL ONLY</button></div><div class="kfsrow"><button class="hwb" data-x="drums"><i class="led"></i>DRUMS ONLY</button><button class="hwb" data-x="nodrums"><i class="led"></i>NO DRUMS</button><button class="hwb" data-x="allon"><i class="led"></i>ALL ON</button><button class="hwb" data-x="x2"><i class="led"></i>×2 LENGTH</button><button class="hwb" data-x="half"><i class="led"></i>½ LENGTH</button><button class="hwb" data-x="uniq" id="sbUniq"><i class="led"></i>MAKE IT ITS OWN</button></div><small id="sbShare"></small></div>'+
 '<div class="tlw" data-help="sbTL"><div class="sbh"><span class="hwl">ARRANGEMENT VIEW</span><span class="tlhint">Parts across, channels down. Tap a block to switch that channel in that part.</span></div><div class="tl" id="sbTL"></div></div>'+
 '<div class="sbplay"><button class="hwb big" id="sbSong" data-help="sbSongPlay"><i class="led"></i>▶ PLAY THE SONG</button><button class="hwb big" id="sbStop"><i class="led"></i>■ STOP</button><button class="hwb big" id="sbExport" data-help="sbExport"><i class="led"></i>EXPORT ▶</button></div></div></div>';
 return u}
function nextPart(){if(!need())return;const r=API().nextPart(SB.carry);if(r.err){say(r.err);return}SB.sel=r.part-1;
 say('PART '+r.part+' is pattern P'+(r.to+1)+(SB.carry==='all'?', starting with the whole loop':SB.carry==='on'?', starting with the channels that were on':', blank')+'. '+(API().playing()?'It starts when the current loop ends: play the next part over it.':'Press PLAY (or ⟲ LOOP) and play the next part.'));if(curP==='build')buildRender()}
function builderWire(){
 $('sbCarry').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;SB.carry=b.dataset.c;LSs('bc16:carry',SB.carry);buildRender()};
 $('sbFollow').onchange=e=>{if(need())API().setFollow(e.target.checked)};
 $('sbNext').onclick=nextPart;
 $('sbLoop').onclick=()=>{if(!need())return;const A=API(),P=A.pat();A.loopPart(P);say('Looping P'+(P+1)+'. Arm REC to play the next part over it, or press NEXT PART when it is ready.')};
 $('sbRec').onclick=()=>{$('psRec').click()};
 const stepPart=d=>{if(!need())return;const S=API().song();if(!S.list.length){patStep(d);return}let i=(SB.sel<0?(S.pos>=0?S.pos:0):SB.sel)+d;i=Math.max(0,Math.min(S.list.length-1,i));SB.sel=i;if(S.mode&&API().playing())API().jumpPart(i);else API().loopPart(S.list[i]);say('Part '+(i+1)+': P'+(S.list[i]+1)+'.');buildRender()};
 $('sbPrev').onclick=()=>stepPart(-1);$('sbFwd').onclick=()=>stepPart(1);
 $('sbBars').onchange=e=>{if(need())API().bars(null,+e.target.value)};
 $('sbAllOn').onclick=()=>{if(need()){API().chanAll(null,true);SB.sig=''}};$('sbAllOff').onclick=()=>{if(need()){API().chanAll(null,false);SB.sig=''}};
 $('sbPads').onclick=()=>{if(!need())return;API().setPartPads();say('This part now brings up pad bank '+BL[API().bank()]+' ('+(API().prog()==='chop'?'CHOP':'KIT')+' program) whenever it plays.');SB.sig=''};
 $('sbChans').onclick=e=>{const c=e.target.closest('.ch');if(!c||!need())return;const on=API().chanToggle(null,c.dataset.k);if(on)API().chanHear(c.dataset.k);SB.sig='';buildSync()};
 $('sbAdd').onclick=()=>{if(!need())return;API().songAdd();SB.sel=API().song().list.length-1;buildRender();say('Added P'+(API().pat()+1)+' as part '+(SB.sel+1)+'.')};
 $('sbClear').onclick=async()=>{if(!need())return;if(!API().song().list.length)return;if(!await ask('Clear the song order? Your patterns stay; only the order is cleared. UNDO brings it back.'))return;API().songClear();SB.sel=-1;buildRender()};
 $('sbParts').onclick=e=>{const b=e.target.closest('.part');if(!b||!need())return;SB.sel=+b.dataset.i;const S=API().song();if(S.mode&&API().playing())API().jumpPart(SB.sel);buildRender()};
 $('sbTL').onclick=e=>{const c=e.target.closest('.cell:not(.none)');if(c&&need()){const on=API().chanToggle(+c.dataset.pi,c.dataset.k);if(on)API().chanHear(c.dataset.k);TLSIG='';SB.sig='';buildSync();return}const h=e.target.closest('.hd[data-part]');if(h&&need()){SB.sel=+h.dataset.part;buildRender()}};
 $('sbParts').ondblclick=e=>{const b=e.target.closest('.part');if(!b||!need())return;API().jumpPart(+b.dataset.i)};
 $('sbEdit').onclick=e=>{const b=e.target.closest('[data-e]');if(!b||!need())return;const S=API().song(),i=SB.sel;if(i<0||i>=S.list.length){say('Tap a part in the song first.');return}const a=b.dataset.e;
  if(a==='l'||a==='r'){if(API().songMove(i,a==='l'?-1:1))SB.sel=i+(a==='l'?-1:1)}else if(a==='d'){API().songDup(i);SB.sel=i+1;say('Part '+(i+1)+' repeats: it now plays twice in a row.')}else if(a==='x'){API().songDel(i);SB.sel=Math.min(i,API().song().list.length-1);say('Removed part '+(i+1)+' from the order. The pattern itself is kept.')}
  else if(a==='lp'){API().loopPart(S.list[i]);say('Looping part '+(i+1)+' (P'+(S.list[i]+1)+'). Play over it, or fix it, then press ▶ PLAY THE SONG.')}else if(a==='pf'){API().playSong(i);say('Playing the song from part '+(i+1)+'.')}buildRender()};
 $('sbLay').onclick=layOut;$('sbSmart').onclick=e=>{const b=e.target.closest('[data-x]');if(b)smartEdit(b.dataset.x)};
 $('sbSong').onclick=()=>{if(!need())return;if(!API().playSong(0)){say('The song has no parts yet. Loop a part and press NEXT PART, or + ADD CURRENT PATTERN.');return}say('Playing the whole song from the top.')};
 $('sbStop').onclick=()=>$('psStop').click();
 $('sbExport').onclick=()=>go('song')}

/* DAW arrangement view */
let TLSIG='';
function tlRender(){const box=$('sbTL');if(!box)return;const A=API(),S=A.song(),pats=A.patMeta();if(!S.list.length){box.innerHTML='<p class="empty">Parts appear here as you build the song.</p>';TLSIG='';return}
 const parts=S.list.map(pi=>({pi,bars:pats[pi].bars,ch:A.chans(pi),au:A.autoLanes(pi)}));
 const sig=JSON.stringify(parts.map(p=>[p.pi,p.bars,p.ch.map(c=>c.k+(c.on?1:0)),Object.values(p.au).map(x=>x.length)]));if(sig===TLSIG)return;TLSIG=sig;
 const rows=[],seen=new Map();parts.forEach(p=>p.ch.forEach(c=>{if(!seen.has(c.k)){seen.set(c.k,rows.length);rows.push({k:c.k,name:c.name,col:c.col})}}));
 const W=p=>Math.max(64,p.bars*34),cols=parts.map(W).map(w=>w+'px').join(' ');
 let h='<div class="tlg" style="grid-template-columns:150px '+cols+'"><div class="tlc hd">CHANNEL</div>'+parts.map((p,i)=>'<div class="tlc hd" data-part="'+i+'">'+(i+1)+' · P'+(p.pi+1)+'</div>').join('');
 rows.forEach(r=>{h+='<div class="tlc nm" style="--pc:'+r.col+'" title="'+esc(r.name)+'">'+esc(r.name)+'</div>';parts.forEach((p,i)=>{const c=p.ch.find(x=>x.k===r.k);h+='<div class="tlc cell'+(c?(c.on?' on':' off'):' none')+'" style="--pc:'+r.col+'" data-pi="'+p.pi+'" data-k="'+esc(r.k)+'">'+(c?'<i style="width:'+Math.min(100,c.n*6)+'%"></i>':'')+'</div>'})});
 [['flt','FILTER'],['pump','PUMP'],['sw','SWING']].forEach(([k,n])=>{h+='<div class="tlc nm au">'+n+' AUTO</div>';parts.forEach(p=>{h+='<div class="tlc acell"><canvas width="'+W(p)*2+'" height="40" data-k="'+k+'" data-bars="'+p.bars+'" data-pts="'+esc(JSON.stringify(p.au[k]||[]))+'"></canvas></div>'})});
 h+='</div><i class="tlph" id="tlPh"></i>';box.innerHTML=h;
 $$('#sbTL canvas').forEach(cv=>{const x=cv.getContext('2d'),W2=cv.width,H2=cv.height,pts=JSON.parse(cv.dataset.pts),len=+cv.dataset.bars*4,k=cv.dataset.k;x.strokeStyle=getComputedStyle(document.body).getPropertyValue('--acc')||'#fd3';x.lineWidth=2;
  const yv=v=>k==='flt'?H2/2-(v/100)*(H2/2-3):H2-3-(v/100)*(H2-6);x.globalAlpha=.25;x.beginPath();x.moveTo(0,k==='flt'?H2/2:H2-3);x.lineTo(W2,k==='flt'?H2/2:H2-3);x.stroke();x.globalAlpha=1;
  if(!pts.length)return;x.beginPath();x.moveTo(0,yv(pts[0].v));pts.forEach(p=>x.lineTo(p.t/len*W2,yv(p.v)));x.lineTo(W2,yv(pts[pts.length-1].v));x.stroke()})}
function tlPlayhead(){const ph=$('tlPh'),A=API();if(!ph||!A)return;const S=A.song(),hd=$$('#sbTL .tlc.hd[data-part]');let i=S.mode&&A.playing()?S.pos:-1;if(i<0){const P=A.pat();i=SB.sel>=0&&S.list[SB.sel]===P?SB.sel:S.list.indexOf(P);if(!A.playing())i=-1}
 if(i<0||!hd[i]){ph.style.display='none';return}const c=hd[i],g=c.parentElement.getBoundingClientRect(),r=c.getBoundingClientRect();ph.style.display='block';ph.style.left=(r.left-g.left+A.pos()*r.width+c.parentElement.offsetLeft)+'px';hd.forEach((x,j)=>x.classList.toggle('play',j===i))}
function buildRender(){SB.sig='';TLSIG='';buildSync()}
function buildSync(){if(!$('osBuild'))return;if(!ready()){$('sbParts').innerHTML='<p class="empty">Load a song to start building.</p>';return}
 const A=API(),S=A.song(),P=A.pat(),q=A.queued(),pats=A.patMeta(),pl=A.playing();
 const partOfP=S.mode&&S.pos>=0?S.pos:(SB.sel>=0&&S.list[SB.sel]===P?SB.sel:S.list.lastIndexOf(P));
 $('sbPart').textContent=(partOfP>=0?'PART '+(partOfP+1)+' OF '+S.list.length+' · ':'')+'P'+String(P+1).padStart(2,'0')+(q!=null?' → P'+String(q+1).padStart(2,'0'):'');
 $('sbInfo').textContent=pats[P].bars+' BAR'+(pats[P].bars>1?'S':'')+' · '+pats[P].hits+' HITS · '+(pl?(S.mode?'PLAYING THE SONG':'LOOPING THIS PART'):'STOPPED')+(A.rec()?' · RECORDING':'');
 $('sbProg').style.width=(pl?A.pos()*100:0)+'%';tlPlayhead();$('sbLcd').classList.toggle('rec',A.rec());$('sbRec').classList.toggle('on',A.rec());$('sbLoop').classList.toggle('on',pl&&!S.mode);$('sbSong').classList.toggle('on',pl&&S.mode);
 const sig=A.ver()+'|'+S.list.join(',')+'|'+S.pos+'|'+S.nextPos+'|'+SB.sel+'|'+P+'|'+q+'|'+SB.carry+'|'+S.follow+'|'+A.prog()+'|'+A.bank()+'|'+pl;if(sig===SB.sig)return;SB.sig=sig;tlRender();
 $$('#sbCarry [data-c]').forEach(b=>b.classList.toggle('on',b.dataset.c===SB.carry));$('sbFollow').checked=!!S.follow;$('sbBars').value=String(pats[P].bars);
 const ch=A.chans();$('sbChans').innerHTML=ch.length?ch.map(c=>'<button class="ch'+(c.on?' on':'')+'" data-k="'+esc(c.k)+'" style="--pc:'+c.col+'"><i></i><b>'+esc(c.name)+'</b><small>'+c.n+' hit'+(c.n>1?'s':'')+'</small></button>').join(''):'<p class="empty">No hits in P'+(P+1)+' yet. Arm REC and play, or draw on the STEP SEQUENCER.</p>';
 $('sbParts').innerHTML=S.list.length?S.list.map((pi,i)=>{const pp=pats[pi],pd=API().partPads(pi);return'<button class="part'+(i===SB.sel?' sel':'')+(S.mode&&pl&&i===S.pos?' play':'')+(S.nextPos===i?' q':'')+(pi===P&&!S.mode?' cur':'')+'" data-i="'+i+'"><b>'+(i+1)+'</b><span>'+(pp.name?pp.name+' · ':'')+'P'+(pi+1)+'</span><em>'+pp.bars+' BAR'+(pp.bars>1?'S':'')+(pd.bank!=null?' · '+BL[pd.bank]:'')+'</em><small>'+pp.hits+' hits</small></button>'}).join('<i class="parr">›</i>'):'<p class="empty">No parts yet. Loop your first part, then press NEXT PART: it is added here, and the next part starts.</p>';
 {const sp=SB.sel>=0&&SB.sel<S.list.length?S.list[SB.sel]:-1,uses=sp<0?0:S.list.filter(x=>x===sp).length;$('sbSmart').classList.toggle('dim',sp<0);if(sp>=0&&pats[sp].name&&SECS.includes(pats[sp].name.toLowerCase()))$('sbSec').value=pats[sp].name.toLowerCase();$('sbShare').textContent=sp<0?'Tap a part above to edit it.':uses>1?'P'+(sp+1)+' is used by '+uses+' parts: edits change all of them. MAKE IT ITS OWN gives this part its own copy.':'Edits change only this part.';$('sbUniq').disabled=uses<2}
 $('sbSelT').textContent=SB.sel>=0&&SB.sel<S.list.length?'Part '+(SB.sel+1)+' (P'+(S.list[SB.sel]+1)+') selected:':'Tap a part to select it.'}

/* ================= PACK FACTORY: AI-generated sample libraries for every genre =================
   Uses the music-generation API the person brings their own key for (sunoapi.org compatible).
   A request makes 2 tracks. Jobs are polled (no callback server is needed), finished tracks go into a
   library kept on this device (IndexedDB), and any track can be loaded, auto-chopped and turned into kits. */
const PF={api:'https://apibox.erweima.ai',genres:new Set(LSg('bc16:pf:g',['detroit'])),types:new Set(LSg('bc16:pf:t',['flip'])),jobs:LSg('bc16:pf:jobs',[]),items:[],filt:'',busy:false};
const GENRES=[
 ['detroit','Detroit / Flint','Detroit Flint street rap beat, fast bouncy hi-hats, eerie detuned piano, menacing minor keys, hard knocking drums'],
 ['trap','Trap','modern trap, rolling hi-hats, booming 808s, dark synth bells, Atlanta'],
 ['drill','Drill','UK and NY drill, sliding 808 glides, triplet hi-hats, dark strings, choir'],
 ['boombap','Boom bap','90s boom bap hip hop, dusty swung drums, jazzy samples, vinyl crackle, MPC swing'],
 ['lofi','Lo-fi hip hop','lo-fi hip hop, mellow Rhodes, tape wobble, soft swung drums, cozy'],
 ['gfunk','West Coast G-funk','West Coast G-funk, whiny synth lead, talkbox feel, funky bass, laid back'],
 ['phonk','Memphis phonk','Memphis phonk, cowbell melodies, distorted 808, dark lo-fi, drift'],
 ['jersey','Jersey club','Jersey club, bouncy kick patterns, bed squeak chops, fast 140 bpm'],
 ['rnb','R&B','contemporary R&B, lush chords, smooth bass, silky pads, late night'],
 ['neosoul','Neo soul','neo soul, warm Rhodes, live bass, jazzy extended chords, organic drums'],
 ['gospel','Gospel','gospel, Hammond organ, church piano, choir pads, uplifting chord changes'],
 ['soul','Vintage soul','1970s soul record, horns, strings, Wurlitzer, warm analog tape, emotional'],
 ['funk','Funk','70s funk, slap bass, wah guitar, tight drums, horn stabs'],
 ['jazz','Jazz','jazz combo, upright bass, brushed drums, piano trio, smoky club'],
 ['blues','Blues','electric blues, slide guitar, shuffle groove, Hammond'],
 ['afrobeats','Afrobeats','afrobeats, syncopated percussion, log drum, highlife guitar, warm'],
 ['amapiano','Amapiano','amapiano, log drum bass, shakers, jazzy piano, deep house groove'],
 ['reggaeton','Reggaeton','reggaeton dembow rhythm, latin percussion, dark synths'],
 ['dancehall','Dancehall','dancehall riddim, digital drums, island bass, steel drums'],
 ['latin','Latin','latin, salsa piano montuno, congas, timbales, brass'],
 ['house','House','house music, four on the floor, piano chords, groovy bass'],
 ['deephouse','Deep house','deep house, warm pads, rolling bass, subtle percussion'],
 ['techno','Techno','techno, driving kick, hypnotic synth sequences, industrial textures'],
 ['dnb','Drum & bass','drum and bass, fast breakbeats, reese bass, liquid pads'],
 ['dubstep','Dubstep','dubstep, half time drums, heavy wobble bass, aggressive'],
 ['edm','EDM','EDM festival, big supersaw leads, build ups, drops'],
 ['pop','Pop','modern pop production, catchy synth hooks, bright, polished'],
 ['rock','Rock','rock, electric guitars, live drums, bass guitar, energetic'],
 ['country','Country','country, acoustic guitar, pedal steel, fiddle, banjo'],
 ['cinematic','Cinematic','cinematic orchestral, epic strings, brass, timpani, trailer'],
 ['ambient','Ambient','ambient, evolving pads, textures, calm, spacious'],
 ['kpop','K-pop','K-pop production, punchy synths, bright hooks, layered'],
 ['bollywood','Bollywood / Desi','Bollywood and desi, sitar, tabla, strings, melodic'],
 ['arab','Middle Eastern','Middle Eastern, oud, darbuka, maqam scales, strings']];
const PTYPES=[
 ['flip','SAMPLE FLIP','vintage record made for sampling and chopping, {g}, warm analog, dusty vinyl, memorable chord phrases, instrumental','vocals, singing, lyrics, rap'],
 ['loops','MELODIC LOOPS','instrumental melodic loops for producers, {g}, catchy repeating 4 bar phrases, clean mix, sample pack quality','vocals, singing, lyrics, rap, drums'],
 ['drums','DRUM BREAK','solo drum break, drums only, {g}, punchy kicks, crisp snares, hats, fills, sample pack quality','melody, bass, piano, guitar, vocals, singing'],
 ['808','808 & BASS','808 and bass lines only, {g}, deep sub bass, gliding 808 notes, sample pack quality','drums, melody, piano, vocals, singing'],
 ['keys','CHORDS & KEYS','chord progressions, piano and keys only, {g}, rich voicings, instrumental','drums, vocals, singing, bass'],
 ['atmos','ATMOSPHERE','atmospheric textures, pads, risers, transitions and FX, {g}, instrumental','drums, vocals, singing'],
 ['vocal','VOCAL CHOPS','wordless vocal chops, oohs, aahs, ad-libs and harmonies, {g}, made for chopping','rap verses, spoken word'],
 ['beat','FULL BEAT','full instrumental beat, {g}, intro, verse and hook sections, mixed for chopping','vocals, singing, lyrics, rap']];
/* --- device library (IndexedDB) --- */
let IDB=null;
function idb(){if(IDB)return IDB;IDB=new Promise((res,rej)=>{const r=indexedDB.open('bc16lib',1);r.onupgradeneeded=()=>{r.result.createObjectStore('items',{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return IDB}
async function idbAll(){const d=await idb();return new Promise(res=>{const q=d.transaction('items').objectStore('items').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])})}
async function idbPut(it){const d=await idb();return new Promise(res=>{const t=d.transaction('items','readwrite');t.objectStore('items').put(it);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}
async function idbDel(id){const d=await idb();return new Promise(res=>{const t=d.transaction('items','readwrite');t.objectStore('items').delete(id);t.oncomplete=()=>res(true)})}
function buildFactory(){const u=el('section',{id:'osFactory',class:'unit'});
 u.innerHTML='<div class="pfwrap"><div class="pforder" id="pfOrder">'+plate('PACK FACTORY','PF-1','pfOrder')+'<div class="kfbody">'+
 '<div class="pfkey" data-help="pfKey"><span class="hwl">API KEY</span><div class="kfsrow"><input id="pfKey" type="password" autocomplete="off" placeholder="Paste your music API key"><label class="sbchk"><input type="checkbox" id="pfRem"> remember on this device</label></div><small>Uses your own account (sunoapi.org-compatible). Each request makes 2 tracks and spends your credits. The key goes only to the music service. <a href="https://sunoapi.org/api-key" target="_blank" rel="noopener">Get a key</a></small></div>'+
 '<div data-help="pfGenres"><div class="sbh"><span class="hwl">GENRES</span><input id="pfGFind" placeholder="find a genre"><button class="chip" id="pfGNone">NONE</button></div><div class="pfchips" id="pfGenres"></div></div>'+
 '<div data-help="pfTypes"><div class="sbh"><span class="hwl">PACK TYPES</span></div><div class="pfchips" id="pfTypes"></div></div>'+
 '<div class="pfopts" data-help="pfOpts"><label>ENGINE <select id="pfModel"><option value="V6">V6 · best quality</option><option value="V6_MINI">V6 MINI · fastest</option><option value="V6_WILD">V6 WILD · boldest</option></select></label><label>LENGTH <select id="pfDur"><option value="30">30 s</option><option value="60" selected>1 min</option><option value="120">2 min</option><option value="180">3 min</option></select></label><label>VARIETY <select id="pfVar"><option value="0">exact</option><option value="1" selected>balanced</option><option value="2">high</option><option value="3">bold</option></select></label><label class="sbchk"><input type="checkbox" id="pfMatch" checked> match my song’s tempo and key</label><label class="pfwide">EXTRA WORDS <input id="pfExtra" maxlength="300" placeholder="e.g. eerie music box, minor key, 1970s"></label></div>'+
 '<div class="pfgo"><div id="pfSum">Pick at least one genre and one pack type.</div><button class="hwb np big" id="pfBuild" data-help="pfBuild"><i class="led"></i>BUILD LIBRARY ▶</button></div><div class="pfjobs" id="pfJobs" data-help="pfJobs"></div></div></div>'+
 '<div class="pflib" id="pfLib">'+plate('SOUND LIBRARY','SL-∞','pfLib')+'<div class="kfbody"><div class="sbh"><input id="pfFind" placeholder="search the library: genre, type, title"><button class="chip" id="pfSaveAll" data-help="pfSaveAll">SAVE ALL OFFLINE</button><button class="chip" id="pfExport" data-help="pfExport">⬇ LIST</button></div><div class="pfitems" id="pfItems" data-help="pfItems"></div><audio id="pfAudio" preload="none"></audio></div></div></div>';
 return u}
const gName=id=>(GENRES.find(g=>g[0]===id)||[0,id])[1],tName=id=>(PTYPES.find(t=>t[0]===id)||[0,id])[1];
function pfKey(){return $('pfKey').value.trim()}
function pfSave(){LSs('bc16:pf:g',[...PF.genres]);LSs('bc16:pf:t',[...PF.types]);LSs('bc16:pf:jobs',PF.jobs.filter(j=>j.state!=='done'&&j.state!=='failed'||Date.now()-(j.ts||0)<36e5))}
function pfStyle(g,t){const G=GENRES.find(x=>x[0]===g),T=PTYPES.find(x=>x[0]===t);let s=T[2].replace('{g}',G[2]);
 if($('pfMatch').checked&&ready()){try{const bpm=Math.round(+$('bpm').value);const kt=window.DBC?DBC.keyText():'';if(bpm)s+=', '+bpm+' BPM';if(kt)s+=', in '+kt}catch(e){}}
 const ex=$('pfExtra').value.trim();if(ex)s+=', '+ex;return s.slice(0,990)}
function pfRender(){
 const q=($('pfGFind').value||'').toLowerCase();
 $('pfGenres').innerHTML=GENRES.filter(g=>!q||g[1].toLowerCase().includes(q)).map(g=>'<button class="chip'+(PF.genres.has(g[0])?' on':'')+'" data-g="'+g[0]+'">'+g[1]+'</button>').join('');
 $('pfTypes').innerHTML=PTYPES.map(t=>'<button class="chip'+(PF.types.has(t[0])?' on':'')+'" data-t="'+t[0]+'">'+t[1]+'</button>').join('');
 const n=PF.genres.size*PF.types.size;$('pfSum').textContent=n?n+' request'+(n>1?'s':'')+' → '+(n*2)+' tracks ('+[...PF.genres].map(gName).join(', ')+' × '+[...PF.types].map(tName).join(', ')+')':'Pick at least one genre and one pack type.';$('pfBuild').disabled=!n||PF.busy;
 pfJobsRender();pfItemsRender()}
function pfJobsRender(){const J=PF.jobs.slice(-12).reverse();$('pfJobs').innerHTML=J.length?'<span class="hwl">ORDERS</span>'+J.map(j=>'<div class="job '+j.state+'"><i></i><b>'+gName(j.g)+' · '+tName(j.t)+'</b><span>'+({queued:'waiting to send',sent:'sent, composing…',text:'composing…',first:'first track ready, finishing…',done:'done: in the library',failed:'failed: '+(j.err||'')})[j.state]+'</span></div>').join(''):''}
function pfItemsRender(){const q=($('pfFind').value||'').toLowerCase().trim();const L=PF.items.filter(it=>!q||(it.title+' '+gName(it.g)+' '+tName(it.t)+' '+(it.tags||'')).toLowerCase().includes(q)).sort((a,b)=>b.created-a.created);
 $('pfItems').innerHTML=L.length?L.map(it=>'<div class="pfi'+(it.blob?' off':'')+'" data-id="'+esc(it.id)+'">'+(it.img?'<img src="'+esc(it.img)+'" alt="" loading="lazy">':'<div class="pfimg"></div>')+'<div class="pft"><b>'+esc(it.title)+'</b><span>'+gName(it.g)+' · '+tName(it.t)+' · '+(it.dur?Math.round(it.dur)+' s':'')+'</span><em>'+(it.blob?'saved on this device':'online copy · the service keeps it about 14 days, press SAVE')+'</em></div><div class="pfb"><button data-a="play" title="Preview">▶</button><button data-a="load" class="p" title="Load into the machine, chop it and build kits">LOAD &amp; CHOP</button><button data-a="pack" title="Load, chop and save its kits as a pro pack">PRO PACK</button>'+(it.blob?'':'<button data-a="save">SAVE</button>')+'<button data-a="dl" title="Download">⬇</button><button data-a="del" title="Delete">✕</button></div></div>').join(''):'<p class="empty">'+(PF.items.length?'Nothing matches.':'Your library is empty. Pick genres and pack types on the left, then BUILD LIBRARY. Finished tracks land here and stay on this device.')+'</p>'}
async function pfCall(path,opt){const k=pfKey();if(!k)throw new Error('Paste your API key first.');const r=await fetch(PF.api+path,{...opt,headers:{'Authorization':'Bearer '+k,'Content-Type':'application/json'}});let j=null;try{j=await r.json()}catch(e){}
 const code=j&&j.code!=null?j.code:r.status;if(code!==200){const M={400:'the request was not accepted',401:'the API key was refused',404:'the service address changed',405:'too many requests, wait a minute',413:'the description is too long',429:'not enough credits on your account',430:'too many requests, wait a minute',455:'the service is under maintenance',500:'the service had an error'};throw new Error((M[code]||'error '+code)+(j&&j.msg?' ('+j.msg+')':''))}return j}
async function pfBuild(){if(!pfKey()){say('Paste your API key first (left column, top).');$('pfKey').focus();return}const n=PF.genres.size*PF.types.size;if(!n)return;
 if(!await ask('Send '+n+' request'+(n>1?'s':'')+'? That makes about '+(n*2)+' tracks and uses your credits.'))return;
 if($('pfRem').checked)LSs('bc16:pf:key',pfKey());PF.busy=true;pfRender();
 for(const g of PF.genres)for(const t of PF.types)PF.jobs.push({id:Math.random().toString(36).slice(2),g,t,state:'queued',t0:Date.now(),ts:Date.now(),style:pfStyle(g,t),model:$('pfModel').value,dur:+$('pfDur').value,variety:+$('pfVar').value,n:PF.items.filter(x=>x.g===g&&x.t===t).length+1});
 pfSave();pfJobsRender();await pfPump();PF.busy=false;pfRender()}
async function pfPump(){for(const j of PF.jobs.filter(j=>j.state==='queued')){const T=PTYPES.find(x=>x[0]===j.t),voc=j.t==='vocal';
  const body={customMode:true,instrumental:!voc,model:j.model,callBackUrl:'https://example.com/bc16-no-callback',title:(gName(j.g)+' '+tName(j.t)+' '+j.n).slice(0,80),style:j.style,negativeTags:T[3],duration:j.dur,variety:j.variety,styleWeight:.7};
  if(voc)body.lyrics='[Vocal chops]\nooh, ooh\naah\nyeah, yeah\nhey\nooh, aah';
  try{const r=await pfCall('/api/v1/generate',{method:'POST',body:JSON.stringify(body)});j.task=r.data&&(r.data.taskId||r.data.task_id);j.state=j.task?'sent':'failed';if(!j.task)j.err='no task id came back'}catch(e){j.state='failed';j.err=e.message;if(/key|credits/.test(e.message)){say('Stopped: '+e.message+'.');pfSave();pfJobsRender();return}}
  pfSave();pfJobsRender();await sleep(1500)}pfPoll()}
let pfT=null;
function pfPoll(){clearTimeout(pfT);const live=PF.jobs.filter(j=>j.task&&['sent','text','first'].includes(j.state));if(!live.length)return;pfT=setTimeout(async()=>{for(const j of live){try{const r=await pfCall('/api/v1/generate/record-info?taskId='+encodeURIComponent(j.task),{method:'GET'});const d=r.data||{},st=d.status||'';
  const tr=((d.response&&(d.response.sunoData||d.response.data))||[]);
  for(const a of tr){const url=a.audio_url||a.audioUrl||a.source_audio_url||a.sourceAudioUrl;if(!url)continue;const id=a.id||url;if(PF.items.some(x=>x.id===id))continue;
   const it={id,g:j.g,t:j.t,title:a.title||(gName(j.g)+' '+tName(j.t)),tags:a.tags||'',dur:+a.duration||0,url,img:a.image_url||a.imageUrl||'',created:Date.now(),style:j.style};PF.items.push(it);await idbPut(it);pfOffline(it,true)}
  if(st==='SUCCESS'){j.state='done'}else if(st==='FIRST_SUCCESS'){j.state='first'}else if(st==='TEXT_SUCCESS'){j.state='text'}else if(/FAIL|ERROR|EXCEPTION/.test(st)){j.state='failed';j.err=d.errorMessage||st.toLowerCase().replace(/_/g,' ')}
  if(Date.now()-j.t0>20*60e3&&j.state!=='done'){j.state='failed';j.err='timed out'}}catch(e){if(/key/.test(e.message)){j.state='failed';j.err=e.message}}}
  pfSave();pfJobsRender();pfItemsRender();pfPoll()},8000)}
async function pfFetch(it){if(it.blob)return it.blob;const r=await fetch(it.url);if(!r.ok)throw new Error('download failed ('+r.status+')');return await r.blob()}
async function pfOffline(it,quiet){try{const b=await pfFetch(it);it.blob=b;await idbPut(it);if(!quiet)say('Saved “'+it.title+'” on this device.');pfItemsRender();return true}catch(e){if(!quiet)say('Could not save “'+it.title+'” here: the file host blocks it. Press ⬇ to download it, then drop it on the machine.');return false}}
async function pfLoad(it){say('Loading “'+it.title+'”…');try{const b=await pfFetch(it);const buf=await b.arrayBuffer();if(!it.blob){it.blob=b;idbPut(it)}load(buf,it.title.replace(/[^\w\- ]+/g,'').trim()||'generated');return true}catch(e){say('Could not load it directly: the file host blocks it. Press ⬇ to download it, then drop the file on the machine.');return false}}
async function pfPack(it){if(!(await pfLoad(it)))return;say('Loading, chopping and building kits for “'+it.title+'”… this takes a moment.');let n=0;const nm=(it.title.replace(/[^\w\- ]+/g,'').trim()||'generated').replace(/[^\w\-]+/g,'_');
 while(n<600){await sleep(500);n++;try{if(fname===nm&&ready()&&API().kit(0).some(Boolean))break}catch(e){}}if(n>=600){say('The track loaded; build kits from KIT FORGE.');return}await sleep(1500);
 let saved=0;for(let b=0;b<8;b++){if(API().kit(b).filter(Boolean).length>=4){API().saveKit(gName(it.g)+' '+tName(it.t)+' · bank '+BL[b],b);saved++}}
 say('Pro pack ready: '+saved+' kit'+(saved!==1?'s':'')+' from “'+it.title+'” saved under MY KITS in KIT FORGE. The cuts are on the pads now.');go('kit')}
function factoryWire(){const k=LSg('bc16:pf:key','');if(k){$('pfKey').value=k;$('pfRem').checked=true}
 $('pfRem').onchange=e=>{if(e.target.checked){if(pfKey())LSs('bc16:pf:key',pfKey())}else localStorage.removeItem('bc16:pf:key')};
 $('pfKey').onchange=()=>{if($('pfRem').checked)LSs('bc16:pf:key',pfKey())};
 $('pfGenres').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;const g=b.dataset.g;PF.genres.has(g)?PF.genres.delete(g):PF.genres.add(g);pfSave();pfRender()};
 $('pfTypes').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;const t=b.dataset.t;PF.types.has(t)?PF.types.delete(t):PF.types.add(t);pfSave();pfRender()};
 $('pfGFind').oninput=pfRender;$('pfGNone').onclick=()=>{PF.genres.clear();pfSave();pfRender()};$('pfFind').oninput=pfItemsRender;
 $('pfBuild').onclick=pfBuild;
 $('pfSaveAll').onclick=async()=>{let ok=0,bad=0;for(const it of PF.items.filter(x=>!x.blob)){(await pfOffline(it,true))?ok++:bad++}say(ok+' saved on this device'+(bad?', '+bad+' could not be saved here (download them with ⬇)':'')+'.');pfItemsRender()};
 $('pfExport').onclick=()=>{const data=JSON.stringify(PF.items.map(({blob,...x})=>x),null,1);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='bc16-library.json';a.click()};
 $('pfItems').onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;const it=PF.items.find(x=>x.id===b.closest('.pfi').dataset.id);if(!it)return;const a=b.dataset.a,au=$('pfAudio');
  if(a==='play'){if(!au.paused&&au.dataset.id===it.id){au.pause();b.textContent='▶';return}$$('#pfItems [data-a="play"]').forEach(x=>x.textContent='▶');au.src=it.blob?URL.createObjectURL(it.blob):it.url;au.dataset.id=it.id;au.play().catch(()=>say('This track will not play here.'));b.textContent='❚❚'}
  else if(a==='load')pfLoad(it);else if(a==='pack')pfPack(it);else if(a==='save')pfOffline(it);
  else if(a==='dl'){const x=document.createElement('a');if(it.blob){x.href=URL.createObjectURL(it.blob);x.download=it.title+'.mp3'}else{x.href=it.url;x.target='_blank';x.rel='noopener'}x.click()}
  else if(a==='del'){if(!await ask('Delete “'+it.title+'” from the library?'))return;PF.items=PF.items.filter(x=>x!==it);await idbDel(it.id);pfItemsRender()}};
 idbAll().then(L=>{PF.items=L;pfItemsRender()}).catch(()=>{});
 if(PF.jobs.some(j=>['sent','text','first'].includes(j.state))&&LSg('bc16:pf:key',''))pfPoll();
 const qd=PF.jobs.filter(j=>j.state==='queued');if(qd.length)qd.forEach(j=>{j.state='failed';j.err='not sent (page closed)'})}

/* ================= PACK STORE: free starter packs, premium drops, memberships =================
   Pricing follows the classic ladder: a generous free tier (reciprocity), one highlighted middle plan
   (centre-stage effect), a single-pack price that anchors the plans (a pack costs more than a month of PRO),
   charm prices, per-pack maths and an annual option worth two free months. No fake timers, counters or reviews.
   Checkout and license checks go through the owner's own Lemon Squeezy or Gumroad links (owner setup). */
const PLANS=[
 {id:'free',n:'STARTER',m:0,y:0,tag:'Free forever',f:['Every BC-16 unit and tool','3 starter packs made from the demo beat','Pack Factory with your own API key','Save kits, songs and setups on your device']},
 {id:'pro',n:'PRO',m:9.99,y:99,tag:'Most popular',hl:1,f:['Everything in Starter','10 premium packs a month','The full premium catalog to browse','Royalty-free for your releases','Keep every pack you download, even if you cancel']},
 {id:'studio',n:'STUDIO',m:24.99,y:249,tag:'For heavy producers',f:['Everything in PRO','Unlimited premium packs','Studio-only drops and stem packs','New drops before everyone else','Priority requests for genres and styles']}];
const SINGLE=14.99,RANK={free:0,pro:1,studio:2};
const ST={yearly:LSg('bc16:st:y',1),lic:LSg('bc16:st:lic',null),own:LSg('bc16:st:own',{}),cat:[],owner:false};
const myPlan=()=>ST.lic&&ST.lic.plan&&ST.lic.ok?ST.lic.plan:'free';
function buildStore(){const u=el('section',{id:'osStore',class:'unit'});
 u.innerHTML=plate('PACK STORE','PS-3','osStore','<span class="pchip ro" id="stPlan" data-help="stPlan">PLAN: STARTER</span>')+'<div class="stbody">'+
 '<div class="sthead"><div><h2>Sounds for every session</h2><p>Start free. Upgrade when the free packs are not enough. Cancel any time and keep what you downloaded.</p></div><div class="seg" id="stCycle" data-help="stCycle"><button data-y="0">MONTHLY</button><button data-y="1">YEARLY · 2 MONTHS FREE</button></div></div>'+
 '<div class="plans" id="stPlans" data-help="stPlans"></div>'+
 '<div class="stsingle" data-help="stSingle"><b>Just one pack?</b><span>Any single premium pack: <s></s><em>$'+SINGLE+'</em> once. PRO gives you 10 a month for $9.99.</span><button class="hwb" id="stBuy1"><i class="led"></i>BUY ONE PACK</button></div>'+
 '<div class="stlic" data-help="stLic"><span class="hwl">ALREADY A MEMBER?</span><div class="kfsrow"><input id="stKey" placeholder="Paste your license key" autocomplete="off"><button class="hwb" id="stCheck"><i class="led"></i>UNLOCK</button></div><small id="stLicMsg"></small></div>'+
 '<h3 class="sth">Free starter packs</h3><div class="stpacks" id="stFree" data-help="stFree"></div>'+
 '<h3 class="sth">Premium catalog</h3><div class="stpacks" id="stCat" data-help="stCat"></div>'+
 '<details class="stown" id="stOwn"><summary>Owner setup (only for the person selling the packs)</summary><div class="ownb">'+
 '<p>Paste the checkout links from your Lemon Squeezy or Gumroad store. Buyers get a license key by email and paste it above. The premium catalog is a JSON file you host (export it from your library below).</p>'+
 '<label>License service <select id="ownProv"><option value="ls">Lemon Squeezy</option><option value="gr">Gumroad</option></select></label><label>Gumroad product id <input id="ownGr" placeholder="only for Gumroad"></label>'+
 '<label>PRO monthly link <input id="ownPm"></label><label>PRO yearly link <input id="ownPy"></label><label>STUDIO monthly link <input id="ownSm"></label><label>STUDIO yearly link <input id="ownSy"></label><label>Single pack link <input id="ownS1"></label><label>Catalog URL <input id="ownCat" placeholder="https://…/catalog.json"></label>'+
 '<div class="kfact"><button class="hwb" id="ownSave"><i class="led"></i>SAVE SETUP</button><button class="hwb" id="ownExport"><i class="led"></i>EXPORT CATALOG FROM MY LIBRARY</button></div><small>Prices shown on the cards are set in the code (PLANS) and must match your store. Checks run in the browser, so treat this as a convenience lock: for strict protection, serve premium files through signed links from your store.</small></div></details></div>';
 return u}
const money=v=>v===0?'$0':'$'+(v%1?v.toFixed(2):v);
function storeRender(){const y=!!ST.yearly,mine=myPlan();
 $$('#stCycle [data-y]').forEach(b=>b.classList.toggle('on',+b.dataset.y===+y));$('stPlan').textContent='PLAN: '+PLANS.find(p=>p.id===mine).n;
 $('stPlans').innerHTML=PLANS.map(p=>{const price=y?p.y:p.m,per=p.id==='pro'?(y?p.y/12/10:p.m/10):0;
  return'<div class="plan'+(p.hl?' hl':'')+(mine===p.id?' mine':'')+'"><small>'+p.tag+'</small><b>'+p.n+'</b><div class="pr">'+(p.m?'<em>'+money(y?+(p.y/12).toFixed(2):p.m)+'</em><span>/ month'+(y?'<br>billed '+money(p.y)+' a year':'')+'</span>':'<em>$0</em><span>forever</span>')+'</div>'+(per?'<div class="per">about $'+per.toFixed(2)+' a pack</div>':'')+(y&&p.m?'<div class="save">you save '+money(+(p.m*12-p.y).toFixed(2))+' a year</div>':'')+
  '<ul>'+p.f.map(f=>'<li>'+f+'</li>').join('')+'</ul><button class="hwb'+(p.hl?' np':'')+'" data-plan="'+p.id+'"><i class="led"></i>'+(mine===p.id?'YOUR PLAN':p.m?(RANK[mine]>RANK[p.id]?'INCLUDED':'GET '+p.n):'START FREE')+'</button></div>'}).join('');
 $('stBuy1').querySelector('i').nextSibling;$$('.stsingle s')[0].textContent='';
 $('stFree').innerHTML=[['A','DETROIT STARTER KIT','The smart drum kit from the demo beat: kicks, snares, hats, percs.'],['B','CHOP CHAINS STARTER','Slices that link into phrases, ready to flip.'],['C','LOOP STARTER','Seamless 1, 2 and 4 bar loops from the demo.']].map(([b,t,d])=>'<div class="spk free"><b>'+t+'</b><span>'+d+'</span><em>FREE</em><button class="hwb" data-free="'+b+'" data-n="'+t+'"><i class="led"></i>GET IT</button></div>').join('');
 const C=ST.cat;$('stCat').innerHTML=C.length?C.map((c,i)=>{const ok=RANK[mine]>=RANK[c.tier||'pro'];return'<div class="spk'+(ok?'':' lock')+'">'+(c.img?'<img src="'+esc(c.img)+'" alt="">':'')+'<b>'+esc(c.title)+'</b><span>'+esc([c.genre,c.type].filter(Boolean).join(' · '))+'</span><em>'+(c.tier==='studio'?'STUDIO':'PRO')+'</em><button class="hwb'+(ok?' np':'')+'" data-cat="'+i+'"><i class="led"></i>'+(ok?'LOAD &amp; CHOP':'🔒 UNLOCK')+'</button></div>'}).join(''):'<p class="empty">'+(ST.own.cat?'Loading the catalog…':'No premium packs have been published here yet.')+'</p>'}
async function storeCatalog(){const u=ST.own.cat;if(!u){ST.cat=[];return}try{const r=await fetch(u,{cache:'no-cache'});const j=await r.json();ST.cat=(Array.isArray(j)?j:j.packs||[]).filter(x=>x&&x.url&&x.title);storeRender()}catch(e){ST.cat=[];say('The premium catalog could not be loaded.');storeRender()}}
async function checkLicense(key){const O=ST.own;let ok=false,plan='pro',name='';
 if((O.prov||'ls')==='gr'){if(!O.gr)throw new Error('The store owner has not set up Gumroad yet.');const r=await fetch('https://api.gumroad.com/v2/licenses/verify',{method:'POST',body:new URLSearchParams({product_id:O.gr,license_key:key,increment_uses_count:'false'})});const j=await r.json();const P=j.purchase||{};ok=!!j.success&&!P.subscription_cancelled_at&&!P.subscription_failed_at&&!P.subscription_ended_at&&!P.refunded;name=(P.product_name||'')+' '+(P.variants||'')}
 else{const r=await fetch('https://api.lemonsqueezy.com/v1/licenses/validate',{method:'POST',headers:{Accept:'application/json'},body:new URLSearchParams({license_key:key})});const j=await r.json();ok=!!j.valid&&(!j.license_key||['active','inactive'].includes(j.license_key.status));name=j.meta?(j.meta.product_name||'')+' '+(j.meta.variant_name||''):''}
 if(/studio/i.test(name))plan='studio';else if(/single|one pack/i.test(name))plan='single';return{ok,plan:plan==='single'?'free':plan,single:plan==='single',name:name.trim(),key,at:Date.now()}}
function storeWire(){
 $('stCycle').onclick=e=>{const b=e.target.closest('[data-y]');if(!b)return;ST.yearly=+b.dataset.y;LSs('bc16:st:y',ST.yearly);storeRender()};
 $('stPlans').onclick=e=>{const b=e.target.closest('[data-plan]');if(!b)return;const p=b.dataset.plan;if(p==='free'){say('You are on STARTER. Grab the free packs below.');$('stFree').scrollIntoView({behavior:'smooth'});return}
  const k={pro:ST.yearly?'py':'pm',studio:ST.yearly?'sy':'sm'}[p],link=ST.own[k];if(!link){say('Checkout is not set up on this copy yet (owner setup, at the bottom).');return}window.open(link,'_blank','noopener');say('Checkout opened in a new tab. Your license key arrives by email: paste it under ALREADY A MEMBER.')};
 $('stBuy1').onclick=()=>{if(!ST.own.s1){say('Single-pack checkout is not set up on this copy yet.');return}window.open(ST.own.s1,'_blank','noopener')};
 $('stCheck').onclick=async()=>{const k=$('stKey').value.trim();if(!k){say('Paste your license key first.');return}$('stLicMsg').textContent='Checking…';try{const L=await checkLicense(k);if(!L.ok){$('stLicMsg').textContent='That key is not active. Check it, or contact the store.';return}ST.lic=L;LSs('bc16:st:lic',L);$('stLicMsg').textContent='Unlocked: '+(L.name||PLANS.find(p=>p.id===L.plan).n)+'.';storeRender()}catch(e){$('stLicMsg').textContent='Could not check the key: '+e.message}};
 $('stFree').onclick=async e=>{const b=e.target.closest('[data-free]');if(!b)return;const bank='ABCDEFGH'.indexOf(b.dataset.free),n=b.dataset.n;
  if(!ready()||!/demo|taco/i.test(fnameSafe())){const d=$('demo');if(!d||d.hidden){say('The demo beat is not available in this copy.');return}say('Loading the demo beat to build '+n+'…');d.click();let t=0;while(!(ready()&&API().kit(bank).some(Boolean))&&t<600){await sleep(500);t++}await sleep(1200)}
  if(!API().kit(bank).some(Boolean)){say('The demo kits are still building. Try again in a moment.');return}API().saveKit(n,bank);say(n+' is saved under MY KITS in KIT FORGE.');go('kit')};
 $('stCat').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;const c=ST.cat[+b.dataset.cat];if(RANK[myPlan()]<RANK[c.tier||'pro']){$('stPlans').scrollIntoView({behavior:'smooth'});say('“'+c.title+'” is in '+(c.tier==='studio'?'STUDIO':'PRO')+'. Pick a plan above, or buy it as a single pack.');return}
  const it={id:'cat:'+c.url,g:'',t:'',title:c.title,url:c.url,img:c.img||'',dur:0,created:Date.now()};if(!PF.items.some(x=>x.id===it.id)){PF.items.push(it);idbPut(it)}pfPack(it)};
 const O=ST.own,f={ownProv:'prov',ownGr:'gr',ownPm:'pm',ownPy:'py',ownSm:'sm',ownSy:'sy',ownS1:'s1',ownCat:'cat'};for(const[id,k]of Object.entries(f))if(O[k])$(id).value=O[k];
 $('ownSave').onclick=()=>{for(const[id,k]of Object.entries(f))ST.own[k]=$(id).value.trim();LSs('bc16:st:own',ST.own);say('Store setup saved on this device.');storeCatalog();storeRender()};
 $('ownExport').onclick=()=>{const L=PF.items.filter(x=>x.url&&!/^cat:/.test(x.id)).map(x=>({title:x.title,genre:gName(x.g),type:tName(x.t),tier:'pro',url:x.url,img:x.img||''}));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({packs:L},null,1)],{type:'application/json'}));a.download='catalog.json';a.click();say('catalog.json has '+L.length+' packs. Set tier to "studio" on any you want STUDIO-only, host the audio and this file, then paste its link as the Catalog URL.')};
 storeCatalog()}

/* ================= SLICE INTELLIGENCE: what every cut is, how good it is, and which chop fits the song ================= */
let SI={ref:null,res:null};
function sliceIntel(){let S;try{S=slices}catch(e){return null}if(!S||!S.length)return null;if(SI.ref===S&&SI.res)return SI.res;
 const bpm=+$('bpm').value||90,beat=60/bpm,step=beat/4,ph=(()=>{try{return phase||0}catch(e){return 0}})(),d=y;
 const out=S.map((s,i)=>{const len=(s.e-s.s)/sr,bt=len/beat,u=(s.t-ph)/step,off=Math.abs(u-Math.round(u)),grid=Math.max(0,1-2*off);
  const a=Math.min(s.e,s.s+Math.floor(sr*.015));let pk=0;for(let k=s.s;k<a;k++){const v=Math.abs(d[k]);if(v>pk)pk=v}
  const en=s.en||1e-4,punch=Math.max(0,Math.min(1,(pk/(en*1.4+1e-6)-1)/5));
  const q=Math.max(8,Math.floor((s.e-s.s)/5));let h=0,tl=0;for(let k=s.s;k<s.s+q;k+=2)h+=d[k]*d[k];for(let k=s.e-q;k<s.e;k+=2)tl+=d[k]*d[k];const clean=Math.max(0,Math.min(1,1-Math.sqrt(tl/(h+1e-9))));
  const kind=s.kind||'',clar=s.clar||0,tonal=clar>.6;
  const score=kind==='tone'?.35*grid+.4*clar+.25*Math.min(1,bt/2):.35*punch+.3*clean+.35*grid;
  return{i,kind,len,bt,grid,punch,clean,clar,tonal,score,en,v:[s.lo||0,s.hi||0,Math.min(1,(s.pk||0)/30),Math.min(1,bt/4),Math.min(1,en*4)]}});
 for(let i=0;i<out.length;i++){if(out[i].dup!=null)continue;for(let j=i+1;j<out.length;j++){if(out[j].dup!=null||out[j].kind!==out[i].kind)continue;let dd=0;for(let k=0;k<5;k++)dd+=(out[i].v[k]-out[j].v[k])**2;if(dd<.0006)out[j].dup=i}}
 const dur=(S[S.length-1].e-S[0].s)/sr,share={kick:0,snare:0,hat:0,tone:0};out.forEach(o=>{if(share[o.kind]!=null)share[o.kind]+=o.len});for(const k in share)share[k]/=dur||1;
 const res={list:out,share,dups:out.filter(o=>o.dup!=null).length,grid:out.filter(o=>o.grid>.8).length/out.length,avg:out.reduce((a,o)=>a+o.bt,0)/out.length,beat};SI={ref:S,res};return res}
const RECIPES=[
 ['drums','DRUM HITS','One sound per pad: kicks, snares, hats, percs. For drum breaks and full songs you want to rebuild.',{mode:'smart',sens:65,minl:'0.25',maxl:'1'}],
 ['flip','SOUL FLIP','Musical phrases cut on the hits, ½ to 1 bar. The classic chop-and-flip.',{mode:'smart',sens:40,minl:'1',maxl:'4'}],
 ['stabs','STABS','Short chords and hits to play like an instrument.',{mode:'smart',sens:55,minl:'0.5',maxl:'2'}],
 ['half','HALF-BAR','Every 2 beats, nudged onto the hits. Great for re-sequencing a loop.',{mode:'smart',sens:45,minl:'2',maxl:'2'}],
 ['loops','BAR LOOPS','One bar per pad, on the bar lines. For looping whole sections.',{mode:'bar',sens:50,minl:'0.25',maxl:'0'}],
 ['grid','16TH GRID','Even 16th slices for stutters, rolls and glitches.',{mode:'grid',sens:50,minl:'0.125',maxl:'0.5'}],
 ['vocal','VOCAL CHOPS','Longer, softer cuts that keep words and syllables whole.',{mode:'smart',sens:35,minl:'0.5',maxl:'4'}]];
function recipeApply(id){if(!need())return;const R=RECIPES.find(r=>r[0]===id),c=R[3];$('mode').value=c.mode;$('sens').value=c.sens;if($('sv'))$('sv').textContent=c.sens;$('minl').value=c.minl;$('maxl').value=c.maxl;try{rebuild()}catch(e){}SI.ref=null;LSs('bc16:recipe:'+fnameSafe(),id);say(R[1]+': '+slicesN()+' cuts. The pads now play them in order.');if(curP==='slicer')slicerRender()}
const slicesN=()=>{try{return slices.length}catch(e){return 0}};
function recommend(){const R=sliceIntel();if(!R)return null;const drum=R.share.kick+R.share.snare+R.share.hat,ton=R.share.tone;
 if(drum>.55)return['drums','Most of this song is drum hits ('+Math.round(drum*100)+'%), so one hit per pad gives you a playable kit.'];
 if(ton>.5)return['flip','Most of this song is tonal ('+Math.round(ton*100)+'%), so phrase chops on the hits will flip best.'];
 return['stabs','The song mixes drums and music, so short stabs give you both hits and chords to play.']}
function buildSlicer(){const u=el('section',{id:'osSlicer',class:'unit'});
 u.innerHTML=plate('SLICE BRAIN','SX-1','osSlicer')+'<div class="sxbody"><div class="sxcol"><div class="sxrec" id="sxRec" data-help="sxRec"></div><span class="hwl">CHOP RECIPES</span><div class="recipes" id="sxRecipes" data-help="sxRecipes"></div><span class="hwl">CLEAN-UP</span><div class="kfact" data-help="sxClean"><button class="hwb" id="sxMerge"><i class="led"></i>MERGE WEAK CUTS</button><button class="hwb" id="sxReset"><i class="led"></i>UNDO MY CUT EDITS</button><button class="hwb np" id="sxKit"><i class="led"></i>BEST-OF KIT ▶</button></div></div>'+
 '<div class="sxcol"><div class="sxsum" id="sxSum" data-help="sxSum"></div><div class="sbh"><span class="hwl">EVERY CUT, RANKED</span><div class="kffilt" id="sxFilt"></div><label class="sbchk"><input type="checkbox" id="sxDup" checked> hide repeats</label></div><div class="sxlist" id="sxList" data-help="sxList"></div></div></div>';
 return u}
let SX={filt:'all',sig:''};
function slicerRender(){if(!ready()){$('sxList').innerHTML='<p class="empty">Load a song to analyze its cuts.</p>';return}const R=sliceIntel();if(!R)return;const rec=recommend(),cur=LSg('bc16:recipe:'+fnameSafe(),'');
 $('sxRec').innerHTML='<b>RECOMMENDED: '+RECIPES.find(r=>r[0]===rec[0])[1]+'</b><span>'+rec[1]+'</span><button class="hwb np" data-r="'+rec[0]+'"><i class="led"></i>USE IT</button>';
 $('sxRecipes').innerHTML=RECIPES.map(r=>'<button class="recipe'+(r[0]===cur?' on':'')+(r[0]===rec[0]?' rec':'')+'" data-r="'+r[0]+'"><b>'+r[1]+'</b><span>'+r[2]+'</span></button>').join('');
 const pct=v=>Math.round(v*100)+'%';$('sxSum').innerHTML='<div><b>'+R.list.length+'</b><span>cuts</span></div><div><b>'+R.avg.toFixed(2)+'</b><span>beats each</span></div><div><b>'+pct(R.grid)+'</b><span>on the grid</span></div><div><b>'+R.dups+'</b><span>repeats</span></div><div class="mix"><i style="flex:'+R.share.kick+';background:#e03131" title="kick"></i><i style="flex:'+R.share.snare+';background:#4c6ef5" title="snare"></i><i style="flex:'+R.share.hat+';background:#f59f00" title="hat"></i><i style="flex:'+R.share.tone+';background:#12b886" title="tone"></i></div>';
 $('sxFilt').innerHTML=[['all','ALL'],['kick','KICK'],['snare','SNARE'],['hat','HAT'],['tone','TONE']].map(([f,t])=>'<button class="chip'+(SX.filt===f?' on':'')+'" data-f="'+f+'">'+t+'</button>').join('');
 const L=R.list.filter(o=>(SX.filt==='all'||o.kind===SX.filt)&&(!$('sxDup').checked||o.dup==null)).sort((a,b)=>b.score-a.score).slice(0,160),bar=v=>'<i class="mt"><u style="width:'+Math.round(v*100)+'%"></u></i>';
 $('sxList').innerHTML='<div class="sxh"><span>CUT</span><span>LENGTH</span><span>ON GRID</span><span>PUNCH</span><span>CLEAN</span><span>SCORE</span><span></span></div>'+L.map(o=>'<div class="sxr" data-i="'+o.i+'" style="--pc:'+(KCOL[o.kind]||'#7d8b98')+'"><button class="sxp" data-a="hear">▶ #'+(o.i+1)+' <em>'+(o.kind||'cut').toUpperCase()+'</em>'+(o.dup!=null?'<small>like #'+(o.dup+1)+'</small>':'')+'</button><span>'+o.bt.toFixed(2)+' bt</span>'+bar(o.grid)+bar(o.punch)+bar(o.clean)+'<b>'+Math.round(o.score*100)+'</b><span class="sxa"><button data-a="kit" title="Put in the lit Kit Forge slot">→ KIT</button><button data-a="cut" title="Remove the cut before this slice (merge it into the one before)">✕ CUT</button></span></div>').join('')}
const KCOL={kick:'#e03131',snare:'#4c6ef5',hat:'#f59f00',tone:'#12b886'};
function slicerWire(){
 const app=e=>{const b=e.target.closest('[data-r]');if(b)recipeApply(b.dataset.r)};$('sxRecipes').onclick=app;$('sxRec').onclick=app;
 $('sxFilt').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;SX.filt=b.dataset.f;slicerRender()};$('sxDup').onchange=slicerRender;
 $('sxList').onclick=e=>{const b=e.target.closest('[data-a]');if(!b||!need())return;const i=+b.closest('.sxr').dataset.i,a=b.dataset.a;
  if(a==='hear')API().hear({k:'slice',ci:i});
  else if(a==='kit'){if(API().put(i,KF.bank,KF.armed)){say('Cut #'+(i+1)+' → kit slot '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+'.');kitArmNext(false)}}
  else if(a==='cut'){if(i===0){say('The first cut cannot be removed.');return}try{manual.del.push(slices[i].t);rebuild()}catch(er){}SI.ref=null;slicerRender();say('Merged #'+(i+1)+' into #'+i+'. UNDO MY CUT EDITS puts it back.')}};
 $('sxMerge').onclick=()=>{if(!need())return;const R=sliceIntel();let n=0;try{for(const o of R.list){if(o.i===0)continue;if(o.bt<.2&&o.score<.45&&o.kind!=='hat'){manual.del.push(slices[o.i].t);n++}}if(n)rebuild()}catch(e){}SI.ref=null;slicerRender();say(n?'Merged '+n+' weak, tiny cuts into their neighbours. UNDO MY CUT EDITS puts them back.':'No weak tiny cuts found.')};
 $('sxReset').onclick=()=>{try{$('rst').click()}catch(e){}SI.ref=null;slicerRender();say('Your cut edits are cleared: the recipe’s cuts are back.')};
 $('sxKit').onclick=async()=>{if(!need())return;let b=[...Array(8).keys()].find(i=>!API().kit(i).some(Boolean));let rep=false;if(b==null){if(!await ask('All 8 kit banks have sounds. Rebuild bank '+BL[KF.bank]+' as a best-of kit? UNDO brings it back.'))return;b=KF.bank;rep=true}KF.bank=b;KF.armed=0;API().setBank(b);go('kit');autoFill('roles',rep)}}

/* ================= KIT FORGE: MPC roles, auto-fill and suggestions ================= */
const ROLES=[['KICK','kick','s'],['SNARE','snare','s'],['CLAP','snare','s2'],['KICK 2','kick','s2'],['HAT','hat','s'],['OPEN HAT','hat','l'],['HAT 2','hat','s2'],['PERC','snare','p'],['PERC 2','hat','p'],['SNARE 2','snare','s3'],['FX','tone','s'],['CRASH','hat','l2'],['TONE 1','tone','t'],['TONE 2','tone','t'],['TONE 3','tone','t'],['TONE 4','tone','t']];
function roleCands(j,used){const R=sliceIntel();if(!R)return[];const [nm,kind,pref]=ROLES[j];let L=R.list.filter(o=>o.kind===kind&&o.dup==null&&!used.has(o.i));
 if(pref[0]==='l')L=L.sort((a,b)=>(b.bt*.5+b.score)-(a.bt*.5+a.score));else if(pref==='t')L=L.filter(o=>o.tonal||o.kind==='tone').sort((a,b)=>b.score-a.score);else if(pref==='p')L=L.filter(o=>o.bt<.5).sort((a,b)=>(b.punch+b.clean)-(a.punch+a.clean));else L=L.filter(o=>o.bt<1.2).sort((a,b)=>b.score-a.score);
 if(!L.length)L=R.list.filter(o=>o.kind===kind&&!used.has(o.i)).sort((a,b)=>b.score-a.score);const skip=pref==='s2'?1:pref==='s3'?2:pref==='l2'?1:0;return L.slice(skip)}
function autoFill(how,replace){if(!need())return;const A=API(),K=A.kit(KF.bank),R=sliceIntel();if(!R)return;const used=new Set();let n=0;
 const slots=[...Array(16).keys()].filter(j=>replace||!K[j]);if(!slots.length){say('Bank '+BL[KF.bank]+' is full. Tick REPLACE to rebuild it, or pick another bank.');return}
 if(how==='roles'){for(const j of slots){const c=roleCands(j,used)[0];if(c){A.put(c.i,KF.bank,j);used.add(c.i);n++}}}
 else{let L;if(how==='order'){const all=kitList();L=all.slice(KF.page*KF.per)}else if(how==='tonal')L=R.list.filter(o=>o.kind==='tone'||o.tonal).filter(o=>o.dup==null).sort((a,b)=>b.score-a.score).map(o=>o.i);
  else if(how==='loops')L=R.list.filter(o=>o.bt>=1.8&&o.dup==null).sort((a,b)=>(b.grid+b.score)-(a.grid+a.score)).map(o=>o.i);else L=R.list.filter(o=>o.dup==null).sort((a,b)=>b.score-a.score).map(o=>o.i);
  let k=0;for(const j of slots){const ci=L[k++];if(ci==null)break;A.put(ci,KF.bank,j);n++}}
 kitArmNext(true);kitRender();say(n?'Filled '+n+' slot'+(n>1?'s':'')+' in bank '+BL[KF.bank]+' ('+({roles:'MPC drum layout',order:'cuts in order from this page',tonal:'best tonal stabs',loops:'loops',best:'best cuts'})[how]+'). Change any slot by lighting it and holding another cut; UNDO takes the fill back.':'Not enough matching cuts. Try another fill, or another chop recipe on SLICE BRAIN.')}
function kitSuggest(){const box=$('kfSug');if(!box)return;if(!ready()){box.innerHTML='';return}const c=roleCands(KF.armed,new Set()).slice(0,8),A=API();
 box.innerHTML='<span class="hwl">BEST FOR '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+(KF.roles?' · '+ROLES[KF.armed][0]:'')+'</span><div class="kfsg">'+c.map(o=>{const s=A.slice(o.i);return'<button class="kc" data-ci="'+o.i+'" style="--pc:'+s.col+'"><canvas width="120" height="40"></canvas><b>#'+(o.i+1)+'</b><span>'+Math.round(o.score*100)+'</span></button>'}).join('')+'</div>';
 $$('#kfSug .kc').forEach(x=>wave(x.querySelector('canvas'),A.slice(+x.dataset.ci)))}

/* ================= COACH: a guide that stays on while you work =================
   The panel shows, for the unit you are on: what it is for, the steps to get the best from it (ticked off live),
   what the control you just pressed did and what to do next, and pro tips. Holding any control for ½ s
   explains it without pressing it (pads, kit slots, cuts and keys keep their own hold actions). */
const A_=()=>API();const has=f=>{try{return!!f()}catch(e){return false}};
const patHits=()=>has(()=>A_().patMeta()[A_().pat()].hits>0),anyKit=()=>has(()=>[0,1,2,3,4,5,6,7].some(b=>A_().kit(b).some(Boolean)));
const GUIDE={
 start:{why:'Every session starts here: load a song and the machine finds its tempo, key and every hit, then cuts it and builds first kits.',steps:[['Load a song: LOAD (top bar), drop a file anywhere, or try the demo beat.',()=>ready()],['Check the display: tempo, key and slice count are right.',()=>ready()],['Go to CHOP to choose how it is cut.',null,'chop']],tips:['WAV or FLAC chops cleanest; MP3 works too.','Each song remembers its own cuts, kits and patterns: switch songs and come back any time.']},
 chop:{why:'The sampler decides where the song is cut. The PAD MATRIX plays the cuts in order (CHOP program).',steps:[['Pick a recipe on the SLICE BRAIN tab, or set SHORTEST and LONGEST.',()=>!!LSg('bc16:recipe:'+fnameSafe(),'')],['Tap through the pads to hear the cuts.',null],['Tap the waveform to add a cut, tap a cut line to remove it.',null],['Build a kit from your favourite cuts.',()=>anyKit(),'kit']],tips:['Drum hits: LONGEST 1 beat. Loop chops: LONGEST 1 or 2 bars.','More than 128 cuts? ◀ SLICES / SLICES ▶ page the banks.']},
 slicer:{why:'Slice Brain reads the song: which chop flips best, and how good each cut is.',steps:[['Read the recommendation and press USE IT.',()=>!!LSg('bc16:recipe:'+fnameSafe(),'')],['Filter KICK, SNARE, HAT or TONE and play the top scores.',null],['Send keepers → KIT, or press BEST-OF KIT.',()=>anyKit()]],tips:['Score = on the grid + sharp start + clean tail. 70+ is a keeper.','“like #12” means the same sound repeats: keep one, hide repeats.','✕ CUT merges a slice into the one before; UNDO MY CUT EDITS puts it back.']},
 kit:{why:'Kit Forge builds your own pads: by hand, or automatically and then by hand.',steps:[['Pick a kit bank (A–H).',null],['AUTO-FILL, or light a slot and hold a cut.',()=>has(()=>A_().kit(KF.bank).some(Boolean))],['Swap any slot: light it, hold a better cut.',null],['Name the kit and SAVE KIT.',()=>has(()=>A_().kits().length)],['PLAY ON PADS.',null,'pads']],tips:['The strip under the slots shows the best cuts for the lit slot.','Arrange 2–3 banks per song (chops, drums, hook) and the Song Builder brings the right one back per part.']},
 pads:{why:'The drum machine: play, record and fix your parts.',steps:[['Choose what the pads play: CHOP or KIT.',null],['Pick a pattern (◀ ▶ or P1–P16).',null],['REC, then PLAY, then play the pads.',()=>patHits()],['Fix it: UNDO the take, or ERASE + a pad.',null],['Add movement: AUTOMATION WRITE, move FILTER or PUMP.',()=>has(()=>Object.keys(A_().autoLanes()).length)]],tips:['Keys A S D F … play the pads; 1–8 switch banks.','NOTE REPEAT for rolls; 16 LEVELS plays one sound as notes.']},
 sequence:{why:'Draw and edit hits on a grid, and make variations.',steps:[['Click cells to add or remove hits.',()=>patHits()],['Set the length: 1, 2, 4 or 8 bars.',null],['COPY ▶ for a variation, then change the copy.',()=>has(()=>A_().patMeta().filter(p=>p.hits).length>1)]],tips:['Click a pad name on the left to hear it.','SMART BEAT writes a starting pattern from your sounds.']},
 tower:{why:'Three stacked keyboards for bass, chords and leads.',steps:[['Pick a sound and octave for each tier.',null],['Play: glide, tap, or use the Z and Q rows.',null],['REC + PLAY to record the melody into the pattern.',()=>patHits()]],tips:['STACK two tiers for a layered sound.','SCALE LOCK keeps every note in key.']},
  build:{why:'This is how a chop song gets made: loop a part, play the next part over it, NEXT PART, until it is done. Or lay out a structure and let Beat Brain write the parts, then edit each one.',steps:[['Optional: SONG STRUCTURE → LAY IT OUT writes named parts for you.',()=>has(()=>A_().patMeta().some(p=>p.name))],['LOOP THIS PART.',()=>has(()=>A_().playing())],['Arm REC and play the part that goes over it.',()=>patHits()],['NEXT PART.',()=>has(()=>A_().song().list.length>=2)],['Turn channels on or off for the new part.',null],['PLAY THE SONG, then EXPORT.',null,'song']],tips:['The whole loop carries into each new part; drop channels for breakdowns.','Tap a part, then SMART EDIT: rewrite it as a hook, a new take, drums only… MAKE IT ITS OWN before changing a repeated part.','Double-tap a part to jump to it on the beat.']},
 song:{why:'Song order, exports and saved setups.',steps:[['Check the order of parts.',()=>has(()=>A_().song().list.length)],['Export WAV, MP3 or MIDI.',null],['SAVE your setup.',null]],tips:['TAKE REC (top bar) records a live performance as audio.']},
 launch:{why:'Perform: every pattern on one console.',steps:[['Tap a clip to play it.',()=>has(()=>A_().playing())],['Tap the next clip: it waits, then starts on time.',null],['Play pads and sweep FILTER on top.',null]],tips:['F1–F12 launch clips from the keyboard.']},
 factory:{why:'Make new sample packs with AI, in any genre, saved to your own library.',steps:[['Paste your API key.',()=>!!(($('pfKey')||{}).value)],['Pick genres and pack types.',null],['BUILD LIBRARY.',null],['PRO PACK any track to chop it into kits.',null]],tips:['Each request makes 2 tracks and uses your credits.','SAVE keeps the audio on this device (the service only keeps it ~14 days).']},
 store:{why:'Free starter packs and premium plans.',steps:[['Grab the free starter packs.',null],['Have a license key? Paste it under ALREADY A MEMBER.',null]],tips:[]},
 guide:{why:'Lessons, the full narrated course and the button book.',steps:[['Take the narrated course, or one lesson at a time.',null]],tips:['Hold any button for ½ second to hear what it does.']}};
const NEXT={psRec:'Now press PLAY. After the count-in, play the pads or keys.',psPlay:'Playing. Press STOP when you are done, or NEXT PART to move on.',psStop:'Stopped. Press PLAY to hear it back, or UNDO if the take was not right.',osUndo:'Undone. Try again whenever you are ready.',osNext:'New part: play the next part over the loop, then NEXT PART again.',osPatDup:'You are on the copy now: change it to make the variation.',kfFill:'Change any slot: light it, then hold a better cut.',sbLoop:'Arm REC and play the part that goes over this loop.',hwLoad:'When the song loads, go to CHOP.',kfSv:'Saved. Tap it under MY KITS to load it into any bank.',osSave:'Saved. Your work also saves itself as you go.',hwErase:'ERASE is lit: press a pad to wipe only that sound.',hwMute:'PAD MUTE is lit: press pads to mute or unmute them.'};
const CO={on:LSg('bc16:coach',0),last:null,sig:''};
function coachPanelBuild(){const p=el('aside',{id:'coachP','aria-label':'Coach'});p.innerHTML='<div class="plate"><i class="pled"></i><b class="pn">COACH</b><span class="pm">ON</span><span class="vent"></span><button class="zb" id="coachX" title="Turn the coach off" aria-label="Turn the coach off">✕</button></div><div class="cpb" id="coachB"></div>';$('device').append(p);$('coachX').onclick=()=>coachToggle(false)}
function coachToggle(on){CO.on=on;LSs('bc16:coach',on?1:0);document.body.classList.toggle('coachon',on);$('osCoach').classList.toggle('on',on);CO.sig='';coachRender();say(on?'Coach on: steps for this unit, and what each button does as you press it. Hold any button to learn it.':'Coach off. Hold any button to learn it, any time.')}
function coachRender(){if(!CO.on)return;const G=GUIDE[curP]||{why:(UNITS[curP]||{}).d||'',steps:[],tips:[]};const st=G.steps.map(s=>s[1]?has(s[1]):null);
 const sig=curP+'|'+st.join(',')+'|'+(CO.last?CO.last.k+CO.last.t:'');if(sig===CO.sig)return;CO.sig=sig;const U=UNITS[curP]||{n:''};
 let h='<h4>'+U.n+'</h4><p class="cwhy">'+G.why+'</p>';
 if(G.steps.length)h+='<ol class="csteps">'+G.steps.map((s,i)=>'<li class="'+(st[i]?'done':'')+'"><i>'+(st[i]?'✓':i+1)+'</i><span>'+s[0]+(s[2]?' <button class="cgo" data-go="'+s[2]+'">GO ▶</button>':'')+'</span></li>').join('')+'</ol>';
 if(CO.last)h+='<div class="clast"><small>YOU PRESSED</small><b>'+esc(CO.last.t)+'</b><p>'+esc(CO.last.d)+'</p>'+(NEXT[CO.last.k]?'<p class="cnext">Next: '+NEXT[CO.last.k]+'</p>':'')+'</div>';
 if(G.tips&&G.tips.length)h+='<div class="ctips"><small>PRO TIPS</small>'+G.tips.map(t=>'<p>'+t+'</p>').join('')+'</div>';
 h+='<div class="cfoot">Hold any button for ½ second to learn it · <button class="cgo" data-lesson="1">LESSONS ▶</button></div>';$('coachB').innerHTML=h}
function coachWire2(){coachPanelBuild();
 $('coachB').onclick=e=>{const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}if(e.target.closest('[data-lesson]'))go('guide')};
 document.addEventListener('click',e=>{if(!CO.on||document.body.classList.contains('explain'))return;if(e.target.closest('#coachP,#coach,#xbub'))return;const h=helpFor(e.target);if(!h||h[2]==='Unit')return;const k=(h[3].dataset&&h[3].dataset.help)||h[3].id||'';CO.last={k,t:h[0],d:h[1]};setTimeout(coachRender,60)},true);
 /* hold to learn */
 let HT=null,HS=null,swallow=false;const NOHOLD='#psGrid .pp,.ks,.kc,.twkb,.twkb *,#c1,#pads button,.knob,input[type=range],#sbTL .cell,.clip,.part';
 document.addEventListener('pointerdown',e=>{if(document.body.classList.contains('explain')||e.button>0)return;const t=e.target;if(t.closest(NOHOLD)||t.closest('#coach,#xbub,#welcome,input[type=text],input:not([type]),select,textarea'))return;const h=helpFor(t);if(!h||h[2]==='Unit')return;HS={x:e.clientX,y:e.clientY};clearTimeout(HT);HT=setTimeout(()=>{swallow=true;showBub(h);$('xbub').querySelector('small').textContent='Hold any button to learn it. Let go and tap it normally to use it.';try{navigator.vibrate&&navigator.vibrate(12)}catch(er){}},550)},true);
 addEventListener('pointermove',e=>{if(HS&&Math.hypot(e.clientX-HS.x,e.clientY-HS.y)>8){clearTimeout(HT);HS=null}},true);
 addEventListener('pointerup',()=>{clearTimeout(HT);HS=null},true);addEventListener('pointercancel',()=>{clearTimeout(HT);HS=null},true);
 document.addEventListener('click',e=>{if(swallow){swallow=false;if(!e.target.closest('#xbub')){e.preventDefault();e.stopPropagation()}}},true);
 document.addEventListener('contextmenu',e=>{if(swallow||HT&&HS)e.preventDefault()},true);
 document.addEventListener('pointerdown',e=>{if(!$('xbub').hidden&&!e.target.closest('#xbub')&&!document.body.classList.contains('explain'))$('xbub').hidden=true});
 if(CO.on)coachToggle(true)}



/* ================= SOUND LOGIC: one main player at a time, page sounds stop when you leave =================
   Main players: the transport (patterns / song), the sampler's song preview, the Auto Producer playback and
   the library preview. Starting one stops the others. Pads, cuts and keys you play by hand are never cut off:
   you play along with whatever is running. Leaving a page stops what only belongs to that page; the transport
   keeps running across pages, like hardware. STOP on a stopped machine = ALL STOP (everything silent). */
const eng=n=>{try{return window[n]}catch(e){return null}};
function previewOn(){try{return!!src}catch(e){return false}}
function arrangeOn(){try{return!!(AR&&AR.src)}catch(e){return false}}
function libStop(){const a=$('pfAudio');if(a&&!a.paused){a.pause();$$('#pfItems [data-a="play"]').forEach(x=>x.textContent='▶')}}
function towerOff(){for(const k of [...TW.ons.keys()])tOff(k)}
function focus(who){if(who!=='preview'&&previewOn())try{stop()}catch(e){}if(who!=='arrange'&&arrangeOn())try{aStop()}catch(e){}if(who!=='library')libStop();if(who!=='transport'&&API()&&API().playing())$('psStop').click()}
function leave(prev,p){const g=x=>(GROUPS.find(G=>G.pages.includes(x))||{}).id;
 if(prev==='chop'&&g(p)!=='chop'&&previewOn())try{stop()}catch(e){}
 if(prev==='arrange'&&arrangeOn())try{aStop()}catch(e){}
 if(prev==='factory'||prev==='store')libStop();
 if(prev==='keys'||prev==='live')try{stopAll()}catch(e){}
 if(prev==='tower')towerOff()}
function allStop(){try{API().panic()}catch(e){}focus('none');try{stopAll()}catch(e){}towerOff();shush();say('ALL STOP: everything is silent.')}
function soundWire(){const wp=eng('play');if(typeof wp==='function'){window.play=function(d,btn){if(!(btn&&btn.dataset&&btn.dataset.on))focus('preview');return wp.apply(this,arguments)}}
 const ap=eng('aPlay');if(typeof ap==='function'){window.aPlay=function(){focus('arrange');return ap.apply(this,arguments)}}
 const au=$('pfAudio');if(au)au.addEventListener('play',()=>focus('library'));
 $('psStop').addEventListener('click',e=>{if(!API()||!ready())return;if(!API().playing()){allStop()}},true)}

/* ================= PROJECTS: the song audio + everything made with it, kept on this device =================
   Every song loaded is stored (IndexedDB) so a project reopens with one tap. The working state already
   autosaves per song; versions are snapshots you can go back to (each SAVE, plus one every 5 minutes of work).
   A full project file (.bc16) carries the audio AND the state, for moving to another device. */
let PDB=null;
function pdb(){if(PDB)return PDB;PDB=new Promise((res,rej)=>{const r=indexedDB.open('bc16proj',1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('songs',{keyPath:'key'});const v=d.createObjectStore('versions',{keyPath:'id'});v.createIndex('song','song')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return PDB}
async function ptx(store,mode,fn){const d=await pdb();return new Promise((res,rej)=>{const t=d.transaction(store,mode),st=t.objectStore(store);let out;const r=fn(st);if(r)r.onsuccess=()=>{out=r.result};t.oncomplete=()=>res(out);t.onerror=()=>rej(t.error)})}
const songKey=n=>(n||'').replace(/\.[^.]+$/,'').replace(/[^\w\-]+/g,'_')||'beat';
const PJ={savedVer:-1,lastAutoVer:-1,lastAutoAt:0,loading:false};
function projWire(){const L=window.load;if(typeof L==='function'){window.load=async function(ab,name){const key=songKey(name);
  if(!PJ.loading&&ab&&ab.byteLength<160e6){const bytes=ab.slice(0);ptx('songs','readwrite',st=>st.put({key,name,size:bytes.byteLength,bytes,added:Date.now(),opened:Date.now()})).catch(()=>{})}
  else if(PJ.loading){ptx('songs','readwrite',st=>st.get(key)).then(()=>{}).catch(()=>{})}
  LSs('bc16:lastSong',key);LSs('bc16:lastAt',Date.now());const r=await L.apply(this,arguments);PJ.savedVer=-1;return r}}
 try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
 /* unsaved light on SAVE, autosave versions every 5 minutes of changes */
 setInterval(()=>{const A=API();if(!A||!ready())return;const v=A.dirtyN();if(PJ.savedVer<0)PJ.savedVer=v;const uns=v!==PJ.savedVer;const b=$('osSave');b.classList.toggle('unsaved',uns);b.title=uns?'Unsaved changes (they are also autosaved): press to save a version':'Saved';
  LSs('bc16:lastAt',Date.now());if(uns&&v!==PJ.lastAutoVer&&Date.now()-PJ.lastAutoAt>300000){PJ.lastAutoVer=v;PJ.lastAutoAt=Date.now();saveVersion('autosave',true)}},2000)}
async function saveVersion(label,auto){const A=API();if(!A||!ready())return;const song=fnameSafe(),data=A.snapshot(),id=song+'@'+Date.now();await ptx('versions','readwrite',st=>st.put({id,song,at:Date.now(),label:label||'',auto:!!auto,data})).catch(()=>{});
 const all=await listVersions(song);const autos=all.filter(v=>v.auto);if(autos.length>20)for(const v of autos.slice(20))await ptx('versions','readwrite',st=>st.delete(v.id));if(!auto){PJ.savedVer=A.dirtyN();$('osSave').classList.remove('unsaved')}if(curP==='project')projRender()}
async function listVersions(song){const d=await pdb();return new Promise(res=>{const q=d.transaction('versions').objectStore('versions').index('song').getAll(song);q.onsuccess=()=>res((q.result||[]).sort((a,b)=>b.at-a.at));q.onerror=()=>res([])})}
async function listSongs(){const d=await pdb();return new Promise(res=>{const out=[];const c=d.transaction('songs').objectStore('songs').openCursor();c.onsuccess=()=>{const k=c.result;if(k){const{bytes,...m}=k.value;out.push(m);k.continue()}else res(out.sort((a,b)=>(b.opened||0)-(a.opened||0)))};c.onerror=()=>res([])})}
async function openSong(key){const rec=await ptx('songs','readonly',st=>st.get(key));if(!rec){say('That song is no longer stored on this device.');return false}
 rec.opened=Date.now();ptx('songs','readwrite',st=>st.put(rec)).catch(()=>{});PJ.loading=true;say('Opening “'+rec.name+'”…');try{await load(rec.bytes.slice(0),rec.name)}finally{PJ.loading=false}go('start');return true}
function buildProject(){const u=el('section',{id:'osProject',class:'unit'});
 u.innerHTML=plate('PROJECT MANAGER','PM-1','osProject')+'<div class="pjbody"><div class="pjcol"><div class="pjnow" id="pjNow" data-help="pjNow"></div>'+
 '<div data-help="pjVer"><div class="sbh"><span class="hwl">VERSIONS OF THIS PROJECT</span></div><div class="kfsrow"><input id="pjLabel" maxlength="40" placeholder="Name this version, e.g. hook done"><button class="hwb np" id="pjSaveV"><i class="led"></i>SAVE VERSION</button></div><div class="pjlist" id="pjVers"></div></div></div>'+
 '<div class="pjcol"><div data-help="pjRecent"><div class="sbh"><span class="hwl">RECENT PROJECTS ON THIS DEVICE</span></div><div class="pjlist" id="pjSongs"></div></div>'+
 '<div data-help="pjFile"><div class="sbh"><span class="hwl">PROJECT FILE (AUDIO + EVERYTHING)</span></div><div class="kfact"><button class="hwb" id="pjDl"><i class="led"></i>⬇ DOWNLOAD .BC16</button><label class="hwb loadbtn" for="pjOpen"><i class="led"></i>OPEN .BC16 FILE</label><input type="file" id="pjOpen" accept=".bc16,application/json" hidden><button class="hwb" id="pjDup"><i class="led"></i>⧉ DUPLICATE PROJECT</button></div><small class="pjnote">A .bc16 file holds the song audio, cuts, kits, pads, patterns, automation and song order. Open it on any device to carry on.</small></div>'+
 '<div class="pjstore" id="pjStore"></div></div></div>';return u}
const ago=t=>{const s=(Date.now()-t)/1000;return s<90?'just now':s<5400?Math.round(s/60)+' min ago':s<172800?Math.round(s/3600)+' h ago':new Date(t).toLocaleDateString()};
async function projRender(){if(!$('pjNow'))return;const r=ready(),song=r?fnameSafe():null,A=API();
 $('pjNow').innerHTML=r?'<small>OPEN NOW</small><b>'+esc(song)+'</b><span>'+($('osSave').classList.contains('unsaved')?'Changes since your last version (autosaved as you work)':'All changes saved')+' · '+(A.song().list.length||0)+' song parts · '+A.patMeta().filter(p=>p.hits).length+' patterns · '+A.kits().length+' saved kits</span>':'<small>NO PROJECT OPEN</small><b>Open a recent project or load a song</b>';
 const V=r?await listVersions(song):[];$('pjVers').innerHTML=V.length?V.map(v=>'<div class="pjr"><b>'+esc(v.label||(v.auto?'Autosave':'Version'))+'</b><span>'+ago(v.at)+' · '+new Date(v.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'</span><button data-v="'+esc(v.id)+'" data-a="r">↺ RESTORE</button><button data-v="'+esc(v.id)+'" data-a="x">✕</button></div>').join(''):'<p class="empty">'+(r?'No versions yet. SAVE VERSION keeps a copy you can come back to; one is also kept every 5 minutes while you work.':'Open a project to see its versions.')+'</p>';
 const S=await listSongs();$('pjSongs').innerHTML=S.length?S.map(x=>'<div class="pjr'+(x.key===song?' cur':'')+'"><b>'+esc(x.name)+'</b><span>'+(x.size/1e6).toFixed(1)+' MB · opened '+ago(x.opened||x.added)+'</span><button data-s="'+esc(x.key)+'" data-a="o">'+(x.key===song?'OPEN NOW':'OPEN')+'</button><button data-s="'+esc(x.key)+'" data-a="d">✕</button></div>').join(''):'<p class="empty">Songs you load are kept here so you can reopen them with their work.</p>';
 try{const e=await navigator.storage.estimate();$('pjStore').textContent='Storage: '+(e.usage/1e6).toFixed(0)+' MB used of about '+(e.quota/1e9).toFixed(1)+' GB.'}catch(er){}}
async function projFile(){const A=API();if(!need())return;const key=songKey(fnameSafe());const rec=await ptx('songs','readonly',st=>st.get(key));if(!rec){say('The song audio is not stored yet: load the song once more, then download.');return}
 say('Packing the project…');const b64=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.readAsDataURL(new Blob([rec.bytes]))});
 const P={bc16:1,name:rec.name,saved:new Date().toISOString(),state:A.snapshot(),kits:LSg('bcrps:kits:'+API().main(),{}),audio:b64};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(P)],{type:'application/json'}));a.download=key+'.bc16';a.click();say('Downloaded '+key+'.bc16: audio and all your work in one file.')}
async function projOpen(f){try{say('Opening '+f.name+'…');const P=JSON.parse(await f.text());if(!P.bc16||!P.audio)throw new Error('That is not a BC-16 project file.');
 const bin=Uint8Array.from(atob(P.audio),c=>c.charCodeAt(0)).buffer,key=songKey(P.name);await ptx('songs','readwrite',st=>st.put({key,name:P.name,size:bin.byteLength,bytes:bin.slice(0),added:Date.now(),opened:Date.now()}));
 if(P.kits)LSs('bcrps:kits:'+key,P.kits);PJ.quietUntil=Date.now()+60000;PJ.loading=true;try{await load(bin,P.name)}finally{PJ.loading=false}let n=0;while(!ready()&&n<400){await sleep(150);n++}await sleep(1200);API().restore(P.state);PJ.savedVer=API().dirtyN();say('Opened '+P.name+' with all its work.');go('build')}catch(e){say('Could not open it: '+(e.message||e))}}
async function projDup(){if(!need())return;const key=songKey(fnameSafe()),rec=await ptx('songs','readonly',st=>st.get(key));if(!rec){say('Load the song once more first, then duplicate.');return}
 let nm=rec.name.replace(/(\.[^.]+)?$/,' copy$1'),i=2;const S=await listSongs();while(S.some(x=>x.key===songKey(nm)))nm=rec.name.replace(/(\.[^.]+)?$/,' copy '+(i++)+'$1');
 const state=API().snapshot();const k2=songKey(nm);LSs('bcrps:kits:'+k2,LSg('bcrps:kits:'+API().main(),{}));
 await ptx('songs','readwrite',st=>st.put({key:k2,name:nm,size:rec.size,bytes:rec.bytes.slice(0),added:Date.now(),opened:Date.now()}));
 PJ.quietUntil=Date.now()+60000;PJ.loading=true;try{await load(rec.bytes.slice(0),nm)}finally{PJ.loading=false}let n=0;while(!(ready()&&fnameSafe()===k2)&&n<400){await sleep(150);n++}await sleep(1200);API().restore(state);say('Duplicated as “'+nm+'”. The original stays as it was.');projRender()}
function projWire2(){
 $('pjSaveV').onclick=async()=>{if(!need())return;await saveVersion($('pjLabel').value.trim()||'Version '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));$('pjLabel').value='';say('Version saved.')};
 $('pjVers').onclick=async e=>{const b=e.target.closest('[data-v]');if(!b)return;const v=await ptx('versions','readonly',st=>st.get(b.dataset.v));if(!v)return;
  if(b.dataset.a==='r'){if(!await ask('Restore “'+(v.label||'autosave')+'” from '+ago(v.at)+'? Your current work is kept as a version first, and UNDO also brings it back.','RESTORE'))return;await saveVersion('Before restore',false);API().restore(v.data);say('Restored “'+(v.label||'autosave')+'”.');projRender()}
  else{if(!await ask('Delete this version?','DELETE'))return;await ptx('versions','readwrite',st=>st.delete(v.id));projRender()}};
 $('pjSongs').onclick=async e=>{const b=e.target.closest('[data-s]');if(!b)return;if(b.dataset.a==='o'){if(ready()&&songKey(fnameSafe())===b.dataset.s){say('This project is already open.');return}await openSong(b.dataset.s)}
  else{if(!await ask('Remove this song from the device? Its saved work for this song stays; you would need the audio file to open it again.','REMOVE'))return;await ptx('songs','readwrite',st=>st.delete(b.dataset.s));projRender()}};
 $('pjDl').onclick=projFile;$('pjOpen').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)projOpen(f)};$('pjDup').onclick=projDup;
 $('osSave').onclick=async()=>{if(!need())return;API().save();await saveVersion('Saved '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),false);say('Saved: a version of '+fnameSafe()+' is kept under PROJECT. Your work also saves itself as you go.')}}
/* resume card on the tape deck */
async function resumeOffer(){if(ready())return;const k=LSg('bc16:lastSong','');if(!k)return;let rec;try{rec=await ptx('songs','readonly',st=>st.get(k))}catch(e){return}if(!rec||ready())return;
 const d=$('drop');if(!d||$('resumeCard'))return;const c=el('div',{id:'resumeCard'},'<small>CARRY ON WHERE YOU LEFT OFF</small><b>'+esc(rec.name)+'</b><span>last worked on '+ago(LSg('bc16:lastAt',rec.opened||Date.now()))+'</span><button class="hwb np big" id="resumeGo"><i class="led"></i>▶ RESUME</button><button class="hwb" id="resumeAll"><i class="led"></i>ALL PROJECTS</button>');
 d.parentElement.insertBefore(c,d);$('resumeGo').onclick=()=>openSong(k).then(()=>c.remove());$('resumeAll').onclick=()=>go('project')}

/* ================= SESSION START: a clear direction as soon as a song is ready ================= */
function sessionStart(){if(!ready()||Date.now()<(PJ.quietUntil||0))return;if(document.body.classList.contains('coach')){API().setProg('chop');return}let bpm='',key='';try{bpm=Math.round(+$('bpm').value);key=DBC.keyText()}catch(e){}
 const d=el('div',{id:'askD',role:'dialog','aria-modal':'true'});d.innerHTML='<div class="askc wide"><div class="plate"><i class="pled"></i><b class="pn">SESSION START</b><span class="pm">'+esc(fnameSafe())+'</span><span class="vent"></span></div>'+
 '<p class="ssum">Ready: '+(bpm?bpm+' BPM · ':'')+(key?key+' · ':'')+slicesN()+' cuts. Smart kits are built in the KIT program. Your patterns are empty and nothing plays until you press a pad or PLAY.</p><h3 class="ssq">What do you want to do with this song?</h3><div class="sopts">'+
 [['chop','CHOP & FLIP IT','The pads play the song’s cuts in order. Pick a chop, then play and record your flip.'],['beat','MAKE A BEAT FROM ITS SOUNDS','The pads play the smart kit (kick, snare, hats…). Arm REC and play.'],['song','START A FULL SONG','Lay out intro, verse, hook… and let Beat Brain write each part from your sounds. Then edit any part.'],['look','WALK THE STUDIO FLOOR','See every machine in its place and pick one. GUIDE and COACH are on the rail.']].map(([k,t,x])=>'<button class="sopt" data-s="'+k+'"><b>'+t+'</b><span>'+x+'</span></button>').join('')+'</div></div>';
 document.body.append(d);const done=k=>{d.remove();if(k==='chop'){API().setProg('chop');go('slicer');say('Pick a chop recipe (Slice Brain recommends one), then play the pads. REC + PLAY records your flip.')}
  else if(k==='beat'){API().setProg('kit');API().setBank(0);go('pads');say('Pads play the smart kit. Arm REC, press PLAY, and play. Fill your own kits any time in KIT FORGE.')}
  else if(k==='look'){go('floor')}
  else if(k==='song'){go('build');setTimeout(()=>{$('sbTpl').scrollIntoView({block:'center'});$('sbTplRow').classList.add('hl');say('Pick a structure and press LAY IT OUT. Beat Brain writes each part from your sounds; then edit any part.')},300)}}
 d.onclick=e=>{const b=e.target.closest('[data-s]');if(b)done(b.dataset.s)};addEventListener('keydown',function k(e){if(e.key==='Escape'&&document.body.contains(d)){d.remove();removeEventListener('keydown',k,true)}},true)}

/* ================= SONG STRUCTURE + SMART EDIT per part ================= */
const SECS=['intro','verse','hook','bridge','outro'],TPL={classic:['intro','verse','hook','verse','hook','bridge','hook','outro'],trap:['intro','hook','verse','hook','verse','hook','outro'],flip:['intro','verse','verse','hook','verse','hook','outro'],short:['intro','verse','hook','outro']};
const TAKE={};const DRUM=/kick|snare|clap|hat|open|perc|rim|tom|crash|ride|cym/i;
const isDrum=c=>DRUM.test(c.role||'')||DRUM.test(c.name||'');
async function layOut(){if(!need())return;const T=TPL[$('sbTpl').value],write=$('sbWrite').checked,src=$('sbSrc').value,A=API();
 if(A.song().list.length&&!await ask('Replace the current song order with '+T.length+' parts ('+T.join(', ')+')? Your patterns are kept; UNDO brings the order back.','LAY IT OUT'))return;
 const meta=A.patMeta(),uniq=[...new Set(T)],map={},used=new Set();
 for(const sec of uniq){let i=meta.findIndex((m,k)=>m.name===sec.toUpperCase()&&!used.has(k));if(i<0||write&&false)i=meta.findIndex((m,k)=>!m.hits&&!m.name&&!used.has(k));if(i<0)i=meta.findIndex((m,k)=>!used.has(k));map[sec]=i;used.add(i)}
 let wrote=0;for(const sec of uniq){const pi=map[sec];if(write){const n=A.writePart(pi,sec,TAKE[pi]||0,src);if(n<0){say('No kit sounds to write with yet: fill a kit in KIT FORGE (or press AUTO-FILL), then lay it out again.');return}wrote++}else A.patName(pi,sec)}
 A.songSet(T.map(s=>map[s]));SB.sel=0;A.loopPart(T.map(s=>map[s])[0]);A.selPat(map[T[0]]);try{$('psStop').click()}catch(e){}buildRender();
 say(write?'Laid out '+T.length+' parts; Beat Brain wrote '+wrote+' sections from your sounds. Tap a part, then use SMART EDIT to change it: new take, drums only, rewrite as a hook…':'Laid out '+T.length+' parts with names. Loop each part and play it in.')}
function selPart(){const S=API().song();if(SB.sel<0||SB.sel>=S.list.length){say('Tap a part in the song first.');return null}return{i:SB.sel,pi:S.list[SB.sel],S}}
function smartEdit(a){if(!need())return;const P=selPart();if(!P)return;const A=API(),pi=P.pi;
 if(a==='write'||a==='take'){const sec=$('sbSec').value;if(a==='take')TAKE[pi]=(TAKE[pi]||0)+1;const n=A.writePart(pi,sec,TAKE[pi]||0,$('sbSrc').value);if(n<0){say('No kit sounds to write with yet: fill a kit first.');return}say((a==='take'?'New take #'+(TAKE[pi]+1)+' of':'Wrote')+' part '+(P.i+1)+' as a '+sec.toUpperCase()+' ('+n+' hits). UNDO goes back.')}
 else if(a==='drums'||a==='nodrums'||a==='allon'){const ch=A.chans(pi);if(!ch.length){say('This part has no hits yet.');return}const off=a==='allon'?[]:ch.filter(c=>a==='drums'?!isDrum(c):isDrum(c)).map(c=>c.k);A.chanSet(pi,off);say(a==='drums'?'Part '+(P.i+1)+': drums only.':a==='nodrums'?'Part '+(P.i+1)+': drums out (a breakdown).':'Part '+(P.i+1)+': every channel on.')}
 else if(a==='x2'||a==='half'){const nb=A.bars2(pi,a==='x2'?2:.5);say('Part '+(P.i+1)+' is now '+nb+' bar'+(nb>1?'s':'')+'.')}
 else if(a==='uniq'){const r=A.uniquePart(P.i);say(r<0?'All 16 patterns are in use.':'Part '+(P.i+1)+' now has its own pattern (P'+(r+1)+'): edit it without changing the other parts.')}
 else if(a==='name'){A.patName(pi,$('sbSec').value);say('Part '+(P.i+1)+' is labelled '+$('sbSec').value.toUpperCase()+'.')}
 SB.sig='';TLSIG='';buildSync()}

/* ================= KEY REFERENCE ================= */
function keysOverlay(){if($('keysD')){$('keysD').remove();return}const row=(k,t)=>'<div class="kr"><kbd>'+k+'</kbd><span>'+t+'</span></div>';
 const d=el('div',{id:'keysD',role:'dialog','aria-modal':'true'});d.innerHTML='<div class="askc wide"><div class="plate"><i class="pled"></i><b class="pn">KEY REFERENCE</b><span class="pm">EVERY SHORTCUT</span><span class="vent"></span><button class="zb" id="keysX" aria-label="Close">✕</button></div><div class="kgrid">'+
 '<section><h4>TRANSPORT</h4>'+row('Space','Play / stop')+row('Enter','Record on / off (count-in)')+row('Backspace','Undo')+row('0','Click on / off')+row('Shift + ← / →','Previous / next pattern')+row('Z X C V B N M ,','Patterns 1–8')+'</section>'+
 '<section><h4>PADS</h4>'+row('A S D F G H J K','Pads, bottom two rows')+row('Q W E R T Y U I','Pads, top two rows')+row('1 – 8','Pad bank A–H')+row('← / →','Previous / next bank')+row('L','16 LEVELS: one sound as 16 notes')+'</section>'+
 '<section><h4>PERFORM (DJ)</h4>'+row('O P [ ]','Hold: roll 1/4, 1/8, 1/16, 1/32')+row('; \' . /','Gate, echo (hold) · backspin, tape stop (tap)')+row('9  -  =','Kill low / mid / high')+row('F1 – F12','Launch pattern clips (LIVE)')+'</section>'+
 '<section><h4>UNITS</h4>'+row('Alt + 1 … 0','Jump to a unit on the rail')+row('`','Back to the last unit')+row('Esc','Back out of anything open')+row('?','Explain mode')+row('Hold a button','Learn what it does')+'</section>'+
 '<section><h4>KEY TOWER</h4>'+row('Z S X D C …','Tier 1 keys')+row('Q 2 W 3 E …','Tier 2 keys')+row('MIDI keyboard','The tier with MIDI IN lit')+'</section>'+
 '<section><h4>KIT FORGE</h4>'+row('Page Up / Down','Previous / next page of cuts')+row('Hold a cut','Drop it in the lit slot')+'</section></div></div>';
 document.body.append(d);$('keysX').onclick=()=>d.remove();d.onclick=e=>{if(e.target===d)d.remove()};addEventListener('keydown',function k(e){if(e.key==='Escape'&&document.body.contains(d)){e.stopPropagation();d.remove();removeEventListener('keydown',k,true)}},true)}

/* ================= on-screen dialog: replaces the browser's pop-ups ================= */
function ask(text,ok,cancel){return new Promise(res=>{const d=el('div',{id:'askD',role:'alertdialog','aria-modal':'true'});
 const okL=ok||(/^Delete/.test(text)?'DELETE':/^Clear/.test(text)?'CLEAR IT':/^Send/.test(text)?'SEND':/^Rebuild/.test(text)?'REBUILD':'YES');
 d.innerHTML='<div class="askc"><div class="plate"><i class="pled"></i><b class="pn">CHECK</b><span class="pm">BEFORE YOU GO ON</span><span class="vent"></span></div><p>'+esc(text)+'</p><div class="askb"><button class="hwb" data-a="0"><i class="led"></i>◀ '+(cancel||'NO, GO BACK')+'</button><button class="hwb np" data-a="1"><i class="led"></i>'+okL+'</button></div><small>Enter = '+okL+' · Esc = go back</small></div>';
 document.body.append(d);const done=v=>{d.remove();removeEventListener('keydown',kd,true);res(v)};
 d.onclick=e=>{const b=e.target.closest('[data-a]');if(b)done(b.dataset.a==='1');else if(e.target===d)done(false)};
 const kd=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done(false)}else if(e.key==='Enter'){e.preventDefault();e.stopPropagation();done(true)}};addEventListener('keydown',kd,true);setTimeout(()=>d.querySelector('.np').focus(),30)})}

/* ================= HELP: every control explains itself ================= */
const H={
 /* rail */
 'rail-home':['TAPE DECK','Where a session starts: load a song (or the demo beat) and see its tempo, key, slice count and bars.','Rail'],
 'rail-chop':['SAMPLER','Sets how the song is cut. SHORTEST and LONGEST decide slice length; the PAD MATRIX plays the cuts in order (CHOP program).','Rail'],
 'rail-kit':['KIT FORGE','Build your own kits by hand: light a slot on the left, find a cut on the right, hold it. Save kits by name.','Rail'],
 'rail-pads':['DRUM MACHINE','The pads, full size, with the pad editor: play, arrange, edit, tune and clear pads.','Rail'],
 'rail-seq':['STEP SEQUENCER','Draw or erase hits on the grid of the current pattern.','Rail'],
 'rail-keys':['KEYS','KEY TOWER (three stacked keyboards), PIANO and LAYER RIG. Every keyboard can record into the pattern.','Rail'],
 'rail-song':['SONG','SONG ARRANGER puts patterns in order and exports; AUTO PRODUCER builds a new arrangement of the song.','Rail'],
 'rail-live':['LIVE','LAUNCH CONSOLE shows all 8 patterns to launch, DJ MIXER has cues, loops, rolls and kills.','Rail'],
 'rail-lab':['LAB','SOUND BROWSER, STEM SPLITTER and SOUND SORTER: dig through every slice, split stems, group similar sounds.','Rail'],
 'rail-brain':['BEAT BRAIN','Presets, numbered variations, full-song writing and smart sound packs built from your own slices.','Rail'],
 'rail-guide':['STUDIO MANUAL','Lessons, the studio map, the button book and a demo that plays itself.','Rail'],
 subNext:['NEXT UNIT','The next unit in the beat-making chain: load, chop, build kits, play, program, keys, perform, build the song, export. ◀ BACK on the left goes the other way.','Unit'],
 osCoach:['COACH','Turns the coach panel on or off. With it on, every unit shows its steps (ticked off as you do them), what the button you just pressed did and what to do next, and pro tips. It stays on while you work.','Rail'],
 osExplain:['EXPLAIN','Turns explain mode on and off. While it is on, pressing any control tells you what it does instead of doing it. Keyboard: ?','Rail'],
 /* meter bridge */
 hwLoad:['LOAD','Opens a song from your device (WAV, MP3, M4A, FLAC, OGG). You can also drop a file anywhere on the machine. Each song keeps its own pads, kits and patterns.','Meter bridge'],
 osSave:['SAVE','Saves a version of this project (see PROJECT). The light blinks when there are changes since your last version; work also autosaves as you go, so nothing is lost if the browser closes.','Meter bridge'],
 vu:['OUTPUT VU','The analog meter shows the master output. The rim turns red when the signal peaks near clipping: turn MASTER down a little.','Meter bridge'],
 hwMasterIn:['MASTER','Master volume for everything the machine plays.','Meter bridge'],
 gRec:['TAKE REC','Records everything you hear, from any unit, into a take (audio). Press again to stop; takes appear on SONG → SONG ARRANGER for export.','Meter bridge'],
 /* transport */
 psRec:['REC','Arms recording into the current pattern. Then press PLAY (count-in on) and play pads or keys; every hit lands in the pattern.','Transport'],
 hwOvd:['OVERDUB','Starts playing and recording on top of what is already in the pattern.','Transport'],
 psStop:['STOP','Stops playback and recording. Press it again while stopped for ALL STOP: every sound in every unit goes silent (latched pads, note repeat, previews, held notes).','Transport'],
 psPlay:['PLAY','Plays the current pattern on a loop (or the song order when song mode is on).','Transport'],
 hwPst:['PLAY START','Plays from the very start: pattern 1 or the first entry of the song order.','Transport'],
 psTap:['TAP TEMPO','Tap 4 times in time to set the tempo.','Transport'],
 osPatPrev:['PATTERN ◀','Steps back one pattern. While playing, the new pattern waits until the current one finishes. Keyboard: Shift+←','Transport'],
 osPatNext:['PATTERN ▶','Steps forward one pattern (P1–P16). While playing it queues. Keyboard: Shift+→','Transport'],
 patLcd:['PATTERN DISPLAY','Shows the pattern playing, the one queued (→), its length, number of hits and a progress line.','Transport'],
 psPats:['P1–P8','Jump straight to any of the 8 patterns. A lit button has hits in it. Keyboard: Z X C V B N M ,','Transport'],
 osPatDup:['COPY ▶','Copies the current pattern into the next empty one and jumps there, so you can build a variation without losing the original.','Transport'],
 osPatClr:['CLEAR','Removes every hit from the current pattern (asks first). UNDO brings it back.','Transport'],
 osUndo:['UNDO','Takes back the last change: a recording, a cleared pattern, a pad you loaded. Up to 50 steps.','Transport'],
 ltOn:['LOOP-TIGHT','On: the tempo is locked to the hits, silence is cut off the front and the end, bar 1 starts on the first downbeat with sound, and every cut starts right on its hit. The readout shows how tight it is. Off: cuts exactly as detected.','Sampler'],
 osUpd:['UPDATE','A newer BC-16 is on GitHub. On the live site it reloads into the new version. From a downloaded file it opens the live app or downloads the newest file. Save projects as .bc16 files to carry them across.','System'],
 osHome:['STUDIO','The studio floor: every machine in its place with its live status. Tap a machine to walk up to it. Keyboard: Home, or Esc from any machine.','Navigation'],
 osBack:['◀ BACK','Returns to the unit you were on before, like a back button. Keyboard: `','Transport'],
 /* pad matrix */
 scrProg:['CHOP / KIT program','CHOP: the pads play the song’s cuts in order (A01 = cut 1). KIT: the pads play the kits you built in KIT FORGE or got from Beat Brain.','Pad matrix'],
 psBanks:['PAD BANKS A–H','Eight banks of 16 pads. In CHOP they hold cuts 1–128 (◀/▶ SLICES on the SAMPLER pages through more). Keyboard: 1–8','Pad matrix'],
 psGrid:['PADS','Play with mouse, touch or keys A S D F … Hold an empty pad (KIT program) to choose a sound for it: you go to KIT FORGE with that slot lit.','Pad matrix'],
 psBpm:['TEMPO knob','Tempo of the sequencer. Drag up/down, scroll, or double-click to reset.','Pad matrix'],psSw:['SWING knob','Pushes every other 16th late for groove.','Pad matrix'],psFk:['FILTER knob','Left = low-pass (darker), right = high-pass (thinner). Centre is off.','Pad matrix'],djPump:['PUMP knob','Sidechain pump: the music ducks on every kick.','Pad matrix'],
 nrB:['NOTE REPEAT','While held on, pads retrigger at the rate shown next to it. SHIFT does the same while held.','Pad matrix'],
 psKeys:['16 LEVELS','Turns the 16 pads into 16 notes of the last pad you played, in the song’s key.','Pad matrix'],psChd:['CHORD','With 16 LEVELS on, each pad plays a chord.','Pad matrix'],psUndo:['UNDO','Same as UNDO in the transport bar.','Pad matrix'],
 hwShift:['SHIFT','Second function: pads note-repeat; with PAD MUTE, unmutes everything; with SHORTEST/LONGEST, steps back.','Pad matrix'],
 hwErase:['ERASE','While lit, pressing a pad erases that pad’s hits from the current pattern.','Pad matrix'],hwCopy:['COPY','Copies the current pattern to the next empty one.','Pad matrix'],
 hwTC:['TC (timing correct)','Steps the quantize grid: off, 1/4 … 1/32. New hits snap to it.','Pad matrix'],hwFull:['FULL LEVEL','Every hit plays at full velocity.','Pad matrix'],hwMute:['PAD MUTE','While lit, pads mute and unmute instead of playing.','Pad matrix'],
 jog:['DATA wheel','Changes whichever value you touched last on the screen. − and + step it one at a time.','Pad matrix'],
 /* kit forge */
 kfBanks:['KIT BANKS','Which of the 8 kit banks you are building. The number shows how many slots are filled.','Kit Forge'],
 kfSlots:['SLOTS','Tap a slot to light it (and hear it). The lit slot is where the next cut lands. After each drop the next empty slot lights up.','Kit Forge'],
 kfClr:['CLEAR SLOT','Empties the lit slot.','Kit Forge'],kfClrB:['CLEAR BANK','Empties all 16 slots of this bank (asks first).','Kit Forge'],kfPads:['PLAY ON PADS','Switches the pads to the KIT program on this bank and opens the DRUM MACHINE.','Kit Forge'],
 kfSave:['MY KITS','Name the bank and SAVE KIT. Tap a saved kit to load it into the current bank; × deletes it.','Kit Forge'],
 kfPrev:['PAGE ◀ ▶','Flip pages of cuts. ⏮ ⏭ jump to the first and last page. Keyboard: Page Up / Page Down.','Kit Forge'],kfLcd:['CUT DISPLAY','Which cuts are on screen and how many there are.','Kit Forge'],kfPer:['CUTS PER PAGE','16, 32 or 64 cuts on each page.','Kit Forge'],
 kfFilt:['FILTER','Show only kicks, snares, hats or tonal cuts.','Kit Forge'],kfCuts:['CUTS','Tap to hear. Hold ½ second to drop into the lit slot, or drag onto any slot. BT = length in beats.','Kit Forge'],
 /* key tower */
 twKey:['KEY','The song’s key, found when it loaded. Scale lock uses it.','Key Tower'],twLock:['SCALE LOCK','Only notes in the song’s key play and light up, so you cannot hit a wrong note.','Key Tower'],twLab:['KEY LABELS','Shows which computer key plays each note: Z row = tier 1, Q row = tier 2.','Key Tower'],
 twMidi:['MIDI','Plug in a MIDI keyboard; it plays the tier whose MIDI IN is lit.','Key Tower'],twRec:['RECORD KEYS','Arm REC and press PLAY: notes from any tier record into the current pattern, with length and pitch.','Key Tower'],
 twLeft:['TIER SOUND + OCTAVE','◀ ▶ picks the sound (tonal cuts first, then your kit pads, then every cut). − + moves the tier an octave.','Key Tower'],
 twRight:['TIER CONTROLS','VOL sets the tier’s level. HOLD lets notes ring. STACK: stacked tiers play together. MUTE silences it. MIDI IN routes a MIDI keyboard here.','Key Tower'],
 /* launch */
 lcClips:['PATTERN CLIPS','All 8 patterns at once. Tap to play; while playing, a tapped clip waits (blinking) and starts when the current one finishes.','Launch Console'],
 osNext:['NEXT PART ▶','The song-building button. Adds the part you are on to the song, copies its loop into a fresh pattern (or starts blank, see NEXT PART STARTS WITH), and switches to it. While playing it waits for the loop to finish, and REC stays armed, so you just keep playing the next part.','Song Builder'],
 osPatHalf:['9–16 / 1–8','There are 16 patterns. The bar shows 8 at a time: this flips between P1–P8 and P9–P16. ◀ ▶ reach all 16.','Transport'],
 bankStep:['BANK ◀ ▶','Step to the previous or next pad bank without hunting for the letter. Arrow keys ← → do the same.','Pad matrix'],
 sbHow:['HOW A SONG GETS BUILT','Loop a part, play the next part over it, press NEXT PART, switch that part’s channels on or off, repeat. Then play the whole song, or from any part.','Song Builder'],
 sbLcd:['PART DISPLAY','Which part of the song you are on, its pattern, length, hits, and whether it is looping, playing the song or recording.','Song Builder'],
 sbLoop:['⟲ LOOP THIS PART','Plays the current pattern on repeat (song mode off), so you can play the next part over it.','Song Builder'],
 sbPrev:['PART ◀ ▶','Step to the previous or next part of the song. While the song plays, the jump happens when the current part ends.','Song Builder'],
 sbCarry:['NEXT PART STARTS WITH','What the new part starts with: the whole loop, only the channels you left on, or nothing. Most chop songs carry the whole loop and drop or add channels.','Song Builder'],
 sbFollow:['PADS FOLLOW THE PART','Each part remembers the pad bank it was recorded with. When that part comes round, the pads switch to it: arrange 2 or 3 banks for a song and the right pads are always under your fingers.','Song Builder'],
 sbChan:['CHANNELS','Every sound used in this part. Tap to turn it off or on for this part only (the hits are kept). ALL ON / ALL OFF, and SET PADS makes this part bring up the bank you are on now.','Song Builder'],
 sbSong:['THE SONG','Your parts in order. Tap one to select it; double-tap to jump there. Move it earlier or later, ⧉ REPEAT it, ✕ REMOVE it, ⟲ LOOP it to fix it, or ▶ PLAY FROM HERE.','Song Builder'],
 sbSongPlay:['▶ PLAY THE SONG','Plays every part in order from the top. Use PLAY FROM HERE on a selected part to start in the middle.','Song Builder'],
 sbExport:['EXPORT','Opens the SONG ARRANGER for WAV, MP3, MIDI and saves.','Song Builder'],
 pfKey:['API KEY','Your own key for the music service (sunoapi.org-compatible). It is sent only to that service. Tick remember to keep it on this device.','Pack Factory'],
 pfGenres:['GENRES','Pick one or many. Each genre has its own sound description tuned for sampling.','Pack Factory'],
 pfTypes:['PACK TYPES','What to make: sample flips, melodic loops, drum breaks, 808 and bass, chords, atmosphere, vocal chops or full beats. Genres × types = number of requests.','Pack Factory'],
 pfOpts:['OPTIONS','Engine, length, how varied the results are, whether to match your song’s tempo and key, and any extra words for the sound.','Pack Factory'],
 pfBuild:['BUILD LIBRARY','Sends the orders (asks first: it uses your credits). Each request makes 2 tracks; they arrive in a few minutes.','Pack Factory'],
 pfJobs:['ORDERS','Each request and where it is: composing, first track ready, done, or failed with the reason.','Pack Factory'],
 pfItems:['SOUND LIBRARY','Every generated track. ▶ preview, LOAD & CHOP puts it in the machine and cuts it, PRO PACK also saves its kits, SAVE keeps the audio on this device, ⬇ downloads, ✕ deletes.','Pack Factory'],
 pfSaveAll:['SAVE ALL OFFLINE','Keeps every track’s audio on this device; the service only keeps files about 14 days.','Pack Factory'],
 pfExport:['⬇ LIST','Downloads the library list (titles, genres, links) as a file.','Pack Factory'],
 stPlan:['YOUR PLAN','The plan unlocked on this device: STARTER (free), PRO or STUDIO.','Pack Store'],
 stCycle:['MONTHLY / YEARLY','Yearly costs the same as 10 months: two months free.','Pack Store'],
 stPlans:['PLANS','STARTER is free. PRO adds 10 premium packs a month. STUDIO is unlimited plus studio-only drops. GET opens the store checkout in a new tab.','Pack Store'],
 stSingle:['ONE PACK','Buy a single premium pack without a membership.','Pack Store'],
 stLic:['LICENSE KEY','After buying you get a key by email. Paste it here to unlock your plan on this device.','Pack Store'],
 stFree:['FREE STARTER PACKS','Kits built from the demo beat, free. GET IT saves the kit under MY KITS in KIT FORGE.','Pack Store'],
 stCat:['PREMIUM CATALOG','Packs published by the store. Unlocked ones load, chop and save as kits in one press.','Pack Store'],
 sxRec:['RECOMMENDED CHOP','Slice Brain listens to how much of the song is drums and how much is music, and picks the chop that will flip best. USE IT applies it.','Slice Brain'],
 sxRecipes:['CHOP RECIPES','One press sets slice method, sensitivity, shortest and longest for a job: drum hits, soul flip, stabs, half-bar, bar loops, 16th grid, vocal chops. The pads re-chop at once.','Slice Brain'],
 sxSum:['SONG READ-OUT','How many cuts, their average length, how many start on the 16th grid, how many repeat the same sound, and the mix of kick, snare, hat and tonal sound.','Slice Brain'],
 sxList:['EVERY CUT, RANKED','Each cut scored on timing (on the grid), punch (a sharp start) and clean (a tail that does not bleed). ▶ hears it, → KIT puts it in the lit Kit Forge slot, ✕ CUT merges it into the cut before.','Slice Brain'],
 sxClean:['CLEAN-UP','MERGE WEAK CUTS joins tiny, weak slices into their neighbours. UNDO MY CUT EDITS brings the recipe’s cuts back. BEST-OF KIT builds an MPC drum layout from the highest-scoring cuts.','Slice Brain'],
 kfAuto:['AUTO-FILL','Fills the empty slots of this bank in one press: an MPC drum layout, the best cuts, cuts in order, tonal stabs, or loops. Tick replace to rebuild the whole bank. Then change any slot by hand.','Kit Forge'],
 kfSug:['BEST FOR THIS SLOT','The highest-scoring cuts for the lit slot’s role. Tap to hear, hold or drag to drop in.','Kit Forge'],
 autoBar:['AUTOMATION','Like a DAW. WRITE: press PLAY and move FILTER, PUMP or SWING; the moves record into the pattern. READ: the pattern plays its moves back every loop. OFF: ignore them. CLEAR wipes this pattern’s moves. The dot glows when the pattern has automation.','Pad matrix'],
 sbTL:['ARRANGEMENT VIEW','The song like a DAW: parts across, channels down, automation lanes at the bottom. Tap a block to turn that channel on or off in that part. A pattern used twice changes in both places.','Song Builder'],
 pjNow:['OPEN PROJECT','The project you are in, and whether it has changes since your last saved version. Work autosaves as you go either way.','Project'],
 pjVer:['VERSIONS','Snapshots of this project. SAVE VERSION (or SAVE on the top bar) keeps one; one is also kept every 5 minutes of work. ↺ RESTORE goes back to it (your current work is kept as a version first).','Project'],
 pjRecent:['RECENT PROJECTS','Every song you load is kept on this device with its work. OPEN brings back the audio, cuts, kits, patterns and song exactly as you left them.','Project'],
 pjFile:['PROJECT FILE','⬇ DOWNLOAD .BC16 packs the audio and all your work into one file to back up or move to another device; OPEN .BC16 FILE brings it back. ⧉ DUPLICATE makes a copy to try ideas on.','Project'],
 osKeys:['KEY REFERENCE','Every keyboard shortcut on one card: transport, pads, DJ moves, units, Key Tower and Kit Forge. Shift+K opens it too.','Meter bridge'],
 sbTpl:['SONG STRUCTURE','Pick a structure and press LAY IT OUT: the song order is filled with named parts (intro, verse, hook…). With “write the parts” ticked, Beat Brain writes each section from your sounds; untick it to play every part in yourself.','Song Builder'],
 sbSmart:['SMART EDIT','For the part you tapped: WRITE AS THIS rewrites it as an intro, verse, hook, bridge or outro from your sounds; NEW TAKE gives another version; DRUMS ONLY / NO DRUMS / ALL ON switch channels; ×2 and ½ change its length; MAKE IT ITS OWN gives a repeated part its own pattern so you can change just that one.','Song Builder'],
 lcPlay:['PLAY / STOP','Starts or stops the transport.','Launch Console'],lcSong:['+ ADD TO SONG','Adds the current pattern to the end of the song order.','Launch Console']};
const SOFTH={SHORTEST:'Cuts shorter than this are merged into the next. Tap to step: 1/32 … 2 bars. With SHIFT on it steps back.',LONGEST:'Cuts longer than this are split. Tap to step: ½ beat … 4 bars, or never.',PADS:'Switches the pads between CHOP (cuts in order) and KIT (your kits).','◀ SLICES':'Previous 128 cuts on the pad banks.','SLICES ▶':'Next 128 cuts on the pad banks.'};
function helpFor(t){let e=t.closest('[data-help]');if(e)return H[e.dataset.help]?[...H[e.dataset.help],e]:null;
 const k=t.closest('.knob');if(k&&H[k.dataset.for])return[...H[k.dataset.for],k];
 for(let x=t;x&&x!==document.body;x=x.parentElement){if(x.id&&H[x.id])return[...H[x.id],x]}
 const sk=t.closest('#scrFoot .sk');if(sk){const n=(sk.dataset.t||sk.textContent).trim();return[n,SOFTH[n]||'Soft key: does the job written on it for the unit on screen. The keys change with the unit, like an MPC’s F-keys.','Soft keys',sk]}
 const rb=t.closest('.zb');if(rb)return['ZOOM','− and + scale this unit; ⤢ makes it fill the stage (double-click its nameplate does the same).','Any unit',rb];
 const u=t.closest('.unit,#subBar');if(u){const U=UNITS[curP];return[U.n,U.d,'Unit',u]}return null}
function explain(on){document.body.classList.toggle('explain',on);$('osExplain').classList.toggle('on',on);$('xbub').hidden=true;say(on?'Explain mode: press any control to learn what it does. Press ? or Esc to leave.':'Explain mode off.')}
function explainWire(){document.addEventListener('click',e=>{if(!document.body.classList.contains('explain'))return;if(e.target.closest('#osExplain,#xbub,#coach'))return;const h=helpFor(e.target);if(!h)return;e.preventDefault();e.stopPropagation();showBub(h)},true);
 ['pointerdown','mousedown','touchstart'].forEach(ev=>document.addEventListener(ev,e=>{if(document.body.classList.contains('explain')&&!e.target.closest('#osExplain,#xbub,#coach,#rail .rb[data-grp]')&&helpFor(e.target)){e.stopPropagation()}},true))}
function showBub([t,d,g,elx]){const b=$('xbub');b.querySelector('b').textContent=t;b.querySelector('p').textContent=d;b.hidden=false;const r=elx.getBoundingClientRect(),bw=Math.min(340,innerWidth-20);b.style.width=bw+'px';
 let x=Math.min(innerWidth-bw-10,Math.max(10,r.left+r.width/2-bw/2)),y=r.bottom+10;if(y+150>innerHeight)y=Math.max(10,r.top-160);b.style.left=x+'px';b.style.top=y+'px'}

/* ================= STUDIO MANUAL: map, lessons, button book, demo ================= */
const FLOW=[['start','Load'],['chop','Cut'],['kit','Build kits'],['pads','Play'],['sequence','Program'],['tower','Add keys'],['launch','Perform'],['build','Build the song'],['song','Export'],['project','Keep it']];
const LESSONS=[
 {id:'tour',t:'Tour of the studio',d:'Two minutes: the rail, the meter bridge, the transport bar and how the units connect.',steps:[
  {p:'start',s:'#rail',t:'The rail: your studio rack',x:'Each button on the rail opens one piece of gear. Go top to bottom and you follow the way a beat gets made: load, chop, build kits, play, program, keys, arrange, perform.'},
  {p:'start',s:'#hwTop',t:'The meter bridge (always on top)',x:'Song name, tempo and key on the display, the analog OUTPUT meter, SAVE for your whole setup, MASTER volume and TAKE REC. It never changes between units.'},
  {p:'start',s:'#tbar',t:'The transport bar (always on the bottom)',x:'REC, PLAY, STOP and the pattern deck: ◀ ▶ step through patterns P1–P8, COPY ▶ makes a variation, CLEAR wipes the pattern, UNDO takes back a mistake and ◀ BACK returns to the last unit.'},
  {p:'start',s:'#subBar',t:'Unit name and sub-units',x:'This strip tells you which unit you are on and what it is for. Some rail buttons hold more than one unit (KEYS has KEY TOWER, PIANO and LAYER RIG): their tabs show up here.'},
  {p:'start',s:'#screenWrap .zm',t:'Zoom any unit',x:'Every unit has − ⤢ + on its nameplate. − and + make it smaller or bigger; ⤢ makes it fill the stage. Double-click a nameplate for the same.'},
  {p:'start',s:'#osExplain',t:'Explain mode',x:'Lost? Press ? (or this button). Then press any control and it tells you what it does instead of doing it. Press ? again to go back to work.'},
  {p:'start',s:'#drop',t:'Load a song',x:'Press LOAD (top right) or drop a file here. Tempo, key and every hit are found for you. No song yet? Load the demo beat to follow the other lessons.'}]},
 {id:'chop',t:'Chop a song',d:'Set the slice length and page through the cuts on the pads.',need:1,steps:[
  {p:'chop',s:'#rail .rb[data-grp="chop"]',t:'Open the SAMPLER',x:'CHOP on the rail. The screen shows the waveform with every cut; the PAD MATRIX on the right plays the cuts in order.'},
  {p:'chop',s:'#c1',t:'The waveform',x:'Each line is a cut. Tap the waveform to add or remove a cut by hand.'},
  {p:'chop',s:'#scrFoot .sk[data-cyc="minl"]',t:'SHORTEST',x:'Cuts shorter than this get merged. Tap it to step through 1/32 note up to 2 bars. Longer = fewer, bigger chops.'},
  {p:'chop',s:'#scrFoot .sk[data-cyc="maxl"]',t:'LONGEST',x:'Cuts longer than this get split. Set it to 1 bar or 2 bars for loop-size chops; the pads change straight away.'},
  {p:'chop',s:'#padsSlot',t:'Pads follow your cuts',x:'A01 is cut 1, A16 is cut 16, B01 is cut 17 … H16 is cut 128. Every change to the cuts re-chops the pads.'},
  {p:'chop',s:'#banksSlot',t:'Flip through the cuts',x:'Banks A–H hold 128 cuts; the small number is the first cut on each bank. More than 128? ◀ SLICES and SLICES ▶ on the soft keys page through.'}]},
 {id:'kit',t:'Build your own kit',d:'Hand-pick cuts into 16 slots, then save the kit.',need:1,steps:[
  {p:'kit',s:'#kfBanks',t:'Pick a kit bank',x:'Eight kit banks, A–H. The number shows how many slots are filled.'},
  {p:'kit',s:'#kfSlots',t:'Light a slot',x:'Tap the slot you want to fill. It glows. (Holding an empty pad on the DRUM MACHINE brings you here with that slot already lit.)'},
  {p:'kit',s:'#kfLib .kfnav',t:'Page through the cuts',x:'◀ ▶ flip pages, ⏮ ⏭ jump to the ends, and you can show 16, 32 or 64 cuts at a time. Page Up / Page Down work too.'},
  {p:'kit',s:'#kfFilt',t:'Filter',x:'Only kicks, only snares, only hats, or only tonal cuts.'},
  {p:'kit',s:'#kfCuts',t:'Hear, then hold',x:'Tap a cut to hear it. Hold it for half a second (or drag it onto a slot) and it lands in the lit slot. The next empty slot lights up, so you can keep going.'},
  {p:'kit',s:'.kfsave',t:'Save the kit',x:'Name it and press SAVE KIT. Saved kits load into any bank with one tap.'},
  {p:'kit',s:'#kfPads',t:'Play it',x:'PLAY ON PADS switches the pads to the KIT program on this bank and opens the DRUM MACHINE.'}]},
 {id:'beat',t:'Record a beat',d:'Play pads into a pattern, fix mistakes, keep the good take.',need:1,steps:[
  {p:'pads',s:'#deckProg',t:'Choose what the pads play',x:'CHOP = the song’s cuts in order. KIT = your kits. Tap to switch.'},
  {p:'pads',s:'#patDeck',t:'Pick a pattern',x:'◀ ▶ or P1–P8 choose the pattern you are recording into.'},
  {p:'pads',s:'#psRec',t:'Arm REC',x:'Press REC, then PLAY. You get a count-in, then everything you play lands in the pattern.'},
  {p:'pads',s:'#padsSlot',t:'Play the pads',x:'Mouse, touch, or keys A S D F G H J K and Q W E R T Y U I. Hits snap to the TC grid.'},
  {p:'pads',s:'#psStop',t:'Stop',x:'STOP ends the take. PLAY again to hear it loop.'},
  {p:'pads',s:'#osUndo',t:'Not right? UNDO',x:'UNDO takes back the whole take. ERASE + a pad removes just that pad’s hits.'},
  {p:'pads',s:'#hwErase',t:'ERASE',x:'Light ERASE, then press a pad to wipe only that sound from the pattern.'}]},
 {id:'pat',t:'Build and flip patterns',d:'Variations, jumping back and forth, the step grid.',need:1,steps:[
  {p:'sequence',s:'#psSeqCard',t:'The step grid',x:'Rows are pads, columns are 16th notes. Click a cell to add or remove a hit.'},
  {p:'sequence',s:'#osPatDup',t:'COPY ▶ for variations',x:'Copies this pattern into the next empty one and jumps there. Change the copy: drop a kick, add a roll. The original stays safe.'},
  {p:'sequence',s:'#osPatPrev',t:'Flip back and forth',x:'◀ ▶ (or Shift + ← → on the keyboard) step between patterns. While playing, the next one waits until the current one finishes, so it always lands on time.'},
  {p:'sequence',s:'#patLcd',t:'The display',x:'Shows the pattern playing, the one waiting (→ P03), length, hits and a progress line.'}]},
 {id:'keys',t:'Play the Key Tower',d:'Three keyboards, each its own sound and octave, stacked or apart.',need:1,steps:[
  {p:'tower',s:'#twTiers .tier:last-child .tl',t:'Tier sound and octave',x:'Each tier picks its own sound (◀ ▶) and octave (− +). Tier 1 is bass, tier 2 the middle, tier 3 the top: or anything you like.'},
  {p:'tower',s:'#twTiers .tier:last-child .twkb',t:'Play',x:'Click, touch or glide across the keys. Lower on the key = louder. Tier 1 is on the Z row of your keyboard, tier 2 on the Q row.'},
  {p:'tower',s:'#twTiers .tier:last-child .tr',t:'HOLD, STACK, MUTE, MIDI',x:'HOLD lets notes ring. STACK two or three tiers and they play together from any of them: instant layered sounds. MIDI IN sends your MIDI keyboard to this tier.'},
  {p:'tower',s:'#twLock',t:'Scale lock',x:'On: only the song’s key plays, so every note fits.'},
  {p:'tower',s:'#psRec',t:'Record the keys',x:'REC + PLAY and play the tower: the notes go into the current pattern, then build the next with COPY ▶.'}]},
 {id:'song',t:'Arrange and export',d:'Patterns in order, then WAV, MP3, MIDI or stems.',need:1,steps:[
  {p:'song',s:'#psSongCard',t:'Song order',x:'Add patterns in the order they play. Song mode plays the list instead of one pattern.'},
  {p:'launch',s:'#lcSong',t:'Add from the console',x:'On the LAUNCH CONSOLE, + ADD TO SONG adds the current pattern to the end of the order.'},
  {p:'song',s:'#psSaveCard',t:'Save and export',x:'Export the song as WAV or MIDI, and save the whole setup.'},
  {p:'song',s:'#hwRecSlot',t:'TAKE REC',x:'Or record what you play, live, as audio from any unit.'}]},
 {id:'live',t:'Go live',d:'All patterns on one console, pads beside them, FX on the knobs.',need:1,steps:[
  {p:'launch',s:'#lcClips',t:'The clips',x:'Every pattern at once. Tap one to play it; tap another while playing and it waits, blinking, until the current one ends. F1–F8 launch too.'},
  {p:'launch',s:'#padsSlot',t:'Pads beside the clips',x:'Play over the top: the pads sit right there.'},
  {p:'launch',s:'#knobs',t:'Knobs',x:'FILTER sweeps, PUMP ducks the music on the kick, SWING changes the groove live.'},
  {p:'dj',s:'#subTabs',t:'DJ MIXER',x:'The second tab: hot cues, loops, rolls, kills and the filter.'}]}];
function buildGuide(){const u=el('section',{id:'osGuide',class:'unit'});
 u.innerHTML=plate('STUDIO MANUAL','OS','osGuide')+'<div class="gbody"><div class="gcol"><div class="gstart"><h2>Start here</h2><p>The BC-16 is a rack of studio gear. The <b>rail</b> on the left switches units; the <b>meter bridge</b> on top and the <b>transport bar</b> on the bottom never change.</p><div class="gbtns"><button class="hwb big" id="gTour"><i class="led"></i>TAKE THE TOUR</button><button class="hwb big" id="gDemo"><i class="led"></i>▶ FULL NARRATED COURSE</button><button class="hwb big" id="gExp"><i class="led"></i>? EXPLAIN MODE</button></div></div>'+
 '<h3>Narrated course: chapters</h3><ol class="gchap" id="gChap"></ol><h3>Studio map: how the units link</h3><div class="gmap" id="gMap"></div><h3>Lessons</h3><ol class="glessons" id="gLessons"></ol></div>'+
 '<div class="gcol"><h3>Button book</h3><input id="gFind" placeholder="Find a button: record, pattern, kit, octave…" aria-label="Find a button"><div id="gBook"></div></div></div>';
 return u}
function guideRender(){
 $('gChap').innerHTML=CH.map(([c,ss],i)=>'<li><button data-c="'+i+'"><b>'+c+'</b><span>'+ss.length+' steps</span></button></li>').join('');
 $('gMap').innerHTML=FLOW.map(([p,v],i)=>'<button class="gnode" data-p="'+p+'" style="--c:'+UNITS[p].c+'"><b>'+UNITS[p].n+'</b><span>'+v+'</span></button>'+(i<FLOW.length-1?'<i class="garr">→</i>':'')).join('');
 $('gLessons').innerHTML=LESSONS.map(L=>'<li><button class="glesson" data-l="'+L.id+'"><b>'+L.t+'</b><span>'+L.d+'</span><em>'+L.steps.length+' steps'+(L.need?' · needs a song':'')+'</em></button></li>').join('');
 bookRender()}
function bookRender(){const q=($('gFind').value||'').toLowerCase().trim(),G={};
 for(const[k,[t,d,g]]of Object.entries(H)){if(q&&!(t+' '+d+' '+g).toLowerCase().includes(q))continue;(G[g]=G[g]||[]).push([k,t,d])}
 $('gBook').innerHTML=Object.entries(G).map(([g,a])=>'<section><h4>'+g+'</h4>'+a.map(([k,t,d])=>'<div class="bk1"><b>'+t+'</b><p>'+d+'</p><button class="show" data-k="'+k+'">SHOW ME</button></div>').join('')+'</section>').join('')||'<p class="empty">Nothing matches “'+esc(q)+'”.</p>'}
const SHOWP={'Meter bridge':'start',Transport:'start',Rail:'start','Pad matrix':'pads','Kit Forge':'kit','Key Tower':'tower','Launch Console':'launch','Song Builder':'build','Pack Factory':'factory','Pack Store':'store','Slice Brain':'slicer','Project':'project'};
function guideWire(){$('gTour').onclick=()=>coachStart('tour');$('gChap').onclick=e=>{const b=e.target.closest('[data-c]');if(b)courseStart(STEPS.findIndex(s=>s.ci===+b.dataset.c))};$('gDemo').onclick=demoStart;$('gExp').onclick=()=>{explain(true);go(hist[hist.length-1]||'start')};
 $('gMap').onclick=e=>{const n=e.target.closest('.gnode');if(n)go(n.dataset.p)};
 $('gLessons').onclick=e=>{const b=e.target.closest('.glesson');if(b)coachStart(b.dataset.l)};
 $('gFind').oninput=bookRender;
 $('gBook').onclick=e=>{const b=e.target.closest('.show');if(!b)return;const k=b.dataset.k,g=H[k][2];let sel=k.startsWith('rail-')?'#rail .rb[data-grp="'+k.slice(5)+'"]':'[data-help="'+k+'"],#'+k+',.knob[data-for="'+k+'"]';
  const p=SHOWP[g]||'start';if(p!=='start'&&p!=='guide'&&!ready()&&!/^(Meter|Transport|Rail)/.test(g)){say('Load a song first to see that unit.');return}
  coach={mode:'tour',L:{t:'Button book',steps:[{p:ready()||p==='start'?p:'start',s:sel,t:H[k][0],x:H[k][1]}]},i:0};document.body.classList.add('coach');$('coach').hidden=false;coachShow()}}

/* ----- coach: spotlight tours ----- */
let coach=null;
function coachStart(id){narrLoad();const L=LESSONS.find(x=>x.id===id);if(!L)return;if(L.need&&!ready()){coach={mode:'tour',L:{t:L.t,steps:[{p:'start',s:'#drop',t:'Load a song first',x:'This lesson uses a song. Press LOAD on the meter bridge or load the demo beat, wait for “Pads are ready”, then start the lesson again from GUIDE.'}]},i:0}}else coach={mode:'tour',L,i:0};
 document.body.classList.add('coach');$('coach').hidden=false;$('cnext').hidden=false;$('cprev').hidden=false;coachShow()}
function coachShow(){const S=coach.L.steps[coach.i];if(S.p&&curP!==S.p&&(ready()||S.p==='start'||S.p==='guide'))go(S.p);
 $('cstep').textContent=coach.L.t+' · step '+(coach.i+1)+' of '+coach.L.steps.length;$('ctitle').textContent=S.t;$('ctext').textContent=S.x;
 $('cprog').style.width=((coach.i+1)/coach.L.steps.length*100)+'%';$('cprev').disabled=coach.i===0;$('cnext').textContent=coach.i===coach.L.steps.length-1?'Done ✓':'Next ▶';
 setTimeout(coachPlace,60);setTimeout(coachPlace,400);if(NAR.on){shush();const tk=++COURSE.tok;COURSE.on=false;speakTour(S.x)}}
function speakTour(x){const c=clipOf(x);if(c){const a=NAR.audio||(NAR.audio=new Audio());a.src=c;a.playbackRate=Math.max(.7,Math.min(1.4,NAR.rate/.88));a.play().catch(()=>{});return}try{if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(x);u.rate=NAR.rate;if(NAR.voice)u.voice=NAR.voice;u.lang='en-US';speechSynthesis.speak(u)}catch(e){}}
function target(sel){if(sel&&typeof sel!=='string')return sel;let c0;try{c0=$$(sel)}catch(e){return null}const c=c0.filter(e=>e.offsetParent||e.getClientRects().length);return c[0]||null}
function coachPlace(){if(!coach)return;const S=coach.L.steps[coach.i]||coach.cur;if(!S)return;const t=S.s?target(S.s):null,sp=$('spot'),cd=$('ccard');
 if(t){t.scrollIntoView({block:'nearest',inline:'nearest'});const r=t.getBoundingClientRect(),pad=8;Object.assign(sp.style,{left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+pad*2)+'px',height:(r.height+pad*2)+'px',opacity:1})}
 else Object.assign(sp.style,{left:'50%',top:'45%',width:'0px',height:'0px',opacity:1});
 const cw=Math.min(380,innerWidth-24);cd.style.width=cw+'px';const ch=cd.offsetHeight||190;let x,y;
 if(t){const r=t.getBoundingClientRect();const roomR=innerWidth-r.right,roomL=r.left,roomB=innerHeight-r.bottom;
  if(roomB>ch+24){y=r.bottom+18;x=r.left+r.width/2-cw/2}else if(r.top>ch+24){y=r.top-ch-18;x=r.left+r.width/2-cw/2}else if(roomR>cw+24){x=r.right+18;y=r.top+r.height/2-ch/2}else if(roomL>cw+24){x=r.left-cw-18;y=r.top+r.height/2-ch/2}else{x=innerWidth/2-cw/2;y=innerHeight-ch-24}}
 else{x=innerWidth/2-cw/2;y=innerHeight/2-ch/2}
 cd.style.left=Math.max(12,Math.min(innerWidth-cw-12,x))+'px';cd.style.top=Math.max(12,Math.min(innerHeight-ch-12,y))+'px'}
function coachEnd(){if(coach&&coach.mode==='course'){courseEnd();return}shush();coach=null;document.body.classList.remove('coach');$('coach').hidden=true;$('ghost').classList.remove('on')}
function coachWire(){$('cnext').onclick=()=>{if(!coach)return;if(coach.mode==='course'){courseJump(COURSE.i+1);return}if(coach.i<coach.L.steps.length-1){coach.i++;coachShow()}else{const id=coach.L.id;coachEnd();LSs('bc16:done:'+id,1);say('Lesson done. Open GUIDE on the rail for the next one.')}};
 $('cprev').onclick=()=>{if(!coach)return;if(coach.mode==='course'){courseJump(COURSE.i-1);return}if(coach.i>0){coach.i--;coachShow()}};$('cexit').onclick=coachEnd;
 addEventListener('resize',()=>{if(coach)coachPlace();if(curP==='tower'){TW.built='';towerRender()}});
 addEventListener('keydown',e=>{if(!coach)return;if(e.key==='Escape'){e.preventDefault();coachEnd()}else if(coach.mode==='course'&&e.key===' '){e.preventDefault();e.stopPropagation();$('cplay').click()}else if(coach.mode==='course'&&e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();courseJump(COURSE.i+1)}else if(coach.mode==='course'&&e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();courseJump(COURSE.i-1)}else if(coach.mode==='tour'&&(e.key==='ArrowRight'||e.key==='Enter')){e.preventDefault();e.stopPropagation();$('cnext').click()}else if(coach.mode==='tour'&&e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();$('cprev').click()}},true)}

/* ----- THE FULL COURSE: a spoken, slow walkthrough of every unit. The camera zooms onto each part,
   the hand shows where to press, and the machine does it while the narrator explains why. ----- */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function ghostTo(sel,click){const t=typeof sel==='string'?target(sel):sel,g=$('ghost');if(!t)return null;const r=t.getBoundingClientRect();g.classList.add('on');g.style.transform='translate('+(r.left+r.width/2)+'px,'+(r.top+r.height/2)+'px)';await sleep(reduced?150:650);if(click){g.classList.add('tap');setTimeout(()=>g.classList.remove('tap'),300)}return t}
const NAR={on:LSg('bc16:voice',1),rate:LSg('bc16:rate',.88),voice:null,dev:LSg('bc16:devvoice',0),audio:null};
const hk=t=>{let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return(h>>>0).toString(36)};
const clipOf=t=>!NAR.dev&&window.NARR&&NARR[hk(t.trim())];
let NARRP=null;function narrLoad(){if(window.NARR)return Promise.resolve();if(NARRP)return NARRP;NARRP=(async()=>{try{const e=document.getElementById('narrData');if(e){window.NARR=JSON.parse(e.textContent);return}const r=await fetch('audio/narration.json');if(r.ok)window.NARR=await r.json()}catch(er){}})();return NARRP}
function pickVoice(){if(!window.speechSynthesis)return null;const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));
 for(const r of[/natural/i,/google us english/i,/samantha/i,/aria|jenny|guy|davis|ava|andrew|emma/i,/en-us/i]){const v=vs.find(v=>r.test(v.name)||r.test(v.lang));if(v)return v}return vs[0]||null}
if(window.speechSynthesis){NAR.voice=pickVoice();speechSynthesis.onvoiceschanged=()=>{NAR.voice=pickVoice()}}
const COURSE={on:false,tok:0,i:0,jump:null,paused:false};
async function cw(ms,tok){let t=0;while(t<ms){await sleep(100);if(tok!==COURSE.tok||!COURSE.on)throw 0;if(!COURSE.paused)t+=100}}
function speak(text,tok){return new Promise(res=>{const words=text.split(/\s+/).length,clip=NAR.on&&clipOf(text),limit=words/(2.3*NAR.rate)*1000+1500;let el=0,done=false;
 const fin=()=>{if(done)return;done=true;clearInterval(iv);res()};
 const iv=setInterval(()=>{if(tok!==COURSE.tok||!COURSE.on){fin();return}if(!COURSE.paused)el+=200;if(el>(NAR.on&&(clip||window.speechSynthesis)?limit*2.5+6000:limit))fin()},200);
 if(clip){const a=NAR.audio||(NAR.audio=new Audio());a.src=clip;a.playbackRate=Math.max(.7,Math.min(1.4,NAR.rate/.88));a.onended=()=>setTimeout(fin,250);a.onerror=()=>fin();a.play().catch(()=>{});return}
 if(!NAR.on||!window.speechSynthesis)return;
 try{speechSynthesis.cancel()}catch(e){}const parts=text.match(/[^.!?]+[.!?]*/g)||[text];let i=0;
 const next=()=>{if(done||tok!==COURSE.tok)return fin();if(i>=parts.length)return fin();const u=new SpeechSynthesisUtterance(parts[i++].trim());u.rate=NAR.rate;u.pitch=1;if(NAR.voice)u.voice=NAR.voice;u.lang='en-US';u.onend=()=>setTimeout(next,220);u.onerror=()=>setTimeout(next,60);speechSynthesis.speak(u)};next()})}
function shush(){try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}try{if(NAR.audio)NAR.audio.pause()}catch(e){}}

/* camera: zoom the whole machine onto one part */
let CAM={s:1,tx:0,ty:0};
function camReset(){const d=$('device');d.style.transition='transform .8s cubic-bezier(.3,.7,.2,1)';d.style.transform='';CAM={s:1,tx:0,ty:0}}
function camera(sel,z){const dev=$('device');if(!z||z<=1||innerWidth<760){camReset();return}const t=target(sel);if(!t){camReset();return}
 const r=t.getBoundingClientRect(),dx=dev.offsetLeft-scrollX,dy=dev.offsetTop-scrollY,s=CAM.s;
 const p=[(r.left+r.width/2-dx-CAM.tx)/s,(r.top+r.height/2-dy-CAM.ty)/s],w=r.width/s,h=r.height/s;
 const zz=Math.max(1,Math.min(z,innerWidth*.8/w,innerHeight*.55/h));if(zz<1.08){camReset();return}
 const tx=innerWidth/2-dx-zz*p[0],ty=innerHeight*.38-dy-zz*p[1];
 dev.style.transformOrigin='0 0';dev.style.transition='transform .9s cubic-bezier(.3,.7,.2,1)';dev.style.transform='translate('+tx+'px,'+ty+'px) scale('+zz+')';CAM={s:zz,tx,ty}}

/* helpers the steps use */
const cl=sel=>{const t=target(sel);if(t)t.click();return t};
const railTo=async(g,tok)=>{const b=$('rail').querySelector('[data-grp="'+g+'"]');await ghostTo(b,true);b.click();await cw(500,tok)};
const hearSl=async(n,tok,from)=>{for(let i=0;i<n;i++){API().hear({k:'slice',ci:(from||0)+i});await cw(380,tok)}};
const flashPads=async(tok)=>{const ps=$$('#psGrid .pp');for(const j of[12,13,14,15]){const p=ps.find(x=>+x.dataset.j===j);if(p){p.classList.add('on');setTimeout(()=>p.classList.remove('on'),200)}API().hear({k:'kit',b:0,j:j-12});await cw(420,tok)}};
/* chapters: [page, target, title, narration, {z:zoom, act, need}] */
const CH=[
 ['Welcome',[
  ['start','#device','Welcome to the BC-16 studio','Welcome. This course walks you through every part of the BC-16, slowly, one control at a time. You can pause me, skip ahead, or go back a step at any time with the buttons on this card. You can also turn my voice off and just read.',{}],
  ['start','#rail','The rail: your rack of gear','On the left is the rail. Each button opens one piece of studio gear. Top to bottom is the order a beat gets made. Deck to load a song. Chop to cut it. Kits to build your own drum kits. Pads to play. Seq to program. Keys to play melodies. Song to arrange and export. Live to perform. Lab to dig deeper. Brain to let the machine write with you. And Guide, where you are now.',{z:1.5}],
  ['start','#hwTop','The meter bridge, always on top','Across the top is the meter bridge. It never changes. The display shows the song name, the tempo, the key, and the last message from the machine. Read that line whenever you are not sure what just happened.',{z:1.5}],
  ['start','#vu','The output meter','This is the output meter. The needle shows how loud the machine is. If the needle slams into the red, turn the master knob down a little so your recording does not distort.',{z:2.2}],
  ['start','#saveGrp','Save','Save stores your whole setup for this song: your cuts, your kits, your patterns and your song order. The machine also saves by itself while you work, so you never lose more than a moment.',{z:2.2}],
  ['start','#tbar','The transport bar, always on the bottom','Along the bottom is the transport bar. This also never changes. Record, overdub, stop, play, play from the start, and tap tempo. Then the pattern deck, then undo and back. Whatever page you are on, these buttons are in the same place.',{z:1.4}],
  ['start','#editGrp','Undo and back','Two buttons save you from mistakes. Undo takes back the last change, up to fifty steps. Back takes you to the page you were on before, like the back button on a phone.',{z:2.2}],
  ['start','#screenWrap .zm','Zoom any unit','Every unit has these three buttons on its nameplate. Minus and plus make it smaller or bigger. The middle button makes that one unit fill the whole stage. Press it again to bring the others back.',{z:2.4}],
  ['start','#osCoach','Coach mode','Turn on the coach with this button. A panel opens beside every unit, with the steps to get the best out of it, ticked off as you go. It also explains each button right after you press it, and tells you what to do next. And any time, you can hold a button for half a second, and it tells you what it does, without pressing it.',{z:2.2}],
  ['start','#osExplain','Explain mode','If you ever forget what a button does, press the question mark. Explain mode turns on. Now any button you press tells you what it does, instead of doing it. Press the question mark again to go back to work.',{z:2.2}]]],
 ['Load a song',[
  ['start','#loadGrp','Load','To start, press Load and choose a song from your device. W A V, M P 3, M 4 A, FLAC and OGG all work. You can also drag a file and drop it anywhere on the machine.',{z:2.2}],
  ['start','#drop','The tape deck','When a song loads, the machine finds the tempo, the key, every hit, and the bars. Then it cuts the song and builds your first kits automatically. If no song is loaded yet, I will load the demo beat now so you can follow along.',{z:1.4,act:async(t,tok)=>{if(!ready()){const d=$('demo');if(d&&!d.hidden)d.click();let n=0;while(!ready()&&n<2400){await cw(100,tok);n++}await cw(1200,tok)}}}],
  ['start','#oled','What was found','Look at the display. It now shows the song name, the tempo in beats per minute, the key, the Camelot number for mixing, and how many slices were cut. Each song you load keeps its own pads and patterns, so you can switch songs and come back.',{z:2}]]],
 ['Chop the song',[
  ['chop','#rail .rb[data-grp="chop"]','Open the sampler','Press Chop on the rail. This is the sampler. It decides where the song is cut into slices.',{z:2.4,act:async(t,tok)=>railTo('chop',tok),need:1}],
  ['chop','#c1','The waveform','This is the whole song. Every thin line is a cut. Tap on the waveform to add a cut where you want one. Tap an existing cut to remove it.',{z:1.6,need:1}],
  ['chop','#mode','Slice method and sensitivity','Slice method chooses how cuts are found. Smart hits is the best starting point. Sensitivity decides how many hits count. Higher finds more cuts, lower finds fewer.',{z:2,need:1}],
  ['chop','#bpm','Tempo','The tempo was found for you. If it came out double or half, use the half and double buttons next to it. Every cut and every beat follows this tempo.',{z:2.2,need:1}],
  ['chop','#scrFoot .sk[data-cyc="minl"]','Shortest slice','Shortest sets the smallest slice allowed. Tiny cuts get merged into the next one. Tap it to step from a thirty second note up to two bars.',{z:2.4,need:1}],
  ['chop','#scrFoot .sk[data-cyc="maxl"]','Longest slice','Longest splits any slice that runs longer than this. For drum hits use a beat. For loop chops, choose one bar or two bars. Watch the pads change as soon as you tap it.',{z:2.4,need:1}],
  ['chop','#padsSlot','The pads follow your cuts','On the right is the pad matrix. In the chop program, pad A one plays slice one, A two plays slice two, all the way to H sixteen, which is slice one hundred and twenty eight. Listen.',{z:1.6,need:1,act:async(t,tok)=>hearSl(6,tok)}],
  ['chop','#banksSlot','Flip through the cuts','Banks A to H hold one hundred and twenty eight slices. The small number on each bank is its first slice. If the song has more slices, the slices arrow keys at the bottom of the screen move to the next page.',{z:2,need:1}],
  ['slicer','#sxRec','Slice Brain picks the chop','Next to the sampler is the slice brain tab. It listens to the song, tells you which chop will flip best and why, and one press applies it. The chop recipes set everything for a job: drum hits, soul flip, stabs, half bar, bar loops, sixteenth grid, or vocal chops.',{z:1.6,need:1,act:async(t,tok)=>{go('slicer');await cw(500,tok)}}],
  ['slicer','#sxList','Every cut, ranked','Every cut gets a score for timing, punch and how clean its tail is. Play any cut, send it straight to a kit slot, or remove a cut you do not want. Best of kit builds a full drum kit from the top scores.',{z:1.5,need:1}],
  ['chop','#pads','Every slice as a button','Below the waveform, every slice also has a numbered button. Tap one to hear it. Hold one for half a second and it goes straight onto the next empty pad.',{z:1.6,need:1}]]],
 ['Build your own kit',[
  ['kit','#rail .rb[data-grp="kit"]','Open Kit Forge','Now press Kits on the rail. This is Kit Forge, where you build your own drum kits by hand from the cuts.',{z:2.4,need:1,act:async(t,tok)=>railTo('kit',tok)}],
  ['kit','#kfBanks','Kit banks','There are eight kit banks, A to H. The number shows how many of the sixteen slots are filled. The first banks were built for you when the song loaded. I will pick an empty bank to show you.',{z:2,need:1,act:async()=>{let bank=7;for(let b=7;b>=0;b--)if(!API().kit(b).some(Boolean))bank=b;KF.bank=bank;KF.armed=0;kitRender()}}],
  ['kit','#kfSlots','Light a slot','On the left are the sixteen slots of the kit. Tap a slot and it glows. The glowing slot is where the next sound will land.',{z:1.6,need:1}],
  ['kit','#kfLib .kfnav','Page through the cuts','On the right is the cut library. Use the arrows to flip pages. The outer arrows jump to the first and last page. You can show sixteen, thirty two or sixty four cuts at a time.',{z:2,need:1}],
  ['kit','#kfFilt','Filter','Use the filter to show only kicks, only snares, only hats, or only tonal sounds. This makes finding the right sound much faster.',{z:2.2,need:1}],
  ['kit','#kfCuts','Hear, then hold','Tap a cut to hear it. When you find the one you want, hold it down for half a second. It drops into the glowing slot. Watch.',{z:1.5,need:1,act:async(t,tok)=>{const c=$$('#kfCuts .kc').find(x=>/KICK/.test(x.textContent))||$$('#kfCuts .kc')[0];if(!c)return;await ghostTo(c,true);API().hear({k:'slice',ci:+c.dataset.ci});await cw(900,tok);c.classList.add('held');await cw(400,tok);kitDrop(+c.dataset.ci,KF.armed)}}],
  ['kit','#kfSlots','Keep going','The next empty slot lit up by itself. So you can keep tapping and holding, one sound after another, and build a full kit in a minute. You can also drag a cut onto any slot you like.',{z:1.6,need:1,act:async(t,tok)=>{const c=$$('#kfCuts .kc').find(x=>/SNARE/.test(x.textContent));if(!c)return;API().hear({k:'slice',ci:+c.dataset.ci});await cw(700,tok);kitDrop(+c.dataset.ci,KF.armed)}}],
  ['kit','.kfauto','Auto fill','Auto fill builds a bank in one press: an M P C drum layout with kick, snare, hats, percs and tones in their places, or the best cuts, cuts in order, tonal stabs, or loops. Then change any slot by hand. The strip below shows the best cuts for the glowing slot.',{z:1.8,need:1}],
  ['kit','.kfact','Change or remove a sound','To change a slot, tap it and hold a different cut. It is replaced. Clear slot empties it. Clear bank empties all sixteen. Undo brings anything back.',{z:2,need:1}],
  ['kit','.kfsave','Save your kit','Type a name for the kit and press Save kit. Your saved kits are listed here. Tap a name to load it into any bank. The x deletes it. That is how you keep a collection of kits for each song.',{z:2,need:1}],
  ['kit','#kfPads','Play it on the pads','Play on pads switches the pad matrix to this kit and opens the drum machine.',{z:2.4,need:1}]]],
 ['Play the pads',[
  ['pads','#rail .rb[data-grp="pads"]','Open the drum machine','Press Pads on the rail. This is the drum machine. The big pads are on the right. The screen on the left edits them.',{z:2.4,need:1,act:async(t,tok)=>railTo('pads',tok)}],
  ['pads','#deckProg','Chop or kit program','This button decides what the pads play. Chop means the song’s slices in order. Kit means the kits you built or the ones the machine built. Tap it to switch any time.',{z:2.6,need:1}],
  ['pads','#padsSlot','Playing','Tap the pads with your mouse or finger, or use your computer keyboard. The bottom row is A S D F, then G H J K, then Q W E R, then T Y U I on top.',{z:1.6,need:1,act:async(t,tok)=>{API().setProg('kit');API().setBank(0);await cw(300,tok);await flashPads(tok)}}],
  ['pads','#banksSlot','Pad banks','Banks A to H switch which sixteen sounds are on the pads. Number keys one to eight do the same.',{z:2,need:1}],
  ['pads','#knobs','The Q link knobs','These four knobs work in every unit. Tempo. Swing, for groove. Filter, left for darker, right for thinner. And pump, which ducks the music each time the kick hits. Drag a knob up or down, or double click it to reset.',{z:2,need:1}],
  ['pads','#fnGrp','Pad functions','Under the pads are the pad functions. Note repeat retriggers a pad in time while you hold it. Sixteen levels turns the pads into sixteen notes of one sound. Chord stacks those notes. Erase removes a pad’s hits from the pattern. Pad mute silences a pad. Full level plays every hit at full volume. T C sets how hits snap to the grid.',{z:1.7,need:1}],
  ['pads','#psPadCard','Change a pad','On the screen, choose Edit, then tap a pad to change it. You can rename it, set how it plays, one shot, gate, loop, or hot cue. You can set volume, pan, tune, trim the start and end, reverse it, and give it a cut group so hats choke each other. Arrange lets you swap pads around by tapping two pads.',{z:1.5,need:1}],
  ['pads','#scrFoot','Soft keys','The soft keys along the bottom of the screen change with each unit, like the function keys on a real M P C. On this unit they include pick sound, tune to key, and clear pad.',{z:1.8,need:1}],
  ['pads','#psGrid','Fill an empty pad fast','Here is the fastest way to fill a pad. In the kit program, hold an empty pad for half a second. You jump to Kit Forge with that slot already glowing. Hold the cut you want, and press back to return here.',{z:1.6,need:1}]]],
 ['Record a beat',[
  ['pads','#patDeck','Choose a pattern','A pattern is a loop of one to eight bars. You have eight of them, P one to P eight. Pick the one you want to record into with these buttons, or the arrows.',{z:1.8,need:1}],
  ['pads','#psRec','Arm record','Press record. It blinks. Now press play. You hear a count in, then the loop starts. Everything you play on the pads, or on the keys, lands in the pattern.',{z:2.4,need:1}],
  ['pads','#psPlay','Play and listen','Here is the first pattern playing. Each loop you play over it adds more hits. Your hits snap to the T C grid so they are in time.',{z:2.4,need:1,act:async(t,tok)=>{API().selPat(0);$('psPlay').click();await cw(4200,tok);$('psStop').click()}}],
  ['pads','#psStop','Stop','Stop ends the recording. Press play again to hear what you made.',{z:2.4,need:1}],
  ['pads','#osUndo','Fix mistakes','Did not like that take? Press undo and the whole take is gone. Only one sound was wrong? Light erase, then press that pad, and only that sound is removed from the pattern.',{z:2.4,need:1}],
  ['pads','#hwOvd','Overdub','Overdub starts playing and recording at once, on top of what is already there. Use it to add layers, one sound at a time: kick first, then snare, then hats.',{z:2.4,need:1}]]],
 ['Patterns and the step grid',[
  ['sequence','#rail .rb[data-grp="seq"]','Open the step sequencer','Press Seq on the rail. This is the step sequencer: a grid view of the current pattern.',{z:2.4,need:1,act:async(t,tok)=>railTo('seq',tok)}],
  ['sequence','#psSeqCard','Draw hits','Each row is a pad. Each column is a sixteenth note. Click a cell to add a hit. Click it again to remove it. Click a name on the left to hear that pad.',{z:1.4,need:1}],
  ['sequence','#psBars','Pattern length','Set how many bars the pattern lasts: one, two, four or eight.',{z:2.4,need:1}],
  ['sequence','#psGen','Smart beat','Smart beat writes a pattern for you, from your own sounds, into the current pattern. Use it as a starting point, then change it.',{z:2.4,need:1}],
  ['sequence','#osPatDup','Copy for variations','Copy makes a copy of this pattern in the next empty one and jumps there. Change the copy, maybe drop the kick or add a hat roll. Now you have a verse and a variation, and the original is safe.',{z:2.4,need:1}],
  ['sequence','#osPatPrev','Jump back and forth','The arrows step between patterns. Shift with the left and right arrow keys does the same. While a pattern plays, the next one waits until the current one ends, so the change always lands on time.',{z:2.4,need:1}],
  ['sequence','#patLcd','Read the display','The display shows which pattern is playing, which one is waiting, its length, and how many hits it has. The line along the bottom shows where you are in the loop.',{z:2.6,need:1}],
  ['pads','.autoBar','Automation','This works like automation in a D A W. Set it to write, press play, and move the filter, pump or swing knob. The moves record into the pattern. Set it to read and the pattern plays your moves back every loop.',{z:2.2,need:1,act:async(t,tok)=>{go('pads');await cw(400,tok)}}],
  ['sequence','#osPatClr','Clear','Clear empties the current pattern. It asks first, and undo brings it back.',{z:2.4,need:1}]]],
 ['Keys and melodies',[
  ['tower','#rail .rb[data-grp="keys"]','Open the key tower','Press Keys on the rail. This is the key tower: three keyboards stacked on top of each other, each with its own sound and its own octave.',{z:2.4,need:1,act:async(t,tok)=>railTo('keys',tok)}],
  ['tower','#twTiers .tier:last-child .twl','Choose a sound and octave','On the left of each keyboard, the arrows choose the sound. Tonal slices from your song come first, then your kit pads, then every cut. Minus and plus move the keyboard down or up an octave. A common setup is bass on tier one, chords on tier two, and a lead on tier three.',{z:2,need:1}],
  ['tower','#twTiers .tier:nth-child(2) .twkb','Play','Click, tap, or slide across the keys. Pressing lower on a key plays louder. On your computer keyboard, the Z row plays tier one and the Q row plays tier two.',{z:1.5,need:1,act:async(t,tok)=>{const tier=$$('#twTiers .tier')[1];if(!tier)return;const ins=$$('.tww.ins:not(.off)',tier).slice(2,10);for(const k of[0,2,4,5,4,2,1,0])if(ins[k]){tOn('course',ins[k],.8);await cw(330,tok);tOff('course')}}}],
  ['tower','#twLock','Scale lock','With scale lock on, only the notes in the song’s key will play, so every note fits. Turn it off for passing notes.',{z:2.4,need:1}],
  ['tower','#twTiers .tier:last-child .twr','Hold, stack, mute and MIDI','Hold lets notes ring out. Stack ties tiers together, so playing one plays all the stacked tiers at once, for big layered sounds. Mute silences a tier. MIDI in sends a plugged in MIDI keyboard to that tier.',{z:2,need:1}],
  ['tower','#psRec','Record your keys','To record a melody, press record, then play, and play the keys. The notes go into the current pattern with their pitch and length. Then copy the pattern to build the next part.',{z:2.4,need:1}],
  ['tower','#subTabs','Piano and layer rig','Keys also has two more units in these tabs. The piano plays one sound across a full keyboard. The layer rig puts drum pads beside lead, chord and bass layers.',{z:2.2,need:1}]]],
 ['Let the Brain help',[
  ['brain','#rail .rb[data-grp="brain"]','Open Beat Brain','Press Brain on the rail. Beat Brain builds and writes from your own sounds.',{z:2.4,need:1,act:async(t,tok)=>railTo('brain',tok)}],
  ['brain','#psMagic','Build everything','Choose a style, like Detroit and Flint bounce, trap, drill or boom bap, and an energy level. Build it makes a smart kit, chains, loops, melodic sounds and hot cues, then writes four beats and chains them into a song.',{z:1.5,need:1}],
  ['brain','#psBrain','Write and pack','Analyze reads what each sound in your kits is. Write full song writes intro, verse, hook and outro patterns. You can also write just one section into the current pattern, and save any bank as a sound pack to reuse.',{z:1.5,need:1}]]],
 ['Build the song, part by part',[
  ['build','#rail .rb[data-grp="song"]','Open the song builder','Press Song on the rail. The first unit is the song builder. This is how chop music gets made: you loop a part, you play the part that goes over it, then you go to the next part, until the song is done.',{z:2.4,need:1,act:async(t,tok)=>{await railTo('song',tok);go('build');await cw(400,tok)}}],
  ['build','.sbhow','The five steps','These five steps are the whole method. Loop a part. Play over it. Press next part. Turn channels on or off. Then play the song.',{z:1.6,need:1}],
  ['build','#sbLoop','Loop a part','Press loop this part. The current pattern plays over and over. This is your bed: the chop, the loop, whatever the part is built on.',{z:2.4,need:1}],
  ['build','#sbRec','Play the next part over it','Arm record, and play the part that goes there, on the pads or the key tower. It records into the loop, every time around.',{z:2.4,need:1}],
  ['build','#sbNext','Next part','When the part is right, press next part. The part you were on is added to the song. A new part starts, carrying your loop with it, and record stays armed, so you just keep playing. You will find the same next part button on the transport bar, on every page.',{z:2.4,need:1}],
  ['build','#sbCarry','What the next part starts with','Choose what each new part starts with. The whole loop. Only the channels you left on. Or nothing, for a clean break.',{z:2,need:1}],
  ['build','.sbchan','Turn channels on and off','Every sound in this part shows up here as a channel. Tap a channel to turn it off for this part only. Tap again to bring it back. The hits are never deleted, so you can drop the drums for an intro, then bring them back for the hook.',{z:1.8,need:1}],
  ['build','#sbFollow','Pads follow the part','Arrange two or three pad banks for a song, say chops on bank A, drums on bank B, the hook chops on bank C. Each part remembers the bank it was made with, and when that part comes round, the pads switch to it by themselves.',{z:2.2,need:1}],
  ['build','.sbsong','The song, part by part','Your parts line up here, in order. Tap one to select it. Move it earlier or later, repeat it, remove it, loop it to fix something, or play the song from that part.',{z:1.6,need:1}],
  ['build','.tlw','The arrangement view','Below the parts is the arrangement view, like a D A W. Parts run across, channels run down, and your automation lanes sit at the bottom. Tap any block to switch that channel on or off in that part. The white line shows where the song is playing.',{z:1.5,need:1}],
  ['build','#sbSong','Play the song','Play the song plays every part from the top. Double tap any part to jump straight to it, right on the beat. When it is finished, press export.',{z:2.4,need:1}]]],
 ['Export the song',[
  ['song','#subTabs','The song arranger','The song arranger tab holds the same song order, plus exports and saves.',{z:2.4,need:1,act:async(t,tok)=>{go('song');await cw(400,tok)}}],
  ['song','#psSongCard','Song order','Select a pattern, then press add current pattern. Do that for each part, in order: intro, verse, hook, verse, hook, outro. Then turn on song mode, and play runs through the whole list. Play start always begins from the top.',{z:1.5,need:1}],
  ['song','#psSongCard','Export','When it sounds right, export it. W A V for the best quality, M P 3 to share, or MIDI to open the parts in another program. You can also export a bank as a kit, in a zip file.',{z:1.5,need:1}],
  ['song','#subTabs','Auto producer','The second tab, auto producer, builds a whole new arrangement of the original song for you, which you can play and export too.',{z:2.2,need:1}]]],
 ['Perform live',[
  ['launch','#rail .rb[data-grp="live"]','Open the launch console','Press Live on the rail. The launch console shows all eight patterns at once, with the pads right beside them.',{z:2.4,need:1,act:async(t,tok)=>railTo('live',tok)}],
  ['launch','#lcClips','Launch patterns','Tap a pattern to play it. While one is playing, tap the next one. It blinks while it waits, then starts exactly when the current one finishes. The F one to F eight keys launch them too. This way you never have to step through patterns while performing.',{z:1.4,need:1,act:async(t,tok)=>{launch(0);await cw(3500,tok);launch(1);await cw(4500,tok);$('psStop').click()}}],
  ['launch','#knobs','Effects on the knobs','Use the filter knob for sweeps and the pump knob for that ducking bounce. Play the pads on top.',{z:2,need:1}],
  ['dj','#subTabs','DJ mixer','The DJ mixer tab has hot cues, loops, rolls, echo, gate, kills for the low, mid and high, and print, which records a performance as a new sound.',{z:2.2,need:1}],
  ['launch','#hwRecSlot','Take record','Take record, on the top bar, records everything you hear as audio, from any unit. Use it to capture a live performance. Your takes show up on the song page for export.',{z:2.4,need:1}]]],
 ['The lab',[
  ['sounds','#rail .rb[data-grp="lab"]','Open the lab','Press Lab on the rail. The lab has three units for digging deeper.',{z:2.4,need:1,act:async(t,tok)=>railTo('lab',tok)}],
  ['sounds','#psBinCard','Sound browser','The sound browser shows every slice, take and added file. Filter them, tap to hear, and drop them onto pads. Chain lets you pick several slices that play back to back from one pad. Add file brings in your own sounds.',{z:1.4,need:1}],
  ['sounds','#subTabs','Stems and sorter','The stem splitter separates a stretch of the song into drums, bass, vocals and melody. The sound sorter gathers slices that sound alike into groups.',{z:2.2,need:1}]]],
 ['Your sound library',[
  ['factory','#rail .rb[data-grp="lib"]','The library','Press Library on the rail. The pack factory makes brand new sample packs with A I, in any genre, using your own music A P I key.',{z:2.4,act:async(t,tok)=>{await railTo('lib',tok);go('factory');await cw(400,tok)}}],
  ['factory','#pfGenres','Pick genres and pack types','Pick one or more genres, and one or more pack types: sample flips, melodic loops, drum breaks, eight oh eights, chords, atmosphere, vocal chops, or full beats. Each request makes two tracks.',{z:1.6}],
  ['factory','#pfBuild','Build the library','Press build library. It asks before spending credits. The tracks arrive in a few minutes and land in your sound library, saved on this device.',{z:2.4}],
  ['factory','#pfItems','Load, chop and pack','For any track, load and chop puts it in the machine and cuts it. Pro pack also saves its kits under my kits, ready to play.',{z:1.6}],
  ['store','#subTabs','The pack store','The pack store tab has free starter packs, and the premium plans if you want ready made packs every month.',{z:2.2,act:async(t,tok)=>{go('store');await cw(400,tok)}}]]],
 ['Save and come back',[
  ['song','#psSaveCard','Saved setups','Here are your saved setups. Save stores your cut points, all eight banks, pad settings, patterns and song order. Give it a name to keep different versions.',{z:1.5,need:1,act:async(t,tok)=>{go('song');await cw(400,tok)}}],
  ['song','#psSaveCard','Continue later','The audio stays on your device. To continue later, open the same song file again. Your latest work comes back automatically, and your saved setups are listed here. To move a project to another computer, download the project file, then open it there with the same song.',{z:1.5,need:1}],
  ['start','#saveGrp','Save often','The save button on the top bar does the same from any page. Press it whenever you reach something you like.',{z:2.4}]]],
 ['The fastest way to make a song',[
  ['start','#rail','The workflow','Here is the fastest way to work. One: load a song. Two: on chop, set longest to one beat for drums or one bar for loops. Three: in kits, light a slot, hold a cut, and fill a kit. Save it. Four: on pads, switch to the kit, press record and play, and lay down a beat. Five: copy the pattern and change the copy. Six: add melody on the key tower. Seven: put the patterns in order on the song page and export. And when you perform, use the launch console.',{z:1.4}],
  ['guide','#gLessons','Practice one part at a time','This guide has short lessons for each part. Start any one of them, any time. And the button book on the right explains every single control, with show me, which points it out for you.',{z:1.4,act:async(t,tok)=>{go('guide');await cw(500,tok)}}],
  ['guide','#osExplain','You are ready','Remember: if you are ever unsure, press the question mark and press the button you are unsure about. That is the end of the course. Go make something.',{z:2.2}]]]];
const STEPS=[];CH.forEach(([c,ss],ci)=>ss.forEach(s=>STEPS.push({ch:c,ci,p:s[0],s:s[1],t:s[2],x:s[3],o:s[4]||{}})));
async function courseStart(at){shush();await Promise.race([narrLoad(),sleep(4000)]);if(coach&&coach.mode==='tour')coachEnd();COURSE.on=true;COURSE.i=at||0;COURSE.paused=false;COURSE.jump=null;
 coach={mode:'course',L:{t:'Course',steps:[]},i:0};document.body.classList.add('coach','course');$('coach').hidden=false;courseUI();
 while(COURSE.on&&COURSE.i<STEPS.length){const tok=++COURSE.tok;try{await courseStep(STEPS[COURSE.i],tok)}catch(e){if(e)console.warn('course step',COURSE.i,e);if(e&&tok===COURSE.tok)await sleep(1500)}
  if(!COURSE.on)break;if(COURSE.jump!=null){COURSE.i=COURSE.jump;COURSE.jump=null;continue}COURSE.i++}
 const fin=COURSE.on&&COURSE.i>=STEPS.length;courseEnd();if(fin){LSs('bc16:course',1);say('Course finished. Lessons and the button book are on GUIDE any time.')}}
async function courseStep(S,tok){coach.cur={s:S.s,t:S.t,x:S.x};$('cstep').textContent='Chapter '+(S.ci+1)+' of '+CH.length+' · '+S.ch;$('ctitle').textContent=S.t;$('ctext').textContent=S.x;
 $('cprog').style.width=((COURSE.i+1)/STEPS.length*100)+'%';$('cChap').value=S.ci;
 const can=!S.o.need||ready();
 if(can&&S.p&&curP!==S.p&&!S.o.act)go(S.p);
 await cw(250,tok);if(can&&S.o.act&&/^#rail/.test(S.s)){camReset();await cw(300,tok)}else{camera(S.s,can?S.o.z:0);await cw(950,tok)}
 coachPlace();if(can)await ghostTo(S.s,false);
 if(!can)$('ctext').textContent=S.x+' (This part needs a song: load one, or let chapter 2 load the demo.)';const talk=speak(S.x,tok);
 if(can&&S.o.act){await S.o.act(target(S.s),tok);if(S.p&&curP!==S.p)go(S.p);await cw(400,tok);camera(S.s,S.o.z);await cw(900,tok);coachPlace();ghostTo(S.s,false)}
 await talk;await cw(900,tok)}
function courseUI(){$('cprev').textContent='⏮';$('cnext').textContent='⏭';$('cexit').textContent='■ End';$('cplay').textContent='❚❚ Pause';$('cvoice').classList.toggle('on',!!NAR.on);$('cvoice').textContent=NAR.on?'🔊 Voice on':'🔇 Voice off';$('cRate').value=String(NAR.rate)}
function courseJump(i){if(!COURSE.on)return;COURSE.jump=Math.max(0,Math.min(STEPS.length-1,i));COURSE.paused=false;$('cplay').textContent='❚❚ Pause';shush();COURSE.tok++}
function courseEnd(){COURSE.on=false;COURSE.tok++;shush();camReset();tOff('course');document.body.classList.remove('course');$('cprev').textContent='◀ Back';$('cnext').textContent='Next ▶';$('cexit').textContent='Exit';if(coach&&coach.mode==='course'){coach=null;document.body.classList.remove('coach');$('coach').hidden=true;$('ghost').classList.remove('on')}}
function courseWire(){$('cChap').innerHTML=CH.map(([c],i)=>'<option value="'+i+'">'+(i+1)+'. '+c+'</option>').join('');
 $('cChap').onchange=e=>courseJump(STEPS.findIndex(s=>s.ci===+e.target.value));
 $('cplay').onclick=()=>{COURSE.paused=!COURSE.paused;$('cplay').textContent=COURSE.paused?'▶ Resume':'❚❚ Pause';try{if(NAR.audio&&NAR.audio.src&&!NAR.audio.ended)COURSE.paused?NAR.audio.pause():NAR.audio.play();else COURSE.paused?speechSynthesis.pause():speechSynthesis.resume()}catch(e){}};
 $('cvoice').onclick=()=>{NAR.on=!NAR.on;LSs('bc16:voice',NAR.on?1:0);if(!NAR.on)shush();courseUI();if(NAR.on&&COURSE.on)courseJump(COURSE.i)};
 $('cWho').value=String(NAR.dev);$('cWho').onchange=e=>{NAR.dev=+e.target.value;LSs('bc16:devvoice',NAR.dev);if(COURSE.on)courseJump(COURSE.i)};
 $('cRate').onchange=e=>{NAR.rate=+e.target.value;LSs('bc16:rate',NAR.rate);if(COURSE.on)courseJump(COURSE.i)}}
function demoStart(){courseStart(0)}
function demoStop(){courseEnd()}

/* ================= first run ================= */
function welcome(){if(LSg('bc16:welcomed',0))return;const w=el('div',{id:'welcome',role:'dialog','aria-label':'Welcome'});
 w.innerHTML='<div class="wcard"><div class="plate"><i class="pled"></i><b class="pn">BC-16 STUDIO</b><span class="pm">FIRST POWER-ON</span><span class="vent"></span></div><div class="wbody"><h2>Welcome to the studio</h2><p>Every machine is its own piece of gear. Tap one on the studio floor, or jump between them on the rail. A song moves through them left to right:</p><div class="gmap">'+FLOW.map(([p,v],i)=>'<span class="gnode" style="--c:'+UNITS[p].c+'"><b>'+UNITS[p].n+'</b><span>'+v+'</span></span>'+(i<FLOW.length-1?'<i class="garr">→</i>':'')).join('')+'</div><p>Record, play, stop, patterns, undo and back are always on the bottom bar. Pick how you want to start:</p><div class="gbtns"><button class="hwb big" data-w="tour"><i class="led"></i>TAKE THE TOUR</button><button class="hwb big" data-w="demo"><i class="led"></i>▶ FULL NARRATED COURSE</button><button class="hwb big" data-w="coach"><i class="led"></i>COACH ME AS I GO</button><button class="hwb big" data-w="skip"><i class="led"></i>JUST LET ME IN</button></div><small>Hold any button for ½ second to learn what it does. Everything here is on GUIDE and COACH on the rail, any time.</small></div></div>';
 document.body.append(w);w.onclick=e=>{const b=e.target.closest('[data-w]');if(!b)return;LSs('bc16:welcomed',1);w.remove();if(b.dataset.w==='tour')coachStart('tour');else if(b.dataset.w==='demo')demoStart();else if(b.dataset.w==='coach')coachToggle(true)}}

/* ================= keys ================= */
function keys(){addEventListener('keydown',e=>{const tg=e.target;if(/INPUT|SELECT|TEXTAREA/.test(tg.tagName)||e.metaKey||e.ctrlKey)return;
 if(e.altKey&&/^Digit\d$/.test(e.code)){const i=(+e.code.slice(5)+9)%10;const g=GROUPS[i];if(g){e.preventDefault();$('rail').querySelector('[data-grp="'+g.id+'"]').click()}return}
 if(e.altKey)return;
 if(e.key==='?'){e.preventDefault();explain(!document.body.classList.contains('explain'));return}
 if(e.key==='Escape'){if(document.body.classList.contains('explain')){explain(false);return}if(!$('xbub').hidden){$('xbub').hidden=true;return}const f=$$('#stage .unit.focus')[0];if(f){zoom(f,0);return}const gp=$('gPick');if(gp&&!gp.hidden){$('gPickX').click();return}if(pickFrom){$('kfDone').click();return}const w=$('welcome');if(w){LSs('bc16:welcomed',1);w.remove();return}if(curP!=='floor'&&!document.querySelector('#askD,#keysD,#welcome')&&$('coach').hidden&&window.BC16){e.preventDefault();BC16.home();return}}
 if(e.key==='`'){e.preventDefault();back();return}
 if(curP==='tower')return;
 if(e.shiftKey&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();e.stopPropagation();patStep(e.key==='ArrowRight'?1:-1);return}
 if(e.key==='K'&&e.shiftKey){e.preventDefault();keysOverlay();return}
 if(curP==='launch'&&ready()){let i=-1;if(/^F([1-9]|1[0-2])$/.test(e.key))i=+e.key.slice(1)-1;else if(e.shiftKey&&/^Digit[1-8]$/.test(e.code))i=+e.code.slice(5)-1;if(i>=0){e.preventDefault();e.stopPropagation();launch(i);return}}
 if(curP==='kit'&&(e.key==='PageUp'||e.key==='PageDown')){e.preventDefault();KF.pg(e.key==='PageDown'?1:-1)}},true)}

/* ================= boot ================= */
function init(){build();coachWire2();soundWire();projWire();courseWire();kitWire();builderWire();factoryWire();storeWire();slicerWire();projWire2();towerWire();launchWire();explainWire();coachWire();guideWire();keys();
 for(const k of Object.keys(H)){const x=document.getElementById(k);if(x&&!x.dataset.help)x.dataset.help=k}
 const sp=$('seqSlot');if(sp)sp.dataset.help='psPats';
 window.OS={go,say,need,ready,back,units:UNITS,groups:GROUPS,lastOf:m=>{const g=GROUPS.find(x=>x.pages.includes(m.pages[0][0]));return g?LSg('bc16:last:'+g.id,null):null},sessionStart,focus,allStop,_texts:()=>[...new Set([...STEPS.map(s=>s.x),...LESSONS.flatMap(L=>L.steps.map(z=>z.x))])],page,pick,_si:()=>sliceIntel(),_rc:j=>roleCands(j,new Set())};
 const relab=(id,t)=>{const x=$(id);if(!x)return;[...x.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});x.append(t)};relab('hwPst','START');relab('psTap','TAP');
 page(window.curPage?curPage():'start');halfSync();
 setInterval(()=>{coachRender();patSync();const p=$('scrProg');if(p)$('deckProg').textContent=p.textContent;if(curP==='kit'&&ready()&&KF.key.split('|')[0]!==String(API().nSlices()))kitRender()},120);
 const loop=ts=>{vuDraw(ts);requestAnimationFrame(loop)};requestAnimationFrame(loop);
 let lastF='';setInterval(()=>{const f=fnameSafe();if(f!==lastF&&ready()){lastF=f;TW.key='';KF.list=null;if(curP==='kit')kitRender();if(curP==='tower'){TW.built='';towerRender()}if(curP==='launch')launchRender()}},800);
 setTimeout(welcome,600);setTimeout(resumeOffer,900)}
init();
})();
