/* BC-16 LOOP-TIGHT SLICING
   Sits on top of the engine's slicer (engine.js keeps its ids and globals; this only wraps grid() and rebuild()).
   1. TEMPO LOCK  — after the tempo guess, a least-squares fit of the strong hits to the beat grid fixes the exact
                    beat length and phase, so the grid stays on the beat from the first bar to the last.
   2. DEAD ENDS   — silence before the music starts and after it ends is cut off. Bar 1 starts on the first downbeat
                    with sound, and the loop length is a whole number of bars.
   3. ON THE HIT  — every cut starts at the attack of its hit on a zero crossing (no clicks). In GRID / BEAT / BAR modes,
                    a grid cut that lands near a real hit moves onto that hit's attack instead of cutting into it.
   4. LOOP CHECK  — a readout on the sampler: tempo, how tight the grid fits, what was trimmed, how many bars loop. */
(()=>{
"use strict";
if(typeof window.rebuild!=='function'||typeof window.grid!=='function'){console.warn('slicesmart: engine not found');return}
const $=id=>document.getElementById(id);
const LS=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const S={on:LS('bc16:tight')!=='0',fit:null,head:0,tail:0,cutHead:0,cutTail:0,loopBars:0,dev:0,offGrid:0,moved:0};
window.BC16_LOOP=S;

/* ---- 1. tempo lock: fit t = a + n·b over strong hits near the grid ---- */
const G0=window.grid;
window.grid=function(){let beat=G0();if(!S.on)return beat;
 try{const strong=on.filter(o=>o.r>=1);if(strong.length<8)return beat;
  let b=beat,a=phase;for(let it=0;it<3;it++){let n0=0,n1=0,sx=0,sy=0,sxx=0,sxy=0,c=0;
   for(const o of strong){const n=Math.round((o.t-a)/b),e=o.t-(a+n*b);if(Math.abs(e)>(it?0.025:0.04))continue;const w=Math.min(o.r,4);sx+=w*n;sy+=w*o.t;sxx+=w*n*n;sxy+=w*n*o.t;c+=w;n0=Math.min(n0,n);n1=Math.max(n1,n)}
   if(c<6||n1-n0<8)break;const d=c*sxx-sx*sx;if(Math.abs(d)<1e-9)break;const nb=(c*sxy-sx*sy)/d,na=(sy-nb*sx)/c;
   if(!(nb>0)||Math.abs(nb-beat)/beat>.015)break;b=nb;a=na}
  if(Math.abs(b-beat)>1e-6){const dur=y.length/sr;a=((a%b)+b)%b;const j=Math.round(((barPhase-phase)/beat))%4;
   phase=a;barPhase=a+((j%4)+4)%4*b;$('bpm').value=(60/b).toFixed(2);beat=b}
  /* how tight is the fit */
  let s=0,c=0;for(const o of strong){const n=Math.round((o.t-phase)/beat),e=o.t-(phase+n*beat);if(Math.abs(e)<.04){s+=Math.abs(e);c++}}S.fit=c?s/c:null;
 }catch(e){console.warn(e)}
 return beat};

/* ---- 2–4. after the engine cuts: dead ends, cuts on the hit, loop check ---- */
const R0=window.rebuild;
window.rebuild=function(){
 if(!S.on){R0();info();return}
 const real={draw:window.draw,pads:window.pads,reconf:window.reconf};
 window.draw=()=>{};window.pads=()=>{};window.reconf=()=>{};
 try{R0()}finally{Object.assign(window,real)}
 try{tighten()}catch(e){console.warn(e)}
 const beat=60/+$('bpm').value,bs=beat*4;bars=[];slices.forEach((x,i)=>{const k=Math.max(0,Math.floor((x.t-barPhase+beat*.2)/bs)+1);(bars[k]=bars[k]||[]).push(i)});bars=bars.filter(Boolean);
 $('info').textContent=slices.length+' slices · '+bars.length+' bars · '+manual.add.length+' added / '+manual.del.length+' removed';
 draw($('c1'),y,slices.map(x=>x.s),true);pads();prev=null;$('bk').disabled=true;reconf(true);info()};

function tighten(){
 const dur=y.length/sr,beat=60/+$('bpm').value,bl=beat*4,mode=$('mode').value;
 /* where the sound really starts and ends (−34 dB / −40 dB of the loudest moment) */
 let pk=0;for(let k=0;k<env.length;k++)if(env[k]>pk)pk=env[k];
 const thr=pk*.006;let h=0;while(h<env.length&&env[h]<thr)h++;let t=env.length-1;while(t>h&&env[t]<thr*.5)t--;
 let head=h*blk/sr;const first=on.find(o=>o.t>=head-.03&&o.t<=head+.06);if(first)head=Math.min(head,first.t);
 head=Math.max(0,snapZ(Math.floor(head*sr))/sr);if(head<.012)head=0;
 const tail=Math.min(dur,(t*blk)/sr+.04);
 S.head=head;S.tail=tail;S.cutHead=head;S.cutTail=Math.max(0,dur-tail);
 /* bar 1 = the first downbeat that has sound */
 const lim=head-beat*.5;if(barPhase<lim){barPhase+=Math.ceil((lim-barPhase)/bl)*bl}else if(barPhase-bl>=lim){barPhase-=Math.floor((barPhase-lim)/bl)*bl}
 /* grid-type cuts land on the hit they are next to */
 S.moved=0;
 if(mode==='grid'||mode==='beat'||mode==='bar'){for(let i=1;i<slices.length;i++){const x=slices[i],tt=x.s/sr;let best=null,bd=.025;for(const o of on){const d=Math.abs(o.t-tt);if(d<bd&&o.r>=.8){bd=d;best=o}}
  if(best){const ns=Math.round(best.t*sr);if(ns>slices[i-1].s+64&&ns<x.e-64&&ns!==x.s){x.s=ns;x.t=best.t;slices[i-1].e=ns;S.moved++}}}}
 /* dead ends off */
 if(head>0){const hs=Math.floor(head*sr);while(slices.length>1&&slices[0].e<=hs+Math.round(sr*.03))slices.shift();const s0=slices[0];if(s0&&s0.s<hs&&s0.e>hs+64){s0.s=hs;s0.t=head}}
 while(slices.length>1&&slices[slices.length-1].s>=tail*sr-64)slices.pop();
 const last=slices[slices.length-1];if(last&&last.e>tail*sr){const e=snapZ(Math.floor(tail*sr));if(e>last.s+64)last.e=e}
 /* the loop: whole bars from bar 1 to the end of the sound */
 S.loopBars=Math.max(1,Math.round((tail-barPhase)/bl));S.loopStart=barPhase;S.loopEnd=barPhase+S.loopBars*bl;
 /* timing: how far each cut sits from the 1/16 grid */
 const st=beat/4,tr=beat/6;let s=0,n=0,off=0;for(const x of slices){const g=phase+Math.round((x.t-phase)/st)*st,g3=phase+Math.round((x.t-phase)/tr)*tr,e=Math.min(Math.abs(x.t-g),Math.abs(x.t-g3));if(x.t<head||x.t>tail)continue;n++;if(e<=.02)s+=e;else off++}
 S.dev=n-off?s/(n-off):0;S.offGrid=off;S.n=n}

function info(){let box=$('loopChk');const inf=$('info');if(!inf)return;
 if(!box){box=document.createElement('div');box.id='loopChk';box.setAttribute('aria-live','polite');inf.closest('.card')?inf.closest('.card').querySelector('canvas#c1').after(box):inf.after(box);
  box.addEventListener('click',e=>{if(!e.target.closest('#ltOn'))return;S.on=!S.on;try{localStorage.setItem('bc16:tight',S.on?'1':'0')}catch(err){}rebuild();try{window.DBC&&DBC.ensure&&DBC.ensure()}catch(err){}})}
 const ms=v=>Math.round(v*1000);
 if(!S.on){box.innerHTML='<button id="ltOn" class="lt off" data-help="ltOn">LOOP-TIGHT OFF</button><span>Cuts as detected, nothing trimmed.</span>';return}
 const bpm=(+$('bpm').value).toFixed(2),grid=S.n?Math.round((S.n-S.offGrid)/S.n*100):0;
 box.innerHTML='<button id="ltOn" class="lt" data-help="ltOn">LOOP-TIGHT ON</button>'+
  '<span><b>'+bpm+'</b> BPM locked'+(S.fit!=null?' · hits within <b>±'+ms(S.fit)+' ms</b>':'')+'</span>'+
  '<span>front <b>'+(S.cutHead>0?'−'+S.cutHead.toFixed(2)+' s':'clean')+'</b> · end <b>'+(S.cutTail>.05?'−'+S.cutTail.toFixed(2)+' s':'clean')+'</b></span>'+
  '<span>loops <b>'+S.loopBars+' bars</b> from bar 1</span>'+
  '<span>'+grid+'% of cuts on the 1/16 or triplet grid'+(S.offGrid?' · '+S.offGrid+' off it (swing or ghost hits)':'')+(S.moved?' · '+S.moved+' grid cuts moved onto their hit':'')+'</span>'}

window.BC16_tight=()=>S;
/* the engine wired its controls to the first rebuild; point them at the current one */
['mode','bpm','sens','minl','maxl'].forEach(i=>{const x=$(i);if(x)x.onchange=()=>rebuild()});
})();
