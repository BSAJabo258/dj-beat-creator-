/* BC-16 MACHINES — the studio as modules.
   Level 1: the STUDIO FLOOR (home). Every machine stands in its place with live status.
   Level 2: a machine fills the stage (its own chassis, layout and look).
   Level 3: the machine's own mode keys on its faceplate.
   Every machine follows the same contract: pages (its modes), look, status (for the floor), extra in-page modes.
   Machines never talk to each other: they read the shared services (DBC_OS: engine, pads, patterns, song, project)
   and the event bus below. This file adds; it never re-creates the engine's controls. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const OS=window.OS,A=()=>window.DBC_OS;
if(!OS||!OS.units){console.warn('machines: OS not ready');return}
const ready=()=>OS.ready(),say=OS.say,go=OS.go;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ================= event bus (shared service) ================= */
const bus=(()=>{const L={};return{on(e,f){(L[e]=L[e]||[]).push(f);return()=>{L[e]=L[e].filter(x=>x!==f)}},emit(e,d){(L[e]||[]).forEach(f=>{try{f(d)}catch(err){console.error(err)}})}}})();

/* ================= the machines ================= */
const tap=(sel,txt)=>()=>{const b=txt?$$(sel).find(x=>x.textContent.includes(txt)):document.querySelector(sel);if(b)b.click()};
const isOn=(sel,txt)=>()=>{const b=txt?$$(sel).find(x=>x.textContent.includes(txt)):document.querySelector(sel);return!!(b&&(b.classList.contains('on')||b.getAttribute('aria-pressed')==='true'))};
const M=[
 {id:'man',m:'OS',n:'STUDIO MANUAL',fl:'MANUAL',zone:'SHELF',look:'book',pages:[['guide','LESSONS']],free:1},
 {id:'td1',m:'TD-1',n:'TAPE DECK',zone:'SOURCE',look:'reel',pages:[['start','LOAD']],free:1},
 {id:'sb16',m:'SB-16',n:'SONG BUILDER',zone:'PRODUCTION',look:'screen',full:1,pages:[['build','BUILD'],['song','ORDER & EXPORT'],['arrange','AUTO PRODUCER']],deck:'PART PADS'},
 {id:'bb9',m:'BB-9',n:'BEAT BRAIN',zone:'PRODUCTION',look:'matrix',pages:[['brain','WRITE']]},
 {id:'pf1',m:'PF-1',n:'SOUND LIBRARY',fl:'LIBRARY',zone:'SOURCE',look:'carts',pages:[['factory','PACK FACTORY'],['store','PACK STORE']],free:1},
 {id:'cs1',m:'CS-1',n:'SAMPLER',zone:'SAMPLE',look:'crt',full:1,pages:[['chop','CHOP'],['slicer','ANALYSE'],['sounds','LIBRARY'],['parts','STEMS'],['groups','SORT']],deck:'CHOP KEYS'},
 {id:'pm16',m:'PM-16',n:'DRUM MACHINE',zone:'INSTRUMENTS',look:'pads',full:1,pages:[['pads','PADS']],
  modes:[{l:'PLAY',k:'play',act:tap('#psPadCard .mb','Play'),on:isOn('#psPadCard .mb','Play')},{l:'EDIT',k:'edit',act:tap('#psPadCard .mb','Edit'),on:isOn('#psPadCard .mb','Edit')},{l:'ARRANGE',k:'arr',act:tap('#psPadCard .mb','Arrange'),on:isOn('#psPadCard .mb','Arrange')},
   {sep:1},{l:'16 LEVELS',k:'lv',act:tap('#psKeys'),on:isOn('#psKeys')},{l:'NOTE REPEAT',k:'nr',act:tap('#nrB'),on:isOn('#nrB')},{sep:1},{l:()=>'PADS: '+((A()&&A().prog&&A().prog())==='kit'?'KIT':'CHOP'),k:'prog',act:tap('#scrProg'),on:()=>false}]},
 {id:'sq8',m:'SQ-8',n:'STEP SEQUENCER',zone:'INSTRUMENTS',look:'steps',pages:[['sequence','STEPS']]},
 {id:'lc8',m:'LC-8',n:'LAUNCH CONSOLE',zone:'PERFORM',look:'clips',pages:[['launch','CLIPS']]},
 {id:'pm1',m:'PM-1',n:'PROJECT ARCHIVE',fl:'ARCHIVE',zone:'FINISH',look:'tapes',pages:[['project','PROJECTS']],free:1},
 {id:'kf2',m:'KF-2',n:'KIT FORGE',zone:'INSTRUMENTS',look:'patch',pages:[['kit','BUILD']]},
 {id:'kt3',m:'KT-3',n:'KEYBOARD',zone:'INSTRUMENTS',look:'keys',pages:[['tower','THREE TIERS'],['keys','PIANO'],['live','LAYERS']]},
 {id:'dx2',m:'DX-2',n:'DJ MIXER',zone:'PERFORM',look:'dj',pages:[['dj','DECKS']]}];
const byPage={};M.forEach(m=>{m.c=(OS.units[m.pages[0][0]]||{}).c||'#29e3ff';m.c2=(OS.units[m.pages[0][0]]||{}).c2||'#7a5cff';m.pages.forEach(([p])=>byPage[p]=m)});
const mOf=p=>byPage[p]||null;

/* ================= LEVEL 1 · the studio floor ================= */
const FACE={
 book:()=>'<span class="fBook"><i></i><i></i><i></i></span>',
 reel:()=>'<span class="fReel"><i class="rl"></i><i class="tape"></i><i class="rl"></i><em class="ctr" data-f="ctr">0000</em></span><span class="fLoad"><button class="fb" data-act="load">LOAD A SONG</button><button class="fb" data-act="demo">DEMO BEAT</button><button class="fb rs" data-act="resume" hidden>▶ RESUME</button></span>',
 screen:()=>'<span class="fScreen"><span class="fParts" data-f="parts"></span><i class="ph" data-f="ph"></i></span>',
 matrix:()=>'<span class="fMatrix">'+'<i></i>'.repeat(40)+'</span>',
 carts:()=>'<span class="fCarts">'+'<i></i>'.repeat(10)+'</span>',
 crt:()=>'<span class="fCrt"><canvas width="260" height="70" data-f="wave"></canvas></span>',
 pads:()=>'<span class="fPads" data-f="pads">'+'<i></i>'.repeat(16)+'</span><span class="fQ"><i></i><i></i><i></i><i></i></span>',
 steps:()=>'<span class="fSteps" data-f="steps">'+'<i></i>'.repeat(16)+'</span><span class="fSteps lo">'+'<u></u>'.repeat(16)+'</span>',
 clips:()=>'<span class="fClips" data-f="clips">'+'<i></i>'.repeat(16)+'</span>',
 tapes:()=>'<span class="fTapes">'+'<i></i>'.repeat(7)+'</span><em class="fSaved" data-f="saved"></em>',
 patch:()=>'<span class="fPatch">'+'<i></i>'.repeat(16)+'<svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M8 8 C 30 40, 50 0, 72 30"/><path d="M28 30 C 40 0, 70 40, 92 10"/></svg></span>',
 keys:()=>'<span class="fKeys"><i></i><i></i><i></i></span>',
 dj:()=>'<span class="fDj"><i class="pl"></i><span class="xf"><u></u></span><i class="pl"></i></span>'};
function buildFloor(){
 const f=document.createElement('section');f.id='osFloor';f.className='unit';f.setAttribute('aria-label','Studio floor');
 f.innerHTML='<div class="flWall" aria-hidden="true"></div><div class="flDesk" aria-hidden="true"></div>'+
  M.map(m=>'<div class="gear g-'+m.id+(m.full?' big':'')+'" role="button" tabindex="0" data-m="'+m.id+'" style="--c:'+m.c+';--c2:'+m.c2+';grid-area:'+m.id+'" aria-label="'+m.n+' '+m.m+'">'+
   '<span class="gtop"><b class="gm">'+m.m+'</b><span class="gz">'+m.zone+'</span><i class="gled"></i></span>'+
   '<span class="gface">'+(FACE[m.look]||(()=>''))()+'</span>'+
   '<span class="gname">'+(m.fl||m.n)+'</span><span class="gstat" data-f="stat"></span></div>').join('')+
  '<div class="flHint" id="flHint"></div>';
 $('stage').append(f);
 f.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){e.stopPropagation();if(b.dataset.act==='load'){const i=$('f');if(i)i.click()}else if(b.dataset.act==='resume'){const r=$('resumeGo');if(r){say('Reopening your last song…');r.click()}}else{say('Loading the demo beat onto the tape deck…');const d=$('demo');if(d)d.click()}return}
  const g=e.target.closest('.gear');if(g)open(g.dataset.m,g)});
 f.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('gear')){e.preventDefault();open(e.target.dataset.m,e.target)}});
}
let floorSig='';
function floorUpdate(){if(document.body.dataset.pg!=='floor')return;const on=ready(),api=A();let pm=null,song=null,pat=0,playing=false,prog='chop',dirty=0;
 if(on&&api){try{pm=api.patMeta();song=api.song();pat=api.pat();playing=api.playing();prog=api.prog();dirty=api.dirtyN?api.dirtyN():0}catch(e){}}
 const set=(id,t)=>{const g=document.querySelector('.gear[data-m="'+id+'"] [data-f="stat"]');if(g&&g.textContent!==t)g.textContent=t};
 document.body.classList.toggle('flOn',on);document.body.classList.toggle('flPlay',playing);
 $$('#osFloor .gear').forEach(g=>{const m=M.find(x=>x.id===g.dataset.m);g.classList.toggle('lock',!on&&!m.free)});
 let fn='';try{fn=fname}catch(e){}
 const bpm=(()=>{try{return Math.round(+$('bpm').value)}catch(e){return 0}})(),key=(()=>{try{return DBC.keyText()}catch(e){return''}})();
 set('td1',on?fn.replace(/_/g,' ')+(bpm?' · '+bpm+' BPM':''):'NO TAPE · insert a song');
 {const rb=document.querySelector('#osFloor [data-act="resume"]'),card=$('resumeCard');if(rb){rb.hidden=on||!card;if(card){const nm=card.querySelector('b');rb.title=nm?'Resume '+nm.textContent:'Resume'}}}
 if(!on){['cs1','pm16','sq8','kt3','kf2','lc8','dx2','sb16','bb9'].forEach(id=>set(id,'needs a song'));set('pf1','packs and plans');set('pm1','saved songs');set('man','lessons · tour');setHint();return}
 const n=api.nSlices(),used=pm.filter(p=>p.hits).length,P=pm[pat]||{hits:0,bars:2};
 set('cs1',n+' cuts · '+(key||'key ?'));
 set('pm16','P'+String(pat+1).padStart(2,'0')+' · '+P.hits+' hits · '+(prog==='kit'?'KIT':'CHOP')+' program');
 set('sq8',P.bars+' bars · '+used+' of '+pm.length+' patterns used');
 set('kt3',key?key+' · 3 tiers':'3 tiers');set('kf2','8 banks · your kits');set('lc8',used+' clips ready');set('dx2','cues · loops · kills');
 set('sb16',song.list.length?song.list.length+' parts · '+(song.mode?'song mode':'pattern mode'):'no parts yet');set('bb9','presets · write a part');
 set('pf1','packs and plans');set('pm1',dirty?'unsaved changes':'all saved');set('man','lessons · tour');
 /* live faces */
 const sig=pat+'|'+pm.map(p=>p.hits).join(',')+'|'+song.list.join(',')+'|'+n+'|'+prog;
 if(sig!==floorSig){floorSig=sig;
  const pads=$$('#osFloor [data-f="pads"] i');let kit=[];try{kit=api.kit(api.bank())}catch(e){}pads.forEach((x,i)=>{const p=kit[[12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3][i]];x.style.background=p&&p.col?p.col:'';x.classList.toggle('on',!!(p||prog==='chop'))});
  const steps=$$('#osFloor [data-f="steps"] i');steps.forEach((x,i)=>x.classList.toggle('on',P.hits>0&&((i*7+P.hits)%3===0||i%4===0)));
  const clips=$$('#osFloor [data-f="clips"] i');clips.forEach((x,i)=>x.classList.toggle('on',!!(pm[i]&&pm[i].hits)));
  const parts=$('osFloor').querySelector('[data-f="parts"]');if(parts)parts.innerHTML=song.list.slice(0,16).map(i=>{const nm=(pm[i]&&pm[i].name)||'';const s=(nm.match(/intro|verse|hook|bridge|outro/i)||[''])[0].toLowerCase();return'<i class="s-'+(s||'x')+'" style="flex:'+((pm[i]&&pm[i].bars)||2)+'"><b>'+esc((nm||'P'+(i+1)).slice(0,6))+'</b></i>'}).join('')||'<em>empty arrangement</em>';
  drawWave()}
 const ctr=$('osFloor').querySelector('[data-f="ctr"]');if(ctr)ctr.textContent=String(Math.round((performance.now()/1000)%10000)).padStart(4,'0');
 const ph=$('osFloor').querySelector('[data-f="ph"]');if(ph)ph.style.left=(playing?Math.round(api.pos()*100):0)+'%';
 const sv=$('osFloor').querySelector('[data-f="saved"]');if(sv){sv.textContent=dirty?'● UNSAVED':'● SAVED';sv.classList.toggle('dirty',!!dirty)}
 setHint()}
function setHint(){const h=$('flHint');if(!h)return;const t=ready()?'Tap a machine to walk up to it. HOME or Esc brings you back here.':'Start at the TAPE DECK: load a song or the demo beat. Every machine lights up after that.';if(h.textContent!==t)h.textContent=t}
function drawWave(){const cv=$('osFloor').querySelector('[data-f="wave"]');if(!cv)return;const c=cv.getContext('2d'),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);let d=null,sl=[];try{d=y;sl=slices}catch(e){}if(!d||!d.length)return;
 c.strokeStyle='#5dff9e';c.globalAlpha=.9;c.beginPath();const st=Math.max(1,Math.floor(d.length/W));for(let x=0;x<W;x++){let mx=0;const o=x*st;for(let i=0;i<st;i+=Math.max(1,st>>4)){const v=Math.abs(d[o+i]||0);if(v>mx)mx=v}const h=mx*H*.46;c.moveTo(x+.5,H/2-h);c.lineTo(x+.5,H/2+h)}c.stroke();
 c.globalAlpha=.35;c.strokeStyle='#d7ffe6';c.beginPath();const k=Math.max(1,Math.floor(sl.length/60));for(let i=0;i<sl.length;i+=k){const x=Math.round(sl[i].s/d.length*W)+.5;c.moveTo(x,0);c.lineTo(x,H)}c.stroke();c.globalAlpha=1}

/* ================= transitions ================= */
let lastGear=null;
function open(id,from){const m=M.find(x=>x.id===id);if(!m)return;
 if(!m.free&&!ready()){say('The '+m.n+' needs a song. Load one on the TAPE DECK (or try the demo beat) and every machine lights up.');const td=document.querySelector('.gear[data-m="td1"]');if(td){td.classList.remove('nudge');void td.offsetWidth;td.classList.add('nudge')}return}
 lastGear=id;const last=OS.lastOf?OS.lastOf(m):null;const p=last&&m.pages.some(x=>x[0]===last)?last:m.pages[0][0];
 const r=from&&from.getBoundingClientRect();go(p);
 if(r&&!reduced){const st=$('stage'),S=st.getBoundingClientRect();if(!S.width)return;
  st.animate([{transformOrigin:'0 0',transform:'translate('+(r.left-S.left)+'px,'+(r.top-S.top)+'px) scale('+(r.width/S.width)+','+(r.height/S.height)+')',opacity:.25,filter:'brightness(1.6)'},{transformOrigin:'0 0',transform:'none',opacity:1,filter:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}
 else if(!reduced)$('stage').animate([{opacity:0},{opacity:1}],{duration:200})}
function home(){if(document.body.dataset.pg==='floor')return;const from=mOf(document.body.dataset.pg);go('floor');
 const st=$('stage');if(reduced){return}
 const g=from&&document.querySelector('.gear[data-m="'+from.id+'"]');
 if(g){const S=st.getBoundingClientRect(),r=g.getBoundingClientRect();const ox=r.left-S.left+r.width/2,oy=r.top-S.top+r.height/2;
  st.animate([{transformOrigin:ox+'px '+oy+'px',transform:'scale(2.4)',opacity:.2},{transformOrigin:ox+'px '+oy+'px',transform:'none',opacity:1}],{duration:440,easing:'cubic-bezier(.2,.8,.2,1)'});g.classList.remove('back');void g.offsetWidth;g.classList.add('back')}
 else st.animate([{opacity:0},{opacity:1}],{duration:200})}

/* ================= LEVEL 2 + 3 · the machine faceplate ================= */
function buildFace(){
 const sb=$('subBar');const k=document.createElement('div');k.id='machKeys';k.setAttribute('role','toolbar');k.setAttribute('aria-label','Machine modes');
 $('unitTag').after(k);
 k.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;const m=mOf(document.body.dataset.pg);if(!m)return;
  if(b.dataset.p){go(b.dataset.p);return}const md=(m.modes||[]).find(x=>x.k===b.dataset.k);if(md&&OS.need()){md.act();setTimeout(keysSync,60)}});
 /* HOME on the rail */
 const rail=$('rail'),hb=document.createElement('button');hb.className='rb';hb.id='osHome';hb.dataset.help='osHome';hb.title='Studio floor (Home key or Esc)';
 hb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-5h6v5"/></svg><span>STUDIO</span><i class="rled"></i>';
 const br=rail.querySelector('.brand');(br?br:rail.firstChild).after(hb);hb.onclick=home;
}
let keysFor='';
function keysRender(){const p=document.body.dataset.pg,m=mOf(p),k=$('machKeys');if(!k)return;
 const was=document.body.dataset.mach;document.body.dataset.mach=m?m.id:(p==='floor'?'floor':'');if(was!==document.body.dataset.mach)requestAnimationFrame(()=>dispatchEvent(new Event('resize')));document.body.classList.toggle('full',!!(m&&m.full));
 const sig=(m?m.id:'-')+'|'+p;if(sig===keysFor){keysSync();return}keysFor=sig;
 if(!m){k.innerHTML='';return}
 let h='';if(m.pages.length>1)h+=m.pages.map(([q,l])=>'<button class="mk'+(q===p?' on':'')+'" data-k="p:'+q+'" data-p="'+q+'"><i></i>'+l+'</button>').join('');
 if(m.modes){if(h)h+='<span class="mksep"></span>';h+=m.modes.map(x=>x.sep?'<span class="mksep"></span>':'<button class="mk" data-k="'+x.k+'"><i></i><span>'+(typeof x.l==='function'?x.l():x.l)+'</span></button>').join('')}
 k.innerHTML=h;keysSync();
 const dp=document.querySelector('#deck > .plate .pn');if(dp)dp.textContent=m.deck||'PAD MATRIX'}
function keysSync(){const m=mOf(document.body.dataset.pg);if(!m||!m.modes)return;m.modes.forEach(x=>{if(x.sep)return;const b=document.querySelector('#machKeys [data-k="'+x.k+'"]');if(!b)return;b.classList.toggle('on',!!x.on());if(typeof x.l==='function'){const s=b.querySelector('span'),t=x.l();if(s.textContent!==t)s.textContent=t}})}

/* ================= wiring ================= */
const op=OS.page;
OS.page=function(p,prev){op(p,prev);keysRender();if(p==='floor'){floorSig='';floorUpdate()}bus.emit('machine.open',{page:p,prev,machine:mOf(p)})};
function poll(){const api=A();if(!api||!ready())return;let v='';try{v=api.ver()+'|'+api.pat()+'|'+api.song().list.length}catch(e){return}if(v!==poll.v){const was=poll.v;poll.v=v;if(was)bus.emit('project.changed',{ver:v})}}
/* PM-16 side column: Q-links, pad functions and data. display:contents everywhere else, so other machines keep their order */
(()=>{const d=$('deck');if(!d)return;const side=document.createElement('div');side.id='deckSide';['knobGrp','fnGrp','dataGrp'].forEach(id=>{const x=$(id);if(x)side.append(x)});d.append(side)})();
buildFloor();buildFace();keysRender();
/* canvases drawn while their machine was hidden get redrawn at their real size */
let rzT=0;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{['c1','c2','c4'].forEach(id=>{const c=$(id);if(c&&c._a&&c.clientWidth&&typeof draw==='function'){try{draw(c,...c._a)}catch(e){}}})},60)});
bus.on('project.changed',()=>{floorSig=''});
setInterval(()=>{poll();floorUpdate();keysSync()},250);
addEventListener('keydown',e=>{if(e.key==='Home'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();home()}});
window.BC16={bus,machines:M,machineOf:mOf,open,home};
})();
