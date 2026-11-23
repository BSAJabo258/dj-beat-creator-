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
const say=t=>{const s=$('st');if(s)s.textContent=t};
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
 guide:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v14h-7"/>'};
const GROUPS=[
 {id:'home',l:'DECK',pages:['start']},{id:'chop',l:'CHOP',pages:['chop']},{id:'kit',l:'KITS',pages:['kit']},{id:'pads',l:'PADS',pages:['pads']},
 {id:'seq',l:'SEQ',pages:['sequence']},{id:'keys',l:'KEYS',pages:['tower','keys','live']},{id:'song',l:'SONG',pages:['song','arrange']},
 {id:'live',l:'LIVE',pages:['launch','dj']},{id:'lab',l:'LAB',pages:['sounds','parts','groups']},{id:'brain',l:'BRAIN',pages:['brain']},{id:'guide',l:'GUIDE',pages:['guide']}];
const UNITS={
 start:{g:'home',n:'TAPE DECK',m:'TD-1',c:'#29e3ff',c2:'#7a5cff',d:'Load a song. Tempo, key and every hit are found for you.'},
 chop:{g:'chop',n:'SAMPLER',m:'CS-1',c:'#29e3ff',c2:'#00ffa3',d:'Set how the song is cut. The PAD MATRIX plays the cuts in order.'},
 kit:{g:'kit',n:'KIT FORGE',m:'KF-2',c:'#ff8a1f',c2:'#ff2e6e',d:'Build your own kits: pick a slot, hold a cut, it lands.'},
 pads:{g:'pads',n:'DRUM MACHINE',m:'PM-16',c:'#ff3df2',c2:'#7a5cff',d:'Play and program the pads. Switch CHOP / KIT program.'},
 sequence:{g:'seq',n:'STEP SEQUENCER',m:'SQ-8',c:'#b6ff3b',c2:'#29e3ff',d:'Draw hits on the grid of the current pattern.'},
 tower:{g:'keys',n:'KEY TOWER',m:'KT-3',c:'#9b6bff',c2:'#ff3df2',d:'Three stacked keyboards, each with its own sound and octave.'},
 keys:{g:'keys',n:'PIANO',m:'KP-1',c:'#9b6bff',c2:'#29e3ff',d:'One sound across a piano, locked to the key.'},
 live:{g:'keys',n:'LAYER RIG',m:'LR-4',c:'#9b6bff',c2:'#ff8a1f',d:'Drum pads plus lead, chord and bass layers.'},
 song:{g:'song',n:'SONG ARRANGER',m:'SA-8',c:'#ffd23e',c2:'#ff8a1f',d:'Put patterns in order and export the song.'},
 arrange:{g:'song',n:'AUTO PRODUCER',m:'AP-1',c:'#ffd23e',c2:'#ff3df2',d:'A new arrangement of the whole song, built for you.'},
 launch:{g:'live',n:'LAUNCH CONSOLE',m:'LC-8',c:'#ff315c',c2:'#ff8a1f',d:'All 8 patterns on one console. Tap to launch at the end of the bar loop.'},
 dj:{g:'live',n:'DJ MIXER',m:'DX-2',c:'#ff315c',c2:'#29e3ff',d:'Hot cues, loops, rolls, kills and filter.'},
 sounds:{g:'lab',n:'SOUND BROWSER',m:'SB-1',c:'#3d8bff',c2:'#29e3ff',d:'Every slice, take and added file.'},
 parts:{g:'lab',n:'STEM SPLITTER',m:'SS-4',c:'#3d8bff',c2:'#b6ff3b',d:'Split a stretch into drums, bass, vocals and melody.'},
 groups:{g:'lab',n:'SOUND SORTER',m:'GS-1',c:'#3d8bff',c2:'#ff3df2',d:'Slices that sound alike, gathered into groups.'},
 brain:{g:'brain',n:'BEAT BRAIN',m:'BB-9',c:'#ff6ad5',c2:'#7a5cff',d:'Presets, variations, full songs and smart kits.'},
 guide:{g:'guide',n:'STUDIO MANUAL',m:'OS',c:'#5effc8',c2:'#29e3ff',d:'Lessons, the button book and a demo that plays itself.'}};
const WITH_DECK=new Set(['chop','pads','sequence','launch','dj','sounds']);

/* ================= build the rack ================= */
function plate(name,model,id,extra){return '<div class="plate"'+(id?' data-panel="'+id+'"':'')+'><i class="pled"></i><b class="pn">'+name+'</b><span class="pm">'+model+'</span>'+(extra||'')+'<span class="vent"></span><span class="zm"><button class="zb" data-z="-1" title="Zoom out" aria-label="Zoom out">−</button><button class="zb" data-z="0" title="Fill the stage with this unit" aria-label="Focus this unit">⤢</button><button class="zb" data-z="1" title="Zoom in" aria-label="Zoom in">+</button></span></div>'}
function build(){
 document.body.classList.add('os');
 const dev=$('device'),top=$('hwTop');
 /* rail */
 const rail=el('nav',{id:'rail','aria-label':'Studio units'});
 rail.innerHTML='<div class="brand" aria-hidden="true"><b>BC</b><span>16</span></div>'+GROUPS.map((g,i)=>'<button class="rb" data-grp="'+g.id+'" data-help="rail-'+g.id+'" title="'+g.l+(i<10?' (Alt+'+((i+1)%10)+')':'')+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+I[g.id]+'</svg><span>'+g.l+'</span><i class="rled"></i></button>').join('')+'<div class="rsp"></div><button class="rb sm" id="osExplain" data-help="osExplain" title="Explain mode (?)"><b>?</b><span>EXPLAIN</span><i class="rled"></i></button>';
 dev.prepend(rail);
 rail.addEventListener('click',e=>{const b=e.target.closest('.rb[data-grp]');if(!b)return;const g=GROUPS.find(x=>x.id===b.dataset.grp);const last=LSg('bc16:last:'+g.id,g.pages[0]);go(g.pages.includes(last)?last:g.pages[0])});
 /* meter bridge */
 const ol=$('oled');ol.insertAdjacentHTML('beforeend','<span id="osLine" aria-live="polite"></span>');
 const vu=el('div',{id:'vuGrp',class:'hwgrp'},'<span class="hwl">OUTPUT</span><div id="vu" data-help="vu"><canvas id="vuC" width="236" height="92"></canvas></div>');
 const save=el('div',{id:'saveGrp',class:'hwgrp'},'<span class="hwl">SETUP</span><button class="hwb" id="osSave" data-help="osSave"><i class="led"></i>SAVE</button>');
 top.insertBefore(vu,$('loadGrp'));$('loadGrp').after(save);
 $('loadGrp').querySelector('.hwl').textContent='SONG';
 /* stage */
 const stage=el('main',{id:'stage'});
 const sub=el('div',{id:'subBar'},'<div id="unitTag"><i></i><b id="unitName"></b><span id="unitModel"></span><em id="unitDesc"></em></div><div id="subTabs" role="tablist"></div>');
 stage.append(sub);
 const sw=$('screenWrap');sw.insertAdjacentHTML('afterbegin',plate('SAMPLER','CS-1','screen'));sw.classList.add('unit');stage.append(sw);
 const deck=el('section',{id:'deck',class:'unit'});deck.innerHTML=plate('PAD MATRIX','PM-16','deck','<button id="deckProg" class="pchip" data-help="scrProg">CHOP</button>');
 ['knobGrp','bankGrp','padsSlot','fnGrp','dataGrp'].forEach(id=>{const x=$(id);if(x)deck.append(x)});stage.append(deck);
 stage.append(buildKit(),buildTower(),buildLaunch(),buildGuide());
 /* transport bar */
 const bar=el('footer',{id:'tbar'});
 const pat=el('div',{id:'patGrp',class:'hwgrp'},'<span class="hwl">PATTERN</span><div id="patDeck"><button class="hwb sq" id="osPatPrev" data-help="osPatPrev" title="Previous pattern (−)"><i class="led"></i>◀</button><div id="patLcd" data-help="patLcd"><b id="patNum">P01</b><span id="patInfo">—</span><i id="patProg"><u></u></i></div><button class="hwb sq" id="osPatNext" data-help="osPatNext" title="Next pattern (=)"><i class="led"></i>▶</button></div>');
 pat.querySelector('#patDeck').append($('seqSlot'));
 pat.querySelector('#patDeck').insertAdjacentHTML('beforeend','<button class="hwb" id="osPatDup" data-help="osPatDup"><i class="led"></i>COPY ▶</button><button class="hwb" id="osPatClr" data-help="osPatClr"><i class="led"></i>CLEAR</button>');
 const ed=el('div',{id:'editGrp',class:'hwgrp'},'<span class="hwl">EDIT</span><div><button class="hwb" id="osUndo" data-help="osUndo"><i class="led"></i>UNDO</button><button class="hwb" id="osBack" data-help="osBack" title="Back to the last unit (`)"><i class="led"></i>◀ BACK</button></div>');
 bar.append($('trGrp'),pat,ed);
 dev.append(stage,bar);
 ['ctlL','ctlR'].forEach(id=>{const x=$(id);if(x)x.hidden=true});
 const gt=$('gToast');if(gt)document.body.append(gt);
 /* coach / explain layers */
 document.body.insertAdjacentHTML('beforeend','<div id="coach" hidden><div id="spot"></div><div id="ccard" role="dialog" aria-live="polite"><div class="cbar"><i id="cprog"></i></div><small id="cstep"></small><h3 id="ctitle"></h3><p id="ctext"></p><div class="cbtn"><button id="cprev">◀ Back</button><button id="cexit">Exit</button><button id="cnext" class="p">Next ▶</button></div></div><div id="ghost"><i></i></div></div><div id="xbub" hidden><b></b><p></p><small>Explain mode is on: buttons explain themselves instead of acting. Press ? or Esc to turn it off.</small></div>');
 /* status line mirror */
 const st=$('st');const mirror=()=>{$('osLine').textContent=st.textContent};new MutationObserver(mirror).observe(st,{childList:true,characterData:true,subtree:true});mirror();
 /* wiring */
 $('osSave').onclick=()=>{if(!ready()){say('Load a song first.');return}API().save();say('Setup saved: pads, kits, patterns and song order for '+fnameSafe()+'.')};
 $('osPatPrev').onclick=()=>patStep(-1);$('osPatNext').onclick=()=>patStep(1);
 $('osPatDup').onclick=()=>{if(!need())return;const t=API().dupPat();say(t<0?'All 8 patterns have hits. Clear one first.':'Copied into P'+(t+1)+' and switched to it. Change it to make a variation.')};
 $('osPatClr').onclick=()=>{if(!need())return;const P=API().pat();if(!API().pats()[P].hits){say('P'+(P+1)+' is already empty.');return}if(!confirm('Clear every hit in pattern P'+(P+1)+'? UNDO brings it back.'))return;API().clearPat();say('Cleared P'+(P+1)+'. Press UNDO to bring it back.')};
 $('osUndo').onclick=()=>{if(need())API().undo()};
 $('osBack').onclick=back;
 $('deckProg').onclick=()=>{const b=$('scrProg');if(b)b.click()};
 stage.addEventListener('click',e=>{const z=e.target.closest('.zb');if(!z)return;const u=z.closest('.unit');zoom(u,+z.dataset.z)});
 stage.addEventListener('dblclick',e=>{const p=e.target.closest('.plate');if(p&&!e.target.closest('button'))zoom(p.closest('.unit'),0)});
 $('osExplain').onclick=()=>explain(!document.body.classList.contains('explain'));
}
const fnameSafe=()=>{try{return fname}catch(e){return'this song'}};
function need(){if(!ready()){say('Load a song first: press LOAD on the meter bridge, or try the demo beat on the TAPE DECK.');return false}if(window.DBC)DBC.ensure();return true}

/* ================= zoom and focus ================= */
function zoomKey(u){return'bc16:zoom:'+document.body.dataset.pg+':'+u.id}
function zoom(u,d){if(!u)return;if(d===0){const on=!u.classList.contains('focus');$$('#stage .unit.focus').forEach(x=>x.classList.remove('focus'));u.classList.toggle('focus',on);document.getElementById('stage').classList.toggle('focusing',on);say(on?'Focused on '+u.querySelector('.pn').textContent+'. Press ⤢ again to bring the other units back.':'All units back on the stage.');return}
 let z=LSg(zoomKey(u),1);z=Math.round(Math.max(.6,Math.min(1.6,z+d*.1))*10)/10;LSs(zoomKey(u),z);applyZoom(u);say(u.querySelector('.pn').textContent+' zoom '+Math.round(z*100)+'%')}
function applyZoom(u){const z=LSg(zoomKey(u),1),b=u.querySelector(':scope > :not(.plate)')?u:null;u.style.setProperty('--uz',z);u.classList.toggle('zoomed',z!==1)}

/* ================= pages ================= */
let curP='start',hist=[];
function page(p,prev){curP=p;const U=UNITS[p]||UNITS.start;const g=GROUPS.find(x=>x.pages.includes(p))||GROUPS[0];
 if(prev&&prev!==p&&!backing){hist.push(prev);if(hist.length>30)hist.shift()}backing=false;
 LSs('bc16:last:'+g.id,p);
 const B=document.body;B.dataset.pg=p;B.dataset.grp=g.id;B.style.setProperty('--acc',U.c);B.style.setProperty('--acc2',U.c2);B.classList.toggle('deck',WITH_DECK.has(p));
 $$('#rail .rb[data-grp]').forEach(b=>b.classList.toggle('on',b.dataset.grp===g.id));
 $('unitName').textContent=U.n;$('unitModel').textContent=U.m;$('unitDesc').textContent=U.d;
 const tabs=$('subTabs');tabs.textContent='';if(g.pages.length>1)g.pages.forEach(q=>{const b=el('button',{class:'stab'+(q===p?' on':''),role:'tab'},'<i></i>'+UNITS[q].n);b.onclick=()=>go(q);tabs.append(b)});
 const sp=$('screenWrap').querySelector('.plate');sp.querySelector('.pn').textContent=U.n;sp.querySelector('.pm').textContent=U.m;
 $$('#stage .unit').forEach(u=>{u.classList.remove('focus');applyZoom(u)});$('stage').classList.remove('focusing');
 if(p==='kit')kitRender();if(p==='tower')towerRender();if(p==='launch')launchRender();if(p==='guide')guideRender();
 $('osBack').disabled=!hist.length;
 if(coach&&coach.mode==='tour')setTimeout(coachPlace,80)}
let backing=false;
function back(){const p=hist.pop();if(!p){say('Nothing to go back to yet.');return}backing=true;go(p)}

/* ================= pattern deck ================= */
function patStep(d){if(!need())return;const A=API(),q=A.queued(),c=q!=null?q:A.pat();A.selPat((c+d+8)%8);const n=(c+d+8)%8;say(A.playing()?'P'+(n+1)+' plays when the current pattern finishes. Press again to keep stepping.':'Now on pattern P'+(n+1)+'.')}
function patSync(){const A=API();if(!A||!ready()){$('patNum').textContent='P--';$('patInfo').textContent='NO SONG';return}
 let P,ps;try{P=A.pat();ps=A.pats()}catch(e){return}const q=A.queued(),info=ps[P];
 $('patNum').textContent='P'+String(P+1).padStart(2,'0')+(q!=null?' → P'+String(q+1).padStart(2,'0'):'');
 $('patInfo').textContent=info.bars+' BAR'+(info.bars>1?'S':'')+' · '+info.hits+' HITS'+(A.rec()?' · REC':'');
 $('patProg').firstChild.style.width=(A.playing()?A.pos()*100:0)+'%';$('patLcd').classList.toggle('q',q!=null);$('patLcd').classList.toggle('rec',A.rec());
 if(curP==='launch')launchSync(ps,P,q)}

/* ================= VU meter ================= */
let vuL=0,vuPk=0,vuPkT=0;
function vuDraw(){const c=$('vuC');if(!c)return;const x=c.getContext('2d'),W=c.width,H=c.height;let lv=[0,0];try{if(API())lv=API().level()}catch(e){}
 const db=20*Math.log10(Math.max(1e-5,lv[0]*1.414)),f=Math.max(0,Math.min(1,(db+30)/33));vuL+=(f-vuL)*(f>vuL?.35:.08);
 const pk=lv[1];if(pk>.97){vuPk=1;vuPkT=performance.now()}else if(performance.now()-vuPkT>900)vuPk=0;
 x.clearRect(0,0,W,H);const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f3e6c1');g.addColorStop(1,'#d8c79a');x.fillStyle=g;x.fillRect(0,0,W,H);
 const cx=W/2,cy=H*1.55,R=H*1.28;x.lineWidth=2;
 for(let i=0;i<=10;i++){const a=-Math.PI/2+(-0.62+1.24*i/10),red=i>=8;x.strokeStyle=red?'#c3262e':'#2a2620';const r0=R-(i%2?8:13);x.beginPath();x.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);x.stroke()}
 x.strokeStyle='#c3262e';x.lineWidth=4;x.beginPath();x.arc(cx,cy,R+2,-Math.PI/2+.62*.6,-Math.PI/2+.62);x.stroke();
 x.fillStyle='#2a2620';x.font='600 13px "Martian Mono",monospace';x.textAlign='center';x.fillText('VU',cx,H*.78);
 const a=-Math.PI/2-0.66+1.32*vuL;x.strokeStyle='#111';x.lineWidth=2.2;x.beginPath();x.moveTo(cx+Math.cos(a)*(R*.42),cy+Math.sin(a)*(R*.42));x.lineTo(cx+Math.cos(a)*(R+4),cy+Math.sin(a)*(R+4));x.stroke();
 $('vu').classList.toggle('pk',!!vuPk)}

/* ================= KIT FORGE ================= */
const KF={bank:0,armed:0,page:0,per:16,filt:'all',list:null,key:''};
function buildKit(){const u=el('section',{id:'osKit',class:'unit'});
 u.innerHTML='<div class="kfwrap"><div class="kfrack" id="kfRack">'+plate('KIT RACK','KR-16','kfRack')+
 '<div class="kfbody"><div class="kfbanks" id="kfBanks" data-help="kfBanks"></div><div class="kfslots" id="kfSlots" data-help="kfSlots"></div>'+
 '<div class="kfact"><button class="hwb" id="kfClr" data-help="kfClr"><i class="led"></i>CLEAR SLOT</button><button class="hwb" id="kfClrB" data-help="kfClrB"><i class="led"></i>CLEAR BANK</button><button class="hwb" id="kfPads" data-help="kfPads"><i class="led"></i>PLAY ON PADS ▶</button></div>'+
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
 $('kfClrB').onclick=()=>{if(!need())return;if(!confirm('Clear all 16 slots in kit bank '+BL[KF.bank]+'? UNDO brings them back.'))return;API().clearBank(KF.bank);KF.armed=0;kitRender()};
 $('kfPads').onclick=()=>{if(!need())return;API().setProg('kit');API().setBank(KF.bank);go('pads');say('The PAD MATRIX now plays kit bank '+BL[KF.bank]+' (KIT program).')};
 $('kfSv').onclick=()=>{if(!need())return;const n=$('kfName').value.trim()||('Kit '+BL[KF.bank]+' '+new Date().toLocaleDateString());if(!API().kit(KF.bank).some(Boolean)){say('Bank '+BL[KF.bank]+' is empty. Load some slots first.');return}API().saveKit(n,KF.bank);$('kfName').value='';kitRender();say('Saved “'+n+'”. Tap it under MY KITS to load it into any bank.')};
 $('kfList').onclick=e=>{const x=e.target.closest('.kdel'),b=e.target.closest('.kload');if(x){if(confirm('Delete the saved kit “'+x.dataset.n+'”?')){API().delKit(x.dataset.n);kitRender()}return}if(b){if(!need())return;API().loadKit(b.dataset.n,KF.bank);kitRender();say('Loaded “'+b.dataset.n+'” into bank '+BL[KF.bank]+'.')}};
 /* slots: tap = choose (and hear); the lit slot is where the next cut lands */
 holdable($('kfSlots'),'.ks',(t)=>{KF.armed=+t.dataset.j;API().hear({k:'kit',b:KF.bank,j:KF.armed});kitRender()},(t)=>{KF.armed=+t.dataset.j;kitRender();say('Slot '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+' is lit. Now hold a cut in the CUT LIBRARY.')});
 /* cuts: tap = hear, hold = drop into the lit slot, drag = drop on any slot */
 holdable($('kfCuts'),'.kc',(t)=>{API().hear({k:'slice',ci:+t.dataset.ci});$$('#kfCuts .kc.aud').forEach(x=>x.classList.remove('aud'));t.classList.add('aud')},(t)=>kitDrop(+t.dataset.ci,KF.armed),{drag:(t,slot)=>kitDrop(+t.dataset.ci,+slot.dataset.j),target:'#kfSlots .ks'});
}
function kitDrop(ci,j){if(!need())return;if(!API().put(ci,KF.bank,j))return;const s=API().slice(ci);const was=j;say('Cut '+s.name+' → slot '+BL[KF.bank]+String(j+1).padStart(2,'0')+'.'+(pickFrom?' Press ◀ BACK to return to the pads, or keep filling.':''));KF.armed=j;kitArmNext(false);kitRender();const sl=$('kfSlots').querySelector('[data-j="'+was+'"]');if(sl){sl.classList.add('land');setTimeout(()=>sl.classList.remove('land'),700)}}
function kitArmNext(fromStart){const K=API().kit(KF.bank);const order=[...Array(16).keys()];const start=fromStart?0:KF.armed+1;for(let k=0;k<16;k++){const j=(start+k)%16;if(!K[j]){KF.armed=j;return}}}
let pickFrom=null;
function pick(b,j){pickFrom={b,j};KF.bank=b;KF.armed=j;go('kit');say('Choosing a sound for pad '+BL[b]+String(j+1).padStart(2,'0')+'. Page through the CUT LIBRARY, tap to hear, hold the one you want.')}
function kitRender(){if(!ready()){$('kfSlots').innerHTML='<p class="empty">Load a song to forge kits from its cuts.</p>';$('kfCuts').textContent='';return}
 const A=API(),K=A.kit(KF.bank);
 $('kfBanks').innerHTML=BL.split('').map((L,b)=>{const n=A.kit(b).filter(Boolean).length;return'<button class="bkx'+(b===KF.bank?' on':'')+(n?' has':'')+'" data-b="'+b+'">'+L+'<small>'+n+'/16</small></button>'}).join('');
 $('kfSlots').innerHTML=[12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3].map(j=>{const p=K[j];return'<button class="ks'+(p?'':' emp')+(j===KF.armed?' arm':'')+'" data-j="'+j+'" style="--pc:'+(p?p.col:'#555')+'"><span class="kn">'+BL[KF.bank]+String(j+1).padStart(2,'0')+'</span><span class="knm">'+(p?esc(p.name):'EMPTY')+'</span></button>'}).join('');
 const L=kitList(),N=Math.max(1,Math.ceil(L.length/KF.per)),from=KF.page*KF.per,ids=L.slice(from,from+KF.per);
 $('kfLcd').querySelector('b').textContent=L.length?'CUTS '+(from+1)+'–'+Math.min(L.length,from+KF.per):'NO CUTS';$('kfLcd').querySelector('span').textContent='PAGE '+(KF.page+1)+'/'+N+' · '+L.length+' '+(KF.filt==='all'?'TOTAL':KF.filt.toUpperCase());
 $('kfPrev').disabled=$('kfFirst').disabled=KF.page<=0;$('kfNext').disabled=$('kfLast').disabled=KF.page>=N-1;
 $$('#kfFilt .chip').forEach(b=>b.classList.toggle('on',b.dataset.f===KF.filt));
 const bpm=+($('bpm')||{}).value||90;$('kfCuts').dataset.per=KF.per;
 $('kfCuts').innerHTML=ids.map(ci=>{const s=A.slice(ci),bt=s.dur*bpm/60;return'<button class="kc" data-ci="'+ci+'" style="--pc:'+s.col+'"><canvas width="120" height="40"></canvas><b>#'+(ci+1)+'</b><span>'+(s.kind||'cut').toUpperCase()+(s.tonal&&s.midi!=null?' · '+nn(Math.round(s.midi)):'')+'</span><em>'+(bt<1?bt.toFixed(2):bt.toFixed(1))+' BT</em></button>'}).join('')||'<p class="empty">No cuts match this filter.</p>';
 $$('#kfCuts .kc').forEach(c=>wave(c.querySelector('canvas'),A.slice(+c.dataset.ci)));
 const ks=A.kits();$('kfList').innerHTML=ks.length?ks.map(n=>'<span class="kchip"><button class="kload" data-n="'+esc(n)+'">'+esc(n)+'</button><button class="kdel" data-n="'+esc(n)+'" aria-label="Delete '+esc(n)+'">×</button></span>').join(''):'<em>No saved kits for this song yet. Build a bank, name it, press SAVE KIT.</em>';
 $('kfHint').textContent='Lit slot: '+BL[KF.bank]+String(KF.armed+1).padStart(2,'0')+'. Tap a cut to hear it. Hold it (½ s) or drag it onto a slot to drop it in. The next empty slot lights up by itself.'}
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
 '<div class="lcrow"><button class="hwb" id="lcPlay" data-help="lcPlay"><i class="led"></i>▶ PLAY / ■ STOP</button><button class="hwb" id="lcSong" data-help="lcSong"><i class="led"></i>+ ADD TO SONG</button><button class="hwb" id="lcPads" data-help="scrProg"><i class="led"></i>PADS: CHOP</button><span class="lchint">Tap a pattern to play it. While playing, it starts when the current one finishes (it blinks while it waits). Keys <kbd>F1</kbd>–<kbd>F8</kbd> or <kbd>Shift</kbd>+<kbd>1</kbd>–<kbd>8</kbd> launch too.</span></div></div>';
 return u}
function launchWire(){$('lcClips').onclick=e=>{const c=e.target.closest('.clip');if(!c||!need())return;launch(+c.dataset.i)};
 $('lcPlay').onclick=()=>{if(!need())return;(API().playing()?$('psStop'):$('psPlay')).click()};
 $('lcSong').onclick=()=>{if(!need())return;const b=$('psSongAdd');if(b){b.click();say('Added P'+(API().pat()+1)+' to the song order. See it on SONG → SONG ARRANGER.')}};
 $('lcPads').onclick=()=>{const b=$('scrProg');if(b)b.click()}}
function launch(i){const A=API();A.selPat(i);if(!A.playing()){$('psPlay').click();say('Playing P'+(i+1)+'.')}else say('P'+(i+1)+' is queued: it starts when the current pattern finishes.')}
function launchRender(){if(!ready()){$('lcClips').innerHTML='<p class="empty">Load a song to launch its patterns.</p>';return}const A=API();
 $('lcClips').innerHTML=A.pats().map(p=>'<button class="clip'+(p.hits?' has':'')+'" data-i="'+p.i+'"><b>P'+(p.i+1)+'</b><span>'+p.bars+' BAR'+(p.bars>1?'S':'')+' · '+p.hits+' HITS</span><canvas width="200" height="56"></canvas><i class="cbar"><u></u></i><kbd>F'+(p.i+1)+'</kbd></button>').join('');
 LC_SIG='';launchSync(A.pats(),A.pat(),A.queued())}
let LC_SIG='';
function launchSync(ps,P,q){const A=API(),sig=ps.map(p=>p.hits+'/'+p.bars).join(',');if(sig!==LC_SIG){LC_SIG=sig;$$('#lcClips .clip').forEach((c,i)=>{const p=ps[i];c.classList.toggle('has',!!p.hits);c.querySelector('span').textContent=p.bars+' BAR'+(p.bars>1?'S':'')+' · '+p.hits+' HITS';const cv=c.querySelector('canvas'),x=cv.getContext('2d');x.clearRect(0,0,200,56);
  p.ev.forEach(e=>{const r=e.pg==='chop'?(e.ci%16):e.p;x.fillStyle=getComputedStyle(document.body).getPropertyValue('--acc')||'#f35';x.globalAlpha=.85;x.fillRect(e.t/(p.bars*4)*196+2,2+r*3.3,3,3)})})}
 $$('#lcClips .clip').forEach((c,i)=>{const pl=A.playing()&&i===P;c.classList.toggle('play',pl);c.classList.toggle('q',q===i);c.classList.toggle('cur',!A.playing()&&i===P);c.querySelector('.cbar u').style.width=(pl?A.pos()*100:0)+'%'});
 const lp=$('lcPads');try{lp.lastChild.textContent='PADS: '+(A.prog()==='chop'?'CHOP':'KIT')}catch(e){}}

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
 osExplain:['EXPLAIN','Turns explain mode on and off. While it is on, pressing any control tells you what it does instead of doing it. Keyboard: ?','Rail'],
 /* meter bridge */
 hwLoad:['LOAD','Opens a song from your device (WAV, MP3, M4A, FLAC, OGG). You can also drop a file anywhere on the machine. Each song keeps its own pads, kits and patterns.','Meter bridge'],
 osSave:['SAVE','Saves this setup: pads, kit banks, patterns and song order, under the song’s name. It also saves by itself as you work.','Meter bridge'],
 vu:['OUTPUT VU','The analog meter shows the master output. The rim turns red when the signal peaks near clipping: turn MASTER down a little.','Meter bridge'],
 hwMasterIn:['MASTER','Master volume for everything the machine plays.','Meter bridge'],
 gRec:['TAKE REC','Records everything you hear, from any unit, into a take (audio). Press again to stop; takes appear on SONG → SONG ARRANGER for export.','Meter bridge'],
 /* transport */
 psRec:['REC','Arms recording into the current pattern. Then press PLAY (count-in on) and play pads or keys; every hit lands in the pattern.','Transport'],
 hwOvd:['OVERDUB','Starts playing and recording on top of what is already in the pattern.','Transport'],
 psStop:['STOP','Stops playback and recording.','Transport'],
 psPlay:['PLAY','Plays the current pattern on a loop (or the song order when song mode is on).','Transport'],
 hwPst:['PLAY START','Plays from the very start: pattern 1 or the first entry of the song order.','Transport'],
 psTap:['TAP TEMPO','Tap 4 times in time to set the tempo.','Transport'],
 osPatPrev:['PATTERN ◀','Steps back one pattern. While playing, the new pattern waits until the current one finishes. Keyboard: −','Transport'],
 osPatNext:['PATTERN ▶','Steps forward one pattern (P1–P8). While playing it queues. Keyboard: =','Transport'],
 patLcd:['PATTERN DISPLAY','Shows the pattern playing, the one queued (→), its length, number of hits and a progress line.','Transport'],
 psPats:['P1–P8','Jump straight to any of the 8 patterns. A lit button has hits in it. Keyboard: Z X C V B N M ,','Transport'],
 osPatDup:['COPY ▶','Copies the current pattern into the next empty one and jumps there, so you can build a variation without losing the original.','Transport'],
 osPatClr:['CLEAR','Removes every hit from the current pattern (asks first). UNDO brings it back.','Transport'],
 osUndo:['UNDO','Takes back the last change: a recording, a cleared pattern, a pad you loaded. Up to 50 steps.','Transport'],
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
const FLOW=[['start','Load'],['chop','Cut'],['kit','Build kits'],['pads','Play'],['sequence','Program'],['tower','Add keys'],['launch','Perform'],['song','Arrange + export']];
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
  {p:'sequence',s:'#osPatPrev',t:'Flip back and forth',x:'◀ ▶ (or − and = on the keyboard) step between patterns. While playing, the next one waits until the current one finishes, so it always lands on time.'},
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
 u.innerHTML=plate('STUDIO MANUAL','OS','osGuide')+'<div class="gbody"><div class="gcol"><div class="gstart"><h2>Start here</h2><p>The BC-16 is a rack of studio gear. The <b>rail</b> on the left switches units; the <b>meter bridge</b> on top and the <b>transport bar</b> on the bottom never change.</p><div class="gbtns"><button class="hwb big" id="gTour"><i class="led"></i>TAKE THE TOUR</button><button class="hwb big" id="gDemo"><i class="led"></i>▶ WATCH THE DEMO</button><button class="hwb big" id="gExp"><i class="led"></i>? EXPLAIN MODE</button></div></div>'+
 '<h3>Studio map: how the units link</h3><div class="gmap" id="gMap"></div><h3>Lessons</h3><ol class="glessons" id="gLessons"></ol></div>'+
 '<div class="gcol"><h3>Button book</h3><input id="gFind" placeholder="Find a button: record, pattern, kit, octave…" aria-label="Find a button"><div id="gBook"></div></div></div>';
 return u}
function guideRender(){
 $('gMap').innerHTML=FLOW.map(([p,v],i)=>'<button class="gnode" data-p="'+p+'" style="--c:'+UNITS[p].c+'"><b>'+UNITS[p].n+'</b><span>'+v+'</span></button>'+(i<FLOW.length-1?'<i class="garr">→</i>':'')).join('');
 $('gLessons').innerHTML=LESSONS.map(L=>'<li><button class="glesson" data-l="'+L.id+'"><b>'+L.t+'</b><span>'+L.d+'</span><em>'+L.steps.length+' steps'+(L.need?' · needs a song':'')+'</em></button></li>').join('');
 bookRender()}
function bookRender(){const q=($('gFind').value||'').toLowerCase().trim(),G={};
 for(const[k,[t,d,g]]of Object.entries(H)){if(q&&!(t+' '+d+' '+g).toLowerCase().includes(q))continue;(G[g]=G[g]||[]).push([k,t,d])}
 $('gBook').innerHTML=Object.entries(G).map(([g,a])=>'<section><h4>'+g+'</h4>'+a.map(([k,t,d])=>'<div class="bk1"><b>'+t+'</b><p>'+d+'</p><button class="show" data-k="'+k+'">SHOW ME</button></div>').join('')+'</section>').join('')||'<p class="empty">Nothing matches “'+esc(q)+'”.</p>'}
const SHOWP={'Meter bridge':'start',Transport:'start',Rail:'start','Pad matrix':'pads','Kit Forge':'kit','Key Tower':'tower','Launch Console':'launch'};
function guideWire(){$('gTour').onclick=()=>coachStart('tour');$('gDemo').onclick=demoStart;$('gExp').onclick=()=>{explain(true);go(hist[hist.length-1]||'start')};
 $('gMap').onclick=e=>{const n=e.target.closest('.gnode');if(n)go(n.dataset.p)};
 $('gLessons').onclick=e=>{const b=e.target.closest('.glesson');if(b)coachStart(b.dataset.l)};
 $('gFind').oninput=bookRender;
 $('gBook').onclick=e=>{const b=e.target.closest('.show');if(!b)return;const k=b.dataset.k,g=H[k][2];let sel=k.startsWith('rail-')?'#rail .rb[data-grp="'+k.slice(5)+'"]':'[data-help="'+k+'"],#'+k+',.knob[data-for="'+k+'"]';
  const p=SHOWP[g]||'start';if(p!=='start'&&p!=='guide'&&!ready()&&!/^(Meter|Transport|Rail)/.test(g)){say('Load a song first to see that unit.');return}
  coach={mode:'tour',L:{t:'Button book',steps:[{p:ready()||p==='start'?p:'start',s:sel,t:H[k][0],x:H[k][1]}]},i:0};document.body.classList.add('coach');$('coach').hidden=false;coachShow()}}

/* ----- coach: spotlight tours ----- */
let coach=null;
function coachStart(id){const L=LESSONS.find(x=>x.id===id);if(!L)return;if(L.need&&!ready()){coach={mode:'tour',L:{t:L.t,steps:[{p:'start',s:'#drop',t:'Load a song first',x:'This lesson uses a song. Press LOAD on the meter bridge or load the demo beat, wait for “Pads are ready”, then start the lesson again from GUIDE.'}]},i:0}}else coach={mode:'tour',L,i:0};
 document.body.classList.add('coach');$('coach').hidden=false;$('cnext').hidden=false;$('cprev').hidden=false;coachShow()}
function coachShow(){const S=coach.L.steps[coach.i];if(S.p&&curP!==S.p&&(ready()||S.p==='start'||S.p==='guide'))go(S.p);
 $('cstep').textContent=coach.L.t+' · step '+(coach.i+1)+' of '+coach.L.steps.length;$('ctitle').textContent=S.t;$('ctext').textContent=S.x;
 $('cprog').style.width=((coach.i+1)/coach.L.steps.length*100)+'%';$('cprev').disabled=coach.i===0;$('cnext').textContent=coach.i===coach.L.steps.length-1?'Done ✓':'Next ▶';
 setTimeout(coachPlace,60);setTimeout(coachPlace,400)}
function target(sel){if(sel&&typeof sel!=='string')return sel;let c0;try{c0=$$(sel)}catch(e){return null}const c=c0.filter(e=>e.offsetParent||e.getClientRects().length);return c[0]||null}
function coachPlace(){if(!coach)return;const S=coach.L.steps[coach.i]||coach.cur;if(!S)return;const t=S.s?target(S.s):null,sp=$('spot'),cd=$('ccard');
 if(t){t.scrollIntoView({block:'nearest',inline:'nearest'});const r=t.getBoundingClientRect(),pad=8;Object.assign(sp.style,{left:(r.left-pad)+'px',top:(r.top-pad)+'px',width:(r.width+pad*2)+'px',height:(r.height+pad*2)+'px',opacity:1})}
 else Object.assign(sp.style,{left:'50%',top:'45%',width:'0px',height:'0px',opacity:1});
 const cw=Math.min(380,innerWidth-24);cd.style.width=cw+'px';const ch=cd.offsetHeight||190;let x,y;
 if(t){const r=t.getBoundingClientRect();const roomR=innerWidth-r.right,roomL=r.left,roomB=innerHeight-r.bottom;
  if(roomB>ch+24){y=r.bottom+18;x=r.left+r.width/2-cw/2}else if(r.top>ch+24){y=r.top-ch-18;x=r.left+r.width/2-cw/2}else if(roomR>cw+24){x=r.right+18;y=r.top+r.height/2-ch/2}else if(roomL>cw+24){x=r.left-cw-18;y=r.top+r.height/2-ch/2}else{x=innerWidth/2-cw/2;y=innerHeight-ch-24}}
 else{x=innerWidth/2-cw/2;y=innerHeight/2-ch/2}
 cd.style.left=Math.max(12,Math.min(innerWidth-cw-12,x))+'px';cd.style.top=Math.max(12,Math.min(innerHeight-ch-12,y))+'px'}
function coachEnd(){if(coach&&coach.mode==='demo')demoStop();coach=null;document.body.classList.remove('coach');$('coach').hidden=true;$('ghost').classList.remove('on')}
function coachWire(){$('cnext').onclick=()=>{if(!coach)return;if(coach.mode==='demo'){demoPause();return}if(coach.i<coach.L.steps.length-1){coach.i++;coachShow()}else{const id=coach.L.id;coachEnd();LSs('bc16:done:'+id,1);say('Lesson done. Open GUIDE on the rail for the next one.')}};
 $('cprev').onclick=()=>{if(!coach)return;if(coach.mode==='demo'){coachEnd();return}if(coach.i>0){coach.i--;coachShow()}};$('cexit').onclick=coachEnd;
 addEventListener('resize',()=>{if(coach)coachPlace();if(curP==='tower'){TW.built='';towerRender()}});
 addEventListener('keydown',e=>{if(!coach)return;if(e.key==='Escape'){e.preventDefault();coachEnd()}else if(coach.mode==='tour'&&(e.key==='ArrowRight'||e.key==='Enter')){e.preventDefault();e.stopPropagation();$('cnext').click()}else if(coach.mode==='tour'&&e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();$('cprev').click()}},true)}

/* ----- the demo: a tour that drives the machine itself, with a ghost hand ----- */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let DEMO=null;
async function ghostTo(sel,click){const t=typeof sel==='string'?target(sel):sel,g=$('ghost');if(!t)return null;t.scrollIntoView({block:'nearest'});const r=t.getBoundingClientRect();g.classList.add('on');g.style.transform='translate('+(r.left+r.width/2)+'px,'+(r.top+r.height/2)+'px)';await sleep(reduced?150:650);if(click){g.classList.add('tap');setTimeout(()=>g.classList.remove('tap'),300)}return t}
async function demoStep(sel,title,text,act,wait){if(!DEMO||DEMO.stop)throw 0;while(DEMO.paused&&!DEMO.stop)await sleep(150);if(DEMO.stop)throw 0;
 coach.cur={s:sel,t:title,x:text};$('ctitle').textContent=title;$('ctext').textContent=text;DEMO.n++;$('cstep').textContent='Demo · '+DEMO.n+' of '+DEMO.total;$('cprog').style.width=(DEMO.n/DEMO.total*100)+'%';
 coachPlace();const t=await ghostTo(sel,!!act);coachPlace();if(act&&t)await act(t);await sleep(wait||2600);coachPlace()}
async function demoStart(){coach={mode:'demo',L:{t:'Demo',steps:[]},i:0};DEMO={n:0,total:18,paused:false,stop:false};document.body.classList.add('coach');$('coach').hidden=false;$('cnext').textContent='❚❚ Pause';$('cprev').textContent='■ Stop';$('cprev').disabled=false;
 const A=()=>API(),click=sel=>t=>{(typeof sel==='string'?target(sel):t).click()};
 try{
  if(!ready()){go('start');await demoStep('#demo','Loading the demo beat','The demo needs a song, so the demo beat is loading. Tempo, key and every hit are being found.',async t=>{const d=$('demo');if(d&&!d.hidden)d.click()},500);
   const t0=Date.now();while(!ready()&&Date.now()-t0<240000&&!DEMO.stop){await sleep(500)}await sleep(1500);if(!ready())throw 0}
  go('start');await demoStep('#rail','The rail','Every unit of the studio sits on this rail, in the order you make a beat. Watch: we go top to bottom.',null,2800);
  await demoStep('#oled','The song display','Name, tempo, key and how many cuts were found. Messages scroll on the last line.',null,2600);
  await demoStep('#rail .rb[data-grp="chop"]','SAMPLER','CHOP on the rail opens the sampler: the waveform with every cut.',click('#rail .rb[data-grp="chop"]'),2400);
  await demoStep('#padsSlot','Pads follow the cuts','A01 plays cut 1, A02 cut 2 … listen.',async()=>{for(let i=0;i<6;i++){A().hear({k:'slice',ci:i});const p=$$('#psGrid .pp')[[12,13,14,15,8,9][i]];if(p){p.classList.add('on');setTimeout(()=>p.classList.remove('on'),180)}await sleep(330)}},1200);
  await demoStep('#scrFoot .sk[data-cyc="maxl"]','LONGEST','This decides how long a cut can get. Bigger = loop-size chops. (We leave it as is.)',null,2600);
  await demoStep('#rail .rb[data-grp="kit"]','KIT FORGE','Now we build a kit by hand.',click('#rail .rb[data-grp="kit"]'),1800);
  let bank=0;for(let b=7;b>=0;b--){if(!A().kit(b).some(Boolean))bank=b}KF.bank=bank;KF.armed=0;kitRender();
  await demoStep('#kfSlots .ks[data-j="0"]','Light a slot','Tap a slot: it glows. That is where the next cut goes.',async t=>{KF.armed=0;kitRender()},1800);
  const ks=$$('#kfCuts .kc');const pickC=ks.find(c=>/KICK/.test(c.textContent))||ks[0];
  await demoStep(pickC,'Hear, then hold','Tap a cut to hear it; hold it for half a second to drop it in.',async t=>{A().hear({k:'slice',ci:+t.dataset.ci});await sleep(700);t.classList.add('held');await sleep(400);kitDrop(+t.dataset.ci,KF.armed);DEMO.put=(DEMO.put||0)+1},2000);
  const sn=$$('#kfCuts .kc').find(c=>/SNARE/.test(c.textContent));if(sn)await demoStep(sn,'Keep going','The next empty slot lit up by itself, so the next hold fills it.',async t=>{A().hear({k:'slice',ci:+t.dataset.ci});await sleep(600);kitDrop(+t.dataset.ci,KF.armed);DEMO.put++},2000);
  await demoStep('.kfsave','Save it','Name the kit and SAVE KIT. Saved kits load into any bank with one tap.',null,2400);
  await demoStep('#tbar','The transport bar','Always at the bottom: REC, PLAY, STOP, the pattern deck, UNDO and BACK.',null,2600);
  await demoStep('#osPatNext','Flip patterns','◀ ▶ step through P1–P8. COPY ▶ makes a variation in the next empty pattern.',null,2600);
  await demoStep('#rail .rb[data-grp="keys"]','KEY TOWER','Three stacked keyboards, each its own sound and octave.',click('#rail .rb[data-grp="keys"]'),1600);
  if(curP!=='tower')go('tower');await sleep(300);
  const tier=$$('#twTiers .tier')[1];if(tier)await demoStep(tier.querySelector('.twkb'),'Play a line','Glide or tap the keys. Scale lock keeps every note in the song’s key.',async()=>{const ins=$$('.twkb .tww.ins:not(.off),.twkb .twb.ins:not(.off)',tier).slice(2,9);for(const k of [0,2,4,3,1,2,0])if(ins[k]){tOn('demo',ins[k],.8);await sleep(260);tOff('demo')}},1200);
  await demoStep('#rail .rb[data-grp="live"]','LAUNCH CONSOLE','All 8 patterns on one console, pads beside them for playing live.',click('#rail .rb[data-grp="live"]'),2200);
  await demoStep('#osExplain','Stuck? Explain mode','Press ? and then any control: it tells you what it does. GUIDE has lessons for every unit.',null,3200);
  await demoStep('#rail .rb[data-grp="guide"]','That is the studio','Open GUIDE for the step-by-step lessons. The kit slots the demo filled can be taken back with UNDO.',click('#rail .rb[data-grp="guide"]'),2600);
 }catch(e){if(e)console.warn('demo stopped:',e)}
 coachEnd()}
function demoPause(){if(!DEMO)return;DEMO.paused=!DEMO.paused;$('cnext').textContent=DEMO.paused?'▶ Resume':'❚❚ Pause'}
function demoStop(){if(DEMO)DEMO.stop=true;tOff('demo');$('cprev').textContent='◀ Back';$('cnext').textContent='Next ▶';DEMO=null}

/* ================= first run ================= */
function welcome(){if(LSg('bc16:welcomed',0))return;const w=el('div',{id:'welcome',role:'dialog','aria-label':'Welcome'});
 w.innerHTML='<div class="wcard"><div class="plate"><i class="pled"></i><b class="pn">BC-16 STUDIO</b><span class="pm">FIRST POWER-ON</span><span class="vent"></span></div><div class="wbody"><h2>Welcome to the studio</h2><p>Every page is its own piece of gear. You move through them on the rail, left to right in this map:</p><div class="gmap">'+FLOW.map(([p,v],i)=>'<span class="gnode" style="--c:'+UNITS[p].c+'"><b>'+UNITS[p].n+'</b><span>'+v+'</span></span>'+(i<FLOW.length-1?'<i class="garr">→</i>':'')).join('')+'</div><p>Record, play, stop, patterns, undo and back are always on the bottom bar. Pick how you want to start:</p><div class="gbtns"><button class="hwb big" data-w="tour"><i class="led"></i>TAKE THE TOUR</button><button class="hwb big" data-w="demo"><i class="led"></i>▶ WATCH THE DEMO</button><button class="hwb big" data-w="skip"><i class="led"></i>JUST LET ME IN</button></div><small>You can come back to all of this any time from GUIDE on the rail.</small></div></div>';
 document.body.append(w);w.onclick=e=>{const b=e.target.closest('[data-w]');if(!b)return;LSs('bc16:welcomed',1);w.remove();if(b.dataset.w==='tour')coachStart('tour');else if(b.dataset.w==='demo')demoStart()}}

/* ================= keys ================= */
function keys(){addEventListener('keydown',e=>{const tg=e.target;if(/INPUT|SELECT|TEXTAREA/.test(tg.tagName)||e.metaKey||e.ctrlKey)return;
 if(e.altKey&&/^Digit\d$/.test(e.code)){const i=(+e.code.slice(5)+9)%10;const g=GROUPS[i];if(g){e.preventDefault();$('rail').querySelector('[data-grp="'+g.id+'"]').click()}return}
 if(e.altKey)return;
 if(e.key==='?'){e.preventDefault();explain(!document.body.classList.contains('explain'));return}
 if(e.key==='Escape'&&document.body.classList.contains('explain')){explain(false);return}
 if(e.key==='`'){e.preventDefault();back();return}
 if(curP==='tower')return;
 if(e.key==='-'||e.key==='='){e.preventDefault();patStep(e.key==='='?1:-1);return}
 if(curP==='launch'&&ready()){let i=-1;if(/^F[1-8]$/.test(e.key))i=+e.key.slice(1)-1;else if(e.shiftKey&&/^Digit[1-8]$/.test(e.code))i=+e.code.slice(5)-1;if(i>=0){e.preventDefault();e.stopPropagation();launch(i);return}}
 if(curP==='kit'&&(e.key==='PageUp'||e.key==='PageDown')){e.preventDefault();KF.pg(e.key==='PageDown'?1:-1)}},true)}

/* ================= boot ================= */
function init(){build();kitWire();towerWire();launchWire();explainWire();coachWire();guideWire();keys();
 for(const k of Object.keys(H)){const x=document.getElementById(k);if(x&&!x.dataset.help)x.dataset.help=k}
 const sp=$('seqSlot');if(sp)sp.dataset.help='psPats';
 window.OS={page,pick};
 page(window.curPage?curPage():'start');
 setInterval(()=>{patSync();const p=$('scrProg');if(p)$('deckProg').textContent=p.textContent;if(curP==='kit'&&ready()&&KF.key.split('|')[0]!==String(API().nSlices()))kitRender()},120);
 const loop=()=>{vuDraw();requestAnimationFrame(loop)};requestAnimationFrame(loop);
 let lastF='';setInterval(()=>{const f=fnameSafe();if(f!==lastF&&ready()){lastF=f;TW.key='';KF.list=null;if(curP==='kit')kitRender();if(curP==='tower'){TW.built='';towerRender()}if(curP==='launch')launchRender()}},800);
 setTimeout(welcome,600)}
init();
})();
