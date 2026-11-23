/* Pad Studio, DJ engine, Beat Brain, connections. Loaded after engine.js. */

/* ================= PAD STUDIO ================= */
(()=>{
"use strict";
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const PK='asdfghjkqwertyui',BK='12345678',PTK='zxcvbnm,',BL='ABCDEFGH';
const COLS=['#e03131','#f76707','#f59f00','#2f9e44','#12b886','#1c7ed6','#4c6ef5','#ae3ec9','#d6336c','#868e96'];
const RC={kick:'#e03131',snare:'#4c6ef5',hat:'#f59f00',open:'#fab005',perc:'#ae3ec9',stab:'#12b886',tone:'#12b886',chain:'#1c7ed6',loop:'#2f9e44',group:'#d6336c',long:'#868e96'};
const KIND2ROLE={kick:'kick',snare:'snare',hat:'hat',tone:'tone'};
const emptyBank=()=>Array(16).fill(null),NPAT=16,AUTOK=['flt','pump','sw'];
const PS={banks:Array.from({length:8},emptyBank),bank:0,pats:Array.from({length:NPAT},()=>({bars:2,ev:[]})),pat:0,follow:true,song:[],songMode:false,
 bpm:90,swing:0,q:.25,metro:true,countIn:true,mode:'play',keys:false,kp:null,chord:false,root:9,scale:'min',oct:0,sel:null,lastHit:null,swapSrc:null,
 armed:[],chain:false,layout:'g44',vel:false,srcs:{},cur:null,main:null,binF:'all',undo:[],init:false};
const TR={playing:false,rec:false,t0:0,seg:null,segId:0,sched:0,timer:null,next:null,songPos:0,vs:[],recSnap:false,segChanged:false};
const CK=new Map(),held=new Map(),act=new Map(),LATCH=new Map();
let OUT=null,padEl=[],saveT=null,raf=0,pdrag=null,bdrag=null,ghost=null,suppress=false,taps=[],aud=null,seqDirty=false,edSnap=false,builtLay='';
const CW=18,RH=20,LW=86;
const bd=()=>60/PS.bpm,patLen=i=>PS.pats[i].bars*4,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const songBpm=()=>+$('bpm').value||PS.bpm;
const msg=t=>{$('psHint').textContent=t||''};
const LS={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const tick0=()=>new Promise(r=>setTimeout(r,20));
const REC={ch:[],print:false,pr:[]},ALLV=new Set(),DRUMR=new Set(['kick','snare','hat','open','perc']);let FX=null;
function outN(){if(OUT)return OUT;const A=ac,bq=(t,f,q)=>{const x=A.createBiquadFilter();x.type=t;x.frequency.value=f;if(q)x.Q.value=q;return x};
 const o=A.createGain();o.gain.value=.85;const hp=bq('highpass',10,.9),lp=bq('lowpass',22000,.9),lo=bq('lowshelf',220),mi=bq('peaking',1100,.7),hi=bq('highshelf',4500);
 const dry=A.createGain(),duck=A.createGain(),c=A.createDynamicsCompressor();c.threshold.value=-8;c.ratio.value=4;c.attack.value=.003;c.release.value=.15;
 o.connect(hp);hp.connect(lp);lp.connect(lo);lo.connect(mi);mi.connect(hi);hi.connect(dry);dry.connect(duck);duck.connect(c);c.connect(A.destination);
 const snd=A.createGain();snd.gain.value=0;const dl=A.createDelay(4),fb=A.createGain(),dlf=bq('bandpass',1400,.5);fb.gain.value=.5;hi.connect(snd);snd.connect(dl);dl.connect(dlf);dlf.connect(fb);fb.connect(dl);dlf.connect(c);
 const rg=A.createGain();rg.connect(c);const drum=A.createGain(),mus=A.createGain(),pump=A.createGain();drum.connect(o);mus.connect(pump);pump.connect(o);
 FX={o,hp,lp,lo,mi,hi,dry,duck,c,snd,dl,fb,rg,drum,mus,pump};OUT=o;return o}
function busFor(p){outN();return p&&DRUMR.has(p.role)?FX.drum:FX.mus}
function srcBuf(name){const S=PS.srcs[name];if(!S||!S.chs)return null;if(S._ab&&S._ab.length===S.len)return S._ab;const b=ac.createBuffer(S.chs.length,S.len,sr);S.chs.forEach((d,c)=>b.copyToChannel(d,c));S._ab=b;return b}
function resume(){if(ac&&ac.state==='suspended')ac.resume()}
const deep=o=>JSON.parse(JSON.stringify(o));

/* ---------- sources ---------- */
function regMain(){if(typeof chs==='undefined'||!chs||!chs.length)return;const nm=fname||'song';
 for(const k in PS.srcs)if(k!==nm)PS.srcs[k].main=false;
 const S=PS.srcs[nm]||(PS.srcs[nm]={});S.chs=chs;S.len=chs[0].length;S.main=true;S.slRef=slices;
 sweet();S.sl=slices.map((x,i)=>({src:nm,s:x.s,e:x.e,kind:x.kind||'',i,midi:x.clar>.6&&x.midi!==undefined?x.midi:undefined,sw:x._sw||0,star:!!x._star}));
 if(PS.main!==nm){const prev=PS.main;if(prev&&PS.init){try{LS.set('bcrps:auto:'+prev,ser())}catch(e){}}PS.main=nm;PS.cur=nm;if(prev)songSwitch(nm)}if(!PS.cur||!PS.srcs[PS.cur]||!PS.srcs[PS.cur].chs)PS.cur=nm}
function songSwitch(nm){try{stopT()}catch(e){}LATCH.clear();PS.banks=Array.from({length:8},emptyBank);PS.pats=Array.from({length:NPAT},()=>({bars:2,ev:[]}));PS.song=[];PS.songMode=false;PS.undo=[];PS.sel=null;PS.kp=null;PS.keys=false;PS.armed=[];PS.pat=0;PS.bank=0;PS.keySet=false;PS.prog='chop';PS.cpage=0;CHOPB=null;
 const a=LS.get('bcrps:auto:'+nm);if(a&&Array.isArray(a.banks)){try{applyProj(a,{noChop:true});PS.undo=[];autoDoneFor=nm}catch(e){}}
 if(PS.init){try{syncCtl();renderAll()}catch(e){}}}
function mainFresh(){const S=PS.srcs[PS.main];if(!S||S.slRef!==slices||PS.main!==fname)regMain()}
const isMainCur=()=>PS.cur===PS.main&&PS.srcs[PS.cur]&&PS.srcs[PS.cur].slRef===slices;


/* ================= PROGRAMS: CHOP (pads follow your cuts) and KIT =================
   CHOP is the MPC "chop to program": slice 1 on A01, slice 16 on A16, slice 17 on B01 …
   128 slices per page; the pads re-follow every time the cuts change.
   KIT is the hand-built / smart program (PS.banks). Sequence events from the CHOP program
   remember the slice number (ci), so a recorded beat keeps its sounds after a re-chop. */
PS.prog='chop';PS.cpage=0;
let CHOPP=new Map(),CHOPREF=null,CHOPB=null,CHOPBK='';
const KCOL={kick:'#e03131',snare:'#4c6ef5',hat:'#f59f00',tone:'#12b886'};
function chopPad(ci){if(CHOPREF!==slices){CHOPP=new Map();CHOPREF=slices;CHOPB=null}if(CHOPP.has(ci))return CHOPP.get(ci);const s=slices[ci];if(!s||!PS.main)return null;
 const p=mkPad(PS.main,[[s.s,s.e]],'#'+(ci+1)+(s.kind?' '+s.kind.toUpperCase():''),KIND2ROLE[s.kind]||'',{midi:s.clar>.6?s.midi:undefined,col:KCOL[s.kind]||'#7d8b98',ci,chop:true,choke:s.kind==='hat'?1:0});CHOPP.set(ci,p);return p}
function chopBanks(){mainFresh();if(CHOPREF!==slices){CHOPP=new Map();CHOPREF=slices;CHOPB=null}const key=PS.cpage+'|'+slices.length;if(CHOPB&&CHOPBK===key)return CHOPB;
 CHOPB=Array.from({length:8},(_,b)=>Array.from({length:16},(_,j)=>chopPad(PS.cpage*128+b*16+j)));CHOPBK=key;return CHOPB}
const AB=()=>PS.prog==='chop'&&PS.main&&typeof slices!=='undefined'&&slices.length?chopBanks():PS.banks;
const ciOf=(b,j)=>PS.cpage*128+b*16+j;
function padOfEv(ev){return ev.pg==='chop'?chopPad(ev.ci):(PS.banks[ev.b]&&PS.banks[ev.b][ev.p])}
const evKey=ev=>ev.pg==='chop'?'c'+ev.ci:ev.b+':'+ev.p;
const keyOf=(b,j)=>PS.prog==='chop'?'c'+ciOf(b,j):b+':'+j;
function evRow(ev){if(PS.prog==='chop'){if(ev.pg!=='chop')return-1;const r=ev.ci-PS.cpage*128-PS.bank*16;return r>=0&&r<16?r:-1}return!ev.pg&&ev.b===PS.bank?ev.p:-1}
function setProg(pg,quiet){if(pg===PS.prog)return;PS.prog=pg;PS.sel=null;PS.swapSrc=null;PS.keys=false;PS.kp=null;if(pg==='chop'&&PS.mode!=='play')PS.mode='play';
 try{renderAll()}catch(e){}if(!quiet)msg(pg==='chop'?'CHOP program: the pads play your slices in order and follow every change to the cuts. Slices '+(PS.cpage*128+1)+'–'+(PS.cpage*128+128)+' are on banks A–H.':'KIT program: your smart kits and hand-built pads. Edit, Arrange and hold-to-fill work here.')}
function chopPage(d){const n=Math.max(1,Math.ceil(slices.length/128));PS.cpage=clamp(PS.cpage+d,0,n-1);CHOPB=null;try{renderAll()}catch(e){}msg('Slices '+(PS.cpage*128+1)+'–'+Math.min(slices.length,PS.cpage*128+128)+' are on banks A–H (page '+(PS.cpage+1)+' of '+n+').')}

/* ---------- pad buffers ---------- */
const PBUF=new Map();
const pbKey=p=>p.src+'|'+p.seg.map(a=>a[0]+'-'+a[1]).join(',')+'|'+(p.rev?1:0)+'|'+(p.ts||0)+'|'+(p.te||0);
function padBuf(p){if(!p)return null;const S=PS.srcs[p.src];if(!S||!S.chs)return null;const k=pbKey(p);let b=PBUF.get(k);if(b)return b;
 const nc=S.chs.length,f=Math.floor(.003*sr);let tot=0;for(const[s,e]of p.seg)tot+=Math.max(0,e-s);if(tot<160)return null;
 const a=clamp(Math.round((p.ts||0)/1000*sr),0,tot-128),z=clamp(Math.round((p.te||0)/1000*sr),0,tot-a-128),n=tot-a-z;
 b=ac.createBuffer(nc,n,sr);
 for(let c=0;c<nc;c++){const o=new Float32Array(tot);let pos=0;
  for(const[s,e]of p.seg){const x=S.chs[c].slice(s,e),g=Math.min(f,x.length>>1);if(p.seg.length>1)for(let j=0;j<g;j++){x[j]*=j/g;x[x.length-1-j]*=j/g}o.set(x,pos);pos+=x.length}
  const r=o.slice(a,a+n),g=Math.min(p.mode==='loop'||p.mode==='latch'?Math.floor(.0015*sr):f,n>>1);for(let j=0;j<g;j++){r[j]*=j/g;r[n-1-j]*=j/g}if(p.rev)r.reverse();b.copyToChannel(r,c)}
 if(PBUF.size>400)PBUF.clear();PBUF.set(k,b);return b}
const padBeats=p=>{const b=padBuf(p);return b?b.duration/(60/songBpm()):0};
function peaks(b,n){if(b._pk&&b._pk.length===n)return b._pk;const d=b.getChannelData(0),st=d.length/n,o=new Float32Array(n);
 for(let i=0;i<n;i++){let m=0;const a=Math.floor(i*st),e=Math.min(d.length,Math.floor((i+1)*st));for(let k=a;k<e;k+=Math.max(1,(e-a)>>5))m=Math.max(m,Math.abs(d[k]));o[i]=m}b._pk=o;return o}
function wave(cv,b,col){const r=Math.min(2,devicePixelRatio||1),w=cv.clientWidth||100,h=cv.clientHeight||60;cv.width=w*r;cv.height=h*r;const g=cv.getContext('2d');g.setTransform(r,0,0,r,0,0);g.clearRect(0,0,w,h);if(!b)return;
 const p=peaks(b,Math.max(10,Math.floor(w)));let mx=0;for(const v of p)mx=Math.max(mx,v);mx=mx||1;g.fillStyle=col;for(let x=0;x<p.length;x++){const hh=p[x]/mx*h*.42;g.fillRect(x,h/2-hh,1,Math.max(1,hh*2))}}

/* ---------- voices ---------- */
function rateOf(p,st){let r=Math.pow(2,((p.tune||0)+(st||0))/12);if(p.sync&&p.bpm)r*=PS.bpm/p.bpm;return r}
function voice(ctx,dest,p,when,vel,st,dur,ck){const cue=p.mode==='cue',b=cue?srcBuf(p.src):padBuf(p);if(!b)return null;const off=cue?Math.min(b.duration-.05,p.seg[0][0]/sr):0;const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=b;src.playbackRate.value=rateOf(p,st);
 const looping=p.mode==='loop'||p.mode==='latch';if(looping)src.loop=true;
 const lv=(p.gain??1)*Math.pow(clamp(vel,0,1),1.2),att=Math.max(.003,(p.att||0)/1000);g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(lv,when+att);
 let head=src;if(p.flt){const f=ctx.createBiquadFilter(),x=p.flt/100;f.type=x<0?'lowpass':'highpass';f.frequency.value=x<0?20000*Math.pow(150/20000,-x):20*Math.pow(4000/20,x);f.Q.value=.9;src.connect(f);head=f}head.connect(g);
 let last=g;if(ctx.createStereoPanner&&p.pan){const pn=ctx.createStereoPanner();pn.pan.value=p.pan;g.connect(pn);last=pn}last.connect(dest);src.start(when,off);
 const v={src,g,ctx,when,rel:(p.rel||0)/1000,end:when+(looping?1e9:(b.duration-off)/src.playbackRate.value)};if(ck&&p.mono){const o=ck.get(p);if(o&&o!==v)vStop(o,when,.01);ck.set(p,v)}if(ctx===ac&&FX&&p.role==='kick'&&dest===FX.drum)duck(FX.pump.gain,when);if(ctx===ac){ALLV.add(v);src.onended=()=>ALLV.delete(v)}
 if(ck&&p.choke){const S=ck.get(p.choke)||new Set();for(const o of S)if(o!==v)vStop(o,when,.012);S.clear();S.add(v);ck.set(p.choke,S)}
 if(dur>0&&(looping||cue||p.mode==='gate'))vStop(v,when+dur,.02);return v}
function vStop(v,t,rel){if(!v)return;t=Math.max(t,v.ctx.currentTime);rel=Math.max(rel||.02,(v.rel||0)/3);try{v.g.gain.cancelScheduledValues(t);v.g.gain.setTargetAtTime(0,t,rel);v.src.stop(t+.3+rel*4)}catch(e){}v.end=Math.min(v.end,t+.3+rel*4)}
function audition(p,st){if(!p||!ac)return;resume();if(aud)vStop(aud,ac.currentTime,.01);aud=voice(ac,busFor(p),p.mode==='latch'||p.mode==='loop'||p.mode==='cue'?{...p,mode:'one'}:p,ac.currentTime,.85,st||0,0,null)}

/* ---------- keys mode (play a sound as an instrument) ---------- */
function keyNotes(p,j){const sc=SCALES[PS.scale]||SCALES.min,n=sc.length,pm=p.midi!==undefined?p.midi:48+PS.root;
 const base=Math.round(pm)-((((Math.round(pm)-PS.root)%12)+12)%12)+12*PS.oct,deg=k=>base+12*Math.floor(k/n)+sc[((k%n)+n)%n];
 const ds=PS.chord?(n>7?null:[j,j+2,j+4]):[j];const ms=ds?ds.map(deg):[deg(j),deg(j)+4,deg(j)+7];return ms.map(m=>clamp(m-pm,-36,36))}
const keyName=(p,j)=>{const pm=p.midi!==undefined?p.midi:48+PS.root;return nn(Math.round(pm+keyNotes({...p},j)[0]))};

/* ---------- live hits ---------- */
function flash(j){const el=padEl[j];if(!el)return;el.classList.add('on');clearTimeout(el._ft);el._ft=setTimeout(()=>el.classList.remove('on'),110)}
function recEv(sb,sj,vel,st,ci){if(!(TR.playing&&TR.rec))return null;const nb=beatNow(),seg=TR.seg;if(nb<0||!seg)return null;let pos=nb-seg.start;pos=((pos%seg.len)+seg.len)%seg.len;
 let t=PS.q>0?Math.round(pos/PS.q)*PS.q:pos;if(t>=seg.len-1e-4)t=0;if(!TR.recSnap){pushUndo();TR.recSnap=true}
 const ev={t:+t.toFixed(4),b:sb,p:sj,v:+vel.toFixed(2),st:st||0,d:0,_skip:seg.id};if(ci!=null){ev.pg='chop';ev.ci=ci}{const SP=PS.pats[seg.pat];if(SP.bank==null){SP.bank=PS.bank;SP.prog=PS.prog}}PS.pats[seg.pat].ev.push(ev);seqDirty=true;dirty();return ev}
function hit(b,j,vel){if(!ac)return null;resume();flash(j);if(HW.full)vel=1;
 if(!PS.keys&&HW.erase){hwEraseHit(b,j);return null}if(!PS.keys&&HW.mute){hwMuteHit(b,j);return null}
 if(PS.keys&&PS.kp){const p=PS.kp.pad||PS.banks[PS.kp.b][PS.kp.j];if(!p)return null;const vs=[],evs=[],t=ac.currentTime;
  keyNotes(p,j).forEach((st,i)=>{const v=voice(ac,busFor(p),p.mode==='latch'||p.mode==='cue'?{...p,mode:'gate'}:p,t+i*.008,vel*(PS.chord?.75:1),st,0,null);if(v)vs.push(v);const ev=recEv(PS.kp.b,PS.kp.j,vel,st,PS.kp.ci);if(ev)evs.push(ev)});
  return{vs,evs,p:p.mode==='latch'||p.mode==='cue'?{...p,mode:'gate'}:p,b0:beatNow()}}
 const p=AB()[b][j];if(!p){if(!PICK)msg(PS.prog==='chop'?'No slice on this pad: the song has '+slices.length+' slices. Lower LONGEST on CHOP for more, or switch to the KIT program.':'Pad '+BL[b]+String(j+1).padStart(2,'0')+' is empty. Hold it for ½ second to choose a sound for it.');return null}PS.lastHit={b,j,ci:p.chop?p.ci:undefined,pad:p.chop?p:undefined};
 if((NR.on||SHIFT||HW.shift)&&p.mode!=='latch'&&p.mode!=='cue'){const k=b+':'+j;nrStart(k,b,j,vel);return{vs:[],evs:[],p:{...p,mode:'one'},b0:0,nr:k}}
 if(p.mode==='latch'||p.mode==='cue'){const k=b+':'+j,on=LATCH.get(k);
  if(on&&p.mode==='cue'){vStop(on.v,ac.currentTime,.008);LATCH.delete(k);on.done=1}
  if(on&&!on.done){vStop(on.v,TR.playing&&on.ev===null?nextBeatT():ac.currentTime,.03);LATCH.delete(k);if(on.ev){on.ev.d=+Math.max(.25,beatNow()-on.b0).toFixed(3)}if(padEl[j])padEl[j].classList.remove('hold');return null}
  const when=TR.playing&&!TR.rec?nextBeatT():ac.currentTime,v=voice(ac,busFor(p),p,when,vel,0,0,CK);
  for(const[kk,o]of LATCH)if(o.v&&o.v.end<ac.currentTime+.05)LATCH.delete(kk);
  if(p.choke)for(const[kk,o]of LATCH){const[bb,jj]=kk.split(':').map(Number),q=PS.banks[bb][jj];if(q&&q.choke===p.choke){LATCH.delete(kk);if(bb===PS.bank&&padEl[jj])padEl[jj].classList.remove('hold')}}
  const ev=recEv(b,j,vel,0,p.chop?p.ci:undefined);LATCH.set(k,{v,ev,b0:beatNow()});if(padEl[j])padEl[j].classList.add('hold');return null}
 const v=voice(ac,busFor(p),p,ac.currentTime,vel,0,0,CK),ev=recEv(b,j,vel,0,p.chop?p.ci:undefined);return{vs:v?[v]:[],evs:ev?[ev]:[],p,b0:beatNow()}}
function release(h){if(!h)return;if(h.nr){nrStop(h.nr);return}if(h.p.mode==='gate'||h.p.mode==='loop')h.vs.forEach(v=>vStop(v,ac.currentTime,.03));
 if(h.evs.length){const d=+Math.max(.0625,beatNow()-h.b0).toFixed(3);h.evs.forEach(e=>e.d=d)}}
function nextBeatT(){const nb=beatNow();return TR.t0+Math.ceil(nb-.02)*bd()}

/* ---------- transport ---------- */
function beatNow(){return ac?(ac.currentTime-TR.t0)/bd():0}
function click(t,acc){const o=ac.createOscillator(),g=ac.createGain();g._noRec=1;o.frequency.value=acc?1760:1100;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(acc?.32:.18,t+.001);g.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.06)}
function startT(){if(TR.playing||!ac)return;resume();const sf=PS.songMode&&PS.song.length?clamp(TR.songFrom||0,0,PS.song.length-1):0;TR.songFrom=0;const ci=TR.rec&&PS.countIn?4:0,first=PS.songMode&&PS.song.length?PS.song[sf]:PS.pat;
 TR.songPos=sf;followPart(first,0);PS.pat=first;TR.t0=ac.currentTime+.1+ci*bd();TR.seg={pat:first,start:0,len:patLen(first),id:++TR.segId};TR.sched=-ci;TR.next=null;TR.playing=true;TR.recSnap=false;
 TR.timer=setInterval(tick,25);tick();uiT();renderPats();seqDraw();loop()}
function stopT(){clearInterval(TR.timer);TR.timer=null;const was=TR.playing;TR.playing=false;TR.next=null;TR.rec=false;if(ac){const t=ac.currentTime;TR.vs.forEach(v=>vStop(v,t,.02));for(const o of LATCH.values())vStop(o.v,t,.03)}
 TR.vs=[];LATCH.clear();try{rollStop()}catch(e){}for(const S of CK.values())S.clear();padEl.forEach(e=>e&&e.classList.remove('hold'));uiT();renderPats();$('psPh').style.display='none';$('psPos').textContent='Stopped';if(was)seqDraw()}
function tick(){if(!TR.playing)return;const ahead=beatNow()+.15/bd();let guard=0;
 while(TR.sched<ahead&&guard++<64){const seg=TR.seg,end=seg.start+seg.len,to=Math.min(ahead,end);sched(TR.sched,to,seg);TR.sched=to;if(to>=end-1e-9)adv()}
 const now=ac.currentTime;TR.vs=TR.vs.filter(v=>v.end>now-.5)}
function adv(){const seg=TR.seg;let p;
 if(TR.next!=null){p=TR.next;TR.next=null;if(PS.songMode){const k=TR.nextPos!=null?TR.nextPos:PS.song.indexOf(p);TR.nextPos=null;if(k>=0)TR.songPos=k}}
 else if(PS.songMode&&PS.song.length){TR.songPos=(TR.songPos+1)%PS.song.length;p=PS.song[TR.songPos]}else p=seg.pat;
 TR.seg={pat:p,start:seg.start+seg.len,len:patLen(p),id:++TR.segId};TR.recSnap=false;TR.segChanged=true;if(p!==seg.pat)followPart(p,(TR.seg.start-beatNow())*bd()*1000)}
function followPart(p,ms){const P=PS.pats[p];if(!PS.follow||!P||P.bank==null)return;setTimeout(()=>{try{if(P.prog&&P.prog!==PS.prog)setProg(P.prog,true);if(P.bank!==PS.bank)setBank(P.bank)}catch(e){}},Math.max(0,ms||0))}

/* ================= AUTOMATION (DAW style): knob moves recorded into the pattern =================
   Lanes per pattern: flt (filter -100..100), pump (0..100), sw (swing 0..100).
   PS.autoMode: 'read' plays lanes back, 'write' records knob moves while the transport runs
   (and replaces what was there under the moving knob), 'off' ignores lanes. */
PS.autoMode='read';let AUTOW={};
function autoRec(k,v){if(PS.autoMode!=='write'||!TR.playing||!TR.seg)return;const seg=TR.seg,P=PS.pats[seg.pat],nb=beatNow();let t=nb-seg.start;if(t<0)return;t=t%seg.len;
 P.auto=P.auto||{};const L=P.auto[k]=P.auto[k]||[];const last=AUTOW[k];
 if(last&&last.pat===seg.pat&&t>=last.t){for(let i=L.length-1;i>=0;i--)if(L[i].t>last.t+1e-6&&L[i].t<=t+1e-6)L.splice(i,1)}
 for(let i=L.length-1;i>=0;i--)if(Math.abs(L[i].t-t)<1/16)L.splice(i,1);
 L.push({t:+t.toFixed(4),v:+(+v).toFixed(2)});L.sort((x,y)=>x.t-y.t);AUTOW[k]={pat:seg.pat,t,at:performance.now()};seqDirty=true;dirty()}
function autoApply(k,v){try{if(k==='flt'){$('psFk').value=v;filterKnob(v)}else if(k==='pump'){PUMP=v;if($('djPump')){$('djPump').value=v;$('djPumpV').textContent=Math.round(v)}}else if(k==='sw'){PS.swing=Math.round(v);$('psSw').value=PS.swing;$('psSwv').textContent=PS.swing}}catch(e){}}
function autoPlay(P,seg,lo,b){if(PS.autoMode==='off'||!P.auto)return;for(const k of AUTOK){const L=P.auto[k];if(!L||!L.length)continue;
  const w=AUTOW[k];if(PS.autoMode==='write'&&w&&performance.now()-w.at<350)continue;
  for(const pt of L){const at=seg.start+pt.t;if(pt.t>=seg.len||at<lo-1e-9||at>=b-1e-9)continue;const when=TR.t0+at*bd();setTimeout(()=>{if(TR.playing&&PS.autoMode!=='off')autoApply(k,pt.v)},Math.max(0,(when-ac.currentTime)*1000))}}}

function sched(a,b,seg){
 for(let k=Math.ceil(a-1e-9);k<b-1e-9;k++){if(k<0)click(TR.t0+k*bd(),((k%4)+4)%4===0);else if(PS.metro)click(TR.t0+k*bd(),((k-seg.start)%4+4)%4===0)}
 const lo=Math.max(a,seg.start);if(b<=lo)return;const P=PS.pats[seg.pat],sw=PS.swing/100/6;autoPlay(P,seg,lo,b);
 for(const ev of P.ev){if(ev.t>=seg.len||ev._skip===seg.id)continue;const at=seg.start+ev.t;if(at<lo-1e-9||at>=b-1e-9)continue;
  const p=padOfEv(ev);if(!p||HW.mutes.has(evKey(ev))||(P.mute&&P.mute.includes(evKey(ev))))continue;const odd=Math.abs(((ev.t*4)%2)-1)<.02,when=TR.t0+(at+(odd?sw:0))*bd();
  let d=(ev.d||0)*bd();if(!d&&(p.mode==='loop'||p.mode==='latch'||p.mode==='cue'))d=(seg.len-ev.t)*bd();
  const v=voice(ac,busFor(p),p,Math.max(when,ac.currentTime),ev.v,ev.st||0,d,CK);if(v)TR.vs.push(v);
  {const j=evRow(ev);if(j>=0&&!PS.keys)setTimeout(()=>flash(j),Math.max(0,(when-ac.currentTime)*1000))}}}
function togglePlay(){TR.playing?stopT():startT()}
function toggleRec(){TR.rec=!TR.rec;TR.recSnap=false;if(TR.rec&&!TR.playing)startT();uiT()}
function setBpm(v){v=clamp(+v||PS.bpm,40,240);if(TR.playing){const nb=beatNow();PS.bpm=v;TR.t0=ac.currentTime-nb*bd()}else PS.bpm=v;$('psBpm').value=v;dirty()}
function uiT(){$('psRec').classList.toggle('on',TR.rec);$('psPlay').classList.toggle('on',TR.playing);(!$('psPlay').dataset.hw&&($('psPlay').textContent=TR.playing?'▶ PLAYING':'▶ PLAY'))}
function loop(){cancelAnimationFrame(raf);const f=()=>{if(!TR.playing)return;const nb=beatNow(),seg=TR.seg;
 if(TR.segChanged){TR.segChanged=false;if(PS.pat!==seg.pat){PS.pat=seg.pat;seqDraw();$('psBars').value=PS.pats[PS.pat].bars}renderPats()}
 if(nb<0)$('psPos').textContent='Count-in '+Math.ceil(-nb);else{const pos=Math.max(0,nb-seg.start);$('psPos').textContent=(TR.rec?'● ':'')+'P'+(seg.pat+1)+' · '+(Math.floor(pos/4)+1)+'.'+(Math.floor(pos%4)+1)}
 const ph=$('psPh');if(seg.pat===PS.pat&&nb>=0){const x=LW+(nb-seg.start)*4*CW;ph.style.display='block';ph.style.left=x+'px';
  if($('psFol').classList.contains('on')){const w=$('psSeqW');if(x>w.scrollLeft+w.clientWidth-40||x<w.scrollLeft+LW)w.scrollLeft=Math.max(0,x-LW-20)}}else ph.style.display='none';
 if(seqDirty){seqDirty=false;seqDraw();renderPats()}raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}

/* ---------- undo / save ---------- */
const cleanPats=()=>PS.pats.map(p=>{const o={bars:p.bars,ev:p.ev.map(({_skip,...e})=>e)};if(p.mute&&p.mute.length)o.mute=[...p.mute];if(p.bank!=null)o.bank=p.bank;if(p.prog)o.prog=p.prog;if(p.auto&&AUTOK.some(k=>p.auto[k]&&p.auto[k].length))o.auto=JSON.parse(JSON.stringify(p.auto));return o});
function pushUndo(){PS.undo.push(JSON.stringify({b:PS.banks,p:cleanPats(),s:PS.song}));if(PS.undo.length>50)PS.undo.shift()}
function undo(){const u=PS.undo.pop();if(!u){msg('Nothing to undo.');return}const d=JSON.parse(u);PS.banks=d.b;PS.pats=d.p;PS.song=d.s||[];renderAll();dirty();msg('Undone.')}
function ser(){const S=PS.srcs[PS.main]||{};return{v:1,app:'BeatChopperPadStudio',main:PS.main,mainLen:S.len,srcs:Object.keys(PS.srcs),
 chop:{mode:$('mode').value,bpm:$('bpm').value,sens:$('sens').value,minl:$('minl').value,maxl:$('maxl').value,manual:deep(manual)},
 bpm:PS.bpm,swing:PS.swing,q:PS.q,root:PS.root,scale:PS.scale,banks:PS.banks,packs:PS.packs||[],pats:cleanPats(),song:PS.song,songMode:PS.songMode,layout:PS.layout,saved:new Date().toISOString()}}
function dirty(){clearTimeout(saveT);saveT=setTimeout(()=>{if(PS.main)LS.set('bcrps:auto:'+PS.main,ser())},700);renderBanks()}
const isEmpty=()=>PS.banks.every(B=>B.every(p=>!p))&&PS.pats.every(p=>!p.ev.length);
function applyProj(d,opt){if(!d||!Array.isArray(d.banks))throw new Error('That is not a Pad Studio project file.');opt=opt||{};pushUndo();stopT();
 const cur=PS.srcs[PS.main]||{};let remap=false;if(d.main&&d.main!==PS.main&&!(PS.srcs[d.main]&&PS.srcs[d.main].chs)&&d.mainLen&&d.mainLen===cur.len)remap=true;
 if(!opt.noChop&&d.chop&&(d.main===PS.main||remap)){$('mode').value=d.chop.mode;$('bpm').value=d.chop.bpm;$('sens').value=d.chop.sens;$('sv').textContent=d.chop.sens;$('minl').value=d.chop.minl;$('maxl').value=d.chop.maxl;manual=deep(d.chop.manual||{add:[],del:[]});rebuild();regMain()}
 PS.banks=Array.from({length:8},(_,i)=>{const B=(d.banks[i]||[]).slice(0,16);while(B.length<16)B.push(null);return B.map(p=>p&&p.seg?{...p,src:remap&&p.src===d.main?PS.main:p.src}:null)});
 PS.pats=Array.from({length:NPAT},(_,i)=>{const p=(d.pats||[])[i]||{bars:2,ev:[]};const o={bars:[1,2,4,8].includes(+p.bars)?+p.bars:2,ev:(p.ev||[]).filter(e=>e&&isFinite(e.t))};if(Array.isArray(p.mute))o.mute=p.mute.filter(x=>typeof x==='string');if(p.bank!=null)o.bank=clamp(+p.bank,0,7);if(p.prog)o.prog=p.prog==='kit'?'kit':'chop';if(p.auto&&typeof p.auto==='object'){o.auto={};for(const k of AUTOK)if(Array.isArray(p.auto[k]))o.auto[k]=p.auto[k].filter(x=>x&&isFinite(x.t)&&isFinite(x.v)).map(x=>({t:+x.t,v:+x.v}))}return o});
 PS.song=(d.song||[]).filter(x=>x>=0&&x<NPAT);if(Array.isArray(d.packs))PS.packs=d.packs;PS.songMode=!!d.songMode;if(d.bpm)PS.bpm=+d.bpm;PS.swing=+d.swing||0;if(d.q!==undefined)PS.q=+d.q;if(d.root!==undefined){PS.root=+d.root;PS.keySet=true}if(d.scale)PS.scale=d.scale;if(d.layout)PS.layout=d.layout;
 PS.pat=0;PS.sel=null;PS.kp=null;PS.keys=false;syncCtl();renderAll();dirty();
 const miss=new Set();PS.banks.forEach(B=>B.forEach(p=>{if(p&&!(PS.srcs[p.src]&&PS.srcs[p.src].chs))miss.add(p.src)}));
 return miss}
function syncCtl(){$('psBpm').value=PS.bpm;$('psSw').value=PS.swing;$('psSwv').textContent=PS.swing;$('psQ').value=String(PS.q);if(![...$('psQ').options].some(o=>o.value===String(PS.q)))$('psQ').value='0.25';
 $('psBars').value=PS.pats[PS.pat].bars;$('psRoot').value=PS.root;$('psScale').value=PS.scale;$('psLay').value=PS.layout;$('psSongM').classList.toggle('on',PS.songMode)}

/* ---------- pads: create / assign ---------- */
function mkPad(src,seg,name,role,x){return Object.assign({src,seg,name,role:role||'',col:RC[role]||COLS[Math.floor(Math.random()*COLS.length)],gain:1,pan:0,tune:0,rev:false,mode:'one',choke:role==='hat'||role==='open'?1:0,ts:0,te:0},x||{})}
function mergeSegs(items){const out=[];for(const it of items){const l=out[out.length-1];if(l&&Math.abs(l[1]-it.s)<2)l[1]=it.e;else out.push([it.s,it.e])}return out}
function assignItems(j,items){if(!items.length)return;const src=items[0].src;items=items.filter(i=>i.src===src);pushUndo();const f=items[0],role=items.length>1?'chain':(KIND2ROLE[f.kind]||'');
 PS.banks[PS.bank][j]=mkPad(src,mergeSegs(items),items.length>1?'CHAIN '+(f.i+1)+'+'+(items.length-1):(f.kind?f.kind.toUpperCase()+' ':'#')+(f.i+1),role,{midi:items.length===1?f.midi:undefined,choke:items.length>1?3:(f.kind==='hat'?1:0)});
 PS.armed=[];if(PS.mode==='edit'){PS.sel={b:PS.bank,j}}renderPads();renderBin();openEd();hint();dirty();audition(PS.banks[PS.bank][j])}
function swap(a,b){pushUndo();const B=PS.banks[PS.bank];[B[a],B[b]]=[B[b],B[a]];
 for(const P of PS.pats)for(const e of P.ev)if(e.b===PS.bank){if(e.p===a)e.p=b;else if(e.p===b)e.p=a}
 if(PS.sel&&PS.sel.b===PS.bank){if(PS.sel.j===a)PS.sel.j=b;else if(PS.sel.j===b)PS.sel.j=a}
 renderPads();seqDraw();openEd();dirty();msg('Swapped pads '+(a+1)+' and '+(b+1)+'. Your recorded beats follow the sounds.')}
const nextEmpty=()=>PS.banks[PS.bank].findIndex(p=>!p);

/* ---------- SMART DETECTORS ---------- */
function envAt(sample){const k=Math.floor(sample/blk);return env[clamp(k,0,env.length-1)]}
function envMean(a,b){const ka=Math.floor(a/blk),kb=Math.min(env.length,Math.floor(b/blk));let s=0,n=0;for(let k=ka;k<kb;k++){s+=env[k];n++}return n?s/n:0}
let gMean=0,AUTO=false;const toKit=()=>{if(!AUTO&&PS.prog==='chop')setProg('kit',true)};const globMean=()=>{if(!gMean){let s=0;for(const v of env)s+=v;gMean=s/env.length||1e-6}return gMean};
/* Smart chains: runs of consecutive slices that start on the grid and add up to a musical length */
function smartChains(max){max=max||16;const beat=60/songBpm(),G=globMean(),cand=[],lens=[.5,1,2,4];gMean=0;
 for(let i=0;i<slices.length;i++){const t0=slices[i].t,g16=beat/4,ph=((t0-phase)/g16),err=Math.abs(ph-Math.round(ph))*g16;if(err>.03)continue;
  const onBeat=Math.abs(((t0-phase)/beat)-Math.round((t0-phase)/beat))*beat<.025,bp=(t0-barPhase)/(beat*4),onBar=Math.abs(bp-Math.round(bp))*beat*4<.03;
  for(const Lb of lens){const L=Lb*beat;let k=i;while(k<slices.length-1&&slices[k].e/sr-t0<L*.93)k++;const tot=slices[k].e/sr-t0,fit=Math.abs(tot-L)/L,n=k-i+1;
   if(fit>.12||n<2||n>12)continue;const s=slices[i].s,e=Math.min(y.length,snapMin(t0+L,.01)),en=envMean(s,e)/G;if(en<.35)continue;
   const quiet=1-clamp(envAt(e)/(envMean(s,e)+1e-9),0,1.5)/1.5,dens=n>=2&&n<=6?.4:.1;
   const sc=(1-fit*6)+(onBeat?.5:0)+(onBar?.35:0)+quiet*.6+Math.min(en,2)*.35+dens+(Lb===1?.15:Lb===2?.1:0)+(slices[i]._sw||0)*.35;
   cand.push({i,k,s,e,Lb,sc,why:'Starts on '+(onBar?'the 1 of a bar':onBeat?'a beat':'a 16th')+(slices[i]._star?' with a ★ sweet-spot hit':'')+'; '+n+' hits link into a '+(Lb===4?'1-bar':Lb===.5?'half-beat':Lb+'-beat')+' phrase; '+(quiet>.55?'clean ending':'rolls into the next hit')+(fit<.04?'; lands exactly on the grid':''),bar:Math.floor(bp)+1,beatN:Math.floor((((t0-barPhase)/beat)%4+4)%4)+1})}}
 cand.sort((a,b)=>b.sc-a.sc);const pick=[],per={};
 for(const c of cand){if(pick.length>=max)break;if((per[c.Lb]||0)>=Math.ceil(max/2.5))continue;if(pick.some(p=>Math.min(p.e,c.e)-Math.max(p.s,c.s)>.3*Math.min(p.e-p.s,c.e-c.s)))continue;pick.push(c);per[c.Lb]=(per[c.Lb]||0)+1}
 pick.sort((a,b)=>a.Lb-b.Lb||a.s-b.s);
 return pick.map(c=>mkPad(PS.main,[[c.s,c.e]],(c.Lb===4?'BAR':c.Lb===.5?'½B':c.Lb+'B')+' · '+c.bar+'.'+c.beatN,'chain',{choke:3,lb:c.Lb,bpm:songBpm(),why:c.why}))}
/* Smart loops: bar-aligned 1/2/4-bar windows that repeat well and loop without a click */
function smartLoops(max){max=max||16;const beat=60/songBpm(),bar=beat*4,G=globMean(),dur=y.length/sr,cand=[];gMean=0;
 const envSeg=(a,n)=>{const o=new Float32Array(n),st=Math.floor(beat*sr/blk/n)||1;for(let i=0;i<n;i++)o[i]=envAt(a+i*st*blk);return o};
 const corr=(a,b)=>{let ma=0,mb=0;for(let i=0;i<a.length;i++){ma+=a[i];mb+=b[i]}ma/=a.length;mb/=b.length;let x=0,p=0,q=0;for(let i=0;i<a.length;i++){const u=a[i]-ma,v=b[i]-mb;x+=u*v;p+=u*u;q+=v*v}return x/Math.sqrt(p*q+1e-12)};
 for(const nb of[1,2,4])for(let k=0;;k++){const t=Math.max(0,barPhase)+k*bar;if(t+nb*bar>dur-.02)break;const s=snapMin(t,.01),e=s+Math.round(nb*bar*sr);if(e>=y.length)break;
  const en=envMean(s,e)/G;if(en<.45)continue;const a=envSeg(s,48),b2=e+beat*sr<y.length?envSeg(e,48):null,rep=b2?corr(a,b2):0;
  const seam=1-clamp(Math.abs(y[e-1]-y[s])*6,0,1),edge=1-clamp(envAt(e-blk)/(envMean(s,e)+1e-9),0,2)/2;
  cand.push({s,e,nb,k,sc:rep*1.2+seam*.4+edge*.3+Math.min(en,2)*.4+(nb===2?.15:nb===4?.1:0),why:nb+'-bar section starting on bar '+(k+1)+'; its groove repeats '+Math.round(Math.max(0,rep)*100)+'% like what follows it'+(seam>.8?'; click-free loop seam':'')+(en>1.1?'; one of the fuller parts of the track':'')})}
 cand.sort((a,b)=>b.sc-a.sc);const pick=[],quota={1:6,2:6,4:4};
 for(const c of cand){if(pick.length>=max)break;if(!quota[c.nb])continue;if(pick.some(p=>p.nb===c.nb&&Math.min(p.e,c.e)-Math.max(p.s,c.s)>.5*(c.e-c.s)))continue;pick.push(c);quota[c.nb]--}
 pick.sort((a,b)=>a.nb-b.nb||a.s-b.s);
 return pick.map(c=>mkPad(PS.main,[[c.s,c.e]],'LOOP '+c.nb+'bar · '+(c.k+1),'loop',{mode:'latch',choke:4,sync:true,bpm:songBpm(),lb:c.nb*4,why:c.why}))}
function melodic(max){max=max||16;const pool=slices.filter(s=>s.clar>.72&&s.midi>=24&&s.midi<=96&&dd(s)>=.1).sort((a,b)=>b.clar*b.en*Math.min(dd(b),1.2)-a.clar*a.en*Math.min(dd(a),1.2)),out=[],pcs={};
 for(const s of pool){if(out.length>=max)break;const pc=Math.round(s.midi)%12;if((pcs[pc]||0)>=2)continue;pcs[pc]=(pcs[pc]||0)+1;out.push(s)}
 if(out.length<max)for(const s of slices.filter(x=>dd(x)>.25).sort((a,b)=>b.en-a.en)){if(out.length>=max)break;if(!out.includes(s))out.push(s)}
 return out.map(s=>mkPad(PS.main,[[s.s,s.e]],(s.clar>.6&&s.midi!==undefined?nn(Math.round(s.midi)):'TONE')+' · '+Math.round(dd(s)*1000)+'ms','tone',{mode:'gate',midi:s.clar>.6?s.midi:undefined,why:s.clar>.6?'Clear pitch ('+Math.round(s.clar*100)+'% confidence), so it tunes cleanly across Keys mode':'Longest, fullest sound left over; may be untuned'}))}
async function smartGroups(max){max=max||16;if(!GS.groups.length){msg('Running the Groups engine…');try{ctlSync()}catch(e){}await gRun()}
 const order={confirmed:0,manual:0,suggested:1},gs=[...GS.groups].filter(g=>g.members&&g.members.length).sort((a,b)=>(order[a.status]??2)-(order[b.status]??2));
 return gs.slice(0,max).map(g=>mkPad(PS.main,mergeSegs(g.members.map(m=>({s:m.start_sample,e:m.end_sample}))),g.name||'GROUP','group',{choke:3,why:'Groups engine: '+(g.type||'related')+' slices, '+(g.status||'suggested')}))}
function kitPads(){PL.kit=PS.bank+1;buildKit();const R={KICK:'kick',SNARE:'snare',HAT:'hat',OPEN:'open',PERC:'perc',STAB:'stab',LONG:'long'};
 const bys=new Map(slices.map(s=>[s.s,s]));return PL.pads.map(p=>{if(!p)return null;const role=R[p.label.split(' ')[0]]||'perc',sl=bys.get(p.s);return mkPad(PS.main,[[p.s,p.e]],p.label,role,{choke:p.grp==='hat'?1:0,midi:sl&&sl.clar>.6?sl.midi:undefined,why:'The drum sorter heard this as a '+p.label.toLowerCase()+(role==='hat'||role==='open'?'; hats cut each other off like a real hi-hat':'')})})}
async function fill(kind,from){toKit();mainFresh();const S=PS.srcs[PS.cur];if(!S)return;from=Math.max(0,(+from||1)-1);let main=isMainCur();
 if(!main&&!['order','chain2','chain4','cues'].includes(kind)){msg('That smart fill uses the song loaded in Chopper. Using “16 slices in order” for this added sound.');kind='order'}
 if(main){await prep();regMain()}
 let pads=[];const L=S.sl;
 if(kind==='kit')pads=kitPads();
 else if(kind==='chains')pads=smartChains();
 else if(kind==='loops')pads=smartLoops();
 else if(kind==='keys')pads=melodic();
 else if(kind==='groups')pads=await smartGroups();
 else if(kind==='cues')pads=hotCues();
 else if(kind==='type'){const used=new Set(),top=(k,n)=>slices.map((s,i)=>({s,i})).filter(o=>o.s.kind===k&&!used.has(o.i)).sort((a,b)=>b.s.en-a.s.en).slice(0,n).map(o=>{used.add(o.i);return o});
  ['kick','snare','hat','tone'].forEach((k,r)=>{top(k,4).forEach((o,c)=>{pads[r*4+c]=mkPad(PS.main,[[o.s.s,o.s.e]],k.toUpperCase()+' '+(o.i+1),k,{midi:o.s.clar>.6?o.s.midi:undefined})})})}
 else if(kind==='order'||kind==='chain2'||kind==='chain4'){const n=kind==='order'?1:kind==='chain2'?2:4;for(let j=0;j<16;j++){const a=from+j*n,g=L.slice(a,a+n);if(!g.length)break;pads.push(mkPad(S===PS.srcs[PS.main]?PS.main:PS.cur,mergeSegs(g),n===1?(g[0].kind?g[0].kind.toUpperCase()+' ':'#')+(a+1):'#'+(a+1)+'–'+(a+g.length),n>1?'chain':(KIND2ROLE[g[0].kind]||''),{midi:n===1?g[0].midi:undefined,choke:n>1?3:0}))}}
 else if(kind==='beats'){const beat=60/songBpm(),dur=y.length/sr,t0=Math.max(0,barPhase)+from*beat;for(let j=0;j<16;j++){const a=t0+j*beat;if(a>=dur-.05)break;const sa=snapMin(a,.012),sb=Math.min(y.length,snapMin(Math.min(a+beat,dur),.012));if(sb-sa>400)pads.push(mkPad(PS.main,[[sa,sb]],'BEAT '+(Math.floor((from+j)/4)+1)+'.'+((from+j)%4+1),'chain',{choke:3,lb:1,bpm:songBpm()}))}}
 else if(kind==='half'||kind==='bars2'||kind==='bars4'){const beat=60/songBpm(),L=kind==='half'?beat/2:kind==='bars4'?beat*16:beat*8,dur=y.length/sr,t0=Math.max(0,barPhase)+from*L;for(let j=0;j<16;j++){const a=t0+j*L;if(a>=dur-.05)break;const sa=snapMin(a,.008),sb=Math.min(y.length,snapMin(Math.min(a+L,dur),.008));if(sb-sa>300)pads.push(mkPad(PS.main,[[sa,sb]],(kind==='half'?'½B ':kind==='bars4'?'4BAR ':'2BAR ')+(from+j+1),kind==='half'?'chain':'loop',kind==='half'?{choke:3,lb:.5,bpm:songBpm()}:{choke:4,mode:'latch',sync:true,bpm:songBpm(),lb:kind==='bars4'?16:8}))}}
 else if(kind==='rand'){const st=slices.map((s,i)=>({s,i})).filter(o=>o.s._star),Rr=rng(VS().seed);for(let k=st.length-1;k>0;k--){const q=Math.floor(Rr()*(k+1));[st[k],st[q]]=[st[q],st[k]]}st.slice(0,16).sort((a,b)=>a.i-b.i).forEach(o=>pads.push(mkPad(PS.main,[[o.s.s,o.s.e]],'★ '+(o.s.kind?o.s.kind.toUpperCase()+' ':'#')+(o.i+1),KIND2ROLE[o.s.kind]||'',{midi:o.s.clar>.6?o.s.midi:undefined,why:'★ sweet spot picked by variation '+VS().v}))) }
 else if(kind==='bars'){for(let j=0;j<16;j++){const b=bars[from+j];if(!b)break;pads.push(mkPad(PS.main,[[slices[b[0]].s,slices[b[b.length-1]].e]],'BAR '+(from+j+1),'loop',{choke:4,mode:'latch',sync:true,bpm:songBpm(),lb:4}))}}
 const old=PS.banks[PS.bank],B=emptyBank();if(old.some(p=>p&&p.lock)){old.forEach((p,j)=>{if(p&&p.lock)B[j]=p});let k=0;pads.filter(Boolean).forEach(p=>{while(k<16&&B[k])k++;if(k<16)B[k++]=p})}else pads.slice(0,16).forEach((p,j)=>B[j]=p||null);const ap=autoProcessBank(B);pushUndo();PS.banks[PS.bank]=B;PS.sel=null;renderAll();dirty();
 const n=B.filter(Boolean).length;msg(n?'Filled bank '+BL[PS.bank]+' with '+n+' pads'+(ap.nL?', levels matched':'')+(ap.nT?', '+ap.nT+' tuned to the key':'')+(old.some(p=>p&&p.lock)?', locked pads kept':'')+'.':'Nothing suitable found for that fill. Try another option or adjust the cuts in Chopper.');return n}

/* ---------- SMART BEAT (rule-based, uses only your pads) ---------- */
function findRole(roles,bankPref){const out=[];const order=[bankPref,...[0,1,2,3,4,5,6,7].filter(b=>b!==bankPref)];
 for(const b of order)PS.banks[b].forEach((p,j)=>{if(p&&roles.includes(p.role))out.push({b,j,p})});return out}
const STY={
 det:{k:[[0,3,6,10],[0,3,7,10,13],[0,6,10,11]],s:[8],hat:.5,roll:.35,open:.2,sw:12},
 trap:{k:[[0,7,10],[0,10,11],[0,3,10]],s:[8],hat:.5,roll:.45,open:.15,sw:0},
 drill:{k:[[0,6,11],[0,3,11,14],[0,7,14]],s:[8,15],hat:.5,roll:.2,open:.1,sw:0,trip:true},
 boom:{k:[[0,7,10],[0,8,10],[0,3,10]],s:[4,12],hat:.5,roll:0,open:.25,sw:28},
 flip:{k:[[0,10],[0,7]],s:[8],hat:1,roll:.1,open:.1,sw:15}};
function smartBeat(pi,o){o=o||{};const sty=STY[o.style||$('psSty').value]||STY.det,R=rng(o.seed||VS().seed),en=(o.energy??+$('psEn').value)/100,P=PS.pats[pi],bars=P.bars,ev=[];
 const pref=o.bank??PS.bank,K=findRole(['kick'],pref),S=findRole(['snare'],pref),H=findRole(['hat'],pref),O=findRole(['open'],pref),PC=findRole(['perc'],pref),
  C=findRole(['chain','group'],o.chainBank??pref),LP=findRole(['loop'],o.loopBank??pref),T=findRole(['tone','stab'],o.keyBank??pref);
 const add=(x,t,v,st,d)=>{if(x&&t<bars*4)ev.push({t:+t.toFixed(4),b:x.b,p:x.j,v:+clamp(v,.1,1).toFixed(2),st:st||0,d:d||0})};
 const pick=a=>a.length?a[Math.floor(R()*Math.min(a.length,3))]:null;
 const k1=pick(K),k2=K[1]||k1,sn=pick(S),hh=pick(H),oh=pick(O),pc=pick(PC);
 const kA=sty.k[Math.floor(R()*sty.k.length)],kB=sty.k[Math.floor(R()*sty.k.length)];
 const drums=o.drums!==false,chops=o.chops!==false&&C.length,loops=o.loops&&LP.length,keys=o.keys&&T.length;
 for(let br=0;br<bars;br++){const B=br*4,last=br===bars-1,alt=br%2===1;
  if(drums&&!o.noKick){(alt?kB:kA).forEach((s,i)=>add(i&&R()<.3?k2:k1,B+s/4,i?.8:1));if(en>.6&&R()<en-.4)add(k2,B+(alt?14:5)/4,.65)}
  if(drums){sty.s.forEach(s=>add(sn,B+s/4,1));if(last&&en>.5&&R()<.6){add(sn,B+14/4,.55);add(sn,B+15/4,.75)}
   const step=sty.trip?1/3:sty.hat;for(let t=0;t<4-1e-6;t+=step){const roll=R()<sty.roll*en&&!(Math.abs(t%1)<1e-6&&t%2===0);
    if(roll){const n=R()<.5?3:4;for(let r=0;r<n;r++)add(hh,B+t+r*step/n,.45+.3*r/n)}else add(hh,B+t,Math.abs(t%1)<1e-6?.85:.55)}
   if(oh&&R()<sty.open+en*.2)add(oh,B+(alt?3.5:1.5),.7);if(pc&&en>.4)add(pc,B+(R()<.5?2.75:1.75),.6)}
  if(chops){const seq=[];let t=0;const Rb=rng((o.seed||7)+(alt?101:11));
   while(t<4-1e-6){if(Rb()<.18*(1-en)){t+=.5;continue}const c=C[Math.floor(Rb()*Math.min(C.length,8))],lb=c.p.lb||Math.max(.25,Math.round(padBeats(c.p)*4)/4)||1,len=Math.min(lb,4-t);
    seq.push([c,t,len]);t+=Math.max(.5,Math.min(len,lb>=2?2:lb))}
   for(const[c,t2,len]of seq)add(c,B+t2,.9,0,len)}
  if(keys&&(br%2===0||en>.7)){const kp=T[0],degs=[0,4,5,3],deg=degs[br%4];const st=keyNotes(kp.p,deg)[0];add(kp,B,.8,st,1.5);if(en>.5)add(kp,B+2.5,.6,keyNotes(kp.p,deg+2)[0],.75)}}
 if(loops){const lp=LP[Math.floor(R()*Math.min(LP.length,4))],lb=lp.p.lb||4;for(let t=0;t<bars*4;t+=lb)add(lp,t,.85,0,Math.min(lb,bars*4-t))}
 pushUndo();P.ev=ev;if(sty.sw&&!o.keepSwing){PS.swing=sty.sw;$('psSw').value=PS.swing;$('psSwv').textContent=PS.swing}return ev.length}
function adoptKey(){if(!PS.keySet&&PL.sl===slices){PS.root=PL.root;PS.scale=PL.scale;$('psRoot').value=PS.root;$('psScale').value=PS.scale}}
async function magic(){const btn=$('psMagicGo');btn.disabled=true;try{msg('🪄 Building… sorting and tuning your sounds');await tick0();mainFresh();PS.cur=PS.main;await prep();regMain();adoptKey();
 const steps=[['kit',0,'smart kit'],['chains',1,'chains'],['loops',2,'loops'],['keys',3,'melodic sounds'],['groups',4,'groups'],['cues',5,'hot cues']],made=[];
 for(const[k,b,n]of steps){PS.bank=b;msg('🪄 Bank '+BL[b]+': '+n+'…');await tick0();try{const c=await fill(k,1);if(c)made.push(BL[b]+' '+n)}catch(e){}}
 PS.bpm=+songBpm().toFixed(1);$('psBpm').value=PS.bpm;const sd=VS().seed,sty=$('psSty').value;
 [0,1,2,3].forEach(i=>PS.pats[i].bars=4);
 smartBeat(0,{bank:0,chainBank:1,seed:sd,style:sty});
 smartBeat(1,{bank:0,chainBank:1,loopBank:2,seed:sd+3,loops:true,style:sty,energy:Math.min(100,+$('psEn').value+15)});
 smartBeat(2,{bank:0,chainBank:1,loopBank:2,keyBank:3,seed:sd+5,loops:true,keys:true,noKick:true,chops:false,style:sty,energy:30});
 smartBeat(3,{bank:0,chainBank:1,keyBank:3,seed:sd+9,keys:true,style:sty,energy:Math.min(100,+$('psEn').value+25)});
 PS.song=[0,0,1,0,2,3,3,1];PS.songMode=false;PS.bank=0;PS.pat=0;syncCtl();renderAll();dirty();
 msg('🪄 Done: '+made.join(', ')+'. Bank F holds hot cues for DJing the track. P1 = beat, P2 = beat + loop, P3 = breakdown, P4 = hook. The song chain is set. Press PLAY to hear it, or REC to record over it.')}
 catch(e){msg('Build stopped: '+(e.message||e))}btn.disabled=false}

/* ---------- rendering ---------- */
function renderBanks(){const AA=AB(),ch=AA!==PS.banks;$$('#psBanks .bkb').forEach((el,i)=>{el.classList.toggle('on',i===PS.bank);el.classList.toggle('has',AA[i].some(Boolean));const sm=el.querySelector('small');if(sm)sm.textContent=ch?String(PS.cpage*128+i*16+1):BK[i];el.classList.toggle('ins',!!(PS.keys&&PS.kp&&PS.kp.b===i))});
 $('psBankInfo').textContent=AA[PS.bank].filter(Boolean).length+'/16 pads loaded'}
function renderPats(){const cur=TR.playing&&TR.seg?TR.seg.pat:PS.pat;$$('#psPats .bkb').forEach((el,i)=>{el.classList.toggle('on',i===cur);el.classList.toggle('has',PS.pats[i].ev.length>0);el.classList.toggle('q',TR.next===i)});
 $('psPatInfo').textContent=PS.pats[cur].ev.length+' hits · '+PS.pats[cur].bars+' bar'+(PS.pats[cur].bars>1?'s':'')+(PS.songMode?' · song mode':'')}
function buildGrid(){const g=$('psGrid');g.className=PS.layout;g.textContent='';padEl=[];
 const order=PS.layout==='g28'?[8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7]:[12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3];
 for(const j of order){const el=document.createElement('button');el.className='pp';el.dataset.j=j;el.innerHTML='<canvas></canvas><span class="kk"></span><span class="nb"></span><span class="nm"></span>';padEl[j]=el;padHandlers(el,j);g.appendChild(el)}
 builtLay=PS.layout}
function renderPads(){if(builtLay!==PS.layout)buildGrid();const B=AB()[PS.bank],kp=PS.keys&&PS.kp?(PS.kp.pad||PS.banks[PS.kp.b][PS.kp.j]):null;
 padEl.forEach((el,j)=>{const p=PS.keys?kp:B[j],miss=p&&!(PS.srcs[p.src]&&PS.srcs[p.src].chs);el.className='pp'+(p?'':' emp')+(miss?' miss':'')+(!PS.keys&&PS.sel&&PS.sel.b===PS.bank&&PS.sel.j===j?' sel':'')+(!PS.keys&&PS.swapSrc===j&&PS.mode==='arr'?' sw':'')+(!PS.keys&&HW.mutes.has(keyOf(PS.bank,j))?' mut':'')+(PICK&&PICK.kind==='pad'&&PICK.b===PS.bank&&PICK.j===j?' pick':'');
  el.style.setProperty('--pc',p?p.col:'#868e96');el.querySelector('.kk').textContent=PK[j].toUpperCase();
  el.querySelector('.nb').textContent=PS.keys?(kp?keyName(kp,j):''):BL[PS.bank]+String(j+1).padStart(2,'0');
  el.querySelector('.nm').textContent=PS.keys?(kp?(j===0?kp.name:''):'—'):p?(miss?'⚠ '+p.name:p.name+(p.mode==='latch'?' ⟳':p.mode==='cue'?' ▶':'')):'empty';
  el.title=miss?'Load "'+p.src+'" to hear this pad':'';const cv=el.querySelector('canvas');wave(cv,p&&!PS.keys?padBuf(p):null,p?p.col:'#888');
  if(!PS.keys&&p&&LATCH.has(PS.bank+':'+j))el.classList.add('hold')})}
function hint(){if(PS.armed.length){const a=PS.armed;msg('In hand: slice #'+(a[0].i+1)+(a.length>1?' + '+(a.length-1)+' more (chain)':'')+'. Tap a pad to drop it in.');return}
 if(PS.keys){const p=PS.kp&&PS.banks[PS.kp.b][PS.kp.j];msg(p?'🎹 Keys mode: the 16 keys play “'+p.name+'” as notes in '+NN[PS.root]+' '+$('psScale').selectedOptions[0].text.toLowerCase()+'. The bottom row is the low octave and the top row is one octave up. Press L to go back to pads.':'Pick a sound first: tap a pad, then turn on Keys mode.');return}
 msg(PS.mode==='play'?'Tap pads or use the keys. ● REC records over the loop; ⛶ Perform gives you the big view.':PS.mode==='arr'?'Drag a pad onto another to swap them, or tap one pad and then another. Recorded beats follow the sounds.':'Tap a pad to edit its sound, length, pitch and how it plays.')}
function seqDraw(){const cv=$('psSeq');if(!cv)return;const P=PS.pats[PS.pat],steps=P.bars*16,W=LW+steps*CW,H=16*RH,r=Math.min(2,devicePixelRatio||1);
 cv.style.width=W+'px';cv.style.height=H+'px';cv.width=W*r;cv.height=H*r;const g=cv.getContext('2d');g.setTransform(r,0,0,r,0,0);
 const cs=getComputedStyle(cv),bg=cs.getPropertyValue('--bg').trim(),card=cs.getPropertyValue('--card').trim(),bdc=cs.getPropertyValue('--bd').trim(),fg=cs.getPropertyValue('--fg').trim(),mut=cs.getPropertyValue('--mut').trim();
 g.fillStyle=card;g.fillRect(0,0,W,H);g.font='11px system-ui';
 for(let row=0;row<16;row++){const y0=row*RH,p=AB()[PS.bank][row];
  for(let s=0;s<steps;s++){g.fillStyle=Math.floor(s/4)%2?bdc:bg;g.globalAlpha=Math.floor(s/4)%2?.55:1;g.fillRect(LW+s*CW+1,y0+1,CW-2,RH-2)}g.globalAlpha=1;
  g.fillStyle=p?p.col:bdc;g.fillRect(0,y0+3,4,RH-6);g.fillStyle=p?fg:mut;g.fillText(String(row+1).padStart(2,' ')+' '+(p?p.name:'—').slice(0,10),8,y0+14)}
 g.fillStyle=fg;g.globalAlpha=.5;for(let s=0;s<=steps;s+=16)g.fillRect(LW+s*CW-1,0,2,H);g.globalAlpha=1;
 for(const ev of P.ev){const row=evRow(ev);if(row<0||ev.t>=P.bars*4)continue;const p=padOfEv(ev),x=LW+ev.t*4*CW,y0=row*RH,w=Math.min(W-x-1,Math.max(CW-3,(ev.d||0)*4*CW-2));
  g.globalAlpha=.4+.6*ev.v;g.fillStyle=p?p.col:'#868e96';g.fillRect(x+1,y0+3,w,RH-6);g.globalAlpha=1;if(ev.st){g.fillStyle='#fff';g.font='9px system-ui';g.fillText((ev.st>0?'+':'')+ev.st,x+2,y0+13);g.font='11px system-ui'}}
 $('psSqN').textContent='P'+(PS.pat+1);$('psSqB').textContent=BL[PS.bank]+(PS.prog==='chop'?' (CHOP program, slices '+(ciOf(PS.bank,0)+1)+'–'+(ciOf(PS.bank,15)+1)+')':' (KIT program)')}
function renderBin(){mainFresh();const sel=$('psSrc');sel.textContent='';for(const k of Object.keys(PS.srcs)){const S=PS.srcs[k];if(!S.chs)continue;const o=document.createElement('option');o.value=k;o.textContent=(S.main?'🎵 ':'＋ ')+k+' ('+(S.sl||[]).length+')';sel.appendChild(o)}sel.value=PS.cur;
 $$('#psFilt .chipb').forEach(b=>b.classList.toggle('on',b.dataset.f===PS.binF));$('psChain').classList.toggle('on',PS.chain);
 const box=$('psBin');box.textContent='';const S=PS.srcs[PS.cur];if(!S)return;let L=S.sl||[];const beat=60/songBpm();
 if(PS.binF==='long')L=L.filter(x=>(x.e-x.s)/sr>=beat*.9);else if(PS.binF==='star')L=L.filter(x=>x.star);else if(PS.binF!=='all')L=L.filter(x=>x.kind===PS.binF);
 const fr=document.createDocumentFragment();for(const it of L){const b=document.createElement('button');b.className='tl';b.style.setProperty('--kc',RC[KIND2ROLE[it.kind]]||'#868e96');
  const k=PS.armed.findIndex(a=>a.src===it.src&&a.s===it.s);if(k>=0)b.classList.add('sel');b.innerHTML='<b>'+(it.star?'★':'')+(it.i+1)+'</b><small>'+(PS.chain&&k>=0?'#'+(k+1)+' · ':'')+Math.round((it.e-it.s)/sr*1000)+'ms</small>';b._it=it;fr.appendChild(b)}
 box.appendChild(fr);$('psBinInfo').textContent=L.length+' slices shown'}
function renderSong(){const c=$('psSong');c.textContent='';if(!PS.song.length){c.innerHTML='<span class="mt">No song yet. Add patterns in the order you want them to play.</span>'}
 PS.song.forEach((p,i)=>{const s=document.createElement('span');s.className='mc';s.innerHTML='P'+(p+1)+' <button>✕</button>';s.querySelector('button').onclick=()=>{pushUndo();PS.song.splice(i,1);renderSong();dirty()};c.appendChild(s)});
 $('psSongM').classList.toggle('on',PS.songMode)}
function renderSaves(){const box=$('psSvL'),all=LS.get('bcrps:saves')||{};box.textContent='';const ks=Object.keys(all).sort((a,b)=>(all[b].at||'').localeCompare(all[a].at||''));
 if(!ks.length){box.innerHTML='<div class="mt" style="margin-top:6px">No saved setups yet.</div>';return}
 for(const k of ks){const r=document.createElement('div');r.className='svr';const d=all[k];r.innerHTML='<b></b><span class="mt"></span><button data-a="l">Load</button><button data-a="d">Delete</button>';
  r.querySelector('b').textContent=k;r.querySelector('.mt').textContent=(d.data&&d.data.main?d.data.main+' · ':'')+(d.at||'').slice(0,10);
  r.onclick=e=>{const a=e.target.dataset.a;if(a==='l'){try{const miss=applyProj(d.data);msg('Loaded “'+k+'”.'+(miss.size?' Missing audio: '+[...miss].join(', ')+'. Load it in Chopper or with + Add sound file.':''))}catch(x){msg(x.message)}}
   else if(a==='d'&&confirmDel(r)){delete all[k];LS.set('bcrps:saves',all);renderSaves()}};box.appendChild(r)}}
function confirmDel(r){if(r._arm)return true;r._arm=1;const b=r.querySelector('[data-a=d]');b.textContent='Tap again to delete';setTimeout(()=>{r._arm=0;b.textContent='Delete'},2500);return false}
function renderAll(){try{renderPacks()}catch(e){}renderBanks();renderPats();renderPads();renderBin();seqDraw();renderSong();renderSaves();openEd();uiT();
 $$('.mb').forEach(b=>b.classList.toggle('on',b.dataset.m===PS.mode));$('psKeys').classList.toggle('on',PS.keys);$('psChd').classList.toggle('on',PS.chord);$('psKeyRow').hidden=!PS.keys;hint()}

/* ---------- editor ---------- */
function openEd(){const s=PS.sel,ed=$('psEd');if(!s){ed.hidden=true;return}const p=PS.banks[s.b][s.j];ed.hidden=false;edSnap=false;
 $('psEdT').textContent='Pad '+BL[s.b]+String(s.j+1).padStart(2,'0')+(p?' — '+p.name:' — empty (drop a slice on it)');$('psWhy').textContent=p&&p.why?'Why this pad: '+p.why:'';
 $$('#psEd input,#psEd select').forEach(el=>{if(el.id!=='peBk')el.disabled=!p});['peDup','peClr'].forEach(id=>$(id).disabled=!p);if(!p){wave($('psEdC'),null,'#888');return}
 const tot=p.seg.reduce((a,x)=>a+x[1]-x[0],0)/sr*1000;$('peN').value=p.name;$('peM').value=p.mode;$('peC').value=p.choke||0;
 $('peG').value=Math.round((p.gain??1)*100);$('peGv').textContent=$('peG').value+'%';$('peP').value=Math.round((p.pan||0)*100);$('pePv').textContent=$('peP').value;
 $('peT').value=p.tune||0;$('peTv').textContent=(p.tune>0?'+':'')+(p.tune||0);$('peS').max=$('peE').max=Math.max(1,Math.floor(tot-15));$('peS').value=p.ts||0;$('peE').value=p.te||0;$('peSv').textContent=p.ts||0;$('peEv').textContent=p.te||0;
 $('peR').checked=!!p.rev;$('peA').value=p.att||0;$('peAv').textContent=p.att||0;$('peRl').value=p.rel||0;$('peRv').textContent=p.rel||0;$('peF').value=p.flt||0;$('peFv').textContent=!p.flt?'off':p.flt<0?'LP '+(-p.flt):'HP '+p.flt;$('peMo').checked=!!p.mono;$('peLk').checked=!!p.lock;$('peKeyI').textContent=p.midi!==undefined?'Pitch '+nn(Math.round(p.midi+(p.tune||0)))+(inKey(Math.round(p.midi+(p.tune||0)))?' · in key':' · outside the key'):'';$('peY').checked=!!p.sync;$$('#peCol button').forEach(b=>b.classList.toggle('on',b.dataset.c===p.col));
 requestAnimationFrame(()=>wave($('psEdC'),padBuf(p),p.col))}
function edSet(fn){const s=PS.sel;if(!s)return;const p=PS.banks[s.b][s.j];if(!p)return;if(!edSnap){pushUndo();edSnap=true}fn(p);if(p.sync&&!p.bpm)p.bpm=songBpm();renderPads();openEd();seqDraw();dirty()}

/* ---------- export ---------- */
async function renderMix(list,rep,tail){const segs=[];let tot=0;for(let r=0;r<rep;r++)for(const i of list){segs.push({pat:i,start:tot,len:patLen(i)});tot+=patLen(i)}
 const secs=tot*bd()+(tail?1.5:0),oc=new OfflineAudioContext(2,Math.ceil(secs*sr),sr),m=oc.createGain(),c=oc.createDynamicsCompressor();c.threshold.value=-8;c.ratio.value=4;m.gain.value=.85;m.connect(c);c.connect(oc.destination);
 const sw=PS.swing/100/6,all=[];for(const sg of segs){const SP=PS.pats[sg.pat];for(const ev of SP.ev){if(ev.t>=sg.len)continue;const p=padOfEv(ev);if(!p||!padBuf(p)||HW.mutes.has(evKey(ev))||(SP.mute&&SP.mute.includes(evKey(ev))))continue;const odd=Math.abs(((ev.t*4)%2)-1)<.02;all.push({ev,p,at:(sg.start+ev.t+(odd?sw:0))*bd(),rest:(sg.len-ev.t)*bd()})}}
 if(!all.length)throw new Error('That pattern has no hits yet. Record or use 🧠 Smart Beat first.');all.sort((a,b)=>a.at-b.at);const ck=new Map();
 const omus=oc.createGain(),opump=oc.createGain();omus.connect(opump);opump.connect(m);
 for(const x of all){let d=(x.ev.d||0)*bd();if(!d&&(x.p.mode==='loop'||x.p.mode==='latch'||x.p.mode==='cue'))d=x.rest;const dr=DRUMR.has(x.p.role);voice(oc,dr?m:omus,x.p,x.at,x.ev.v,x.ev.st||0,d,ck);if(x.p.role==='kick')duck(opump.gain,x.at)}
 const b=await oc.startRendering(),out=[b.getChannelData(0),b.getChannelData(1)];let pk=0;for(const d of out)for(let i=0;i<d.length;i+=2)pk=Math.max(pk,Math.abs(d[i]));if(pk>.98)for(const d of out)for(let i=0;i<d.length;i++)d[i]*=.97/pk;
 const f=Math.floor(.005*sr);for(const d of out)for(let j=0;j<f;j++)d[d.length-1-j]*=j/f;return out}
function xList(){if($('psXw').value==='song'){if(!PS.song.length)throw new Error('The song is empty. Add patterns to it first.');return{list:PS.song,tag:'song'}}return{list:[PS.pat],tag:'P'+(PS.pat+1)}}
function vlq2(n){const b=[n&127];while(n>>=7)b.unshift((n&127)|128);return b}
function midiOut(list,rep){const ppq=96,evs=[];let off=0;for(let r=0;r<rep;r++)for(const i of list){const L=patLen(i);for(const e of PS.pats[i].ev){if(e.t>=L)continue;const n=clamp(36+e.p+(e.st||0),0,127),ch=e.b&15,on=Math.round((off+e.t)*ppq),du=Math.max(6,Math.round((e.d||.25)*ppq));
  evs.push([on,1,0x90|ch,n,clamp(Math.round(e.v*127),1,127)],[on+du,0,0x80|ch,n,0])}off+=L}
 evs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const us=Math.round(6e7/PS.bpm),tr=[0,0xFF,0x51,3,(us>>16)&255,(us>>8)&255,us&255];let last=0;
 for(const[t,,s,n,v]of evs){tr.push(...vlq2(t-last),s,n,v);last=t}tr.push(0,0xFF,0x2F,0);
 const h=[77,84,104,100,0,0,0,6,0,0,0,1,0,ppq],L=tr.length;return new Blob([new Uint8Array([...h,77,84,114,107,(L>>>24)&255,(L>>16)&255,(L>>8)&255,L&255,...tr])],{type:'audio/midi'})}

/* ---------- input handling ---------- */
function velOf(e,el){if(!PS.vel)return .9;const r=el.getBoundingClientRect();return .35+.65*clamp((e.clientY-r.top)/Math.max(1,r.height),0,1)}
function padAt(e){const el=document.elementFromPoint(e.clientX,e.clientY),p=el&&el.closest&&el.closest('.pp');return p&&$('psGrid').contains(p)?+p.dataset.j:null}
function padHandlers(el,j){
 el.onpointerdown=e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(x){}
  if(!PS.keys&&(HW.erase||HW.mute)){flash(j);HW.erase?hwEraseHit(PS.bank,j):hwMuteHit(PS.bank,j);return}
  if(PS.armed.length&&!PS.keys){if(PS.prog==='chop')setProg('kit',true);assignItems(j,PS.armed);return}
  if(PS.keys||PS.mode==='play'){if(!PS.keys)el.classList.add('hold');act.set(e.pointerId,{h:hit(PS.bank,j,velOf(e,el)),el});return}
  if(PS.mode==='edit'){PS.sel={b:PS.bank,j};renderPads();openEd();audition(PS.banks[PS.bank][j]);if(innerWidth<900)setTimeout(()=>$('psEd').scrollIntoView({behavior:'smooth',block:'nearest'}),50);return}
  pdrag={from:j,pid:e.pointerId,moved:false,x:e.clientX,y:e.clientY,tgt:null}};
 el.onpointermove=e=>{if(!pdrag||pdrag.pid!==e.pointerId)return;if(Math.hypot(e.clientX-pdrag.x,e.clientY-pdrag.y)>8)pdrag.moved=true;const t=padAt(e);$$('.pp.drop').forEach(x=>x.classList.remove('drop'));pdrag.tgt=t;if(t!=null&&t!==pdrag.from&&pdrag.moved)padEl[t].classList.add('drop')};
 const up=e=>{const a=act.get(e.pointerId);if(a){if(!['latch','cue'].includes(PS.banks[PS.bank][j]?.mode))a.el.classList.remove('hold');release(a.h);act.delete(e.pointerId)}
  if(pdrag&&pdrag.pid===e.pointerId){const d=pdrag;pdrag=null;$$('.pp.drop').forEach(x=>x.classList.remove('drop'));if(e.type==='pointercancel')return;
   if(d.moved&&d.tgt!=null&&d.tgt!==d.from){PS.swapSrc=null;swap(d.from,d.tgt)}
   else if(!d.moved){if(PS.swapSrc!=null&&PS.swapSrc!==d.from){const a2=PS.swapSrc;PS.swapSrc=null;swap(a2,d.from)}else{PS.swapSrc=PS.swapSrc===d.from?null:d.from;audition(PS.banks[PS.bank][d.from]);renderPads()}}}};
 el.onpointerup=up;el.onpointercancel=up;el.oncontextmenu=e=>e.preventDefault()}
function setBank(i){PS.bank=clamp(i,0,7);PS.swapSrc=null;renderBanks();renderPads();seqDraw();hint()}
function selPat(i){if(TR.playing){TR.next=(i===TR.seg.pat)?null:i}else{PS.pat=i;$('psBars').value=PS.pats[i].bars;followPart(i,0);seqDraw()}renderPats()}
function toggleKeys(){if(!PS.keys&&PS.prog==='chop'){const L=PS.lastHit,pad=L&&L.pad;if(!pad){msg('Play a pad first, then press 16 LEVELS to play that slice as notes.');return}PS.kp={b:L.b,j:L.j,pad,ci:L.ci};PS.keys=true;renderAll();return}
 if(!PS.keys){const s=PS.sel&&PS.banks[PS.sel.b][PS.sel.j]?PS.sel:PS.lastHit&&PS.banks[PS.lastHit.b][PS.lastHit.j]?PS.lastHit:null;
  if(!s){const f=findRole(['tone','stab','chain','group'],PS.bank)[0]||(()=>{const j=PS.banks[PS.bank].findIndex(Boolean);return j>=0?{b:PS.bank,j}:null})();if(!f){msg('Load some pads first, then pick one to play as an instrument.');return}PS.kp={b:f.b,j:f.j}}else PS.kp={b:s.b,j:s.j};PS.keys=true}
 else PS.keys=false;renderAll()}

/* ---------- build static UI ---------- */
function buildStatic(){
 const bk=$('psBanks'),pt=$('psPats');for(let i=0;i<8;i++){const b=document.createElement('button');b.className='bkb';b.innerHTML=BL[i]+'<small>'+BK[i]+'</small>';b.onclick=()=>setBank(i);bk.appendChild(b);
  const p=document.createElement('button');p.className='bkb';p.innerHTML='P'+(i+1)+'<small>'+PTK[i].toUpperCase()+'</small>';p.onclick=()=>selPat(i);pt.appendChild(p)}
 for(let i=8;i<NPAT;i++){const p=document.createElement('button');p.className='bkb hi';p.innerHTML='P'+(i+1)+'<small>&nbsp;</small>';p.onclick=()=>selPat(i);pt.appendChild(p)}
 const fl=$('psFilt');[['all','All'],['star','★ Sweet spots'],['kick','Kicks'],['snare','Snares'],['hat','Hats'],['tone','Tones'],['long','Long (1 beat+)']].forEach(([f,t])=>{const b=document.createElement('button');b.className='chipb';b.dataset.f=f;b.textContent=t;b.onclick=()=>{PS.binF=f;renderBin()};fl.appendChild(b)});
 const cl=$('peCol');COLS.forEach(c=>{const b=document.createElement('button');b.style.background=c;b.dataset.c=c;b.onclick=()=>edSet(p=>p.col=c);cl.appendChild(b)});
 for(let i=0;i<8;i++)$('peBk').add(new Option('Bank '+BL[i],i));for(let i=0;i<NPAT;i++)$('psPCp').add(new Option('P'+(i+1),i))
 NN.forEach((n,i)=>$('psRoot').add(new Option(n,i)));
 $$('.mb').forEach(b=>b.onclick=()=>{if(b.dataset.m!=='play'&&PS.prog==='chop')setProg('kit',true);PS.mode=b.dataset.m;PS.swapSrc=null;if(PS.mode!=='edit')PS.sel=PS.mode==='edit'?PS.sel:PS.sel;renderAll()});
 $('psRec').onclick=toggleRec;$('psPlay').onclick=()=>{if(!TR.playing)startT()};$('psStop').onclick=stopT;
 $('psBpm').onchange=e=>setBpm(e.target.value);$('psSyncB').onclick=()=>{setBpm(+songBpm().toFixed(1));msg('Tempo set to the song: '+PS.bpm+' BPM.')};
 $('psTap').onclick=()=>{const t=performance.now();taps=taps.filter(x=>t-x<2500);taps.push(t);if(taps.length>=3){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1);setBpm(Math.round(600000/iv)/10)}};
 $('psQ').onchange=e=>{PS.q=+e.target.value;dirty()};$('psSw').oninput=e=>{PS.swing=+e.target.value;$('psSwv').textContent=PS.swing;autoRec('sw',PS.swing);dirty()};
 $('psBars').onchange=e=>{pushUndo();PS.pats[PS.pat].bars=+e.target.value;seqDraw();renderPats();dirty()};
 $('psMet').onchange=e=>PS.metro=e.target.checked;$('psCi').onchange=e=>PS.countIn=e.target.checked;$('psVel').onchange=e=>PS.vel=e.target.checked;
 $('psKeys').onclick=toggleKeys;$('psChd').onclick=()=>{PS.chord=!PS.chord;renderAll()};
 $('psRoot').onchange=e=>{PS.keySet=true;PS.root=+e.target.value;renderPads();hint();dirty()};$('psScale').onchange=e=>{PS.keySet=true;PS.scale=e.target.value;renderPads();hint();dirty()};$('psOct').onchange=e=>{PS.oct=+e.target.value;renderPads()};
 $('psLay').onchange=e=>{PS.layout=e.target.value;renderPads();dirty()};$('psUndo').onclick=undo;
 $('psPerf').onclick=()=>perf(!$('tS').classList.contains('perf'));
 $('psMagicGo').onclick=magic;
 $('psGen').onclick=()=>{toKit();if(!PS.banks.some(B=>B.some(Boolean))){msg('Load some pads first (try 🪄 Build it or a Smart fill).');return}const n=smartBeat(PS.pat,{loops:findRole(['loop'],PS.bank).length>0&&VS().v%2===0,keys:findRole(['tone','stab'],PS.bank).length>0&&+$('psEn').value>55});seqDraw();renderPats();dirty();msg('🧠 Smart Beat wrote '+n+' hits into P'+(PS.pat+1)+' using your own pads. Change the Variation number in Beat Brain for a different take, or ↩ Undo.')};
 $('psQn').onclick=()=>{if(!PS.q){msg('Pick a quantize value first.');return}pushUndo();const P=PS.pats[PS.pat],L=P.bars*4,seen=new Set();P.ev=P.ev.filter(e=>{e.t=+((Math.round(e.t/PS.q)*PS.q)%L).toFixed(4);const k=e.b+':'+e.p+':'+e.st+':'+e.t;if(seen.has(k))return false;seen.add(k);return true});seqDraw();dirty();msg('Quantized P'+(PS.pat+1)+'.')};
 $('psPClr').onclick=()=>{pushUndo();PS.pats[PS.pat].ev=[];seqDraw();renderPats();dirty();msg('Cleared P'+(PS.pat+1)+' (↩ Undo brings it back).')};
 $('psPCp').onchange=e=>{const t=+e.target.value;if(e.target.value===''){return}pushUndo();PS.pats[t]=deep(cleanPats()[PS.pat]);e.target.value='';renderPats();dirty();msg('Copied P'+(PS.pat+1)+' to P'+(t+1)+'.')};
 $('psFol').onclick=e=>e.currentTarget.classList.toggle('on');
 $('psSeq').onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,yy=e.clientY-r.top,row=Math.floor(yy/RH);if(row<0||row>15)return;const p=AB()[PS.bank][row];if(x<LW){audition(p);return}
  const s=Math.floor((x-LW)/CW),P=PS.pats[PS.pat];if(s<0||s>=P.bars*16)return;pushUndo();const t0=s/4,k=P.ev.findIndex(ev=>evRow(ev)===row&&ev.t>=t0-1e-6&&ev.t<t0+.25-1e-6);
  if(k>=0)P.ev.splice(k,1);else{if(!p){seqDraw();return}const ne={t:t0,b:PS.bank,p:row,v:.9,st:0,d:p.mode==='latch'||p.mode==='loop'||p.mode==='cue'?(p.lb||4):0};if(p.chop){ne.pg='chop';ne.ci=p.ci}P.ev.push(ne);audition(p)}seqDraw();renderPats();dirty()};
 const box=$('psBin');
 box.onclick=e=>{if(suppress)return;const t=e.target.closest('.tl');if(!t)return;const it=t._it,k=PS.armed.findIndex(a=>a.src===it.src&&a.s===it.s);
  if(PS.chain){if(k>=0)PS.armed.splice(k,1);else{if(PS.armed.length&&PS.armed[0].src!==it.src)PS.armed=[];PS.armed.push(it)}}else PS.armed=k>=0&&PS.armed.length===1?[]:[it];
  audition(mkPad(it.src,[[it.s,it.e]],'',''));renderBin();hint()};
 box.onpointerdown=e=>{if(e.pointerType!=='mouse'||e.button!==0)return;const t=e.target.closest('.tl');if(!t)return;bdrag={it:t._it,x:e.clientX,y:e.clientY,on:false}};
 addEventListener('pointermove',e=>{if(!bdrag)return;if(!bdrag.on&&Math.hypot(e.clientX-bdrag.x,e.clientY-bdrag.y)>6){bdrag.on=true;ghost=document.createElement('div');ghost.className='psghost';const multi=PS.armed.length>1&&PS.armed.some(a=>a.s===bdrag.it.s);ghost.textContent=multi?'🔗 chain of '+PS.armed.length:'#'+(bdrag.it.i+1);document.body.appendChild(ghost)}
  if(bdrag.on){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';$$('.pp.drop').forEach(x=>x.classList.remove('drop'));const j=padAt(e);if(j!=null)padEl[j].classList.add('drop')}});
 addEventListener('pointerup',e=>{if(!bdrag)return;const d=bdrag;bdrag=null;if(!d.on)return;suppress=true;setTimeout(()=>suppress=false,0);if(ghost){ghost.remove();ghost=null}$$('.pp.drop').forEach(x=>x.classList.remove('drop'));
  const j=padAt(e);if(j!=null){const multi=PS.armed.length>1&&PS.armed.some(a=>a.s===d.it.s);assignItems(j,multi?PS.armed:[d.it])}});
 $('psSrc').onchange=e=>{PS.cur=e.target.value;PS.armed=[];renderBin();hint()};
 $('psChain').onclick=()=>{PS.chain=!PS.chain;if(!PS.chain&&PS.armed.length>1)PS.armed=[];renderBin();hint();if(PS.chain)msg('🔗 Chain: tap slices in the order you want them to play, then tap a pad (or Drop chain → next empty pad).')};
 $('psChainGo').onclick=()=>{if(!PS.armed.length){msg('Pick some slices first.');return}const j=nextEmpty();if(j<0){msg('This bank is full. Switch banks or clear a pad.');return}assignItems(j,PS.armed)};
 $('psDesel').onclick=()=>{PS.armed=[];renderBin();hint()};
 $('psAdd').onclick=()=>$('psAddF').click();
 $('psAddF').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;msg('Decoding '+f.name+'…');try{const b=await ac.decodeAudioData(await f.arrayBuffer()),nm=f.name.replace(/\.[^.]+$/,'').replace(/[^\w\-]+/g,'_');
  const C=[];for(let c=0;c<Math.min(2,b.numberOfChannels);c++)C.push(b.getChannelData(c).slice());PS.srcs[nm]={chs:C,len:C[0].length,main:false,sl:autoSlice(C,nm)};PS.cur=nm;PBUF.clear();renderBin();renderPads();msg('Added '+nm+' — '+PS.srcs[nm].sl.length+' slices. Any saved pads that use it work again.')}catch(x){msg('Could not read that file.')}};
 $('psFillGo').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{await fill($('psFill').value,$('psFrom').value)}catch(x){msg('Fill failed: '+(x.message||x))}b.disabled=false};
 $('psSongM').onclick=()=>{PS.songMode=!PS.songMode;renderSong();renderPats();dirty();msg(PS.songMode?(PS.song.length?'🎼 Song mode on: ▶ plays the song chain.':'Song mode is on, but the song is empty. Add patterns below.'):'Song mode off: ▶ loops the current pattern.')};
 $('psSongAdd').onclick=()=>{pushUndo();PS.song.push(PS.pat);renderSong();dirty()};$('psSongClr').onclick=()=>{pushUndo();PS.song=[];renderSong();dirty()};
 $('psXwav').onclick=e=>busy(e.currentTarget,async()=>{const{list,tag}=xList(),d=await renderMix(list,+$('psXr').value,tag==='song');return save(fname+'_'+tag+'.wav',new Blob([wav(d)],{type:'audio/wav'}))});
 $('psXmp3').onclick=e=>busy(e.currentTarget,async()=>{if(typeof lamejs==='undefined')throw new Error('The MP3 encoder could not load (it needs internet). Use WAV.');const{list,tag}=xList(),d=await renderMix(list,+$('psXr').value,tag==='song');return save(fname+'_'+tag+'.mp3',mp3(d,+$('kb').value))});
 $('psXmid').onclick=e=>busy(e.currentTarget,()=>{const{list,tag}=xList();return save(fname+'_'+tag+'.mid',midiOut(list,+$('psXr').value))});
 $('psXkit').onclick=e=>busy(e.currentTarget,()=>{const F=[],E=new TextEncoder();let txt='Pad Studio kit — bank '+BL[PS.bank]+'\nSource: '+PS.main+'\nTempo: '+PS.bpm+' BPM\n\n';
  PS.banks[PS.bank].forEach((p,j)=>{const b=padBuf(p);if(!b)return;const n=String(j+1).padStart(2,'0')+'_'+slug(p.name||'pad')+'.wav',d=[];for(let c=0;c<b.numberOfChannels;c++)d.push(b.getChannelData(c));F.push([n,wav(d)]);txt+='Pad '+(j+1)+' ('+PK[j].toUpperCase()+')  '+p.name+'  ['+p.mode+(p.tune?', tune '+p.tune:'')+']\n'});
  if(!F.length)throw new Error('This bank is empty.');F.push(['README.txt',E.encode(txt)]);return save(fname+'_bank'+BL[PS.bank]+'_kit.zip',zip(F))});
 $('psSv').onclick=()=>{const n=$('psSvN').value.trim()||('Setup '+new Date().toLocaleString());const all=LS.get('bcrps:saves')||{};all[n]={at:new Date().toISOString(),data:ser()};if(LS.set('bcrps:saves',all)){$('psSvN').value='';renderSaves();msg('Saved “'+n+'”.')}else msg('This browser blocked saving here. Use ⬇ Download project file instead.')};
 $('psDl').onclick=e=>busy(e.currentTarget,()=>save(fname+'_padstudio.json',new Blob([JSON.stringify(ser())],{type:'application/json'})));
 $('psOp').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const miss=applyProj(JSON.parse(await f.text()));msg('Opened '+f.name+'.'+(miss.size?' Missing audio: '+[...miss].join(', ')+'.':''))}catch(x){msg(x.message||'Could not open that file.')}};
 $('psEdX').onclick=()=>{PS.sel=null;renderPads();openEd()};
 $('peN').oninput=e=>edSet(p=>p.name=e.target.value.slice(0,24));$('peM').onchange=e=>edSet(p=>p.mode=e.target.value);$('peC').onchange=e=>edSet(p=>p.choke=+e.target.value);
 $('peG').oninput=e=>edSet(p=>p.gain=+e.target.value/100);$('peP').oninput=e=>edSet(p=>p.pan=+e.target.value/100);$('peT').oninput=e=>edSet(p=>p.tune=+e.target.value);
 $('peS').oninput=e=>edSet(p=>p.ts=+e.target.value);$('peE').oninput=e=>edSet(p=>p.te=+e.target.value);$('peR').onchange=e=>edSet(p=>p.rev=e.target.checked);$('peY').onchange=e=>edSet(p=>{p.sync=e.target.checked;p.bpm=p.bpm||songBpm()});
 ['peT','peS','peE','peG'].forEach(id=>$(id).addEventListener('change',()=>{const s=PS.sel;if(s)audition(PS.banks[s.b][s.j])}));
 $('peDup').onclick=()=>{const s=PS.sel,p=s&&PS.banks[s.b][s.j],j=PS.banks[s.b].findIndex(x=>!x);if(!p)return;if(j<0){msg('No empty pad in this bank.');return}pushUndo();PS.banks[s.b][j]=deep(p);renderPads();dirty();msg('Duplicated to pad '+(j+1)+'.')};
 $('peClr').onclick=()=>{const s=PS.sel;if(!s)return;pushUndo();PS.banks[s.b][s.j]=null;renderPads();openEd();seqDraw();dirty()};
 $('peBk').onchange=e=>{if(e.target.value==='')return;const t=+e.target.value;pushUndo();PS.banks[t]=deep(PS.banks[PS.bank]);e.target.value='';renderBanks();dirty();msg('Copied bank '+BL[PS.bank]+' to bank '+BL[t]+'.')};
 $('peBkClr').onclick=()=>{pushUndo();PS.banks[PS.bank]=emptyBank();PS.sel=null;renderAll();dirty();msg('Cleared bank '+BL[PS.bank]+' (↩ Undo brings it back).')};
 const T=$('tS');T.addEventListener('change',e=>{if(e.target.tagName==='SELECT')e.target.blur()});T.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setTimeout(()=>b.blur(),0)});
 djInit();brainInit();edgeInit();
 addEventListener('resize',()=>{if(PS.init)renderPads()});
 addEventListener('keydown',e=>{if(!PS.init||(window.psKeysOK?!psKeysOK():$('tS').hidden)||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase();
  if(k==='escape'&&T.classList.contains('perf')){perf(false);return}if(/INPUT|SELECT|TEXTAREA/.test((document.activeElement||{}).tagName||''))return;
  if(k===' '){e.preventDefault();if(!e.repeat)togglePlay();return}if(k==='enter'){e.preventDefault();if(!e.repeat)toggleRec();return}
  if(FXK[e.key]){e.preventDefault();if(!e.repeat)fxDown(FXK[e.key]);return}
  if(!e.repeat&&(k==='9'||k==='-'||k==='=')){e.preventDefault();kill(k==='9'?'lo':k==='-'?'mi':'hi');return}
  let i=PK.indexOf(k);if(i>=0){e.preventDefault();if(e.repeat||held.has(k))return;if(PS.armed.length&&!PS.keys){assignItems(i,PS.armed);return}held.set(k,hit(PS.bank,i,.9));return}
  if(e.repeat)return;i=BK.indexOf(k);if(i>=0){setBank(i);return}i=PTK.indexOf(k);if(i>=0){selPat(i);return}
  if(k==='arrowleft'){e.preventDefault();setBank((PS.bank+7)%8)}else if(k==='arrowright'){e.preventDefault();setBank((PS.bank+1)%8)}
  else if(k==='arrowup'){e.preventDefault();selPat(((TR.next??(TR.playing?TR.seg.pat:PS.pat))+7)%8)}else if(k==='arrowdown'){e.preventDefault();selPat(((TR.next??(TR.playing?TR.seg.pat:PS.pat))+1)%8)}
  else if(k==='backspace'){e.preventDefault();undo()}else if(k==='l')toggleKeys();else if(k==='0'){PS.metro=!PS.metro;$('psMet').checked=PS.metro;msg('Click '+(PS.metro?'on':'off'))}});
 addEventListener('keyup',e=>{if(!PS.init)return;const k=e.key.toLowerCase();if(FXK[e.key]){fxUp(FXK[e.key]);return}if(k===' ')e.preventDefault();const h=held.get(k);if(held.has(k)){held.delete(k);release(h)}});
}
function perf(on){const T=$('tS');T.classList.toggle('perf',on);const gd=$('gDock');if(gd)gd.classList.toggle('hid',on);$('psPerf').textContent=on?'✕ Exit full screen':'⛶ Full screen';document.documentElement.style.overflow=on?'hidden':'';
 if(on&&T.requestFullscreen)T.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});setTimeout(renderPads,60)}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&$('tS').classList.contains('perf'))perf(false)});

/* ---------- SWEET SPOTS: the music logic producers use when they pick a chop ---------- */
function sweet(){if(!slices.length||!env)return;const G=(()=>{let s=0;for(const v of env)s+=v;return s/env.length||1e-6})();let oi=0;const os=on||[];
 const sc=slices.map(x=>{while(oi<os.length-1&&os[oi+1].t<=x.t+.015)oi++;const o=os[oi],r=o&&Math.abs(o.t-x.t)<.02?o.r:0,du=(x.e-x.s)/sr,m=envMean(x.s,x.e)+1e-9,tail=envAt(Math.max(x.s,x.e-blk*4))/m,en=m/G;
  const v=clamp(r,0,4)/4*1.2+(1-clamp(tail,0,1))*.8+(x.clar||0)*.6+(du>=.12&&du<=1.2?.4:0)+clamp(en,0,2)*.3;x._sw=+(v/3.3).toFixed(3);return v});
 const thr=[...sc].sort((a,b)=>b-a)[Math.max(0,Math.floor(sc.length*.15)-1)]||1e9;slices.forEach((x,i)=>x._star=sc[i]>=thr)}
/* ---------- HOT CUES: jump points where the track changes section ---------- */
function hotCues(){const beat=60/songBpm(),bar=beat*4,b0=Math.max(0,barPhase),nb=Math.floor((y.length/sr-b0)/bar);if(nb<2)return[];
 const E=[],D=[];for(let k=0;k<nb;k++){const s=Math.floor((b0+k*bar)*sr),e=Math.floor((b0+(k+1)*bar)*sr);E.push(envMean(s,e));D.push(slices.filter(x=>x.s>=s&&x.s<e).length)}
 const mE=E.reduce((a,b)=>a+b,0)/nb||1e-9,mD=D.reduce((a,b)=>a+b,0)/nb||1,nov=E.map((e,k)=>k?Math.abs(e-E[k-1])/mE+.5*Math.abs(D[k]-D[k-1])/mD+(k%8===0?.35:k%4===0?.2:0):9);
 const order=nov.map((v,k)=>[v,k]).sort((a,b)=>b[0]-a[0]),pick=[];for(const[,k]of order){if(pick.length>=16)break;if(pick.some(q=>Math.abs(q-k)<4))continue;pick.push(k)}
 pick.sort((a,b)=>a-b);const S=PS.srcs[PS.main];
 return pick.map((k,i)=>{const s=snapMin(b0+k*bar,.01),e=Math.min(S.len,s+Math.round(8*bar*sr)),up=k&&E[k]>E[k-1];
  return mkPad(PS.main,[[s,e]],'CUE '+(i+1)+' · bar '+(k+1),'cue',{mode:'cue',choke:5,sync:true,bpm:songBpm(),lb:16,col:'#0ca678',why:k?'Section change at bar '+(k+1)+': the track gets '+(up?'bigger':'smaller')+(D[k]!==D[k-1]?' and the hit count changes':'')+(k%8===0?'; lands on an 8-bar boundary':k%4===0?'; lands on a 4-bar boundary':''):'Start of the track'})})}
/* ---------- capture (for rolls, backspins and printing) ---------- */
function extract(t0,t1){const n=Math.round((t1-t0)*sr);if(n<64||!REC.ch.length||REC.ch[0].t>t0+.002)return null;const L=new Float32Array(n),R=new Float32Array(n);let got=0;
 for(const c of REC.ch){const o=Math.round((c.t-t0)*sr);if(o>=n||o+c.l.length<=0)continue;const a=Math.max(0,-o),b=Math.min(c.l.length,n-o);L.set(c.l.subarray(a,b),o+a);R.set(c.r.subarray(a,b),o+a);got+=b-a}
 if(got<n*.9)return null;const f=Math.min(48,n>>3);for(let j=0;j<f;j++){const g=j/f;L[j]*=g;R[j]*=g;L[n-1-j]*=g;R[n-1-j]*=g}return[L,R]}
function bufOf(d){const b=ac.createBuffer(2,d[0].length,sr);b.copyToChannel(d[0],0);b.copyToChannel(d[1],1);return b}
/* ---------- DJ FX ---------- */
const FXL=[['r4','Roll 1/4','o'],['r8','Roll 1/8','p'],['r16','Roll 1/16','['],['r32','Roll 1/32',']'],['gate','Gate','; '.trim()],['echo','Echo',"'"],['spin','Backspin','.'],['stop','Tape stop','/']];
const FXK={};FXL.forEach(([id,,k])=>FXK[k]=id);const FXON=new Set(),ROLL={tok:0,src:null,id:null},RL={r4:1,r8:.5,r16:.25,r32:.125};
function fxMark(){$$('#psFxB .fx').forEach(b=>b.classList.toggle('on',FXON.has(b.dataset.id)))}
function fxDown(id){if(!ac)return;outN();resume();if(FXON.has(id))return;FXON.add(id);fxMark();
 if(RL[id])rollOn(RL[id],id);else if(id==='gate')gateOn();else if(id==='echo')echoOn();else if(id==='spin')spin();else if(id==='stop')tapeStop()}
function fxUp(id){if(!FXON.has(id))return;if(id==='spin'||id==='stop')return;FXON.delete(id);fxMark();
 if(RL[id]){if(ROLL.id===id)rollStop()}else if(id==='gate')gateOff();else if(id==='echo')echoOff()}
function rollStop(){ROLL.tok++;const t=ac?ac.currentTime:0;if(ROLL.src){try{ROLL.src.stop(t+.01)}catch(e){}ROLL.src=null}ROLL.id=null;if(FX){FX.duck.gain.cancelScheduledValues(t);FX.duck.gain.setTargetAtTime(1,t,.004)}}
function rollOn(Lb,id){if(ROLL.id)rollStop();const tok=++ROLL.tok;ROLL.id=id;const L=Lb*bd(),now=ac.currentTime;let T;
 if(TR.playing&&beatNow()>=0){T=TR.t0+Math.floor(beatNow()/Lb)*Lb*bd();if(now-T<.03)T-=L}else T=now-L-.04;
 setTimeout(()=>{if(ROLL.tok!==tok||!FXON.has(id))return;const d=extract(T,T+L);if(!d){msg('Roll needs a moment of sound playing first.');return}
  const s=ac.createBufferSource();s.buffer=bufOf(d);s.loop=true;let st=ac.currentTime+.012;if(TR.playing){st=TR.t0+Math.ceil((beatNow()+.015/bd())/Lb)*Lb*bd()}
  s.connect(FX.rg);s.start(st);ROLL.src=s;FX.duck.gain.cancelScheduledValues(st);FX.duck.gain.setTargetAtTime(0,st,.003)},Math.max(0,T+L-now)*1000+70)}
let gateT=null;
function gateOn(){const st=bd()/4,now=ac.currentTime;let t=TR.playing?TR.t0+Math.ceil(beatNow()*4+.01)/4*bd():now+.005;const g=FX.dry.gain;g.cancelScheduledValues(now);
 const run=()=>{const lim=ac.currentTime+.4;while(t<lim){g.setTargetAtTime(1,t,.002);g.setTargetAtTime(0,t+st*.5,.003);t+=st}};run();gateT=setInterval(run,150)}
function gateOff(){clearInterval(gateT);const t=ac.currentTime;FX.dry.gain.cancelScheduledValues(t);FX.dry.gain.setTargetAtTime(1,t,.004)}
function echoOn(){const t=ac.currentTime;FX.dl.delayTime.setValueAtTime(Math.min(3.9,bd()*.75),t);FX.fb.gain.setValueAtTime(.55,t);FX.snd.gain.setTargetAtTime(.75,t,.01)}
function echoOff(){const t=ac.currentTime;FX.snd.gain.setTargetAtTime(0,t,.02)}
function spin(){const L=bd(),now=ac.currentTime,d=extract(now-L-.05,now-.05);if(!d){FXON.delete('spin');fxMark();msg('Backspin needs a beat of sound first.');return}
 d[0].reverse();d[1].reverse();const s=ac.createBufferSource();s.buffer=bufOf(d);const t=now+.01,dur=L/1.6;s.playbackRate.setValueAtTime(2.4,t);s.playbackRate.linearRampToValueAtTime(.7,t+dur);s.connect(FX.rg);s.start(t);s.stop(t+dur+.05);
 FX.duck.gain.cancelScheduledValues(t);FX.duck.gain.setTargetAtTime(0,t,.004);const back=TR.playing?TR.t0+Math.ceil((t+dur-TR.t0)/bd())*bd():t+dur;FX.duck.gain.setTargetAtTime(1,back,.004);
 setTimeout(()=>{FXON.delete('spin');fxMark()},(back-now)*1000)}
function tapeStop(){const now=ac.currentTime,T=.85;for(const v of ALLV){try{const r=v.src.playbackRate;r.cancelScheduledValues(now);r.setValueAtTime(r.value,now);r.exponentialRampToValueAtTime(.03,now+T)}catch(e){}}
 if(ROLL.src){try{ROLL.src.playbackRate.setValueAtTime(1,now);ROLL.src.playbackRate.exponentialRampToValueAtTime(.03,now+T)}catch(e){}}
 FX.duck.gain.cancelScheduledValues(now);FX.duck.gain.setTargetAtTime(0,now+T*.6,.08);
 setTimeout(()=>{stopT();for(const v of ALLV)vStop(v,ac.currentTime,.01);ALLV.clear();rollStop();FX.duck.gain.setTargetAtTime(1,ac.currentTime+.05,.01);FXON.delete('stop');fxMark()},T*1000+60)}
function filterKnob(v){outN();const t=ac.currentTime;v=+v;FX.lp.frequency.setTargetAtTime(v<0?20000*Math.pow(180/20000,-v/100):22000,t,.03);FX.hp.frequency.setTargetAtTime(v>0?10*Math.pow(2500/10,v/100):10,t,.03);
 FX.lp.Q.value=v<0?1+(-v/100)*5:.9;FX.hp.Q.value=v>0?1+(v/100)*5:.9}
const KILL={lo:false,mi:false,hi:false,drum:false,mus:false};
function kill(k){outN();KILL[k]=!KILL[k];const t=ac.currentTime;if(k==='drum'||k==='mus')FX[k].gain.setTargetAtTime(KILL[k]?0:1,t,.008);else FX[k].gain.setTargetAtTime(KILL[k]?(k==='mi'?-28:-40):0,t,.01);
 $$('#psDJ .dk').forEach(b=>b.classList.toggle('on',KILL[b.dataset.k]))}
let lastPrint=null,printN=0;
function printToggle(){if(!ac)return;outN();resume();const b=$('psPrint');
 if(!REC.print){REC.pr=[];REC.print=true;b.classList.add('on');b.textContent='⏹ STOP PRINT';msg('⏺ Printing: everything you play, sequence and FX is being recorded.');return}
 REC.print=false;b.classList.remove('on');b.textContent='⏺ PRINT';const n=REC.pr.length*1024;if(n<sr*.3){msg('That print was too short.');return}
 const L=new Float32Array(n),R=new Float32Array(n);REC.pr.forEach(([l,r],i)=>{L.set(l,i*1024);R.set(r,i*1024)});REC.pr=[];
 let a=0;while(a<n-1&&Math.abs(L[a])<1e-4&&Math.abs(R[a])<1e-4)a++;let z=n;while(z>a+1&&Math.abs(L[z-1])<1e-4&&Math.abs(R[z-1])<1e-4)z--;const Lt=L.slice(a,z),Rt=R.slice(a,z);if(Lt.length<sr*.2){msg('The print was silent. Play something while printing.');return}
 const nm='Print_'+(++printN);PS.srcs[nm]={chs:[Lt,Rt],len:Lt.length,main:false,sl:autoSlice([Lt,Rt],nm)};lastPrint=[Lt,Rt];PS.cur=nm;$('psPrintDl').disabled=false;renderBin();
 msg('Printed '+(Lt.length/sr).toFixed(1)+' s as “'+nm+'”. It is in the slice bin as '+PS.srcs[nm].sl.length+' new slices: chop it again, or ⬇ save the WAV.')}
function djInit(){const g=$('psFxB');FXL.forEach(([id,t,k])=>{const b=document.createElement('button');b.className='fx';b.dataset.id=id;b.innerHTML=t+'<small>'+k.toUpperCase()+'</small>';
  b.onpointerdown=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(x){}fxDown(id)};const u=()=>fxUp(id);b.onpointerup=u;b.onpointercancel=u;b.oncontextmenu=e=>e.preventDefault();g.appendChild(b)});
 $('psFk').oninput=e=>{filterKnob(e.target.value);autoRec('flt',+e.target.value)};$('psFk0').onclick=()=>{$('psFk').value=0;filterKnob(0)};
 $$('#psDJ .dk').forEach(b=>b.onclick=()=>kill(b.dataset.k));
 $('psDeckX').onclick=()=>{const t=ac.currentTime;for(const o of LATCH.values())vStop(o.v,t,.03);LATCH.clear();padEl.forEach(e=>e&&e.classList.remove('hold'));msg('Stopped loops and cues.')};
 $('psPrintDl').onclick=e=>busy(e.currentTarget,()=>{if(!lastPrint)throw new Error('Nothing printed yet.');return save(fname+'_print_'+printN+'.wav',new Blob([wav(lastPrint)],{type:'audio/wav'}))})}

/* simple onset slicer for added sound files */
function autoSlice(C,nm){const x=C[0],n=x.length,hop=Math.round(sr*.005),ne=Math.floor(n/hop),e=new Float32Array(ne);for(let k=0;k<ne;k++){let s=0;for(let i=k*hop;i<(k+1)*hop;i++)s+=x[i]*x[i];e[k]=Math.sqrt(s/hop)}
 const fl=new Float32Array(ne);let m=0;for(let k=1;k<ne;k++){fl[k]=Math.max(0,e[k]-e[k-1]);m+=fl[k]}m/=ne;let sd=0;for(const v of fl)sd+=(v-m)**2;sd=Math.sqrt(sd/ne);
 const thr=m+1.4*sd,gap=Math.round(.08*sr/hop),b=[0];for(let k=2;k<ne-1;k++)if(fl[k]>thr&&fl[k]>=fl[k-1]&&fl[k]>=fl[k+1]&&k-b[b.length-1]/hop>gap){let q=k;while(q>1&&e[q-1]<e[q])q--;b.push(q*hop)}
 b.push(n);let out=[];for(let i=0;i<b.length-1;i++)if(b[i+1]-b[i]>sr*.04)out.push([b[i],b[i+1]]);
 if(out.length<4){out=[];const L=Math.floor(n/16);for(let i=0;i<16;i++)out.push([i*L,(i+1)*L])}
 return out.map(([s,e2],i)=>({src:nm,s,e:e2,kind:'',i}))}

/* =========== CONNECTIONS: hold-to-send, pick mode, global recorder =========== */
/* --- universal tap on everything that reaches the speakers (for REC takes + rolls) --- */
const TK={on:false,buf:[],takes:[],n:0,t0:0,play:null};let TAP=null;
const _con=AudioNode.prototype.connect;
function tapIn(ctx){if(TAP&&TAP.ctx===ctx)return TAP.g;const g=ctx.createGain(),sp=ctx.createScriptProcessor(1024,2,2),z=ctx.createGain();z.gain.value=0;z._noRec=1;sp._noRec=1;
 _con.call(g,sp);_con.call(sp,z);_con.call(z,ctx.destination);
 sp.onaudioprocess=e=>{const ib=e.inputBuffer,l=ib.getChannelData(0).slice(),r=(ib.numberOfChannels>1?ib.getChannelData(1):ib.getChannelData(0)).slice();REC.ch.push({t:ctx.currentTime-l.length/ctx.sampleRate,l,r});while(REC.ch.length*1024>ctx.sampleRate*10)REC.ch.shift();if(TK.on)TK.buf.push([l,r])};
 TAP={ctx,g,sp};return g}
AudioNode.prototype.connect=function(d,...a){try{if(d&&typeof AudioDestinationNode!=='undefined'&&d instanceof AudioDestinationNode&&!this._noRec&&!(typeof OfflineAudioContext!=='undefined'&&d.context instanceof OfflineAudioContext)){_con.call(this,masterIn(d.context),...a);return d}}catch(e){}return _con.call(this,d,...a)};
const fmtT=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
let curTab='A',lastSrcTab='A';const TABN={A:'Chopper',P:'Play',C:'Produce',D:'Piano',E:'Parts',G:'Groups',S:'Pad Studio'};
function recToggle(){if(!ac){toast('Load a song first.');return null}resume();
 if(!TK.on){TK.buf=[];TK.on=true;TK.t0=ac.currentTime;TK.tab=TABN[curTab];uiRec();return null}
 TK.on=false;const n=TK.buf.length*1024;const L=new Float32Array(n),R=new Float32Array(n);TK.buf.forEach(([l,r],i)=>{L.set(l,i*1024);R.set(r,i*1024)});TK.buf=[];uiRec();
 let a=0;while(a<n-1&&Math.abs(L[a])<1e-4&&Math.abs(R[a])<1e-4)a++;let z=n;while(z>a+1&&Math.abs(L[z-1])<1e-4&&Math.abs(R[z-1])<1e-4)z--;
 if(z-a<sr*.2){toast('Nothing was playing, so the take was empty.');return null}
 const tk={id:++TK.n,name:'Take_'+TK.n,tab:TK.tab,L:L.slice(a,z),R:R.slice(a,z)};tk.dur=tk.L.length/sr;TK.takes.unshift(tk);renderTakes();
 toast('Saved Take '+tk.id+' ('+tk.dur.toFixed(1)+' s, from '+tk.tab+').',[['⬇ WAV',()=>busy($('gTk'),()=>save(fname+'_'+tk.name+'.wav',new Blob([wav([tk.L,tk.R])],{type:'audio/wav'})))],['➕ Slice bin',()=>takeToBin(tk)],['All takes',()=>{if(window.goPage)goPage('song');renderTakes()}]]);return tk}
function uiRec(){const b=$('gRec');b.classList.toggle('on',TK.on);if(!b.dataset.hw)b.textContent=TK.on?'⏹ STOP':'⏺ REC';const p=$('psPrint');if(p){p.classList.toggle('on',TK.on);p.textContent=TK.on?'⏹ STOP PRINT':'⏺ PRINT'}}
setInterval(()=>{if(TK.on&&ac)$('gRecT').textContent='● '+fmtT(ac.currentTime-TK.t0)+' · '+TK.tab;else $('gRecT').textContent=''},250);
function takeToBin(tk){const nm=tk.name;PS.srcs[nm]={chs:[tk.L,tk.R],len:tk.L.length,main:false,sl:autoSlice([tk.L,tk.R],nm)};PS.cur=nm;if(window.goPage)goPage('sounds');else tab('S');PS.cur=nm;renderBin();msg(nm+' is in the slice bin as '+PS.srcs[nm].sl.length+' slices. Tap to hear, then tap or hold to load pads.')}
function renderTakes(){const c=$('gTkL');c.textContent='';$('gTk').textContent='🎙 Takes ('+TK.takes.length+')';if(!TK.takes.length){c.innerHTML='<div class="mt">No takes yet. Press ⏺ REC on any tab, play, then press ⏹.</div>';return}
 for(const tk of TK.takes){const r=document.createElement('div');r.className='svr';r.innerHTML='<b></b><span class="mt"></span><button data-a="p">▶</button><button data-a="w">⬇ WAV</button><button data-a="m">⬇ MP3</button><button data-a="b">➕ Slice bin</button><button data-a="x">✕</button>';
  r.querySelector('b').textContent=tk.name;r.querySelector('.mt').textContent=tk.dur.toFixed(1)+' s · '+tk.tab;
  r.onclick=e=>{const a=e.target.dataset.a;if(!a)return;
   if(a==='p'){if(TK.play){try{TK.play.stop()}catch(x){}const was=TK.play._id;TK.play=null;if(was===tk.id)return}resume();const b=ac.createBuffer(2,tk.L.length,sr);b.copyToChannel(tk.L,0);b.copyToChannel(tk.R,1);const s=ac.createBufferSource();s.buffer=b;s._noRec=1;s.connect(ac.destination);s._id=tk.id;s.onended=()=>{if(TK.play===s)TK.play=null};s.start();TK.play=s}
   else if(a==='w')busy(e.target,()=>save(fname+'_'+tk.name+'.wav',new Blob([wav([tk.L,tk.R])],{type:'audio/wav'})));
   else if(a==='m')busy(e.target,()=>{if(typeof lamejs==='undefined')throw new Error('The MP3 encoder needs internet. Use WAV.');return save(fname+'_'+tk.name+'.mp3',mp3([tk.L,tk.R],+$('kb').value||192))});
   else if(a==='b')takeToBin(tk);else if(a==='x'){TK.takes=TK.takes.filter(t=>t!==tk);renderTakes()}};c.appendChild(r)}}
/* --- toast --- */
let toastT=null;function toast(t,btns){const el=$('gToast');el.textContent='';const s=document.createElement('span');s.textContent=t;el.appendChild(s);(btns||[]).forEach(([lab,fn])=>{const b=document.createElement('button');b.textContent=lab;b.onclick=()=>{el.hidden=true;fn()};el.appendChild(b)});el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,btns&&btns.length?7000:4500)}
/* --- resolve a held element into a sound --- */
function abSrc(ab,name){let nm=('Snd_'+(name||'sound')).replace(/[^\w\-]+/g,'_').slice(0,28),k=2;while(PS.srcs[nm])nm=nm.replace(/_\d+$/,'')+'_'+k++;
 const C=Array.isArray(ab)?ab:[...Array(ab.numberOfChannels)].map((_,c)=>ab.getChannelData(c).slice());PS.srcs[nm]={chs:C,len:C[0].length,main:false,sl:[{src:nm,s:0,e:C[0].length,kind:'',i:0}]};return nm}
const LR={KICK:'kick',SNARE:'snare',HAT:'hat',OPEN:'open',PERC:'perc',STAB:'stab',LONG:'long'};
function mainSnd(s,e,name,x){mainFresh();return Object.assign({src:PS.main,seg:[[s,e]],name},x||{})}
function soundAt(el){
 if(!el||!el.closest)return null;let t;
 if((t=el.closest('#pads button'))){const i=+t.textContent-1,s=slices[i];return s&&mainSnd(s.s,s.e,(s.kind?s.kind.toUpperCase()+' ':'#')+(i+1),{role:KIND2ROLE[s.kind]||'',midi:s.clar>.6?s.midi:undefined,from:'Chopper slice #'+(i+1)})}
 if((t=el.closest('#psBin .tl'))&&t._it){const it=t._it;return{src:it.src,seg:[[it.s,it.e]],name:(it.kind?it.kind.toUpperCase()+' ':'#')+(it.i+1),role:KIND2ROLE[it.kind]||'',midi:it.midi,from:'slice bin #'+(it.i+1)}}
 if((t=el.closest('#pg .pad'))){const j=PL.padEl.indexOf(t),arr=PL.bank==='drums'?PL.pads:PL.bank==='groups'?(PL.gpads||[]):PL.chops,p=arr[j];if(!p)return null;
  const role=LR[(p.label||'').split(' ')[0]]||(PL.bank==='chops'?'chain':PL.bank==='groups'?'group':'');if(p.ab)return{src:abSrc(p.ab,p.label),seg:null,name:p.label,role,from:'Play pad'};return mainSnd(p.s,p.e,p.label,{role,choke:p.grp==='hat'?1:PL.bank==='chops'?3:0,from:'Play pad '+p.label})}
 if((t=el.closest('#lays .key'))){const L=LAYERS.find(x=>x.ks&&x.ks.contains(t)),s=L&&L.list&&L.list[L.i];if(!s)return null;const m=notesFor({...L,chord:false},+t.dataset.d)[0],nat=natM(s)!==undefined?natM(s):L.base-L.base%12+PL.root;
  return mainSnd(s.s,s.e,L.name+' '+nn(Math.round(m)),{role:'tone',midi:s.midi,tune:clamp(Math.round(m-nat),-24,24),mode:L.hold?'gate':'one',from:'Play '+L.name+' key'})}
 if((t=el.closest('#lays .lh .ls'))){const L=LAYERS.find(x=>x.el&&x.el.contains(t)),s=L&&L.list&&L.list[L.i];return s?mainSnd(s.s,s.e,L.name+' sound',{role:'tone',midi:s.midi,mode:L.hold?'gate':'one',from:'Play '+L.name}):null}
 if((t=el.closest('#zk .wk,#zk .bk'))){const m=+t.dataset.m;let s=PNO.slice?pnMap().get(m):null;if(!s)s=PNO.list[PNO.i];if(!s)return null;const nat=natM(s)!==undefined?natM(s):48+PL.root,tune=PNO.slice?0:clamp(Math.round(m-nat),-24,24);
  const base=s.ab?{src:abSrc(s.ab,s.name||'piano'),seg:null}:{src:(mainFresh(),PS.main),seg:[[s.s,s.e]]};return Object.assign(base,{name:'PIANO '+nn(m),role:'tone',midi:s.midi,tune,mode:PNO.hold?'gate':'one',from:'Piano key '+nn(m)})}
 if((t=el.closest('#zpl'))){const s=PNO.list[PNO.i];if(!s)return null;return s.ab?{src:abSrc(s.ab,'piano'),seg:null,name:'PIANO sound',role:'tone',midi:s.midi,from:'Piano sound'}:mainSnd(s.s,s.e,'PIANO sound',{role:'tone',midi:s.midi,from:'Piano sound'})}
 if((t=el.closest('#glist .gc2'))||(t=el.closest('#gpads button'))){let g=null;if(t.dataset.id)g=gById(t.dataset.id);else{const k=[...$('gpads').children].indexOf(t),id=GS.pads[k];g=id&&gById(id)}
  if(!g||!g.members||!g.members.length)return null;mainFresh();return{src:PS.main,seg:mergeSegs(g.members.map(m=>({s:m.start_sample,e:m.end_sample}))),name:g.name||'GROUP',role:'group',choke:3,from:'Group '+(g.name||'')}}
 if((t=el.closest('#eparts > div'))&&STM.rows){const r=STM.rows[[...$('eparts').children].indexOf(t)];if(!r)return null;const q=slices[r.i-1],a=$('eaud').value;
  if(a==='mix'||!STM.st)return mainSnd(q.s,q.e,'PART #'+r.i+' '+r.lab,{role:r.top==='drum'?'perc':'tone',from:'Parts row #'+r.i});
  const ks=a==='drum'?['kick','snare','hat']:[a],o=q.s-STM.i0;return{src:abSrc(segOf(ks,o,q.e-q.s),a+'_'+r.i),seg:null,name:a.toUpperCase()+' #'+r.i,role:a==='drum'?'perc':'tone',from:'Parts '+a+' stem, slice #'+r.i}}
 if((t=el.closest('#estems > div'))&&STM.st){const k=SN[[...$('estems').children].indexOf(t)];if(!k)return null;return{src:abSrc(STM.st[k],'stem_'+k),seg:null,name:'STEM '+k.toUpperCase(),role:'loop',mode:'latch',choke:4,from:'Parts '+k+' stem (also added to the slice bin)'}}
 if((t=el.closest('#psGrid .pp'))&&!PS.keys){const p=AB()[PS.bank][+t.dataset.j];return p?{pad:p,src:p.src,seg:p.seg,name:p.name,role:p.role,midi:p.midi,from:'pad '+BL[PS.bank]+(+t.dataset.j+1)}:null}
 return null}
function toPad(snd){if(snd.pad)return deep(snd.pad);let seg=snd.seg;if(!seg){const S=PS.srcs[snd.src];seg=[[0,S.len]]}
 return mkPad(snd.src,seg,(snd.name||'SOUND').slice(0,24),snd.role||'',{midi:snd.midi,tune:snd.tune||0,mode:snd.mode||'one',choke:snd.choke??(snd.role==='hat'||snd.role==='open'?1:0),why:'Loaded from '+(snd.from||'another tab')})}
function toInstrument(snd){const p=toPad(snd);let s;if(p.src===PS.main&&p.seg.length===1&&!p.tune)s={s:p.seg[0][0],e:p.seg[0][1]};else s={s:0,e:1,ab:padBuf(p)};
 s.midi=p.midi;s.clar=p.midi!==undefined?.9:0;s.en=1;s.name=p.name;return s}
/* --- targets --- */
let PICK=null;
function targetAt(el){let t;if(!el||!el.closest)return null;
 if((t=el.closest('#psGrid .pp'))&&!PS.keys){const j=+t.dataset.j;if(PS.prog!=='chop'&&(!PS.banks[PS.bank][j]||PS.mode!=='play'))return{kind:'pad',b:PS.bank,j}}
 if(el.closest('#zpk'))return{kind:'piano'};
 if((t=el.closest('#lays .lh b'))){const L=LAYERS.find(x=>x.el&&x.el.contains(t));if(L)return{kind:'layer',id:L.id}}
 return null}
const tName=T=>T.kind==='pad'?'pad '+BL[T.b]+String(T.j+1).padStart(2,'0'):T.kind==='piano'?'the Piano':'the '+(LAYERS.find(l=>l.id===T.id)||{}).name+' layer';
const oneCol=()=>innerWidth<1100;
function startPick(T){if(T.kind==='pad'&&window.OS&&OS.pick){OS.pick(T.b,T.j);return}PICK=T;PICK.cand=null;if($('gPickGo'))$('gPickGo').hidden=true;let go=lastSrcTab||'A';if(T.kind==='layer'&&go==='P')go='A';$('gPick').hidden=false;$('gPickT').textContent='🎯 Choosing a sound for '+tName(T)+'. Tap sounds to hear them, then press the yellow button — or hold one for ½ second to load it straight away.';
 if(T.kind==='pad'&&PS.init&&!$('tS').hidden&&$('tS').classList.contains('perf'))perf(false);
 (window.goPage?goPage(({A:'chop',P:'live',E:'parts',G:'groups'})[go]||'chop'):tab(go));try{renderPads()}catch(e){}if(oneCol())setTimeout(()=>$('screenWrap')&&$('screenWrap').scrollIntoView({behavior:'smooth',block:'start'}),60);setTimeout(()=>{const el=go==='A'?$('pads'):go==='P'?$('pg'):go==='G'?$('glist'):go==='E'?$('eparts'):go==='D'?$('zk'):null;if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},120)}
function endPick(){PICK=null;$('gPick').hidden=true;try{renderPads()}catch(e){}}
function deliver(snd,T){
 if(T.kind==='pad'){ensurePS();if(PS.prog==='chop')setProg('kit',true);pushUndo();PS.banks[T.b][T.j]=toPad(snd);dirty();tab('S');setBank(T.b);PS.sel=PS.mode==='edit'?{b:T.b,j:T.j}:PS.sel;renderAll();const el=padEl[T.j];if(el){el.scrollIntoView({behavior:'smooth',block:oneCol()?'center':'nearest'});el.classList.add('drop');setTimeout(()=>el.classList.remove('drop'),900)}audition(PS.banks[T.b][T.j]);
  toast('Loaded '+snd.name+' into pad '+BL[T.b]+String(T.j+1).padStart(2,'0')+'.',[['↩ Undo',undo]])}
 else if(T.kind==='piano'){const s=toInstrument(snd);PNO.list.unshift(s);PNO.i=0;tab('D');pnUI();toast('The Piano now plays '+snd.name+'.')}
 else if(T.kind==='layer'){const L=LAYERS.find(l=>l.id===T.id),s=toInstrument(snd);L.list=L.list||[];L.list.unshift(s);L.i=0;tab('P');lab(L);keysFor(L);toast(L.name+' now plays '+snd.name+'.')}}
function ensurePS(){if(!PS.init)psInit()}
function quickSend(snd){ensurePS();const B=PS.banks[PS.bank];let j=B.findIndex(p=>!p);if(j<0){toast('Bank '+BL[PS.bank]+' is full. Hold an empty pad in another bank, or switch banks in Pad Studio.',[['Open Pad Studio',()=>tab('S')]]);return}
 pushUndo();B[j]=toPad(snd);dirty();renderAll();
 toast('Sent '+snd.name+' → pad '+BL[PS.bank]+String(j+1).padStart(2,'0'),[['Go to pad',()=>{tab('S');const el=padEl[j];if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}],['↩ Undo',()=>{undo();}]])}
/* --- long-press engine --- */
const LP_SEL='#pads button,#psBin .tl,#pg .pad,#lays .key,#lays .lh .ls,#lays .lh b,#zk .wk,#zk .bk,#zpl,#zpk,#glist .gc2,#gpads button,#eparts > div,#estems > div,#psGrid .pp';
let LPS=null,lpFired=0;
document.addEventListener('pointerdown',e=>{if(e.button>0)return;const el=e.target.closest&&e.target.closest(LP_SEL);if(!el||!ac)return;const x=e.clientX,y0=e.clientY,tgt=e.target;
 const tl=el.closest('#zk')?el:el;LPS={el,x,y:y0,id:e.pointerId,tm:setTimeout(()=>fire(tgt,el),450)};el.classList.add('lpress')},true);
const lpCancel=()=>{if(LPS){clearTimeout(LPS.tm);LPS.el.classList.remove('lpress');LPS=null}};
document.addEventListener('pointermove',e=>{if(LPS&&LPS.id===e.pointerId&&Math.hypot(e.clientX-LPS.x,e.clientY-LPS.y)>12)lpCancel()},true);
document.addEventListener('pointerup',lpCancel,true);document.addEventListener('pointercancel',lpCancel,true);
document.addEventListener('click',e=>{if(Date.now()-lpFired<600){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest(LP_SEL))e.preventDefault()},true);
document.addEventListener('click',e=>{if(!PICK||Date.now()-lpFired<600)return;const t=e.target;if(!t.closest||t.closest('#gPick'))return;const el=t.closest(LP_SEL);if(!el||targetAt(t))return;const snd=soundAt(t);if(!snd)return;PICK.cand=snd;const g=$('gPickGo');if(g){g.hidden=false;g.textContent='Put “'+snd.name+'” on '+tName(PICK)}});
function fire(tgt,el){if(!LPS)return;LPS.el.classList.remove('lpress');LPS=null;lpFired=Date.now();if(navigator.vibrate)try{navigator.vibrate(25)}catch(x){}
 if(PICK){const snd=soundAt(tgt);if(snd){const T=PICK;endPick();deliver(snd,T);return}}
 const T=targetAt(tgt);if(T){startPick(T);return}
 const snd=soundAt(tgt);if(snd){if(el.closest('#psGrid'))return;quickSend(snd)}}
/* --- UI --- */
function glUI(){const d=document.createElement('div');d.innerHTML=`<div id="gPick" class="gbar" hidden><span id="gPickT"></span><div class="gtabs"><button data-t="A">🎛️ Chopper</button><button data-t="P">🎹 Play</button><button data-t="D">🎹 Piano</button><button data-t="E">🧬 Parts</button><button data-t="G">🧩 Groups</button><button data-t="S">🥁 Slice bin</button><button id="gPickX">✕ Cancel</button></div></div>
<div id="gToast" hidden></div>
<div id="gDock"><button id="gRec" class="psb rec">⏺ REC</button><span id="gRecT" class="mt"></span><span class="sp"></span><button id="gTk">🎙 Takes (0)</button><button id="gPS">🥁 Pad Studio</button></div>
<div id="gTakes" class="card" hidden><div class="h"><b style="color:var(--fg)">🎙 Takes — recorded from any tab</b><button id="gTkX" style="padding:2px 9px">✕</button></div><div id="gTkL"></div></div>`;
 while(d.firstChild)document.body.appendChild(d.firstChild);
 $('gRec').onclick=recToggle;$('gTk').onclick=()=>{$('gTakes').hidden=!$('gTakes').hidden;renderTakes()};$('gTkX').onclick=()=>$('gTakes').hidden=true;$('gPS').onclick=()=>tab('S');
 $('gPickX').onclick=endPick;{const go=document.createElement('button');go.id='gPickGo';go.className='p';go.hidden=true;go.onclick=e=>{e.stopPropagation();if(PICK&&PICK.cand){const T=PICK,s2=PICK.cand;endPick();deliver(s2,T)}};$('gPickT').after(go)}$$('#gPick .gtabs [data-t]').forEach(b=>b.onclick=()=>{tab(b.dataset.t);if(b.dataset.t==='S')setTimeout(()=>$('psBin').scrollIntoView({behavior:'smooth',block:'center'}),100)});
 // section hints + explicit pick buttons
 const hint=(after,html)=>{const el=$(after);if(!el)return;const h=document.createElement('div');h.className='h gh';h.innerHTML='<span>'+html+'</span>';el.parentNode.insertBefore(h,el.nextSibling)};
 hint('pads','<b>Hold</b> a slice for ½ s to send it to Pad Studio, or to the pad you are picking for.');
 hint('pg','<b>Hold</b> a pad or key to send that sound to Pad Studio. <b>Hold</b> a layer name (LEAD / CHORDS / BASS) to load a different sound into it.');
 hint('zi','<b>Hold</b> a piano key to send that note to a pad. Tap 🎯 to load any sound into the Piano.');
 hint('gpads','<b>Hold</b> a group or group pad to send it to Pad Studio.');
 hint('eparts','<b>Hold</b> a row or stem to send it to Pad Studio. A stem goes in as a whole loop.');
 const pk=document.createElement('button');pk.id='zpk';pk.textContent='🎯 Load sound';pk.onclick=()=>startPick({kind:'piano'});$('zpn').after(pk);
 const ep=document.createElement('button');ep.id='pePick';ep.textContent='🎯 Pick a sound for this pad';ep.onclick=()=>{if(PS.sel)startPick({kind:'pad',b:PS.sel.b,j:PS.sel.j})};$('peDup').before(ep);
 $('psPrint').onclick=()=>{const tk=recToggle();if(tk){const nm=tk.name;PS.srcs[nm]={chs:[tk.L,tk.R],len:tk.L.length,main:false,sl:autoSlice([tk.L,tk.R],nm)};PS.cur=nm;lastPrint=[tk.L,tk.R];$('psPrintDl').disabled=false;renderBin();msg('Printed '+tk.dur.toFixed(1)+' s as “'+nm+'”. It is in the slice bin as new slices, and in 🎙 Takes.')}};
 const app=$('app');const sh=()=>{$('gDock').style.display=app.hidden?'none':'flex'};sh();new MutationObserver(sh).observe(app,{attributes:true,attributeFilter:['hidden']})}
glUI();

/* ================= BEAT BRAIN: song intelligence + smart sound packs ================= */
/* 1. measure every sound */
const FEAT=new WeakMap();
function featPad(p){const b=padBuf(p);if(!b)return null;if(FEAT.has(b))return FEAT.get(b);const d=b.getChannelData(0),n=d.length,step=Math.max(1,n>>14);let pk=0,pi=0,e=0,zc=0,lo=0,lp=0,c=0;const a=Math.exp(-2*Math.PI*150/sr);
 for(let i=0;i<n;i+=step){const v=d[i];const av=Math.abs(v);if(av>pk){pk=av;pi=i}e+=v*v;c++}
 for(let i=1;i<Math.min(n,sr*.6);i++){if((d[i]>=0)!==(d[i-1]>=0))zc++;lp=a*lp+(1-a)*d[i];lo+=lp*lp}
 let e6=0;for(let i=0;i<Math.min(n,sr*.6);i++)e6+=d[i]*d[i];const m=Math.min(n,sr*.6);
 const f={dur:n/sr,rms:Math.sqrt(e/c),peak:pk,att:pi/sr,bright:zc/(m/sr)/2,low:e6?lo/e6:0,midi:p.midi};FEAT.set(b,f);return f}
/* 2. what is each sound for? */
function roleOf(p,f){const r=p.role||'';if(r==='cue')return null;if(r==='loop'||p.mode==='latch')return'loop';if(r==='chain'||r==='group')return'chop';
 if(r==='kick'||r==='snare'||r==='hat'||r==='open'||r==='perc')return r;
 if(f){if((r==='tone'||r==='stab'||r==='')&&f.midi!==undefined&&f.midi<52&&f.low>.35&&f.dur>.25)return'bass';if(r==='tone'||r==='stab')return'keys';
  if(f.dur>1.5)return'fx';if(f.low>.5&&f.att<.03&&f.dur<1.2)return'kick';if(f.bright>4500&&f.dur<.35)return f.dur>.18?'open':'hat';if(f.att<.02&&f.dur<.6)return f.bright>1800?'snare':'perc';if(f.midi!==undefined)return'keys'}
 return r==='long'?'fx':'perc'}
function kitMap(src){const K={kick:[],snare:[],hat:[],open:[],perc:[],bass:[],keys:[],chop:[],loop:[],fx:[]};
 const banks=src==='all'?[0,1,2,3,4,5,6,7]:[+src];
 for(const b of banks)PS.banks[b].forEach((p,j)=>{if(!p)return;const f=featPad(p),r=roleOf(p,f);if(r&&K[r])K[r].push({b,j,p,f})});
 const loud=x=>x.f?x.f.rms:0;for(const k in K)K[k].sort((a,b)=>loud(b)-loud(a));
 K.chop.sort((a,b)=>(a.p.seg[0][0])-(b.p.seg[0][0]));return K}
function inKey(m){if(m===undefined)return true;const sc=SCALES[PS.scale]||SCALES.min;return sc.includes((((Math.round(m)-PS.root)%12)+12)%12)}
function kitReport(K){const have=Object.entries(K).filter(([,v])=>v.length).map(([k,v])=>v.length+' '+k),miss=['kick','snare','hat','bass','keys','chop'].filter(k=>!K[k].length);
 const outKey=[...K.keys,...K.bass].filter(x=>x.p.midi!==undefined&&!inKey(x.p.midi)).length;
 let t='Key '+NN[PS.root]+' '+(PS.scale==='maj'?'major':PS.scale==='min'?'minor':PS.scale)+' · '+PS.bpm+' BPM. Found: '+(have.join(', ')||'nothing yet')+'.';
 if(miss.length)t+=' Missing: '+miss.join(', ')+(miss.includes('bass')?' (a tuned kick will stand in as the 808)':'')+(miss.includes('keys')&&K.chop.length?' (chops will carry the melody)':'')+'.';
 if(outKey)t+=' '+outKey+' tuned sound'+(outKey>1?'s are':' is')+' outside the key; the brain only plays them on in-key notes.';return t}
/* 3. note math: scale degree -> semitone offset for a pad */
function degSt(p,deg,oct){const sc=SCALES[PS.scale]||SCALES.min,n=sc.length,pm=p.midi!==undefined?Math.round(p.midi):48+PS.root,base=pm-(((pm-PS.root)%12)+12)%12;
 let m=base+12*Math.floor(deg/n)+sc[((deg%n)+n)%n]+12*(oct||0);while(m-pm>7)m-=12;while(m-pm<-7)m+=12;return clamp(m-pm,-24,24)}
const PROGS={min:[[0,5,2,6],[0,3,4,0],[0,6,5,6],[0,2,5,4],[0,5,3,4]],maj:[[0,4,5,3],[0,5,3,4],[0,3,4,4],[5,3,0,4]]};
/* 4. write a section, the way a producer would */
const SEC={intro:{kick:0,snare:0,hat:.3,bass:0,keys:1,chop:.6,loop:1,perc:0,en:.3},verse:{kick:1,snare:1,hat:.7,bass:1,keys:.4,chop:.7,loop:0,perc:.5,en:.6},
 hook:{kick:1,snare:1,hat:1,bass:1,keys:1,chop:1,loop:.5,perc:1,en:1},bridge:{kick:0,snare:.5,hat:.4,bass:0,keys:1,chop:1,loop:1,perc:0,en:.45},outro:{kick:.5,snare:0,hat:.5,bass:.5,keys:1,chop:.8,loop:1,perc:0,en:.35}};
function writeSection(pi,secName,K,o){const S=SEC[secName],P=PS.pats[pi],bars=P.bars=4,R=rng(o.seed),sty=STY[o.style]||STY.det,ev=[],en=clamp(o.energy*S.en*1.3,0,1);
 const add=(x,t,v,st,d)=>{if(x&&t>=0&&t<bars*4-1e-6)ev.push({t:+t.toFixed(4),b:x.b,p:x.j,v:+clamp(v,.08,1).toFixed(2),st:st||0,d:d||0})};
 const kk=K.kick[0],k2=K.kick[1]||kk,sn=K.snare[0],cl=K.snare[1],hh=K.hat[0],h2=K.hat[1]||hh,oh=K.open[0],pc=K.perc,ky=K.keys.filter(x=>x.p.midi!==undefined)[0]||K.keys[0],ky2=K.keys[1];
 let bs=K.bass[0];if(!bs&&kk&&S.bass&&o.sub){bs=kk;if(!kk.p.choke){kk.p.choke=2}}
 if(bs&&!bs.p.choke)bs.p.choke=2;
 const prog=o.prog,kA=sty.k[o.kv%sty.k.length],kB=sty.k[(o.kv+1)%sty.k.length];
 const chopRun=(()=>{if(!K.chop.length)return[];const st=Math.floor(R()*Math.max(1,K.chop.length-3));return K.chop.slice(st,st+4)})();
 const RHY=[[0,1.5,2,3],[0,.75,1.5,2.5,3],[0,2,2.75,3.5],[0,1,2,3],[0,1.5,3]],rA=RHY[o.kv%RHY.length],rB=RHY[(o.kv+2)%RHY.length];
 for(let br=0;br<bars;br++){const B=br*4,last=br===bars-1,third=br===2,deg=prog[br%prog.length],kp=(br%2?kB:kA).map(s=>s/4);
  // drums: kick pattern, bar 4 gets a variation; snare backbeat; ghost notes; hats with accents; rolls only into the next phrase
  if(S.kick&&kk){const pat=last&&en>.5?[...kp.filter(t=>t<3),3.25,3.75]:kp;pat.forEach((t,i)=>add(i&&R()<.25?k2:kk,B+t,i?.85:1))}
  if(S.snare&&sn){if(S.snare>=1||last)sty.s.forEach(s=>{add(sn,B+s/4,1);if(cl&&en>.7)add(cl,B+s/4,.55)});if(en>.55&&R()<.5)add(sn,B+(R()<.5?1.75:3.75),.3);if(last&&secName==='bridge')for(let r=0;r<8;r++)add(sn,B+2+r*.25,.35+r*.08)}
  if(S.hat&&hh){const dens=en>.8&&o.style!=='boom'?.25:.5,acc=[.9,.5,.72,.5];for(let t=0;t<4-1e-6;t+=dens){const i=Math.round(t/dens);add(Math.abs(t%1)<1e-6||h2===hh?hh:h2,B+t,acc[i%4]*S.hat)}
   if(last&&en>.45&&sty.roll){const st2=sty.trip?1/6:.125;for(let t=3;t<4-1e-6;t+=st2)add(hh,B+t,.4+(t-3)*.5)}
   if(oh&&(last||R()<.3*en))add(oh,B+3.5,.7)}
  if(S.perc&&pc.length&&en>.35){add(pc[0],B+(br%2?2.75:1.75),.55);if(pc[1]&&R()<.4)add(pc[1],B+3.25,.45)}
  // 808 / bass locks to the kick and follows the progression root
  if(S.bass&&bs){const pts=(S.kick&&kk?kp:[0,2.5]);pts.forEach((t,i)=>{const nx=pts[i+1]??4;const up=last&&i===pts.length-1&&en>.6;add(bs,B+t,.9,degSt(bs.p,deg+(up?4:0),bs===kk?-1:0),(nx-t)*.95)})}
  // keys: chord on the 1 in the hook, single tones elsewhere, all in key
  if(S.keys&&ky&&(!K.chop.length||secName!=='verse'||br%2)){if(secName==='hook'||secName==='intro'){[0,2,4].forEach((d,i)=>add(ky,B+i*.01,.6,degSt(ky.p,deg+d),secName==='intro'?3.8:1.75));if(secName==='hook')[0,2,4].forEach(d=>add(ky,B+2.5,.5,degSt(ky.p,deg+d),1))}
   else add(ky,B+(br%2?2:0),.65,degSt(ky.p,deg),1.5);if(ky2&&secName==='hook'&&R()<.5)add(ky2,B+3.5,.5,degSt(ky2.p,deg+4),.5)}
  // chops: call (A) and response (B), played in source order like a producer re-sequencing the sample
  if(S.chop&&chopRun.length){const rh=third?rB:rA;rh.forEach((t,i)=>{if(R()>S.chop+.1)return;const c=chopRun[(i+(third?1:0)+(last&&i===rh.length-1?2:0))%chopRun.length];const nx=rh[i+1]??4;add(c,B+t,.9,0,Math.min(nx-t,c.p.lb||nx-t))})}}
 // loop bed (sample-led sections)
 if(S.loop&&K.loop.length&&(secName!=='hook'||!K.chop.length)){const lp=K.loop[o.kv%K.loop.length],lb=lp.p.lb||4;for(let t=0;t<bars*4;t+=lb)add(lp,t,.8,0,Math.min(lb,bars*4-t))}
 P.ev=ev;return ev.length}
function brainSong(){toKit();const src=$('bbSrc').value;let K;if(src.startsWith('pack:')){const pk=PS.packs[+src.slice(5)];const b=loadPack(pk,true);if(b<0)return;K=kitMap(String(b))}else K=kitMap(src);
 const n=Object.values(K).reduce((a,v)=>a+v.length,0);if(!n){bbMsg('No pads to work with yet. Use 🪄 Build it, a Smart fill, or 🎁 Build packs first.');return}
 pushUndo();const style=$('psSty').value,energy=+$('psEn').value/100,VV=VS(),seed=VV.seed,scale=PS.scale==='maj'||PS.scale==='pmaj'?'maj':'min',prog=VV.prog,kv=VV.kv,sub=!K.bass.length;
 const plan=[['intro',0],['verse',1],['hook',2],['bridge',3],['verse',4],['outro',5]];plan.forEach(([s,pi],i)=>writeSection(pi,s,K,{seed:seed+i*17,style,energy,prog,kv:kv+(pi===4?1:0),sub}));
 PS.song=[0,1,4,2,1,2,3,2,5];PS.songMode=true;PS.pat=2;if(STY[style].sw){PS.swing=STY[style].sw}syncCtl();renderAll();dirty();
 const nm=d=>NN[(PS.root+(SCALES[scale==='maj'?'maj':'min'][d%7]))%12];
 bbMsg('🧠 “'+VV.P.name+'”, variation '+VV.v+': wrote a full song: Intro (P1) → Verse (P2, P5) → Hook (P3) → Bridge (P4) → Outro (P6), in song mode. Chords: '+prog.map(nm).join(' – ')+'. The 808 follows the kick and the chord roots, chops answer each other bar to bar, and hat rolls only lead into the next phrase. '+kitReport(K)+' Press ▶ to hear it.')}
function brainPattern(){toKit();const K=kitMap($('bbSrc').value.startsWith('pack:')?'all':$('bbSrc').value);if(!Object.values(K).some(v=>v.length)){bbMsg('No pads yet.');return}pushUndo();const VV=VS();
 writeSection(PS.pat,$('bbSec').value,K,{seed:VV.seed+PS.pat*31,style:$('psSty').value,energy:+$('psEn').value/100,prog:VV.prog,kv:VV.kv,sub:!K.bass.length});
 seqDraw();renderPats();dirty();bbMsg('Wrote a '+$('bbSec').value+' into P'+(PS.pat+1)+'. '+kitReport(K))}
/* 5. SMART SOUND PACKS: curated kits drafted from every sound you have */
const PROF={hard:{n:'Hard Knock',att:-1.4,rms:1.2,bright:.2,dur:-.3},dark:{n:'Dark',att:0,rms:.6,bright:-1.3,dur:.2},bright:{n:'Bright',att:-.4,rms:.5,bright:1.3,dur:-.2},dusty:{n:'Dusty / Soft',att:.9,rms:-.3,bright:-.5,dur:.4}};
const SLOTS=[['kick','KICK'],['kick','KICK 2'],['snare','SNARE'],['snare','CLAP'],['hat','HAT'],['hat','HAT 2'],['open','OPEN HAT'],['perc','PERC'],['perc','PERC 2'],['bass','808'],['keys','KEYS'],['keys','KEYS 2'],['keys','STAB'],['chop','CHOP'],['chop','CHOP 2'],['loop','LOOP']];
function poolAll(){mainFresh();const pool=[],seen=new Set(),push=(p,from)=>{const k=pbKey(p);if(seen.has(k))return;seen.add(k);const f=featPad(p);if(!f)return;const r=roleOf(p,f);if(r)pool.push({p,f,r,from})};
 PS.banks.forEach((B,b)=>B.forEach(p=>p&&p.mode!=='cue'&&push(p,'bank '+BL[b])));
 if(PS.srcs[PS.main])for(const s of slices){if(s.e-s.s<sr*.03)continue;push(mkPad(PS.main,[[s.s,s.e]],(s.kind||'snd').toUpperCase()+' '+(slices.indexOf(s)+1),KIND2ROLE[s.kind]||'',{midi:s.clar>.6?s.midi:undefined}),'slice')}
 for(const k in PS.srcs){const S=PS.srcs[k];if(S.main||!S.chs)continue;(S.sl||[]).slice(0,120).forEach(it=>push(mkPad(k,[[it.s,it.e]],k+' #'+(it.i+1),''),k))}
 try{smartChains(10).forEach(p=>push(p,'smart chain'));smartLoops(6).forEach(p=>push(p,'smart loop'))}catch(e){}
 return pool}
function buildPacks(){const pool=poolAll();if(pool.length<4){bbMsg('Not enough sounds yet: load a song in Chopper first.');return}
 const st=k=>{const v=pool.map(x=>x.f[k]);const m=v.reduce((a,b)=>a+b,0)/v.length,s=Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/v.length)||1;return x=>(x-m)/s},Z={att:st('att'),rms:st('rms'),bright:st('bright'),dur:st('dur')};
 const usedAll=new Map(),out=[];
 for(const[key,P]of Object.entries(PROF)){const used=new Set(),pads=[];
  for(const[role,label]of SLOTS){let cands=pool.filter(x=>x.r===role&&!used.has(x));if(!cands.length&&role==='bass')cands=pool.filter(x=>x.r==='kick'&&!used.has(x)&&x.f.dur>.3);if(!cands.length&&role==='open')cands=pool.filter(x=>x.r==='hat'&&!used.has(x));if(!cands.length&&role==='keys')cands=pool.filter(x=>x.p.midi!==undefined&&!used.has(x));
   if(!cands.length){pads.push(null);continue}
   const sc=x=>Z.att(x.f.att)*P.att+Z.rms(x.f.rms)*P.rms+Z.bright(x.f.bright)*P.bright+Z.dur(x.f.dur)*P.dur+(role==='keys'||role==='bass'?(inKey(x.p.midi)?1.2:-1.5):0)-(usedAll.get(x)||0)*.9;
   const best=cands.sort((a,b)=>sc(b)-sc(a))[0];used.add(best);usedAll.set(best,(usedAll.get(best)||0)+1);
   const p=deep(best.p);p.name=label;p.role=role==='bass'?'tone':role==='keys'?'stab':role==='chop'?'chain':role==='fx'?'long':role;p.col=RC[p.role]||p.col;if(role==='bass'){p.choke=2;p.mode='one'}if(role==='hat'||role==='open')p.choke=1;if(role==='chop')p.choke=3;if(role==='loop'){p.mode='latch';p.choke=4}
   p.why=P.n+' pack · '+label.toLowerCase()+' from '+best.from+': '+(Z.att(best.f.att)<-.3?'snappy attack':Z.att(best.f.att)>.5?'soft attack':'medium attack')+', '+(Z.bright(best.f.bright)>.4?'bright':Z.bright(best.f.bright)<-.4?'dark':'warm')+(best.p.midi!==undefined?', pitched '+nn(Math.round(best.p.midi))+(inKey(best.p.midi)?' (in key)':''):'');
   pads.push(p)}
  out.push({name:P.n+' — '+(PS.main||'kit').slice(0,18),pads,made:new Date().toISOString()})}
 PS.packs=(PS.packs||[]).concat(out);renderPacks();dirty();bbMsg('🎁 Drafted '+out.length+' sound packs from '+pool.length+' sounds: '+out.map(p=>p.name.split(' — ')[0]).join(', ')+'. Each slot shows why it was picked. ▶ Demo to hear one, load it into a bank to edit it, then 💾 Save bank as pack to keep your edits.')}
function loadPack(pk,quiet){toKit();let b=PS.banks.findIndex(B=>B.every(p=>!p));if(b<0)b=7;pushUndo();PS.banks[b]=pk.pads.map(p=>p?deep(p):null);while(PS.banks[b].length<16)PS.banks[b].push(null);setBank(b);renderAll();dirty();if(!quiet)bbMsg('Loaded “'+pk.name+'” into bank '+BL[b]+'. Edit pads there, then 💾 Save bank as pack.');return b}
function demoPack(pk){toKit();stopT();pushUndo();PS.banks[7]=pk.pads.map(p=>p?deep(p):null);const K=kitMap('7'),scale=PS.scale==='maj'?'maj':'min';PS.pats[7].bars=4;writeSection(7,'hook',K,{seed:VS().seed,style:$('psSty').value,energy:.8,prog:PROGS[scale][0],kv:0,sub:!K.bass.length});
 PS.pat=7;PS.songMode=false;setBank(7);renderAll();startT();bbMsg('▶ Demo of “'+pk.name+'”: loaded into bank H, with a hook written into P8. Press ■ to stop.')}
function packZip(pk){const F=[],E=new TextEncoder();let txt=pk.name+'\nMade with Beat Chopper Pad Studio from: '+PS.main+'\nKey: '+NN[PS.root]+' '+PS.scale+' · Tempo: '+PS.bpm+' BPM\n\n';
 pk.pads.forEach((p,j)=>{if(!p)return;const b=padBuf(p);if(!b)return;const d=[];for(let c=0;c<b.numberOfChannels;c++)d.push(b.getChannelData(c));const n=String(j+1).padStart(2,'0')+'_'+slug(p.name)+(p.midi!==undefined?'_'+nf(Math.round(p.midi)):'')+'.wav';F.push([n,wav(d)]);txt+=n+'\n   '+(p.why||'')+'\n'});
 if(!F.length)throw new Error('This pack has no playable sounds (its source audio is not loaded).');F.push(['README.txt',E.encode(txt)]);return save(slug(pk.name)+'_pack.zip',zip(F))}
function renderPacks(){const c=$('bbPacks');if(!c)return;c.textContent='';const P=PS.packs||[];const sel=$('bbSrc'),cur=sel.value;sel.textContent='';sel.add(new Option('All banks','all'));for(let i=0;i<8;i++)if(PS.banks[i].some(Boolean))sel.add(new Option('Bank '+BL[i],String(i)));P.forEach((p,i)=>sel.add(new Option('🎁 '+p.name,'pack:'+i)));if([...sel.options].some(o=>o.value===cur))sel.value=cur;
 if(!P.length){c.innerHTML='<div class="mt" style="margin-top:6px">No packs yet. Press 🎁 Build packs.</div>';return}
 P.forEach((pk,i)=>{const d=document.createElement('div');d.className='pack';const chips=pk.pads.map((p,j)=>'<span class="pc" title="'+(p&&p.why?p.why.replace(/"/g,"'"):'empty')+'" style="--pc:'+(p?p.col:'#868e96')+'">'+(j+1)+' '+(p?p.name:'—')+'</span>').join('');
  d.innerHTML='<div class="tb"><input type="text" value="" style="flex:1;min-width:140px"><button data-a="d">▶ Demo</button><button data-a="l">Load to bank</button><button data-a="z">⬇ Zip</button><button data-a="x">✕</button></div><div class="pcs">'+chips+'</div><div class="mt pw"></div>';
  const inp=d.querySelector('input');inp.value=pk.name;inp.onchange=()=>{pk.name=inp.value.slice(0,40)||pk.name;renderPacks();dirty()};
  d.querySelector('.pcs').onclick=e=>{const ch=e.target.closest('.pc');if(!ch)return;const j=[...d.querySelectorAll('.pc')].indexOf(ch),p=pk.pads[j];d.querySelector('.pw').textContent=p?(j+1)+' '+p.name+': '+(p.why||''):'';if(p)audition(p)};
  d.querySelector('.tb').onclick=e=>{const a=e.target.dataset.a;if(a==='d')demoPack(pk);else if(a==='l')loadPack(pk);else if(a==='z')busy(e.target,()=>packZip(pk));else if(a==='x'){if(e.target.dataset.arm){PS.packs.splice(i,1);renderPacks();dirty()}else{e.target.dataset.arm=1;e.target.textContent='Tap to delete'}}};c.appendChild(d)})}
const bbMsg=t=>{$('bbOut').textContent=t};
function brainInit(){$('bbAn').onclick=()=>{const K=kitMap($('bbSrc').value.startsWith('pack:')?'all':$('bbSrc').value);bbMsg('🔎 '+kitReport(K))};
 $('bbSong').onclick=brainSong;$('bbPat').onclick=brainPattern;$('bbPk').onclick=e=>{e.currentTarget.disabled=true;const b=e.currentTarget;setTimeout(()=>{try{buildPacks()}catch(x){bbMsg('Pack build failed: '+(x.message||x))}b.disabled=false},30)};
 $('bbSave').onclick=()=>{const B=PS.banks[PS.bank];if(!B.some(Boolean)){bbMsg('This bank is empty.');return}PS.packs=PS.packs||[];PS.packs.push({name:'My pack '+BL[PS.bank]+' '+new Date().toLocaleDateString(),pads:deep(B),made:new Date().toISOString()});renderPacks();dirty();bbMsg('Saved bank '+BL[PS.bank]+' as a pack. Rename it below.')};
 $('bbZipAll').onclick=e=>busy(e.currentTarget,async()=>{if(!(PS.packs||[]).length)throw new Error('No packs yet.');for(const pk of PS.packs)await packZip(pk)});renderPacks()}

/* ================= PRO TOOLS + PRESETS + AUTOMATION =================
   Ideas taken from how the classic boxes work:
   - Note Repeat / Roll (MPC, SP-404MKII): hold a pad and it retriggers on the grid.
   - Per-pad envelope (attack / release) and a DJ filter (left = low-pass, right = high-pass).
   - Mono / poly per pad, lock a pad so smart fills leave it alone, slice at set intervals.
   - Key matching: tune pitched pads to the song's key. Camelot key codes for DJs.
   - Sidechain pump: the kick ducks everything that isn't a drum.
   Presets are named recipes. Variations are numbered and repeatable, never random. */
let SHIFT=false,PUMP=0;
addEventListener('keydown',e=>{if(e.key==='Shift')SHIFT=true});addEventListener('keyup',e=>{if(e.key==='Shift')SHIFT=false});addEventListener('blur',()=>SHIFT=false);
/* --- Note Repeat --- */
const NR={on:false,rate:.25,act:new Map()};
function nrStart(key,b,j,vel){if(NR.act.has(key)||!ac)return;const st={tm:null,snap:false};const r=NR.rate;let nx;
 if(TR.playing&&beatNow()>=0)nx=Math.ceil((beatNow()+.005)/r)*r;else{st.t0=ac.currentTime+.01;nx=0}
 const tOf=x=>TR.playing?TR.t0+x*bd():st.t0+x*bd();
 const run=()=>{const look=ac.currentTime+.06;let guard=0;while(tOf(nx)<look&&guard++<16){const p=AB()[b][j];if(!p)break;const when=Math.max(tOf(nx),ac.currentTime),acc=Math.abs(nx-Math.round(nx))<1e-6?1:Math.abs(nx*2-Math.round(nx*2))<1e-6?.85:.72;
   const v=voice(ac,busFor(p),{...p,mode:'one'},when,vel*acc,0,0,CK);if(v)TR.vs.push(v);
   if(TR.playing&&TR.rec&&TR.seg&&nx>=0){const sg=TR.seg;if(!st.snap){pushUndo();st.snap=true}const t=(((nx-sg.start)%sg.len)+sg.len)%sg.len;const ne={t:+t.toFixed(4),b,p:j,v:+(vel*acc).toFixed(2),st:0,d:0,_skip:nx<sg.start+sg.len?sg.id:-1};if(p.chop){ne.pg='chop';ne.ci=p.ci}PS.pats[sg.pat].ev.push(ne);seqDirty=true;dirty()}
   setTimeout(()=>flash(j),Math.max(0,(when-ac.currentTime)*1000));nx+=r}};
 run();st.tm=setInterval(run,15);NR.act.set(key,st)}
function nrStop(key){const s=NR.act.get(key);if(s){clearInterval(s.tm);NR.act.delete(key)}}
/* --- sidechain pump --- */
function duck(gp,when){const a=PUMP/100;if(a<=0)return;gp.cancelScheduledValues(when);gp.setValueAtTime(1-a*.85,when);gp.setTargetAtTime(1,when+.012,Math.max(.03,bd()/5))}
/* --- key helpers --- */
const CAM_MIN=[5,12,7,2,9,4,11,6,1,8,3,10],CAM_MAJ=[8,3,10,5,12,7,2,9,4,11,6,1];
function camelot(root,scale){if(root==null)return'';return scale==='maj'||scale==='pmaj'?CAM_MAJ[root]+'B':CAM_MIN[root]+'A'}
function keyText(){try{if(PL&&PL.sl)return NN[PL.root]+(PL.scale==='maj'?' major':' minor')}catch(e){}return''}
function tuneToKey(p){if(p.midi===undefined)return false;const m=Math.round(p.midi+(p.tune||0));if(inKey(m))return true;for(const d of[1,-1,2,-2]){if(inKey(m+d)){p.tune=(p.tune||0)+d;return true}}return false}
/* --- automatic gain staging + key matching --- */
const LVL={kick:.24,snare:.2,hat:.1,open:.11,perc:.13,tone:.15,stab:.15,chain:.17,loop:.16,group:.16,long:.14,cue:0};
function autoProcessBank(B){const lv=$('auLvl')?$('auLvl').checked:true,tk=$('auTune')?$('auTune').checked:true;let nL=0,nT=0;
 B.forEach(p=>{if(!p||p.lock)return;const f=featPad(p);if(lv&&f&&f.rms>1e-4&&LVL[p.role]!==0){const t=LVL[p.role]||.15;p.gain=+clamp(t/f.rms,.35,1.8).toFixed(2);nL++}
  if(tk&&(p.role==='tone'||p.role==='stab')&&p.midi!==undefined){const was=p.tune||0;if(tuneToKey(p)&&p.tune!==was)nT++}});return{nL,nT}}
/* --- presets and repeatable variations --- */
const PRESETS=[
 {id:'det',name:'Detroit bounce',style:'det',energy:62,swing:12,q:.25,pump:25,prog:0,kv:0},
 {id:'flint',name:'Flint street',style:'det',energy:76,swing:6,q:.25,pump:30,prog:2,kv:1},
 {id:'trap',name:'Trap',style:'trap',energy:70,swing:0,q:.25,pump:18,prog:0,kv:0},
 {id:'drill',name:'Drill',style:'drill',energy:70,swing:0,q:.25,pump:15,prog:3,kv:1},
 {id:'boom',name:'Boom bap',style:'boom',energy:55,swing:28,q:.25,pump:0,prog:1,kv:0},
 {id:'soul',name:'Soul chop flip',style:'flip',energy:50,swing:18,q:.25,pump:10,prog:4,kv:0},
 {id:'lofi',name:'Lo-fi',style:'boom',energy:35,swing:34,q:.25,pump:22,prog:1,kv:2}];
const userPresets=()=>LS.get('bcrps:presets')||[];
const allPresets=()=>PRESETS.concat(userPresets());
const hashStr=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function curPreset(){const id=$('bbPre')?$('bbPre').value:'det';return allPresets().find(p=>p.id===id)||PRESETS[0]}
function VS(){const P=curPreset(),v=Math.max(1,+($('bbVar')||{value:1}).value||1),scale=PS.scale==='maj'||PS.scale==='pmaj'?'maj':'min',L=PROGS[scale].length;
 return{seed:(hashStr((PS.main||'song')+'|'+P.id)+v*7919)%999983,prog:PROGS[scale][(P.prog+v-1)%L],progI:(P.prog+v-1)%L,kv:(P.kv+Math.floor((v-1)/L))%3,v,P}}
function applyPreset(P,quiet){$('psSty').value=P.style;$('psEn').value=P.energy;PS.swing=P.swing;PS.q=P.q;PUMP=P.pump;if($('djPump')){$('djPump').value=P.pump;$('djPumpV').textContent=P.pump}syncCtl();dirty();
 if(!quiet)bbMsg('Preset “'+P.name+'”: '+STYN[P.style]+' groove, energy '+P.energy+', swing '+P.swing+'%, sidechain pump '+P.pump+'%. Variation 1 is the preset itself; each number after it is a different, repeatable take.')}
const STYN={det:'Detroit / Flint bounce',trap:'trap',drill:'drill',boom:'boom bap',flip:'chop-flip'};
/* --- automatic setup when a new song loads --- */
let autoDoneFor=null;
async function autoSetup(){ensurePS();mainFresh();try{renderAll()}catch(e){}if(!LS.get('bcrps:autoset')&&LS.get('bcrps:autoset')!==null)return;if(!PS.main||autoDoneFor===PS.main||!isEmpty())return;autoDoneFor=PS.main;
 toast('Setting up pads for '+PS.main+'…');try{AUTO=true;try{await magic()}finally{AUTO=false}PS.prog='chop';PS.bank=0;CHOPB=null;renderAll();toast('Pads are ready. The main pads play your chops in order (CHOP program); your smart kits, chains, loops and hot cues are in the KIT program.',[['Open Pads',()=>window.goPage?goPage('pads'):tab('S')]])}catch(e){}}
/* --- UI --- */
function edgeInit(){
 // transport: note repeat
 const tr=$('psTap');const nrB=document.createElement('button');nrB.id='nrB';nrB.className='tg';nrB.textContent='Note repeat';nrB.title='Hold a pad and it retriggers on the grid. Holding Shift does the same.';
 const nrS=document.createElement('select');nrS.id='nrS';[['1/4',1],['1/8',.5],['1/8 T',1/3],['1/16',.25],['1/16 T',1/6],['1/32',.125],['1/64',.0625]].forEach(([t,v])=>nrS.add(new Option(t,v)));nrS.value='0.25';
 tr.after(nrB,nrS);nrB.onclick=()=>{NR.on=!NR.on;nrB.classList.toggle('on',NR.on);msg(NR.on?'Note repeat on: hold a pad and it retriggers every '+nrS.selectedOptions[0].text+'. Holding Shift does the same without this switch.':'Note repeat off.')};nrS.onchange=()=>NR.rate=+nrS.value;
 // DJ: sidechain pump
 const dj=$('psDJ').querySelector('.tb');const pl=document.createElement('label');pl.className='ck';pl.innerHTML='Sidechain pump <input type="range" id="djPump" min="0" max="100" value="0" style="width:110px"><span id="djPumpV">0</span>%';dj.insertBefore(pl,$('psFk0').nextSibling);
 $('djPump').oninput=e=>{PUMP=+e.target.value;$('djPumpV').textContent=PUMP;autoRec('pump',PUMP)};
 // pad editor: envelope, filter, mono, lock, tune to key
 const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
 row.innerHTML='<label>Attack <span id="peAv"></span> ms<input type="range" id="peA" min="0" max="400"></label><label>Release <span id="peRv"></span> ms<input type="range" id="peRl" min="0" max="1500"></label><label>Filter <span id="peFv"></span><input type="range" id="peF" min="-100" max="100"></label>';
 const row2=document.createElement('div');row2.className='tb';row2.style.marginTop='8px';
 row2.innerHTML='<label class="ck"><input type="checkbox" id="peMo"> Mono (retrigger cuts itself)</label><label class="ck"><input type="checkbox" id="peLk"> Lock (smart fills keep it)</label><button id="peKey">Tune to key</button><span class="mt" id="peKeyI"></span>';
 $('peCol').before(row,row2);
 $('peA').oninput=e=>edSet(p=>p.att=+e.target.value);$('peRl').oninput=e=>edSet(p=>p.rel=+e.target.value);$('peF').oninput=e=>edSet(p=>p.flt=+e.target.value);
 $('peMo').onchange=e=>edSet(p=>p.mono=e.target.checked);$('peLk').onchange=e=>edSet(p=>p.lock=e.target.checked);
 $('peKey').onclick=()=>{const s=PS.sel,p=s&&PS.banks[s.b][s.j];if(!p)return;if(p.midi===undefined){$('peKeyI').textContent='No clear pitch in this sound, so there is nothing to tune.';return}const was=p.tune||0;edSet(q=>tuneToKey(q));const now=PS.banks[s.b][s.j].tune||0;$('peKeyI').textContent=now===was?'Already in '+NN[PS.root]+' '+(PS.scale==='maj'?'major':'minor')+'.':'Moved '+(now-was>0?'+':'')+(now-was)+' semitone'+(Math.abs(now-was)>1?'s':'')+' into the key.';audition(PS.banks[s.b][s.j])};
 // fill options
 const fsel=$('psFill');[['half','½ beat per pad'],['bars2','2 bars per pad'],['bars4','4 bars per pad'],['rand','Pick 16 from ★ sweet spots (by variation)']].forEach(([v,t])=>fsel.add(new Option(t,v)));
 // brain: presets, variations, automation switches
 const bb=$('psBrain');const pr=document.createElement('div');pr.className='tb';pr.style.marginTop='8px';
 pr.innerHTML='<label class="ck">Preset <select id="bbPre"></select></label><label class="ck">Variation <button id="bbVm" aria-label="Previous variation">◀</button><input type="number" id="bbVar" value="1" min="1" max="999" style="width:72px"><button id="bbVp" aria-label="Next variation">▶</button></label><input type="text" id="bbPreN" placeholder="Name for your preset" style="width:180px"><button id="bbPreS">Save as my preset</button>';
 const au=document.createElement('div');au.className='tb';au.style.marginTop='8px';
 au.innerHTML='<label class="ck"><input type="checkbox" id="auSet"> Set up pads automatically when a song loads</label><label class="ck"><input type="checkbox" id="auLvl" checked> Match pad levels</label><label class="ck"><input type="checkbox" id="auTune" checked> Tune pitched pads to the key</label>';
 bb.querySelector('.h').after(pr,au);
 const fillPre=()=>{const s=$('bbPre'),c=s.value;s.textContent='';const g1=document.createElement('optgroup');g1.label='Built in';PRESETS.forEach(p=>g1.appendChild(new Option(p.name,p.id)));s.appendChild(g1);const U=userPresets();if(U.length){const g2=document.createElement('optgroup');g2.label='Mine';U.forEach(p=>g2.appendChild(new Option(p.name,p.id)));s.appendChild(g2)}if(c&&[...s.options].some(o=>o.value===c))s.value=c};fillPre();
 $('bbPre').onchange=()=>{$('bbVar').value=1;applyPreset(curPreset())};
 const vstep=d=>{$('bbVar').value=clamp((+$('bbVar').value||1)+d,1,999);const x=VS();bbMsg('Variation '+x.v+' of “'+x.P.name+'”: chord pattern '+(x.progI+1)+', kick pattern '+(x.kv+1)+'. Press 🧠 Write full song or → current pattern to hear it. The same number always gives the same result.')};
 $('bbVm').onclick=()=>vstep(-1);$('bbVp').onclick=()=>vstep(1);
 $('bbPreS').onclick=()=>{const nm=$('bbPreN').value.trim()||('My preset '+(userPresets().length+1)),x=VS();const P={id:'u'+Date.now(),name:nm,style:$('psSty').value,energy:+$('psEn').value,swing:PS.swing,q:PS.q,pump:PUMP,prog:x.progI,kv:x.kv};
  const U=userPresets();U.push(P);LS.set('bcrps:presets',U);fillPre();$('bbPre').value=P.id;$('bbVar').value=1;$('bbPreN').value='';bbMsg('Saved “'+nm+'”. It keeps this groove, energy, swing, quantize, pump, chords and kick pattern.')};
 const as=LS.get('bcrps:autoset');$('auSet').checked=as===null?true:!!as;$('auSet').onchange=e=>LS.set('bcrps:autoset',e.target.checked);
 // magic card: apply chosen style through presets too
 $('psSty').addEventListener('change',()=>{const P=PRESETS.find(p=>p.style===$('psSty').value);if(P&&$('bbPre').value!==P.id){$('bbPre').value=P.id;applyPreset(P,true)}});
 applyPreset(PRESETS[0],true)}
/* ================= MPC HARDWARE FUNCTIONS =================
   OVERDUB, PLAY START, ERASE, COPY, TC, PAD MUTE, FULL LEVEL, SHIFT, MASTER,
   and "record from anywhere": with REC armed, sounds played in Live, Keys, Chop and
   Groups are recorded into the current sequence on pads that are created for them. */
const HW={erase:false,mute:false,full:false,mutes:new Set(),shift:false};
function hwOverdub(){if(!ac)return;ensurePS();if(TR.playing){TR.rec=!TR.rec;TR.recSnap=false;uiT()}else{const ci=PS.countIn;PS.countIn=false;TR.rec=true;startT();PS.countIn=ci}}
function hwPlayStart(){if(!ac)return;ensurePS();if(TR.playing)stopT();startT()}
function curPat(){return TR.playing&&TR.seg?TR.seg.pat:PS.pat}
function hwEraseHit(b,j){const k=keyOf(b,j),P=PS.pats[curPat()],n=P.ev.filter(e=>evKey(e)===k).length;if(n){pushUndo();P.ev=P.ev.filter(e=>evKey(e)!==k)}seqDirty=true;seqDraw();renderPats();dirty();
 msg(n?'Erased '+n+' hit'+(n>1?'s':'')+' of pad '+BL[b]+(j+1)+' from P'+(curPat()+1)+'. UNDO brings them back.':'Pad '+BL[b]+(j+1)+' has no hits in P'+(curPat()+1)+'.')}
function hwMuteHit(b,j){const k=keyOf(b,j);if(HW.mutes.has(k))HW.mutes.delete(k);else HW.mutes.add(k);renderPads();msg('Pad '+BL[b]+(j+1)+(HW.mutes.has(k)?' muted':' unmuted')+'. '+HW.mutes.size+' pad'+(HW.mutes.size===1?' is':'s are')+' muted.')}
function hwCopy(){ensurePS();const src=curPat();let dst=PS.pats.findIndex((p,i)=>i>src&&!p.ev.length);if(dst<0)dst=PS.pats.findIndex((p,i)=>i!==src&&!p.ev.length);if(dst<0)dst=(src+1)%8;
 pushUndo();PS.pats[dst]=deep(cleanPats()[src]);renderPats();dirty();return'Copied P'+(src+1)+' to P'+(dst+1)}
function hwTC(){ensurePS();const s=$('psQ'),o=[...s.options],i=o.findIndex(x=>x.value===s.value);const n=o[(i+1)%o.length];s.value=n.value;PS.q=+n.value;dirty();return'Timing correct '+n.text}
function hwInfo(){const q=$('psQ');return{prog:PS.prog,page:PS.cpage,pages:typeof slices!=='undefined'?Math.max(1,Math.ceil(slices.length/128)):1,pat:curPat()+1,bank:BL[PS.bank],tc:q&&q.selectedOptions[0]?q.selectedOptions[0].text:'',rec:!!TR.rec,playing:!!TR.playing,take:!!TK.on,erase:HW.erase,mute:HW.mute,full:HW.full,shift:HW.shift,mutes:HW.mutes.size}}
/* --- master volume: everything that reaches the speakers passes one master gain --- */
let MASTER=null,MVOL=1;
function masterIn(ctx){if(MASTER&&MASTER.context===ctx)return MASTER;const m=ctx.createGain();m.gain.value=MVOL;m._noRec=1;_con.call(m,ctx.destination);_con.call(m,tapIn(ctx));MASTER=m;return m}
function hwMaster(v){MVOL=Math.pow(clamp(+v,0,120)/100,1.6);if(MASTER)MASTER.gain.setTargetAtTime(MVOL,MASTER.context.currentTime,.02)}
/* --- record from anywhere --- */
let LAST_IN=0;['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{LAST_IN=performance.now()},true));
const AB2SRC=new WeakMap();
function srcForAb(ab,name){let n=AB2SRC.get(ab);if(!n||!PS.srcs[n]){n=abSrc(ab,name);AB2SRC.set(ab,n)}return n}
function sndOfObj(s,name,role,extra){if(!s)return null;mainFresh();const base=s.ab?{src:srcForAb(s.ab,name),seg:null}:{src:PS.main,seg:[[s.s,s.e]]};return Object.assign(base,{name:name.slice(0,24),role,midi:s.clar>.6?s.midi:undefined},extra||{})}
function padFor(snd){const seg=snd.seg||[[0,PS.srcs[snd.src].len]],key=snd.src+'|'+JSON.stringify(seg);
 for(let b=0;b<8;b++)for(let j=0;j<16;j++){const p=PS.banks[b][j];if(p&&!p.rev&&!(p.tune)&&p.src+'|'+JSON.stringify(p.seg)===key)return{b,j,isNew:false}}
 for(const b of[7,6,5,4,3,2,1,0]){const j=PS.banks[b].findIndex(p=>!p);if(j>=0){PS.banks[b][j]=toPad(Object.assign({},snd,{seg,tune:0,from:'recording on the '+(TABN[curTab]||'')+' page'}));PS.banks[b][j].name='REC '+PS.banks[b][j].name;return{b,j,isNew:true}}}
 return null}
function recSound(snd,vel,st){if(!snd||!PS.init||!(TR.playing&&TR.rec)||performance.now()-LAST_IN>200)return;if(TR.seg&&beatNow()<0)return;
 const at=padFor(snd);if(!at){toast('Every pad is full, so that sound was not recorded. Clear a pad or a bank.');return}
 recEv(at.b,at.j,clamp(vel||.85,.1,1),clamp(Math.round(st||0),-24,24));if(at.b===PS.bank)flash(at.j);
 if(at.isNew){renderBanks();if(at.b===PS.bank)renderPads();toast('Recording: new pad '+BL[at.b]+String(at.j+1).padStart(2,'0')+' “'+PS.banks[at.b][at.j].name+'” holds that sound.')}}
const LRL={KICK:'kick',SNARE:'snare',HAT:'hat',OPEN:'open',PERC:'perc',STAB:'stab',LONG:'long'};
function hookEngine(){
 if(typeof window.padDown==='function'&&!window.padDown._dbc){const o=window.padDown;window.padDown=function(j,e,el){const r=o.apply(this,arguments);try{const arr=PL.bank==='drums'?PL.pads:PL.bank==='groups'?(PL.gpads||[]):PL.chops,p=arr[j];
   if(p)recSound(sndOfObj(p,p.label||'PAD',LRL[(p.label||'').split(' ')[0]]||(PL.bank==='chops'?'chain':'perc'),{choke:p.grp==='hat'?1:0}),.9,0)}catch(x){}return r};window.padDown._dbc=1}
 if(typeof window.playNote==='function'&&!window.playNote._dbc){const o=window.playNote;window.playNote=function(L,m,vel,when){const r=o.apply(this,arguments);try{const s=L&&L.list&&L.list[L.i];if(s){const nat=s.clar>.6&&s.midi!==undefined?s.midi:L.base-L.base%12+PL.root;let st=m-nat;while(st>24)st-=12;while(st<-24)st+=12;
   recSound(sndOfObj(s,(L===PNO?'PIANO':L.name||'KEYS'),'tone',{mode:'one'}),vel||.85,st)}}catch(x){}return r};window.playNote._dbc=1}
 if(typeof window.playSlice==='function'&&!window.playSlice._dbc){const o=window.playSlice;window.playSlice=function(i){const r=o.apply(this,arguments);try{const s=slices[i];if(s)recSound(sndOfObj(s,(s.kind?s.kind.toUpperCase()+' ':'#')+(i+1),KIND2ROLE[s.kind]||''),.9,0)}catch(x){}return r};window.playSlice._dbc=1}
 if(typeof window.gPlay==='function'&&!window.gPlay._dbc){const o=window.gPlay;window.gPlay=function(g){const r=o.apply(this,arguments);try{if(g&&g.members&&g.members.length){mainFresh();recSound({src:PS.main,seg:mergeSegs(g.members.map(m=>({s:m.start_sample,e:m.end_sample}))),name:(g.name||'GROUP').slice(0,24),role:'group',choke:3},.9,0)}}catch(x){}return r};window.gPlay._dbc=1}}
hookEngine();
window.DBC_HW={prog:p=>setProg(p),page:d=>chopPage(d),overdub:hwOverdub,playStart:hwPlayStart,copy:hwCopy,tc:hwTC,info:hwInfo,master:hwMaster,
 set:(k,v)=>{HW[k]=v;if(k==='shift')SHIFT=v;if(k==='full')PS.vel=false;try{renderPads()}catch(e){}},clearMutes:()=>{HW.mutes.clear();try{renderPads()}catch(e){}}};


/* ================= OS API: the separate units (Kit Forge, Key Tower, Pattern Deck, Launch) talk to the studio here ================= */
function osPad(src){if(!src)return null;ensurePS();if(src.k==='slice')return chopPad(src.ci);return PS.banks[src.b]&&PS.banks[src.b][src.j]||null}
const KITKEY=()=>'bcrps:kits:'+(PS.main||'');
window.DBC_OS={
 ready:()=>{try{return!!(slices&&slices.length)}catch(e){return false}},
 nSlices:()=>{try{return slices.length}catch(e){return 0}},
 slice:ci=>{try{const s=slices[ci];if(!s)return null;return{ci,kind:s.kind||'',name:'#'+(ci+1)+(s.kind?' '+s.kind.toUpperCase():''),s:s.s,e:s.e,dur:(s.e-s.s)/sr,tonal:s.clar>.6,midi:s.clar>.6?s.midi:null,col:KCOL[s.kind]||'#7d8b98'}}catch(e){return null}},
 kit:b=>{ensurePS();return PS.banks[b].map(p=>p?{name:p.name,col:p.col,role:p.role,mode:p.mode,midi:p.midi}:null)},
 bank:()=>PS.bank,setBank:b=>{ensurePS();setBank(b)},
 hear:src=>{ensurePS();if(!ac)return false;resume();const p=osPad(src);if(p)audition(p);return!!p},
 put:(ci,b,j)=>{const p=osPad({k:'slice',ci});if(!p)return false;pushUndo();const q=deep(p);delete q.ci;delete q.chop;q.why='Picked by hand in Kit Forge (slice #'+(ci+1)+')';PS.banks[b][j]=q;if(PS.prog==='chop')setProg('kit',true);dirty();renderAll();return true},
 putPad:(fb,fj,b,j)=>{ensurePS();const p=PS.banks[fb][fj];if(!p)return false;pushUndo();PS.banks[b][j]=deep(p);dirty();renderAll();return true},
 clear:(b,j)=>{ensurePS();if(!PS.banks[b][j])return;pushUndo();PS.banks[b][j]=null;dirty();renderAll()},
 clearBank:b=>{ensurePS();pushUndo();PS.banks[b]=emptyBank();dirty();renderAll()},
 swap:(b1,j1,b2,j2)=>{ensurePS();pushUndo();const t=PS.banks[b1][j1];PS.banks[b1][j1]=PS.banks[b2][j2];PS.banks[b2][j2]=t;dirty();renderAll()},
 kits:()=>Object.keys(LS.get(KITKEY())||{}),
 saveKit:(name,b)=>{ensurePS();const all=LS.get(KITKEY())||{};all[name]=deep(PS.banks[b]);return LS.set(KITKEY(),all)},
 loadKit:(name,b)=>{ensurePS();const k=(LS.get(KITKEY())||{})[name];if(!k)return false;pushUndo();PS.banks[b]=deep(k);setProg('kit',true);setBank(b);dirty();renderAll();return true},
 delKit:name=>{const all=LS.get(KITKEY())||{};delete all[name];LS.set(KITKEY(),all)},
 prog:()=>PS.prog,setProg:p=>{ensurePS();setProg(p,true)},
 pats:()=>{ensurePS();return PS.pats.map((p,i)=>({i,bars:p.bars,hits:p.ev.length,ev:p.ev.map(e=>({t:e.t,b:e.b,p:e.p,ci:e.ci,pg:e.pg}))}))},
 pat:()=>{ensurePS();return curPat()},queued:()=>TR.next,playing:()=>!!TR.playing,rec:()=>!!TR.rec,
 pos:()=>{if(!TR.playing||!TR.seg)return 0;const nb=beatNow()-TR.seg.start;return Math.max(0,(nb%TR.seg.len)/TR.seg.len)},
 selPat:i=>{ensurePS();selPat(clamp(i,0,7));renderPats()},
 dupPat:()=>{ensurePS();const c=curPat();let t=PS.pats.findIndex((p,i)=>i>c&&!p.ev.length);if(t<0)t=PS.pats.findIndex(p=>!p.ev.length);if(t<0)return-1;pushUndo();PS.pats[t]=deep(cleanPats()[c]);dirty();selPat(t);renderPats();return t},
 clearPat:()=>{ensurePS();const c=curPat();if(!PS.pats[c].ev.length)return false;pushUndo();PS.pats[c].ev=[];dirty();renderAll();return true},
 undo:()=>{ensurePS();undo()},
 root:()=>PS.root,scale:()=>PS.scale,scaleSteps:()=>SCALES[PS.scale]||SCALES.min,
 midiOf:src=>{const p=osPad(src);return p&&p.midi!==undefined?Math.round(p.midi):null},
 noteOn:(src,m,vel,hold)=>{ensurePS();if(!ac)return null;resume();const p0=osPad(src);if(!p0)return null;
  const pm=p0.midi!==undefined?Math.round(p0.midi):48+PS.root,st=clamp(m-pm,-36,36),p=hold?{...p0,mode:'one'}:{...p0,mode:'gate'};
  const v=voice(ac,busFor(p),p,ac.currentTime,vel,st,0,null);const ev=src.k==='slice'?recEv(0,0,vel,st,src.ci):recEv(src.b,src.j,vel,st);return{v,ev,p,b0:beatNow()}},
 noteOff:h=>{if(!h)return;if(h.v&&h.p.mode==='gate')vStop(h.v,ac.currentTime,.05);if(h.ev)h.ev.d=+Math.max(.0625,beatNow()-h.b0).toFixed(3)},
 save:()=>{const b=$('psSv');if(b)b.click()},
 nPats:()=>PS.pats.length,
 bankStep:d=>{ensurePS();setBank((PS.bank+d+8)%8);return PS.bank},
 song:()=>({list:[...PS.song],mode:PS.songMode,pos:TR.playing&&PS.songMode?TR.songPos:-1,nextPos:TR.nextPos,follow:PS.follow}),
 setFollow:v=>{PS.follow=!!v;dirty()},
 songAdd:p=>{ensurePS();pushUndo();PS.song.push(p==null?curPat():p);renderSong();dirty()},
 songDel:i=>{ensurePS();if(i<0||i>=PS.song.length)return;pushUndo();PS.song.splice(i,1);renderSong();dirty()},
 songMove:(i,d)=>{const j=i+d;if(j<0||j>=PS.song.length)return false;pushUndo();[PS.song[i],PS.song[j]]=[PS.song[j],PS.song[i]];renderSong();dirty();return true},
 songDup:i=>{if(i<0||i>=PS.song.length)return;pushUndo();PS.song.splice(i+1,0,PS.song[i]);renderSong();dirty()},
 songClear:()=>{ensurePS();pushUndo();PS.song=[];renderSong();dirty()},
 playSong:from=>{ensurePS();if(!PS.song.length)return false;if(TR.playing)stopT();PS.songMode=true;TR.songFrom=from||0;startT();renderSong();renderPats();try{uiT()}catch(e){}return true},
 jumpPart:i=>{ensurePS();if(i<0||i>=PS.song.length)return;if(TR.playing&&PS.songMode){TR.next=PS.song[i];TR.nextPos=i;renderPats()}else{PS.songMode=true;TR.songFrom=i;if(TR.playing)stopT();startT();renderSong();try{uiT()}catch(e){}}},
 loopPart:p=>{ensurePS();PS.songMode=false;TR.nextPos=null;renderSong();selPat(p);if(!TR.playing){startT();try{uiT()}catch(e){}}renderPats()},
 nextPart:carry=>{ensurePS();const c=curPat(),N0=PS.pats.length;let t=-1;for(let k=1;k<N0;k++){const j=(c+k)%N0;if(!PS.pats[j].ev.length&&!PS.song.includes(j)&&j!==c){t=j;break}}
  if(t<0)return{err:'All 16 patterns are in use. Clear one, or reuse a part: select it and press + ADD.'};
  pushUndo();if(!PS.song.length||PS.song[PS.song.length-1]!==c)PS.song.push(c);
  const P=PS.pats[c],cp=e=>{const{_skip,...x}=e;return{...x}},N={bars:P.bars,ev:[]};
  if(carry==='all')N.ev=P.ev.map(cp);else if(carry==='on')N.ev=P.ev.filter(e=>!(P.mute||[]).includes(evKey(e))).map(cp);
  if(carry==='all'&&P.mute&&P.mute.length)N.mute=[...P.mute];if(carry!=='none'&&P.auto)N.auto=JSON.parse(JSON.stringify(P.auto));
  N.bank=P.bank!=null?P.bank:PS.bank;N.prog=P.prog||PS.prog;PS.pats[t]=N;PS.song.push(t);PS.songMode=false;dirty();renderSong();selPat(t);renderPats();return{from:c,to:t,part:PS.song.length}},
 chans:p=>{ensurePS();const P=PS.pats[p==null?curPat():p];const m=new Map();P.ev.forEach(e=>{const k=evKey(e);if(!m.has(k)){const pd=padOfEv(e);m.set(k,{k,name:pd?pd.name:'missing pad',col:pd?pd.col:'#666',n:0,on:!(P.mute||[]).includes(k)})}m.get(k).n++});return[...m.values()]},
 chanToggle:(p,k)=>{ensurePS();const P=PS.pats[p==null?curPat():p];P.mute=P.mute||[];const i=P.mute.indexOf(k);if(i>=0)P.mute.splice(i,1);else P.mute.push(k);dirty();return i>=0},
 chanAll:(p,on)=>{ensurePS();const P=PS.pats[p==null?curPat():p];P.mute=on?[]:[...new Set(P.ev.map(evKey))];dirty()},
 chanHear:k=>{ensurePS();const P=PS.pats[curPat()];const e=P.ev.find(x=>evKey(x)===k);const p=e&&padOfEv(e);if(p)audition(p,e.st||0)},
 bars:(p,b)=>{ensurePS();const P=PS.pats[p==null?curPat():p];if(b==null)return P.bars;if(![1,2,4,8].includes(b))return P.bars;pushUndo();P.bars=b;if((p==null?curPat():p)===PS.pat)$('psBars').value=b;dirty();renderAll();return b},
 partPads:p=>{const P=PS.pats[p];return P?{bank:P.bank,prog:P.prog}:{}},
 setPartPads:p=>{ensurePS();const P=PS.pats[p==null?curPat():p];P.bank=PS.bank;P.prog=PS.prog;dirty()},
 autoMode:m=>{if(m)PS.autoMode=m;return PS.autoMode},
 autoLanes:p=>{ensurePS();const P=PS.pats[p==null?curPat():p];return P&&P.auto?JSON.parse(JSON.stringify(P.auto)):{}},
 autoClear:(p,k)=>{ensurePS();const P=PS.pats[p==null?curPat():p];if(!P.auto)return;pushUndo();if(k)delete P.auto[k];else delete P.auto;dirty()},
 autoSet:(p,k,pts)=>{ensurePS();const P=PS.pats[p==null?curPat():p];P.auto=P.auto||{};P.auto[k]=pts.map(x=>({t:+x.t,v:+x.v})).sort((a,b)=>a.t-b.t);dirty()},
 level:()=>{if(!MASTER)return[0,0];if(!OSAN||OSAN.context!==MASTER.context){OSAN=MASTER.context.createAnalyser();OSAN.fftSize=1024;OSAN._noRec=1;_con.call(MASTER,OSAN);OSBUF=new Float32Array(1024)}OSAN.getFloatTimeDomainData(OSBUF);let pk=0,sq=0;for(let i=0;i<OSBUF.length;i++){const v=Math.abs(OSBUF[i]);if(v>pk)pk=v;sq+=v*v}return[Math.sqrt(sq/OSBUF.length),pk]}};
let OSAN=null,OSBUF=null;

window.DBC={ensure:()=>{ensurePS();mainFresh()},camelot,keyText,autoSetup,cam:()=>{try{return PL&&PL.sl?camelot(PL.root,PL.scale):''}catch(e){return''}}};

/* ---------- init + tab hook ---------- */
async function psInit(){if(typeof chs==='undefined'||!chs||!chs.length)return;const first=!PS.init;if(first){PS.init=true;PS.bpm=+(songBpm()).toFixed(1);buildStatic()}
 const prevMain=PS.main;regMain();
 if(first||prevMain!==PS.main){const a=LS.get('bcrps:auto:'+PS.main);if(a&&isEmpty()){try{applyProj(a,{noChop:true});PS.undo=[];msg('Restored your last Pad Studio setup for this song.')}catch(e){}}}
 syncCtl();renderAll();if(isEmpty())msg('Start with 🪄 Build it, or load pads yourself from the slice bin below.');
 try{await prep();regMain();adoptKey();renderBin();setSt('Pad Studio ready.')}catch(e){}}
const _tab=tab;
tab=function(t){curTab=t;if('APEG'.includes(t))lastSrcTab=t;if(t==='S'){try{stopAll()}catch(e){}try{lyStopAll()}catch(e){}try{eStop()}catch(e){}try{aStop()}catch(e){}try{stop()}catch(e){}
  ['tA','tP','tC','tD','tE','tG'].forEach(id=>$(id).hidden=true);['ta','tb','tc','td','te','tg'].forEach(id=>$(id).classList.remove('on'));
  $('tS').hidden=false;$('tps').classList.add('on');document.body.classList.add('wide');psInit();return}
 if(!$('tS').hidden){perf(false)}$('tS').hidden=true;$('tps').classList.remove('on');document.body.classList.remove('wide');return _tab(t)};
$('tps').onclick=()=>tab('S');
const _rb=rebuild;rebuild=function(){const r=_rb.apply(this,arguments);gMean=0;CHOPB=null;if(PS.init){regMain();renderBin();try{renderPads();renderBanks();seqDraw()}catch(e){}}return r};
})();
