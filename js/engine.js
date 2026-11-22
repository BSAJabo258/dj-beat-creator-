
"use strict";
const $=id=>document.getElementById(id);
let ac,buf,sr,y,chs=[],on=[],phase=0,slices=[],bars=[],result=null,prev=null,src=null,seed=1,seq=[],fname='beat';
const setSt=t=>$('st').textContent=t;
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
async function load(ab,name){setSt('Decoding…');
 try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();buf=await ac.decodeAudioData(ab);}catch(x){setSt('Could not read that file.');return}
 stop();fname=name.replace(/\.[^.]+$/,'').replace(/[^\w\-]+/g,'_')||'beat';sr=buf.sampleRate;const n=buf.length,ch=Math.min(2,buf.numberOfChannels);y=new Float32Array(n);chs=[];
 for(let c=0;c<ch;c++){const d=buf.getChannelData(c);chs.push(d);for(let i=0;i<n;i++)y[i]+=d[i]/ch}
 setSt('Analyzing rhythm…');await new Promise(r=>setTimeout(r,20));analyze();$('app').hidden=false;prev=null;manual={add:[],del:[]};
 setSt(name+' · '+(n/sr).toFixed(1)+' s · '+ch+' ch · '+sr+' Hz');rebuild();}
$('f').onchange=e=>{const f=e.target.files[0];if(f)f.arrayBuffer().then(b=>load(b,f.name))};
(()=>{const t=$('demodata').textContent.trim();if(!t)return;$('demo').hidden=false;$('demo').onclick=()=>{const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);load(u.buffer,'Taco_Dan_ramintro.m4a')}})();
let env,blk,manual={add:[],del:[]},barPhase=0;
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
 for(let l=2;l<=n;l<<=1){const a=-2*Math.PI/l,wr=Math.cos(a),wi=Math.sin(a),h=l>>1;for(let i=0;i<n;i+=l){let cr=1,ci=0;for(let j=0;j<h;j++){const u=i+j,v=u+h,xr=re[v]*cr-im[v]*ci,xi=re[v]*ci+im[v]*cr;re[v]=re[u]-xr;im[v]=im[u]-xi;re[u]+=xr;im[u]+=xi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}}
function snapZ(s,w){w=w||Math.round(sr*.002);s=Math.max(1,Math.min(y.length-2,Math.round(s)));let best=-1,bd=1e9;
 for(let i=Math.max(1,s-w);i<Math.min(y.length-1,s+w);i++)if(y[i]<=0&&y[i+1]>0){const d=Math.abs(i-s);if(d<bd){bd=d;best=i+1}}return best<0?s:best}
function snapMin(t,w){const c=Math.floor(t*sr/blk),r=Math.max(1,Math.round(w*sr/blk));let m=c,mv=1e9;
 for(let k=Math.max(1,c-r);k<=Math.min(env.length-2,c+r);k++)if(env[k]<mv){mv=env[k];m=k}return snapZ(m*blk)}
function analyze(){
 const N=1024,H=256,nf=Math.max(8,Math.floor((y.length-N)/H));blk=Math.max(8,Math.round(sr*.001));
 const ne=Math.floor(y.length/blk);env=new Float32Array(ne);
 for(let k=0;k<ne;k++){let s=0;for(let i=k*blk;i<(k+1)*blk;i++)s+=y[i]*y[i];env[k]=Math.sqrt(s/blk)}
 const win=new Float32Array(N);for(let i=0;i<N;i++)win[i]=.5-.5*Math.cos(2*Math.PI*i/N);
 const re=new Float32Array(N),im=new Float32Array(N),prev=new Float32Array(N/2),bw=sr/N;
 const b1=Math.max(2,Math.round(200/bw)),b2=Math.round(2000/bw),b3=Math.min(N/2-1,Math.round(12000/bw));
 const bd=[new Float32Array(nf),new Float32Array(nf),new Float32Array(nf)];
 for(let i=0;i<nf;i++){for(let j=0;j<N;j++){re[j]=(y[i*H+j]||0)*win[j];im[j]=0}fft(re,im);
  for(let k=1;k<=b3;k++){const m=Math.log1p(Math.hypot(re[k],im[k])*.05),d=m-prev[k];prev[k]=m;if(d>0)bd[k<b1?0:k<b2?1:2][i]+=d}}
 for(const a of bd){let m=0;for(const v of a)m+=v;m=m/nf+1e-9;for(let i=0;i<nf;i++)a[i]/=m}
 const nov=new Float32Array(nf);for(let i=0;i<nf;i++)nov[i]=bd[0][i]*1.2+bd[1][i]+bd[2][i]*.7;
 const w=Math.round(.25*sr/H),P=new Float64Array(nf+1);for(let i=0;i<nf;i++)P[i+1]=P[i]+nov[i];
 const lm=new Float32Array(nf),od=new Float32Array(nf);let sd=0;
 for(let i=0;i<nf;i++){const a=Math.max(0,i-w),b=Math.min(nf,i+w+1);lm[i]=(P[b]-P[a])/(b-a);od[i]=Math.max(0,nov[i]-lm[i]);sd+=od[i]*od[i]}sd=Math.sqrt(sd/nf)||1;
 const pk=[],md=Math.round(.035*sr/H);
 for(let i=2;i<nf-2;i++){const v=nov[i];if(v>=nov[i-1]&&v>=nov[i-2]&&v>nov[i+1]&&v>nov[i+2]&&(v-lm[i])/sd>.1){
  if(pk.length&&i-pk[pk.length-1]<md){if(v>nov[pk[pk.length-1]])pk[pk.length-1]=i}else pk.push(i)}}
 on=[];
 for(const i of pk){const tc=(i*H+N/2)/sr,ka=Math.max(2,Math.floor((tc-.05)*sr/blk)),kb=Math.min(env.length-4,Math.floor((tc+.01)*sr/blk));
  let k=ka,bs=-1;for(let q=ka;q<=kb;q++){const s=env[q+2]-env[q];if(s>bs){bs=s;k=q}}
  for(let st=0;st<20&&k>1&&env[k-1]<env[k]*.98;st++)k--;
  const t=snapZ(k*blk)/sr;if(on.length&&t-on[on.length-1].t<.02)continue;
  on.push({t,r:(nov[i]-lm[i])/sd,low:bd[0][i]})}
 /* tempo: autocorrelation of onset novelty with a musical-range prior */
 const fs=sr/H;let best=-1,bl=120;
 const ac2=(lag)=>{const L=Math.floor(lag),f=lag-L;let s=0,c=0;for(let i=0;i+L+1<nf;i++){s+=od[i]*(od[i+L]*(1-f)+od[i+L+1]*f);c++}return s/c};
 for(let bpm=60;bpm<=190;bpm+=.25){const lag=fs*60/bpm;const sc=(ac2(lag)+.6*ac2(lag*2)+.4*ac2(lag*4))*Math.exp(-.5*(Math.log2(bpm/112)/.7)**2);if(sc>best){best=sc;bl=bpm}}
 let b2s=-1,bb=bl;for(let bpm=bl-.5;bpm<=bl+.5;bpm+=.05){const lag=fs*60/bpm,sc=ac2(lag)+.6*ac2(lag*2)+.4*ac2(lag*4);if(sc>b2s){b2s=sc;bb=bpm}}
 $('bpm').value=bb.toFixed(1);}
function grid(){const beat=60/+$('bpm').value;let bp=0,bs=-1;
 for(let p=0;p<beat;p+=.002){let s=0;for(const o of on){if(o.r<.6)continue;const d=((o.t-p)%beat+beat)%beat,e=Math.min(d,beat-d);s+=Math.min(o.r,4)*Math.exp(-e*e/(2*.018*.018))}if(s>bs){bs=s;bp=p}}
 phase=bp;const sc=[0,0,0,0];
 for(const o of on){const k=((Math.round((o.t-bp)/beat)%4)+4)%4,d=Math.abs(o.t-(bp+Math.round((o.t-bp)/beat)*beat));if(d<.04)sc[k]+=o.low*Math.min(o.r,4)}
 let j=0;for(let i=1;i<4;i++)if(sc[i]>sc[j]*1.15)j=i;barPhase=bp+j*beat;return beat}
function rebuild(){const beat=grid(),dur=y.length/sr,m=$('mode').value,sens=+$('sens').value,thr=2.2-.02*sens,minL=beat*+$('minl').value,maxL=beat*+$('maxl').value;
 let ons=on.filter(o=>o.r>=thr&&o.t<dur-.01),f=[];
 for(const o of ons){if(f.length&&o.t-f[f.length-1].t<minL){if(o.r>f[f.length-1].r)f[f.length-1]=o}else f.push(o)}
 let b=[0];
 if(m==='smart'||m==='trans'){for(const o of f)b.push(o.t);b.push(dur);b.sort((a,c)=>a-c);
  if(m==='smart'&&maxL>0){const o2=[];for(let i=0;i<b.length-1;i++){o2.push(b[i]);const a=b[i],e=b[i+1];if(e-a>maxL*1.15){
   for(let t=phase+Math.ceil((a+minL-phase)/maxL)*maxL;t<e-minL;t+=maxL)o2.push(snapMin(t,.012)/sr)}}o2.push(dur);b=o2}}
 else if(m==='grid'){const st=beat/4;for(let t=phase;t<dur;t+=st)b.push(snapMin(t,.012)/sr)}
 else if(m==='beat')for(let t=phase;t<dur;t+=beat)b.push(snapMin(t,.012)/sr);
 else for(let t=barPhase;t<dur;t+=beat*4)b.push(snapMin(t,.012)/sr);
 b=b.filter(v=>!manual.del.some(d=>Math.abs(v-d)<.012));for(const a of manual.add)b.push(a);
 b=b.filter(v=>v>=0&&v<dur);b.push(dur);b.sort((a,c)=>a-c);b=b.filter((v,i,a)=>i==0||v-a[i-1]>.004);
 slices=[];for(let i=0;i<b.length-1;i++){const s=Math.floor(b[i]*sr),e=Math.floor(b[i+1]*sr);if(e-s>64)slices.push({s,e,t:b[i]})}
 const bs=beat*4;bars=[];slices.forEach((x,i)=>{const k=Math.max(0,Math.floor((x.t-barPhase+beat*.2)/bs)+1);(bars[k]=bars[k]||[]).push(i)});bars=bars.filter(Boolean);
 $('info').textContent=slices.length+' slices · '+bars.length+' bars · '+manual.add.length+' added / '+manual.del.length+' removed';
 draw($('c1'),y,slices.map(x=>x.s),true);pads();prev=null;$('bk').disabled=true;reconf(true);}
function pads(){const p=$('pads');p.textContent='';slices.forEach((s,i)=>{const b=document.createElement('button');b.textContent=i+1;b.title=((s.e-s.s)/sr*1000).toFixed(0)+' ms';b.onclick=()=>playSlice(i);p.appendChild(b)})}
function playSlice(i){const s=slices[i];stop();if(ac.state==='suspended')ac.resume();const n=s.e-s.s,b=ac.createBuffer(chs.length,n,sr);
 chs.forEach((d,c)=>{const x=d.slice(s.s,s.e),k=Math.min(Math.floor(.003*sr),n>>1);for(let j=0;j<k;j++){x[j]*=j/k;x[n-1-j]*=j/k}b.copyToChannel(x,c)});
 src=ac.createBufferSource();src.buffer=b;src.connect(ac.destination);src.onended=()=>{src=null};src.start()}
$('c1').onclick=e=>{const cv=e.currentTarget,r=cv.getBoundingClientRect(),x=e.clientX-r.left,dur=y.length/sr,t=x/r.width*dur;
 let ni=-1,nd=1e9;slices.forEach((s,i)=>{if(i===0)return;const d=Math.abs(s.s/y.length*r.width-x);if(d<nd){nd=d;ni=i}});
 if(ni>=0&&nd<9){const bt=slices[ni].s/sr,k=manual.add.findIndex(a=>Math.abs(a-bt)<.012);if(k>=0)manual.add.splice(k,1);else manual.del.push(bt)}
 else manual.add.push(snapMin(t,.006)/sr);rebuild()};
$('rst').onclick=()=>{manual={add:[],del:[]};rebuild()};
function reconf(keep){if(!keep&&result){prev={r:result,s:seq};$('bk').disabled=false}
 seed=(seed*7919+13)%1000003;const R=rng(seed),p=$('int').value/100,pre=$('pre').value,lock=$('lock').checked;
 const doRemix=pre==='remix'||pre==='glitch',doSt=pre==='stutter'||pre==='glitch',doFl=pre==='flip'||pre==='glitch';
 let bo=bars.map((_,i)=>i);
 if(doRemix){for(let i=bo.length-1;i>0;i--)if(R()<p){const j=Math.floor(R()*(i+1));[bo[i],bo[j]]=[bo[j],bo[i]]}}
 seq=[];for(const bi of bo){let a=bars[bi].slice();
  if(doRemix)for(let i=lock?1:0;i<a.length;i++)if(R()<p*.8){const j=(lock?1:0)+Math.floor(R()*(a.length-(lock?1:0)));[a[i],a[j]]=[a[j],a[i]]}
  if(doSt)for(let i=lock?1:0;i<a.length;i++)if(R()<p*.45){const n=1+Math.floor(R()*3);for(let k=1;k<=n&&i+k<a.length;k++)a[i+k]=a[i];i+=n}
  for(const i of a)seq.push({i,r:doFl&&R()<p*.6})}
 render()}
function render(){const marks=[];let tot=0;const fade=Math.floor(.004*sr);
 const parts=chs.map(()=>[]);
 for(const q of seq){const sl=slices[q.i];marks.push(tot);chs.forEach((d,ci)=>{const c=d.slice(sl.s,sl.e);if(q.r)c.reverse();const f=Math.min(fade,c.length>>1);for(let k=0;k<f;k++){c[k]*=k/f;c[c.length-1-k]*=k/f}parts[ci].push(c)});tot+=sl.e-sl.s}
 const out=parts.map(ps=>{const o=new Float32Array(tot);let pos=0;for(const c of ps){o.set(c,pos);pos+=c.length}return o});
 if($('norm').checked){let pk=0;for(const o of out)for(const v of o)pk=Math.max(pk,Math.abs(v));if(pk>1e-6)for(const o of out)for(let i=0;i<o.length;i++)o[i]*=.95/pk}
 result=out;draw($('c2'),out[0],marks);$('info2').textContent=(tot/sr).toFixed(1)+' s · '+seq.length+' hits';}
$('bk').onclick=()=>{if(!prev)return;const t={r:result,s:seq};result=prev.r;seq=prev.s;prev=t;draw($('c2'),result[0],[]);let m=0;const mk=[];for(const q of seq){mk.push(m);m+=slices[q.i].e-slices[q.i].s}draw($('c2'),result[0],mk);$('info2').textContent=(m/sr).toFixed(1)+' s · '+seq.length+' hits'};
function draw(cv,d,marks,num){cv._a=[d,marks,num];const w=cv.clientWidth,h=cv.clientHeight,r=devicePixelRatio||1;cv.width=w*r;cv.height=h*r;const g=cv.getContext('2d');g.scale(r,r);
 const cs=getComputedStyle(document.documentElement),wf=cs.getPropertyValue('--wf'),mk=cs.getPropertyValue('--mk');
 g.fillStyle=wf;const step=d.length/w;for(let x=0;x<w;x++){let mx=0;const a=Math.floor(x*step),b=Math.min(d.length,Math.floor((x+1)*step));for(let i=a;i<b;i+=Math.max(1,(b-a)>>4))mx=Math.max(mx,Math.abs(d[i]));const hh=mx*h*.48;g.fillRect(x,h/2-hh,1,Math.max(1,hh*2))}
 g.fillStyle=mk;g.globalAlpha=.7;let lx=-99;g.font='9px system-ui';marks.forEach((m,i)=>{const x=Math.floor(m/d.length*w);g.fillRect(x,0,1,h);if(num&&x-lx>16){g.globalAlpha=1;g.fillText(i+1,x+2,9);g.globalAlpha=.7;lx=x}});g.globalAlpha=1}
function stop(){if(src){src.onended=null;try{src.stop()}catch(e){}src=null}$('pa').textContent='▶ Original';$('pr').textContent='▶ New';delete $('pa').dataset.on;delete $('pr').dataset.on}
function play(d,btn){const was=btn.dataset.on;stop();if(was)return;
 if(ac.state==='suspended')ac.resume();
 const b=ac.createBuffer(d.length,d[0].length,sr);d.forEach((x,i)=>b.copyToChannel(x,i));src=ac.createBufferSource();src.buffer=b;src.loop=$('loop').checked;src.connect(ac.destination);
 src.onended=stop;src.start();btn.dataset.on=1;btn.textContent='■ Stop'}
$('pa').onclick=e=>play(chs,e.currentTarget);$('pr').onclick=e=>play(result,e.currentTarget);
/* ---- export ---- */
function rep(d,n){if(n<2)return d;return d.map(x=>{const o=new Float32Array(x.length*n);for(let k=0;k<n;k++)o.set(x,k*x.length);return o})}
function wav(d){const nc=d.length,n=d[0].length,o=new DataView(new ArrayBuffer(44+n*2*nc));const S=(p,s)=>[...s].forEach((c,i)=>o.setUint8(p+i,c.charCodeAt(0)));
 S(0,'RIFF');o.setUint32(4,36+n*2*nc,true);S(8,'WAVEfmt ');o.setUint32(16,16,true);o.setUint16(20,1,true);o.setUint16(22,nc,true);o.setUint32(24,sr,true);o.setUint32(28,sr*2*nc,true);o.setUint16(32,2*nc,true);o.setUint16(34,16,true);S(36,'data');o.setUint32(40,n*2*nc,true);
 let p=44;for(let i=0;i<n;i++)for(let c=0;c<nc;c++){o.setInt16(p,Math.round(Math.max(-1,Math.min(1,d[c][i]))*32767),true);p+=2}return new Uint8Array(o.buffer)}
function mp3(d,kb){const E=new lamejs.Mp3Encoder(d.length,sr,kb),n=d[0].length,out=[];
 const I=d.map(x=>{const a=new Int16Array(n);for(let i=0;i<n;i++)a[i]=Math.round(Math.max(-1,Math.min(1,x[i]))*32767);return a});
 for(let i=0;i<n;i+=1152){const r=d.length>1?E.encodeBuffer(I[0].subarray(i,i+1152),I[1].subarray(i,i+1152)):E.encodeBuffer(I[0].subarray(i,i+1152));if(r.length)out.push(r)}
 const f=E.flush();if(f.length)out.push(f);return new Blob(out,{type:'audio/mpeg'})}
const CT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^c>>>1:c>>>1;t.push(c>>>0)}return t})();
function crc(u){let c=~0;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^c>>>8;return~c>>>0}
function zip(files){const E=new TextEncoder(),parts=[],cd=[];let off=0;
 for(const[name,u]of files){const nm=E.encode(name),cr=crc(u),h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint32(14,cr,true);h.setUint32(18,u.length,true);h.setUint32(22,u.length,true);h.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(h.buffer),nm,u);
  const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint32(16,cr,true);c.setUint32(20,u.length,true);c.setUint32(24,u.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
  cd.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+u.length}
 let cs=0;for(const x of cd)cs+=x.length;const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cd,new Uint8Array(e.buffer)],{type:'application/zip'})}
async function save(name,blob){let d=null;try{d=await claude.use('downloads')}catch(e){}
 if(d){try{await d.save({filename:name,data:new Uint8Array(await blob.arrayBuffer())});setSt('Saved '+name);}catch(e){if(e&&e.code!=='declined')setSt('Could not save: '+(e.message||e.code))}return}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4e3);setSt('Exported '+name)}
const busy=async(b,fn)=>{b.disabled=true;setSt('Exporting…');await new Promise(r=>setTimeout(r,20));try{await fn()}catch(e){setSt('Export failed: '+(e.message||e))}b.disabled=false};
const out=()=>rep(result,+$('rep').value);
$('dw').onclick=e=>busy(e.currentTarget,()=>save(fname+'_chopped.wav',new Blob([wav(out())],{type:'audio/wav'})));
$('dm').onclick=e=>busy(e.currentTarget,()=>{if(typeof lamejs==='undefined')throw new Error('MP3 encoder could not load (needs internet). Use WAV.');return save(fname+'_chopped.mp3',mp3(out(),+$('kb').value))});
$('ds').onclick=e=>busy(e.currentTarget,()=>{const f=slices.map((s,i)=>[fname+'_slice_'+String(i+1).padStart(3,'0')+'.wav',wav(chs.map(d=>{const c=d.slice(s.s,s.e),k=Math.min(Math.floor(.004*sr),c.length>>1);for(let j=0;j<k;j++){c[j]*=j/k;c[c.length-1-j]*=j/k}return c}))]);return save(fname+'_slices.zip',zip(f))});
$('dj').onclick=e=>busy(e.currentTarget,()=>save(fname+'_arrangement.json',new Blob([JSON.stringify({source:fname,bpm:+$('bpm').value,sampleRate:sr,style:$('pre').value,intensity:+$('int').value,seed,slices:slices.map((s,i)=>({n:i+1,startSec:+(s.s/sr).toFixed(4),endSec:+(s.e/sr).toFixed(4)})),order:seq.map(q=>({slice:q.i+1,reversed:q.r}))},null,1)],{type:'application/json'})));
/* ---- PLAY ---- */
const NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],nn=m=>NN[((m%12)+12)%12]+(Math.floor(m/12)-1),nf=m=>nn(m).replace('#','s');
const SCALES={min:[0,2,3,5,7,8,10],maj:[0,2,4,5,7,9,11],pmin:[0,3,5,7,10],pmaj:[0,2,4,7,9],dor:[0,2,3,5,7,9,10],blu:[0,3,5,6,7,10],chr:[0,1,2,3,4,5,6,7,8,9,10,11]};
const LAYERS=[{id:'ld',name:'LEAD',base:72,hold:false,mono:true,chord:false,col:'#f59f00'},{id:'ch',name:'CHORDS',base:48,hold:true,mono:false,chord:true,col:'#4c6ef5'},{id:'bs',name:'BASS',base:36,hold:false,mono:true,chord:false,col:'#e03131'}];
const PL={root:9,scale:'min',kit:1,bank:'drums',page:0,pages:1,pads:[],chops:[],sl:null,fx:null,built:false,padEl:[]},BUF=new Map(),GRP=new Map(),dd=s=>(s.e-s.s)/sr;
function classify(sl){const N=2048,re=new Float32Array(N),im=new Float32Array(N),n=Math.min(N,sl.e-sl.s);
 for(let i=0;i<n;i++)re[i]=y[sl.s+i]*(.5-.5*Math.cos(Math.PI*i/n));fft(re,im);
 const bw=sr/N;let lo=0,mi=0,hi=0,pv=0,sm=0,c=0;
 for(let k=1;k<N/2;k++){const m=Math.hypot(re[k],im[k]),f=k*bw;if(f<250)lo+=m*m;else if(f<3000){mi+=m*m;if(m>pv)pv=m;sm+=m;c++}else hi+=m*m}
 const tot=lo+mi+hi+1e-12;let e=0,q=0;for(let i=sl.s;i<sl.e;i+=4){e+=y[i]*y[i];q++}
 sl.en=Math.sqrt(e/Math.max(1,q));sl.lo=lo/tot;sl.hi=hi/tot;sl.pk=pv/(sm/c+1e-12);sl.clar=0}
function kinds(){const P=(f,p)=>{const a=slices.map(s=>s[f]).sort((x,y)=>x-y);return a[Math.floor(p*(a.length-1))]},loT=Math.max(.3,P('lo',.7)),hiT=P('hi',.85),pkT=P('pk',.65);
 for(const s of slices){const d=dd(s);s.kind=s.hi>=hiT&&d<.4?'hat':s.lo>=loT&&d<1.2?'kick':s.pk>=pkT?'tone':'snare'}}
function pitch(sl){const dur=sl.e-sl.s;if(dur<sr*.07)return;const D=4,fs=sr/D,W=1024,st=sl.s+Math.floor(Math.min(dur*.25,sr*.05)),n=Math.min(W,Math.floor((sl.e-st)/D));if(n<300)return;
 const x=new Float32Array(n);for(let i=0;i<n;i++){let s=0;for(let k=0;k<D;k++)s+=y[st+i*D+k]||0;x[i]=s/D}
 const lmin=Math.max(2,Math.floor(fs/1000)),lmax=Math.min((n>>1)-2,Math.floor(fs/40)),r=new Float32Array(lmax+2);
 for(let l=lmin;l<=lmax;l++){let a=0,m=0;for(let i=0;i+l<n;i++){a+=x[i]*x[i+l];m+=x[i]*x[i]+x[i+l]*x[i+l]}r[l]=m>0?2*a/m:0}
 let mx=0;for(let l=lmin+1;l<lmax;l++)if(r[l]>r[l-1]&&r[l]>=r[l+1]&&r[l]>mx)mx=r[l];let bl=0;
 for(let l=lmin+1;l<lmax;l++)if(r[l]>r[l-1]&&r[l]>=r[l+1]&&r[l]>=.9*mx&&r[l]>.5){bl=l;break}
 if(!bl)return;const a=r[bl-1],b=r[bl],c=r[bl+1],dn=a-2*b+c,sh=dn?.5*(a-c)/dn:0,f=fs/(bl+sh);sl.clar=b;sl.midi=69+12*Math.log2(f/440)}
function detectKey(){const h=new Array(12).fill(0);let n=0;for(const s of slices)if(s.clar>.8&&s.midi>=28&&s.midi<=96){h[Math.round(s.midi)%12]+=s.clar*s.en*Math.min(1,dd(s)*3);n++}
 if(n<3)return null;const maj=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],mn=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
 const cor=(p,r)=>{let ma=0,mb=0;for(let i=0;i<12;i++){ma+=h[i];mb+=p[i]}ma/=12;mb/=12;let a=0,b=0,c=0;for(let i=0;i<12;i++){const u=h[(i+r)%12]-ma,v=p[i]-mb;a+=u*v;b+=u*u;c+=v*v}return a/Math.sqrt(b*c+1e-12)};
 let best=-9,res={root:9,scale:'min'};for(let r=0;r<12;r++){const a=cor(maj,r),b=cor(mn,r);if(a>best){best=a;res={root:r,scale:'maj'}}if(b>best){best=b;res={root:r,scale:'min'}}}res.n=n;return res}
function pickLayers(){const pc=slices.filter(s=>s.clar>.75&&s.midi>=20&&dd(s)>=.09),pool=pc.length?pc:slices.filter(s=>dd(s)>.1);
 const sc={bs:s=>(s.clar||.5)*s.en*((s.midi||99)<52?2:1)*(s.lo+.3),ch:s=>(s.clar||.5)*s.en*Math.min(dd(s),1.5)*(dd(s)>.35?1.5:1),ld:s=>(s.clar||.5)*s.en*((s.midi||0)>=57?1.6:1)*(dd(s)<.7?1.3:1)},used=new Set();
 for(const id of['ch','bs','ld']){const L=LAYERS.find(l=>l.id===id);L.list=[...pool].sort((a,b)=>sc[id](b)-sc[id](a)).slice(0,12);L.oct=0;L.i=Math.max(0,L.list.findIndex(s=>!used.has(s)));if(L.list[L.i])used.add(L.list[L.i])}}
function buildKit(){const R=rng(PL.kit*7919+3),used=new Set(),by=(k,f)=>slices.filter(s=>s.kind===k&&dd(s)>.03).sort((a,b)=>f(b)-f(a));
 const take=(arr,n)=>{const top=arr.filter(s=>!used.has(s)).slice(0,6);if(PL.kit>1)for(let i=top.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[top[i],top[j]]=[top[j],top[i]]}const o=top.slice(0,n);o.forEach(s=>used.add(s));return o};
 const hats=by('hat',s=>s.en*s.hi),pool=()=>slices.filter(s=>!used.has(s)&&dd(s)<.6).sort((a,b)=>b.en-a.en);
 const K=take(by('kick',s=>s.lo*s.en/(1+dd(s))),2),S=take(by('snare',s=>s.en*(1-s.lo)/(1+dd(s))),2),HC=take(hats.filter(s=>dd(s)<.15),2),HO=take(hats.filter(s=>dd(s)>=.15),1);
 const PC=take(slices.filter(s=>!used.has(s)&&dd(s)<.35&&s.kind!=='tone').sort((a,b)=>b.en-a.en),4),ST=take(slices.filter(s=>s.clar>.7&&dd(s)<.6).sort((a,b)=>b.clar*b.en-a.clar*a.en),4);
 const spec=[[K,0,'KICK'],[K,1,'KICK 2'],[S,0,'SNARE'],[S,1,'SNARE 2'],[HC,0,'HAT','hat'],[HC,1,'HAT 2','hat'],[HO,0,'OPEN','hat'],[PC,0,'PERC'],[PC,1,'PERC 2'],[PC,2,'PERC 3'],[PC,3,'PERC 4'],[ST,0,'STAB'],[ST,1,'STAB 2'],[ST,2,'STAB 3'],[ST,3,'STAB 4']];
 const out=spec.map(([a,i,l,g])=>({sl:a[i],label:l,grp:g||null}));const fill=pool();
 out.forEach(p=>{if(!p.sl){p.sl=fill.shift();used.add(p.sl)}});
 const fx=fill.sort((a,b)=>dd(b)-dd(a))[0];out.push({sl:fx,label:'LONG',grp:null});
 PL.pads=out.map(p=>p.sl?{s:p.sl.s,e:p.sl.e,label:p.label,grp:p.grp,sub:p.label.startsWith('STAB')&&p.sl.midi?nn(Math.round(p.sl.midi)):Math.round(dd(p.sl)*1000)+'ms'}:null)}
function buildChops(){const beat=60/+$('bpm').value,dur=y.length/sr;PL.pages=Math.max(1,Math.ceil((dur-barPhase)/(beat*16)));PL.page=Math.max(0,Math.min(PL.page,PL.pages-1));
 const t0=Math.max(0,barPhase)+PL.page*16*beat,out=[],cut=$('cutc').checked?'chop':null;
 if($('cm').value==='beat'){for(let i=0;i<16;i++){const a=t0+i*beat,b=a+beat;if(a>=dur-.05)break;const sa=snapMin(a,.012),sb=Math.min(y.length,snapMin(Math.min(b,dur),.012));if(sb-sa>400)out.push({s:sa,e:sb,label:(PL.page*4+Math.floor(i/4)+1)+'.'+(i%4+1),grp:cut,sub:Math.round((sb-sa)/sr*1000)+'ms'})}}
 else{const list=slices.filter(x=>x.t>=t0-.02&&x.t<t0+16*beat);for(let i=0;i<Math.min(16,list.length);i++)out.push({s:list[i].s,e:list[i].e,label:String(i+1),grp:cut,sub:Math.round(dd(list[i])*1000)+'ms'})}
 PL.chops=out}
function fxIn(){if(PL.fx)return PL.fx.i;const i=ac.createGain(),lp=ac.createBiquadFilter(),dry=ac.createGain(),wet=ac.createGain(),cv=ac.createConvolver(),out=ac.createGain(),cp=ac.createDynamicsCompressor();
 lp.type='lowpass';lp.frequency.value=20000;lp.Q.value=.7;const n=Math.floor(sr*1.6),ib=ac.createBuffer(2,n,sr);
 for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let k=0;k<n;k++)d[k]=(Math.random()*2-1)*Math.pow(1-k/n,2.6)}cv.buffer=ib;
 i.connect(lp);lp.connect(dry);lp.connect(cv);cv.connect(wet);dry.connect(out);wet.connect(out);wet.gain.value=0;out.gain.value=.85;out.connect(cp);cp.connect(ac.destination);PL.fx={i,lp,wet};return i}
function fxSet(){if(!PL.fx)fxIn();PL.fx.lp.frequency.value=200*Math.pow(100,$('fc').value/100);PL.fx.wet.gain.value=$('fr').value/100*.9}
function getBuf(s,e,rev){const k=s+':'+e+(rev?'r':''),h=BUF.get(k);if(h)return h;const n=e-s,b=ac.createBuffer(chs.length,n,sr),f=Math.min(Math.floor(.003*sr),n>>1);
 chs.forEach((d,c)=>{const x=d.slice(s,e);if(rev)x.reverse();for(let j=0;j<f;j++){x[j]*=j/f;x[n-1-j]*=j/f}b.copyToChannel(x,c)});BUF.set(k,b);return b}
function mk(s,rate,vel,hold,when){const b=s.ab||getBuf(s.s,s.e),src=ac.createBufferSource(),g=ac.createGain(),t=when||ac.currentTime;src.buffer=b;src.playbackRate.value=rate;
 if(hold){src.loop=true;src.loopStart=b.duration*.35;src.loopEnd=b.duration}g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(Math.pow(vel,1.3)*.9,t+.004);src.connect(g);g.connect(fxIn());src.start(t);return{src,g}}
function stopV(v,rel){const t=ac.currentTime;v.g.gain.cancelScheduledValues(t);v.g.gain.setTargetAtTime(0,t,rel||.04);try{v.src.stop(t+.4)}catch(e){}}
function stopAll(){for(const S of GRP.values()){for(const v of S)stopV(v);S.clear()}LAYERS.forEach(L=>{(L.cur||[]).forEach(v=>stopV(v));L.cur=[]})}
const vOf=(e,el)=>{if(!$('tv').checked)return .85;const r=el.getBoundingClientRect();return .4+.6*Math.min(1,Math.max(0,(e.clientY-r.top)/Math.max(1,r.height)))};
const buzz=()=>{if($('hp').checked&&navigator.vibrate)navigator.vibrate(7)};
function padDown(j,e,el){const p=(PL.bank==='drums'?PL.pads:PL.bank==='groups'?(PL.gpads||[]):PL.chops)[j];if(!p)return;if(ac.state==='suspended')ac.resume();const v=mk(p,1,vOf(e,el),false);
 if(p.grp){let S=GRP.get(p.grp);if(!S){S=new Set();GRP.set(p.grp,S)}for(const o of S)stopV(o,.015);S.clear();S.add(v)}buzz()}
function notesFor(L,d){const sc=SCALES[PL.scale],n=sc.length,base=L.base-L.base%12+PL.root+12*L.oct,deg=k=>base+12*Math.floor(k/n)+sc[((k%n)+n)%n];
 return L.chord?(n>7?[deg(d),deg(d)+4,deg(d)+7]:[deg(d),deg(d+2),deg(d+4)]):[deg(d)]}
function playNote(L,m,vel,when){const s=L.list&&L.list[L.i];if(!s)return null;const nat=s.clar>.6&&s.midi!==undefined?s.midi:L.base-L.base%12+PL.root;let st=m-nat;while(st>24)st-=12;while(st<-24)st+=12;return mk(s,Math.pow(2,st/12),vel,L.hold,when)}
function keyDown(L,d,e,el){if(ac.state==='suspended')ac.resume();if(L.mono){(L.cur||[]).forEach(v=>stopV(v,.02));L.cur=[]}const ns=notesFor(L,d),vl=vOf(e,el),t=ac.currentTime,vs=[];
 ns.forEach((m,i)=>{const v=playNote(L,m,vl*(ns.length>1?.75:1),t+i*.012);if(v){vs.push(v);(L.cur=L.cur||[]).push(v)}});buzz();return vs}
function keyUp(L,vs){if(L.hold)vs.forEach(v=>stopV(v,.07))}
function buildLayers(){const c=$('lays');c.textContent='';
 LAYERS.forEach(L=>{const d=document.createElement('div');d.className='layer';d.style.setProperty('--lc',L.col);
  d.innerHTML='<div class="lh"><b>'+L.name+'</b><button data-a="p">‹</button><span class="ls"></span><button data-a="n">›</button><span class="sp"></span><button data-a="od">Oct −</button><button data-a="ou">Oct +</button><button data-a="h" class="tg">HOLD</button><button data-a="c" class="tg">CHORD</button></div><div class="ks"></div>';
  L.el=d;L.ks=d.querySelector('.ks');L.ls=d.querySelector('.ls');
  d.querySelector('.lh').onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const n=(L.list||[]).length;
   if(a==='p'||a==='n'){if(!n)return;L.i=(L.i+(a==='n'?1:n-1))%n;prevL(L)}else if(a==='od')L.oct=Math.max(-2,L.oct-1);else if(a==='ou')L.oct=Math.min(2,L.oct+1);else if(a==='h')L.hold=!L.hold;else if(a==='c')L.chord=!L.chord;lab(L);keysFor(L)};
  const act=new Map(),keyAt=e=>{const k=document.elementFromPoint(e.clientX,e.clientY);return k&&k.closest&&k.closest('.key')&&L.ks.contains(k)?k.closest('.key'):null};
  const press=(id,k,e)=>{k.classList.add('on');act.set(id,{k,vs:keyDown(L,+k.dataset.d,e,k)})},rel=a=>{a.k.classList.remove('on');keyUp(L,a.vs)};
  L.ks.onpointerdown=e=>{e.preventDefault();try{L.ks.setPointerCapture(e.pointerId)}catch(x){}const k=keyAt(e);if(k)press(e.pointerId,k,e)};
  L.ks.onpointermove=e=>{const a=act.get(e.pointerId);if(!a)return;const k=keyAt(e);if(k&&k!==a.k){rel(a);press(e.pointerId,k,e)}};
  const up=e=>{const a=act.get(e.pointerId);if(a){rel(a);act.delete(e.pointerId)}};L.ks.onpointerup=up;L.ks.onpointercancel=up;L.ks.oncontextmenu=e=>e.preventDefault();
  c.appendChild(d)});PL.built=true}
function prevL(L){const v=playNote(L,notesFor(L,0)[0],.8);if(v&&!L.hold)setTimeout(()=>{},0);if(v&&L.hold)setTimeout(()=>stopV(v,.1),500)}
function keysFor(L){L.ks.textContent='';const n=SCALES[PL.scale].length;
 for(let d=0;d<8;d++){const m=notesFor({...L,chord:false},d)[0],b=document.createElement('button');b.className='key'+(d%n===0?' r':'');b.dataset.d=d;b.innerHTML=NN[m%12]+'<small>'+(Math.floor(m/12)-1)+'</small>';L.ks.appendChild(b)}
 L.el.querySelectorAll('.tg').forEach(b=>b.classList.toggle('on',b.dataset.a==='h'?L.hold:L.chord))}
function lab(L){const s=L.list&&L.list[L.i];L.ls.textContent=s?(L.i+1)+'/'+L.list.length+' · '+(s.clar>.6&&s.midi!==undefined?nn(Math.round(s.midi)):'untuned')+' · '+Math.round(dd(s)*1000)+'ms':'no sound'}
function padsRender(){const arr=PL.bank==='drums'?PL.pads:PL.bank==='groups'?(PL.gpads||[]):PL.chops;PL.padEl.forEach((el,j)=>{const p=arr[j];el.disabled=!p;el.className='pad'+(PL.bank==='chops'?' ch':'');el.innerHTML=p?p.label+'<small>'+p.sub+'</small>':''});
 $('bd').classList.toggle('on',PL.bank==='drums');$('bc').classList.toggle('on',PL.bank==='chops');$('bg').classList.toggle('on',PL.bank==='groups');$('chopx').hidden=PL.bank!=='chops';
 $('nl').textContent=PL.bank==='groups'?'Group pads':PL.bank==='drums'?'Kit '+PL.kit:'Bars '+(PL.page*4+1)+'–'+(PL.page*4+4)+' of '+Math.ceil(PL.pages*4)}
function renderAll(){if(!PL.built)buildLayers();LAYERS.forEach(L=>{lab(L);keysFor(L)});padsRender()}
async function prep(){if(PL.sl===slices)return;
 setSt('Sorting and tuning your sounds…');await new Promise(r=>setTimeout(r,30));
 slices.forEach(classify);kinds();let np=0;for(const s of slices){if(s.kind!=='hat')pitch(s);if(s.clar>.8)np++}
 const k=detectKey();if(k){PL.root=k.root;PL.scale=k.scale;$('ki').textContent='Detected key: '+NN[k.root]+(k.scale==='min'?' minor':' major')+' · '+k.n+' tuned sounds'}else{PL.root=9;PL.scale='min';$('ki').textContent='No clear pitch found — keys assume A minor. Set the key below.'}
 $('kr').value=PL.root;$('ks').value=PL.scale;pickLayers();PL.kit=1;PL.page=0;buildKit();buildChops();PL.sl=slices;BUF.clear()}
async function playInit(){await prep();renderAll();setSt('Ready — play!')}
function cutData(s,e){return chs.map(d=>{const c=d.slice(s,e),k=Math.min(Math.floor(.004*sr),c.length>>1);for(let j=0;j<k;j++){c[j]*=j/k;c[c.length-1-j]*=j/k}return c})}
const slug=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
function kitFiles(){const F=[],E=new TextEncoder(),sc=PL.scale;
 PL.pads.forEach((p,j)=>{if(p)F.push(['drums/'+String(j+1).padStart(2,'0')+'_'+slug(p.label)+'.wav',wav(cutData(p.s,p.e))])});
 LAYERS.forEach(L=>(L.list||[]).slice(0,6).forEach((s,i)=>F.push(['keys/'+L.id+'_'+(i+1)+'_'+(s.clar>.6&&s.midi!==undefined?nf(Math.round(s.midi)):'untuned')+'.wav',wav(cutData(s.s,s.e))])));
 PL.chops.forEach(p=>F.push(['chops/bars_'+String(PL.page*4+1).padStart(2,'0')+'_'+slug(p.label)+'.wav',wav(cutData(p.s,p.e))]));
 F.push(['README.txt',E.encode('Beat Chopper kit pack\nSource: '+fname+'\nKey: '+NN[PL.root]+' '+sc+'\nTempo (detected/set in Chopper): '+$('bpm').value+' BPM\n\ndrums/  curated kit, numbered like MPC pads 1-16 (bottom-left first)\nkeys/   tuned sounds for bass/chords/lead; the note in the file name is the detected pitch\nchops/  beat-aligned chops of the current section\n')]);return F}
function allFiles(){return slices.map((s,i)=>[s.kind+'/'+String(i+1).padStart(4,'0')+'_'+(s.clar>.6&&s.midi!==undefined?nf(Math.round(s.midi)):'x')+'_'+Math.round(dd(s)*1000)+'ms.wav',wav(cutData(s.s,s.e))])}
(()=>{const g=$('pg');for(let r=0;r<4;r++)for(let c=0;c<4;c++){const j=(3-r)*4+c,el=document.createElement('button');PL.padEl[j]=el;
 el.onpointerdown=e=>{e.preventDefault();el.classList.add('on');padDown(j,e,el)};const up=()=>el.classList.remove('on');el.onpointerup=up;el.onpointercancel=up;el.onpointerleave=up;el.oncontextmenu=e=>e.preventDefault();g.appendChild(el)}})();
const KEYS=['1234','qwer','asdf','zxcv'];
addEventListener('keydown',e=>{if($('tP').hidden||e.repeat||e.metaKey||e.ctrlKey||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;
 for(let r=0;r<4;r++){const c=KEYS[r].indexOf(e.key.toLowerCase());if(c>=0){const j=(3-r)*4+c,el=PL.padEl[j];el.classList.add('on');setTimeout(()=>el.classList.remove('on'),110);padDown(j,{clientY:0},{getBoundingClientRect:()=>({top:0,height:1})})}}});
function tab(t){stopAll();$('tG').hidden=t!=='G';$('tg').classList.toggle('on',t==='G');if(t!=='D')lyStopAll();$('tD').hidden=t!=='D';$('td').classList.toggle('on',t==='D');$('tE').hidden=t!=='E';$('te').classList.toggle('on',t==='E');if(t!=='E')eStop();aStop();$('tA').hidden=t!=='A';$('tP').hidden=t!=='P';$('tC').hidden=t!=='C';$('ta').classList.toggle('on',t==='A');$('tb').classList.toggle('on',t==='P');$('tc').classList.toggle('on',t==='C');
 if(t==='A')['c1','c2'].forEach(id=>{const c=$(id);if(c._a)draw(c,...c._a)});else if(t==='P')playInit();else if(t==='D')pianoInit();else if(t==='E')partsInit();else if(t==='G')gInit();else{if(!AR.tt)$('at').value=(+$('bpm').value).toFixed(1);if(!AR.sec.length){modeDef();sections()}tlDraw();if(!AR.mix||AR.slSrc!==slices||(AR.bpmSrc!==$('bpm').value&&!AR.tt)){AR.bpmSrc=$('bpm').value;AR.slSrc=slices;doProduce()}}}
$('ta').onclick=()=>tab('A');$('tb').onclick=()=>tab('P');
$('bd').onclick=()=>{PL.bank='drums';padsRender()};$('bg').onclick=()=>{PL.bank='groups';gSync();padsRender()};$('bc').onclick=()=>{PL.bank='chops';buildChops();padsRender()};
$('np').onclick=()=>{if(PL.bank==='drums'){PL.kit=Math.max(1,PL.kit-1);buildKit()}else{PL.page--;buildChops()}padsRender()};
$('nx').onclick=()=>{if(PL.bank==='drums'){PL.kit++;buildKit()}else{PL.page=Math.min(PL.pages-1,PL.page+1);buildChops()}padsRender()};
$('cm').onchange=()=>{buildChops();padsRender()};$('cutc').onchange=()=>{buildChops();padsRender()};
$('kr').onchange=()=>{PL.root=+$('kr').value;LAYERS.forEach(keysFor)};$('ks').onchange=()=>{PL.scale=$('ks').value;LAYERS.forEach(keysFor)};
$('fc').oninput=fxSet;$('fr').oninput=fxSet;
$('stg').onclick=()=>{const el=$('tP'),on=el.classList.toggle('stage');$('stg').textContent=on?'✕ Exit stage':'⛶ Stage mode';document.documentElement.style.overflow=on?'hidden':'';
 if(on&&el.requestFullscreen)el.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{})};
$('kx').onclick=e=>busy(e.currentTarget,()=>save(fname+'_kit_pack.zip',zip(kitFiles())));
$('ax').onclick=e=>busy(e.currentTarget,()=>save(fname+'_all_slices_sorted.zip',zip(allFiles())));
/* ---- PRODUCE ---- */
const AR={seed:1,sec:[],ev:[],tl:[],mix:null,pb:null,src:null,off:0,at:0,bpm:90,beats:0,seg:{},tok:0,gain:1,init:false,tt:false,lpOk:true};
const GMN=[36,35,38,40,42,44,46,39,37,56,54,70,69,75,76,49],GRPS=['drum','bass','chord','lead','loop'],LVL={drum:1,bass:.85,chord:.45,lead:.42,loop:.8};
const TYPES={intro:{n:'Intro',d:0,lp:900,loop:'A',rx:0,ch:'pad',ld:0,bs:0,col:'#868e96'},verse:{n:'Verse',d:2,lp:20000,loop:'A',rx:.15,ch:'pad',ld:0,bs:1,col:'#4c6ef5'},hook:{n:'Hook',d:3,lp:20000,loop:'B',rx:.45,ch:'stab',ld:1,bs:1,col:'#f76707'},main:{n:'Groove',d:3,lp:20000,loop:'B',rx:.3,ch:'stab',ld:1,bs:1,col:'#12b886'},bridge:{n:'Breakdown',d:0,lp:1800,loop:'C',rx:.3,ch:'pad',ld:1,bs:0,col:'#ae3ec9'},outro:{n:'Outro',d:1,lp:1200,loop:'A',rx:0,ch:'pad',ld:0,bs:0,col:'#868e96'}};
const TPL={loop:[['main',8]],ab:[['verse',8],['hook',8]],full:[['intro',4],['verse',8],['hook',8],['verse',8],['hook',8],['bridge',4],['hook',8],['outro',4]],pro:[['intro',8],['verse',16],['hook',8],['verse',16],['hook',8],['bridge',8],['hook',16],['outro',8]]};
const PROG={min:[[0,5,2,6],[0,3,5,4],[0,6,5,6],[0,2,6,5],[0,5,3,6]],maj:[[0,4,5,3],[5,3,0,4],[0,5,3,4],[0,3,4,3]],dor:[[0,3,0,6],[0,6,3,0]]};
const lay=id=>LAYERS.find(l=>l.id===id),arrScale=()=>SCALES[{min:'min',maj:'maj',pmin:'min',pmaj:'maj',dor:'dor',blu:'min',chr:'min'}[PL.scale]];
function progFor(R){const k=PL.scale==='maj'||PL.scale==='pmaj'?'maj':PL.scale==='dor'?'dor':'min',a=PROG[k];return a[Math.floor(R()*a.length)]}
function degMidi(L,k,sh){const sc=arrScale(),n=sc.length,base=L.base-L.base%12+PL.root+12*L.oct+(sh||0);return base+12*Math.floor(k/n)+sc[((k%n)+n)%n]}
function pitched(L,m,t,dur,v,g){const s=L&&L.list&&L.list[L.i];if(!s)return;const nat=s.clar>.6&&s.midi!==undefined?s.midi:L.base-L.base%12+PL.root;let st=m-nat;while(st>24)st-=12;while(st<-24)st+=12;
 AR.ev.push({t,g,s:s.s,e:s.e,rate:Math.pow(2,st/12),v,dur:Math.max(.12,dur),loop:true,m})}
function findSegs(){const beat0=60/+$('bpm').value,bl=4*beat0,dur=y.length/sr,nb=Math.floor((dur-Math.max(0,barPhase))/bl);AR.seg={};if(nb<2)return false;
 const L=Math.min(4,nb),en=[],dn=[];
 for(let n=0;n<nb;n++){const a=barPhase+n*bl,b=a+bl;let s=0,c=0;for(let k=Math.floor(a*sr/blk);k<Math.min(env.length,Math.floor(b*sr/blk));k++){s+=env[k];c++}en.push(s/Math.max(1,c));dn.push(on.filter(o=>o.t>=a&&o.t<b).length)}
 const me=Math.max(...en)||1,md=Math.max(...dn)||1,W=[];
 for(let n=0;n+L<=nb;n++){let e=0,d=0,mn=1e9;for(let k=0;k<L;k++){e+=en[n+k];d+=dn[n+k];mn=Math.min(mn,en[n+k])}e/=L;d/=L;const ok=mn>.3*e;W.push({n,sc:(ok?1:.4)*(.6*e/me+.4*d/md),e,ok})}
 W.sort((a,b)=>b.sc-a.sc);const B=W[0],A=W.find(w=>Math.abs(w.n-B.n)>=L)||W[Math.min(1,W.length-1)],C=W.filter(w=>w.ok&&Math.abs(w.n-B.n)>=L&&Math.abs(w.n-A.n)>=L).sort((a,b)=>a.e-b.e)[0]||A;
 for(const[k,w]of[['A',A],['B',B],['C',C]]){const t0=barPhase+w.n*bl,bs=[];for(let i=0;i<=L*4;i++)bs.push(Math.min(y.length,snapMin(Math.min(t0+i*beat0,dur),.012)));AR.seg[k]={bs,L,n:w.n}}return true}
function drumBar(R,t0,lv,st,cx,sw,fill,ks){const A=(s,i,v,dur)=>{const p=PL.pads[i];if(!p)return;const sh=Number.isInteger(s)&&s%2?sw*.12:0;
  AR.ev.push({t:t0+s*.25+sh,g:'drum',s:p.s,e:p.e,rate:1,v:Math.max(.1,Math.min(1,(v+R()*8-4)/127)),nt:GMN[i],dur:dur||null});if(i<2)ks.push(s)},hat=(s,v)=>A(s,R()<.25?5:4,v),pc=s=>A(s,7+Math.floor(R()*4),58);
 if(st==='house'){if(lv===0)for(const s of[2,6,10,14])hat(s,40);else{for(const s of[0,4,8,12])A(s,0,lv===1?95:112);for(const s of[2,6,10,14])hat(s,lv===1?66:88);
   if(lv>=2)for(const s of[4,12])A(s,3,98);if(lv===3){for(let s=1;s<16;s+=2)if(R()<cx*.35)hat(s,40);if(R()<cx*.5)pc(11);if(R()<.4)A(14,6,70,.75)}}}
 else if(st==='trap'){if(lv===0)for(let s=0;s<16;s+=4)hat(s,38);else if(lv===1){A(0,0,105);for(let s=0;s<16;s+=2)hat(s,s%4?50:65)}
  else{A(0,0,118);for(const s of[7,10,11,14])if(R()<(lv===3?.25+cx*.5:cx*.3))A(s,R()<.3?1:0,100);A(8,2,112);if(lv===3&&R()<cx*.4)A(4,3,60);
   for(let s=0;s<16;s+=2)hat(s,s%4?62:82);for(let s=1;s<16;s+=2)if(R()<cx*(lv===3?.5:.25))hat(s,42);if(lv===3&&R()<.3)A(14,6,70,.75)}}
 else{const lf=st==='lofi'?.85:1;if(lv===0){for(const s of[0,8])hat(s,36)}else if(lv===1){A(0,0,105*lf);if(R()<.6)A(10,0,90*lf);for(let s=0;s<16;s+=2)hat(s,52)}
  else{A(0,0,115*lf);A(10,0,100*lf);for(const s of[3,7,13])if(R()<cx*(lv===3?.45:.25))A(s,R()<.3?1:0,85*lf);for(const s of[4,12])A(s,2,108*lf);
   for(let s=0;s<16;s+=2)if(st!=='lofi'||R()<.85)hat(s,s%4?60:78);for(let s=1;s<16;s+=2)if(R()<cx*(lv===3?.4:.2))hat(s,40);
   if(lv===3){for(const s of[7,15])if(R()<cx*.3)A(s,2,45);for(const s of[2,6,14])if(R()<cx*.35)pc(s);if(R()<.3)A(14,6,70,.75)}}}
 if(fill)for(let k=0;k<4;k++)A(12+k,2,60+k*14)}
function bassBar(R,t0,r,ks,cx){const BS=lay('bs');let h=[...new Set(ks)].sort((a,b)=>a-b);if(!h.length)h=[0,6,10];if(h[0]!==0)h.unshift(0);
 h.forEach((s,i)=>{const nx=h[i+1]!==undefined?h[i+1]:16;let deg=r;if(i>0&&R()<cx*.2)deg=r+4;let m=degMidi(BS,deg);if(i>0&&R()<cx*.18)m+=12;pitched(BS,m,t0+s*.25,(nx-s)*.25*.92,.82,'bass')})}
function chordBar(R,t0,r,mode,cx){const CH=lay('ch'),ns=[0,2,4].map(i=>degMidi(CH,r+i));
 if(mode==='pad')ns.forEach((m,i)=>pitched(CH,m,t0+i*.01,3.9,.55,'chord'));
 else[0,3,6,10].filter((s,i)=>i===0||R()<.5+cx*.3).forEach(s=>ns.forEach((m,i)=>pitched(CH,m,t0+s*.25+i*.008,.45,.62,'chord')))}
function motif(R,cx){return[0,1].map(()=>{const k=2+Math.floor(R()*3+cx*2),u=new Set(),a=[];while(a.length<k){const s=[0,2,3,4,6,8,10,11,12,14][Math.floor(R()*10)];if(u.has(s))continue;u.add(s);a.push({s,o:[0,2,4,1,3,7][Math.floor(R()*6)],l:2+Math.floor(R()*3)})}return a.sort((x,z)=>x.s-z.s)})}
function loopBlock(R,seg,t0,bars,rx,fill,gain,g){const bs=seg.bs,push=(s,e,t,v,rev,dur)=>{if(e-s>200)AR.ev.push({t,g:'loop',s,e,rate:g,v,rev:!!rev,dur:dur||null})},n=bars*4;
 if(rx<.02&&!fill){push(bs[0],bs[n],t0,gain);return}
 for(let b=0;b<bars;b++){const ord=[0,1,2,3];for(let j=1;j<4;j++)if(R()<rx*.9){const k=1+Math.floor(R()*3);[ord[j],ord[k]]=[ord[k],ord[j]]}
  for(let j=0;j<4;j++){const i=b*4+ord[j],a=bs[i],e=bs[i+1],t=t0+b*4+j;
   if(fill&&b===bars-1&&j===3){const q=a+(e-a)*.75;for(let k=0;k<4;k++)push(q,e,t+k*.25,gain*(.6+.1*k),false,.25)}
   else if(j>0&&R()<rx*.3){const m=a+(e-a)*.5;push(a,m,t,gain,false,.5);push(a,m,t+.5,gain*.85,false,.5)}
   else push(a,e,t,gain,j===3&&R()<rx*.18)}}}
function sections(){AR.sec=TPL[$('as').value].map(([ty,b])=>({type:ty,bars:b,on:true,v:0}));secUI()}
function arrange(){AR.ev=[];AR.tl=[];const st=$('ast').value,cx=$('ae').value/100,sw=$('aw').value/100,rebuilt=$('am').value==='rebuild';
 AR.bpm=Math.max(40,Math.min(220,+$('at').value||90));const g=AR.bpm/+$('bpm').value,useLoop=$('tgl').checked&&findSegs();AR.lpOk=!$('tgl').checked||useLoop;
 LVL.loop=$('al').value/100;const secs=AR.sec.filter(s=>s.on),tk=Object.keys(TYPES);let bar=0;
 secs.forEach((sec,si)=>{const T=TYPES[sec.type],tix=tk.indexOf(sec.type),R=rng(AR.seed*977+si*131+sec.v*7919+sec.bars),t0=bar*4,nx=secs[si+1],prog=progFor(rng(AR.seed*31+tix*17)),mo=motif(rng(AR.seed*53+tix*11),cx),
   last=!nx||nx.type!==sec.type,hookNext=nx&&(nx.type==='hook'||nx.type==='main')&&sec.type!==nx.type;
  AR.tl.push({t:t0,bars:sec.bars,type:sec.type,name:T.n,col:T.col,lp:T.lp,hookNext:!!hookNext,last:!nx});
  if((sec.type==='hook'||sec.type==='main')&&$('tgd').checked&&PL.pads[15]&&(si===0||secs[si-1].type!==sec.type)){const p=PL.pads[15];AR.ev.push({t:t0,g:'drum',s:p.s,e:p.e,rate:1,v:.6,nt:49,dur:null})}
  if(useLoop&&$('tgl').checked){const seg=AR.seg[T.loop];for(let b=0;b*seg.L<sec.bars;b++){const nb=Math.min(seg.L,sec.bars-b*seg.L),isLast=(b+1)*seg.L>=sec.bars;
    loopBlock(rng(R()*1e9),seg,t0+b*seg.L*4,nb,b>0?T.rx*(.5+cx):T.rx*.35*cx,isLast&&last&&sec.bars>=4,LVL.loop,g)}}
  for(let b=0;b<sec.bars;b++){const tb=t0+b*4,r=prog[b%4],fill=b===sec.bars-1&&!!nx||(sec.bars>=8&&b%8===7),ks=[];
   if($('tgd').checked)drumBar(R,tb,T.d,st,cx,sw,fill&&T.d>0,ks);
   if($('tgb').checked&&T.bs)bassBar(R,tb,r,ks,cx);
   if($('tgc').checked&&(rebuilt||T.ch))chordBar(R,tb,r,T.ch,cx);
   if($('tgy').checked&&T.ld){const m=mo[b%2];for(const n of m)pitched(lay('ld'),degMidi(lay('ld'),r+n.o,-12),tb+n.s*.25,n.l*.25*.9,.72,'lead')}}
  if(hookNext&&$('tgd').checked&&PL.pads[15]){const p=PL.pads[15],db=(p.e-p.s)/sr*AR.bpm/60,tEnd=t0+sec.bars*4;AR.ev.push({t:Math.max(t0,tEnd-Math.min(db,8)),g:'drum',s:p.s,e:p.e,rate:1,v:.5,rev:true,dur:null,nt:null})}
  bar+=sec.bars});AR.beats=bar*4}
function sched(oc,dst,ev,spb){const b=getBuf(ev.s,ev.e,ev.rev),src=oc.createBufferSource(),gn=oc.createGain(),t=ev.t*spb;src.buffer=b;src.playbackRate.value=ev.rate;
 if(ev.loop){src.loop=true;src.loopStart=b.duration*.35;src.loopEnd=b.duration}gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(ev.v,t+.004);src.connect(gn);gn.connect(dst);src.start(t);
 if(ev.dur){const te=t+ev.dur*spb;gn.gain.setValueAtTime(ev.v,te);gn.gain.setTargetAtTime(0,te,.03);src.stop(te+.3)}}
async function arrRender(groups,gain){const spb=60/AR.bpm,len=Math.ceil((AR.beats*spb+3)*sr),oc=new OfflineAudioContext(2,len,sr),cp=oc.createDynamicsCompressor(),mg=oc.createGain(),bus={};mg.connect(cp);cp.connect(oc.destination);
 for(const g of groups){const lp=oc.createBiquadFilter(),gn=oc.createGain();lp.type='lowpass';lp.frequency.value=20000;lp.connect(gn);gn.gain.value=LVL[g];gn.connect(mg);bus[g]={lp}}
 AR.tl.forEach((s,i)=>{const ts=s.t*spb,te=(s.t+s.bars*4)*spb;for(const g of['loop','chord','lead'])if(bus[g]){const f=bus[g].lp.frequency;f.setValueAtTime(s.lp,ts);if(s.hookNext){f.setValueAtTime(s.lp,Math.max(ts,te-4*spb));f.exponentialRampToValueAtTime(18000,te)}}
  if(s.last&&s.type==='outro'){mg.gain.setValueAtTime(1,Math.max(ts,te-8*spb));mg.gain.linearRampToValueAtTime(.0001,te)}});
 for(const ev of AR.ev)if(bus[ev.g])sched(oc,bus[ev.g].lp,ev,spb);
 const r=await oc.startRendering(),d=[r.getChannelData(0).slice(),r.getChannelData(1).slice()];let f=gain;
 if(f===undefined){let pk=0;for(const x of d)for(const v of x)pk=Math.max(pk,Math.abs(v));f=pk>.01?.92/pk:1}
 for(const x of d)for(let i=0;i<x.length;i++)x[i]*=f;return{d,f}}
let pt=0;function produce(){const k=++pt;setTimeout(()=>{if(k===pt)doProduce()},150)}
async function doProduce(){const tok=++AR.tok;aStop();setSt('Producing…');await prep();if(tok!==AR.tok)return;if(!AR.sec.length)sections();
 try{arrange();const m=await arrRender(GRPS.filter(g=>$({drum:'tgd',bass:'tgb',chord:'tgc',lead:'tgy',loop:'tgl'}[g]).checked));if(tok!==AR.tok)return;AR.mix=m.d;AR.gain=m.f;AR.pb=null;
  const secs=AR.beats/4,tot=AR.beats*60/AR.bpm;$('ai').textContent=secs+' bars · '+Math.floor(tot/60)+':'+String(Math.round(tot%60)).padStart(2,'0')+' · '+AR.bpm+' BPM · '+NN[PL.root]+' '+PL.scale+(AR.lpOk?'':' · (song too short to loop — loop skipped)');
  tlDraw();setSt('Produced — press Play.')}catch(e){setSt('Could not produce: '+(e.message||e))}}
function tlDraw(){const cv=$('c4'),w=cv.clientWidth,h=cv.clientHeight;if(!w)return;const r=devicePixelRatio||1;if(cv.width!==Math.round(w*r)){cv.width=Math.round(w*r);cv.height=Math.round(h*r)}
 const g=cv.getContext('2d');g.setTransform(r,0,0,r,0,0);g.clearRect(0,0,w,h);const tot=AR.beats||1;
 AR.tl.forEach(s=>{const x=s.t/tot*w,ww=s.bars*4/tot*w;g.globalAlpha=.9;g.fillStyle=s.col;g.fillRect(x+1,0,Math.max(1,ww-2),h);g.globalAlpha=1;g.fillStyle='#fff';g.font='11px system-ui';if(ww>38){g.fillText(s.name,x+5,15);g.fillText(s.bars+' bars',x+5,29)}});
 if(AR.src){const p=(AR.off+ac.currentTime-AR.at)/(AR.beats*60/AR.bpm);g.fillStyle='#fff';g.fillRect(Math.min(w-2,p*w),0,2,h);g.fillStyle='#000';g.fillRect(Math.min(w-2,p*w)+2,0,1,h)}}
function aStop(){if(AR.src){const s=AR.src;AR.src=null;s.onended=null;try{s.stop()}catch(e){}}$('apl').textContent='▶ Play'}
function aPlay(off){if(!AR.mix)return;aStop();if(ac.state==='suspended')ac.resume();if(!AR.pb){AR.pb=ac.createBuffer(2,AR.mix[0].length,sr);AR.mix.forEach((x,i)=>AR.pb.copyToChannel(x,i))}
 const s=ac.createBufferSource();s.buffer=AR.pb;s.connect(ac.destination);s.start(0,off||0);AR.at=ac.currentTime;AR.off=off||0;AR.src=s;s.onended=()=>{if(AR.src===s){AR.src=null;$('apl').textContent='▶ Play';tlDraw()}};$('apl').textContent='■ Stop';(function lp(){if(AR.src===s){tlDraw();requestAnimationFrame(lp)}})()}
function secUI(){const c=$('secs');c.textContent='';AR.sec.forEach(s=>{const d=document.createElement('div');d.className='sr';
 d.innerHTML='<input type="checkbox" '+(s.on?'checked':'')+'><select class="ty">'+Object.keys(TYPES).map(k=>'<option value="'+k+'"'+(k===s.type?' selected':'')+'>'+TYPES[k].n+'</option>').join('')+'</select><select class="nb">'+[2,4,8,16].map(b=>'<option'+(b===s.bars?' selected':'')+'>'+b+'</option>').join('')+'</select><button title="Re-roll this section">🎲</button>';
 const ck=d.querySelector('input'),ty=d.querySelector('.ty'),nb=d.querySelector('.nb'),bt=d.querySelector('button');
 ck.onchange=()=>{s.on=ck.checked;produce()};ty.onchange=()=>{s.type=ty.value;produce()};nb.onchange=()=>{s.bars=+nb.value;produce()};bt.onclick=()=>{s.v++;produce()};c.appendChild(d)})}
function modeDef(){const m=$('am').value;$('tgl').checked=m==='rework';$('tgd').checked=true;$('tgb').checked=true;$('tgc').checked=m==='rebuild';$('tgy').checked=m==='rebuild'}
function vlq(n){const b=[n&127];while(n>>=7)b.unshift((n&127)|128);return b}
function amidi(){const tpq=480,us=Math.round(6e7/AR.bpm),L=[],ch={bass:1,chord:2,lead:3};
 for(const e of AR.ev){const t=Math.round(e.t*tpq);if(e.g==='drum'&&e.nt)L.push([t,1,0x99,e.nt,Math.max(1,Math.round(e.v*127))],[t+60,0,0x89,e.nt,0]);
  else if(e.m!==undefined&&ch[e.g]!==undefined){const c=ch[e.g],m=Math.max(0,Math.min(127,Math.round(e.m)));L.push([t,1,0x90|c,m,Math.max(1,Math.round(e.v*127))],[t+Math.max(30,Math.round(e.dur*tpq)),0,0x80|c,m,0])}}
 L.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const T=[0,0xFF,0x51,3,us>>16&255,us>>8&255,us&255];let last=0;for(const x of L){T.push(...vlq(x[0]-last),x[2],x[3],x[4]);last=x[0]}
 T.push(...vlq(Math.max(0,Math.round(AR.beats*tpq)-last)),0xFF,0x2F,0);
 const H=[0x4D,0x54,0x68,0x64,0,0,0,6,0,0,0,1,tpq>>8,tpq&255,0x4D,0x54,0x72,0x6B,T.length>>>24,T.length>>16&255,T.length>>8&255,T.length&255];return new Blob([new Uint8Array([...H,...T])],{type:'audio/midi'})}
$('tc').onclick=()=>tab('C');
$('ag').onclick=()=>{AR.seed=(AR.seed*7919+13)%1000003;AR.sec.forEach(s=>s.v=0);doProduce()};
$('apl').onclick=()=>AR.src?aStop():aPlay(0);
$('c4').onclick=e=>{if(!AR.mix)return;const r=e.currentTarget.getBoundingClientRect();aPlay((e.clientX-r.left)/r.width*(AR.beats*60/AR.bpm))};
$('am').onchange=()=>{modeDef();produce()};$('as').onchange=()=>{sections();produce()};$('ast').onchange=()=>{$('aw').value=$('ast').value==='lofi'?35:20;$('awv').textContent=$('aw').value;produce()};
$('at').onchange=()=>{AR.tt=true;produce()};
['ae','aw','al'].forEach(i=>{$(i).oninput=e=>$(i+'v').textContent=e.target.value;$(i).onchange=produce});
['tgl','tgd','tgb','tgc','tgy'].forEach(i=>$(i).onchange=produce);
const need2=()=>{if(!AR.mix){setSt('Press Produce first.');return false}return true};
$('xw2').onclick=e=>need2()&&busy(e.currentTarget,()=>save(fname+'_produced.wav',new Blob([wav(AR.mix)],{type:'audio/wav'})));
$('xm2').onclick=e=>need2()&&busy(e.currentTarget,()=>{if(typeof lamejs==='undefined')throw new Error('MP3 encoder could not load (needs internet). Use WAV.');return save(fname+'_produced.mp3',mp3(AR.mix,+$('kb').value))});
$('xi2').onclick=e=>need2()&&busy(e.currentTarget,()=>save(fname+'_produced.mid',amidi()));
$('sb').onclick=e=>need2()&&busy(e.currentTarget,async()=>{const k=$('sx').value,gs=k==='beat'?['drum','bass']:[k];const r=await arrRender(gs,AR.gain);return save(fname+'_stem_'+(k==='beat'?'drums_bass':k==='loop'?'sample':k)+'.wav',new Blob([wav(r.d)],{type:'audio/wav'}))});
/* ---- INTELLIGENT GROUPING STUDIO (Stage A–E, local deterministic provider) ---- */
const GS={groups:[],fb:[],rej:new Set(),undo:[],redo:[],sel:new Set(),cur:null,pads:new Array(16).fill(null),cfg:{mode:'tight',mi:65,ch:'tight'},fc:new Map(),bc:new Map(),voice:null,hash:null,busy:false,gid:0,motifs:[],phrases:[],hit:[],stale:false,assign:false};
const ALGV='local-dsp-grouping/1.0.0',SCH=1,TYC={tight:'#e03131',rhythmic:'#f59f00',melodic:'#4c6ef5',phrase:'#12b886',hybrid:'#ae3ec9'},TYN={tight:'Tight',rhythmic:'Rhythm',melodic:'Melody',phrase:'Phrase',hybrid:'Hybrid'};
const WT={tight:{t:.25,a:.45,h:.05,s:.25},rhythmic:{t:.5,a:.15,h:0,s:.35},melodic:{t:.15,a:.2,h:.5,s:.15},phrase:{t:.25,a:.15,h:.15,s:.45},hybrid:{t:.25,a:.25,h:.25,s:.25}};
const BUILTIN=[{preset_id:'taco-dan-tight-punch',name:'Taco Dan — Tight Punch',version:1,sensitivity:61,minimum_slice_beats:.25,maximum_slice_beats:1,grouping_mode:'tight',musical_intelligence:65,chop_character:'tight',preserve_manual_cuts:true,preserve_downbeat:true,builtin:true}];
const mean=a=>a.length?a.reduce((x,z)=>x+z,0)/a.length:0,cvr=a=>{const m=mean(a);return m>0?Math.sqrt(mean(a.map(v=>(v-m)*(v-m))))/m:1},c01=v=>Math.max(0,Math.min(1,v)),rk=(s,e)=>s+':'+e,sidOf=(s,e)=>'sl_'+s+'_'+e,tk=()=>new Promise(r=>setTimeout(r,15));
const cosv=(a,b)=>{let d=0;for(let i=0;i<a.length;i++)d+=a[i]*b[i];return d},beatS=()=>60/(+$('bpm').value||90);
/* providers: every provider shares one envelope; only the local DSP provider exists in this build */
const PROV={local_dsp:{id:'local_dsp',name:'Local deterministic DSP',version:'1.0.0',ml:false,available:true},ml_local:{id:'ml_local',name:'Local ML model',available:false},remote:{id:'remote',name:'Remote AI',available:false,needsPermission:true}};
const env2=(op,result,conf,status,err)=>({request_id:'req_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),asset_id:GS.aid||null,provider_id:'local_dsp',algorithm_version:ALGV,operation:op,result,confidence:conf==null?null:+conf.toFixed(3),status:status||'ok',error:err||null});
function timbreVec(sl){const N=2048,re=new Float32Array(N),im=new Float32Array(N),n=Math.min(N,sl.e-sl.s);for(let i=0;i<n;i++)re[i]=y[sl.s+i]*(.5-.5*Math.cos(Math.PI*i/n));fft(re,im);
 const B=12,v=new Float32Array(B),bw=sr/N;for(let k=1;k<N/2;k++){const f=k*bw;if(f<60||f>12000)continue;const b=Math.min(B-1,Math.floor(Math.log2(f/60)/Math.log2(200)*B));v[b]+=re[k]*re[k]+im[k]*im[k]}
 let q=0;for(let b=0;b<B;b++){v[b]=Math.log1p(v[b]*1e-2);q+=v[b]*v[b]}q=Math.sqrt(q)||1;for(let b=0;b<B;b++)v[b]/=q;return v}
function featOf(s,e){const k=rk(s,e);let f=GS.fc.get(k);if(f)return f;let sl=slices.find(x=>x.s===s&&x.e===e);
 if(!sl){sl={s,e,t:s/sr};classify(sl);sl.kind=sl.hi>.2&&(e-s)/sr<.4?'hat':sl.lo>.5?'kick':sl.pk>12?'tone':'snare';pitch(sl)}
 if(!sl.tv)sl.tv=timbreVec(sl);const b=beatS();sl.bp=(s/sr-phase)/b;sl.db=(e-s)/sr/b;GS.fc.set(k,sl);return sl}
function assetInfo(){if(!GS.hash){let h=2166136261>>>0;const st=Math.max(1,Math.floor(y.length/4096));for(let i=0;i<y.length;i+=st){h^=Math.round(y[i]*32767)&0xffff;h=Math.imul(h,16777619)>>>0}h^=y.length;h=Math.imul(h,16777619)>>>0;GS.hash=h.toString(16).padStart(8,'0')}
 GS.aid='asset_'+GS.hash;return{id:GS.aid,name:fname,content_hash:GS.hash,sample_rate:sr,channels:chs.length,duration_samples:y.length,duration_seconds:+(y.length/sr).toFixed(3)}}
/* Stage B/C: independent dimensions (never collapsed into one hidden number) */
function scoreSet(ms,mode){const b=beatS(),ev=[],n=ms.length;let T,A,H=null,S;
 const al=ms.map(m=>{const q=Math.round(m.bp*4)/4;return 1-Math.min(1,Math.abs(m.bp-q)/.125)}),ioi=[];for(let i=1;i<n;i++)ioi.push(ms[i].bp-ms[i-1].bp);
 const align=mean(al),reg=ioi.length?1/(1+cvr(ioi.map(Math.abs))):1,durc=1/(1+cvr(ms.map(m=>m.db)));T=c01(align*.4+reg*.3+durc*.3);
 ev.push(align>.7?'Hits sit tight on the 16th grid ('+Math.round(align*100)+'%)':'Hits are loose against the grid ('+Math.round(align*100)+'%)');
 const tim=[];for(let i=1;i<n;i++)tim.push(Math.max(0,cosv(ms[i].tv,ms[i-1].tv)));const kc={};ms.forEach(m=>kc[m.kind]=(kc[m.kind]||0)+1);const kk=Object.keys(kc).sort((p,q)=>kc[q]-kc[p])[0],kf=kc[kk]/n,en=1/(1+cvr(ms.map(m=>m.en||0)));
 A=c01(mean(tim)*.5+en*.2+kf*.3);ev.push('Neighbouring timbre match '+Math.round(mean(tim)*100)+'%; mostly '+kk+' sounds ('+Math.round(kf*100)+'%)');
 const pm=ms.filter(m=>m.clar>.6&&m.midi!==undefined);if(pm.length>=2){const sc=SCALES[PL.scale];const ink=pm.filter(m=>sc.includes((((Math.round(m.midi)-PL.root)%12)+12)%12)).length/pm.length,ct=[];
  for(let i=1;i<pm.length;i++){let d=Math.abs(pm[i].midi-pm[i-1].midi)%12;if(d>6)d=12-d;ct.push(1/(1+d/3))}H=c01(ink*.5+mean(ct)*.5);ev.push(Math.round(ink*100)+'% of pitched hits are in '+NN[PL.root]+' '+PL.scale+'; melodic continuity '+Math.round(mean(ct)*100)+'%')}
 const rep=repeats(ms),fr=((ms[0].bp%1)+1)%1,bd=Math.min(fr,1-fr)<.08?1:.5;S=c01(Math.min(1,rep/3)*.6+bd*.4);
 ev.push(rep?'Same rhythm and sound pattern appears '+rep+' more time'+(rep>1?'s':'')+' in the recording':'No repeat of this pattern found');ev.push(bd===1?'Starts on a beat':'Starts off the beat (pickup or syncopation)');
 const W=WT[mode],sc2={t:T,a:A,h:H,s:S};let ws=0,tot=0;for(const k of['t','a','h','s'])if(sc2[k]!=null){ws+=W[k];tot+=W[k]*sc2[k]}
 return{scores:{temporal:+T.toFixed(3),acoustic:+A.toFixed(3),harmonic:H==null?null:+H.toFixed(3),structural:+S.toFixed(3)},base:ws>0?tot/ws:0,ev,rep,kind:kk}}
function repeats(ms){const n=ms.length,F=GS.F||[];if(!F.length||n<2)return 0;const rel=ms.map(m=>Math.round((m.bp-ms[0].bp)*4)),s0=ms[0].s,e1=ms[n-1].e;let c=0;
 for(let k=0;k+n<=F.length&&c<4;k++){const w=F[k];if(w.e>s0&&w.s<e1)continue;let ok=0,ts=0,fine=true;for(let j=0;j<n;j++){const f=F[k+j];if(Math.round((f.bp-w.bp)*4)!==rel[j]){fine=false;break}if(f.kind===ms[j].kind)ok++;ts+=Math.max(0,cosv(f.tv,ms[j].tv))}
  if(fine&&ok/n>=.7&&ts/n>=.85)c++}return c}
function prodScore(f){const A=GS.fb.filter(x=>x.type==='accept'&&x.f),R=GS.fb.filter(x=>x.type==='reject'&&x.f);if(A.length+R.length<3)return null;
 const cen=L=>L.length?[0,1,2,3,4].map(i=>mean(L.map(x=>x.f[i]))):null,dist=(a,b)=>Math.sqrt(a.reduce((s,v,i)=>s+(v-b[i])*(v-b[i]),0)),ca=cen(A),cr=cen(R),sa=ca?1/(1+dist(f,ca)):.5,sr2=cr?1/(1+dist(f,cr)):.5;return c01(.5+.5*(sa-sr2))}
const fvec=(g,sc)=>[sc.temporal,sc.acoustic,sc.harmonic==null?.5:sc.harmonic,sc.structural,Math.min(1,g/12)];
function rate(ms,mode){const r=scoreSet(ms,mode),pv=prodScore(fvec(ms.length,r.scores));let tot=r.base;if(pv!=null){tot=tot*.85+pv*.15;r.scores.producer=+pv.toFixed(3)}else r.scores.producer=null;
 const v=[r.scores.temporal,r.scores.acoustic,r.scores.structural].concat(r.scores.harmonic==null?[]:[r.scores.harmonic]);r.total=c01(tot);r.unc=+(Math.max(...v)-Math.min(...v)).toFixed(3);return r}
function mkGroup(ms,type,status,order){const r=rate(ms,type),b=beatS(),x=(ms[0].s/sr-barPhase)/(b*4),bar=Math.floor(x)+1,bt=Math.floor(((x%1)+1)%1*4)+1,id='grp_'+(++GS.gid)+'_'+Date.now().toString(36),now=new Date().toISOString();
 const span=(Math.max(...ms.map(m=>m.e))-Math.min(...ms.map(m=>m.s)))/sr/b,rel=r.scores.structural>.6?'repeating pattern':r.scores.acoustic>=Math.max(r.scores.temporal,r.scores.structural)?'same sound family':r.scores.harmonic!=null&&r.scores.harmonic>.7?'melodic':'rhythmic placement';
 return{id,name:TYN[type]+' '+bar+'.'+bt,group_type:type,member_ids:ms.map(m=>sidOf(m.s,m.e)),members:ms.map(m=>({start_sample:m.s,end_sample:m.e})),relationship_type:rel,ordering:order||'time',source_asset_ids:[GS.aid],
  recommendation_score:+r.total.toFixed(3),scores:r.scores,evidence:r.ev,repeats:r.rep,duration_beats:+span.toFixed(2),confidence:+(r.total*(1-r.unc*.5)).toFixed(3),uncertainty:r.unc,provider_id:'local_dsp',algorithm_version:ALGV,
  producer_confirmed:status!=='suggested',status,created_at:now,modified_at:now}}
const gms=g=>g.members.map(m=>featOf(m.start_sample,m.end_sample));
/* Stage A–E pipeline */
async function gRun(){if(GS.busy)return;GS.busy=true;const t0=Date.now();
 try{setSt('A · Analyzing audio…');await prep();await tk();assetInfo();
  setSt('B · Extracting timbre, rhythm and pitch features…');await tk();GS.F=slices.map(s=>featOf(s.s,s.e));const F=GS.F,{mode,ch,mi}=GS.cfg,b=beatS();
  setSt('C · Discovering candidate relationships…');await tk();
  const mul={tight:.75,rhythmic:1,melodic:1.5,phrase:2,hybrid:1.25}[mode],maxB={tight:1.25,balanced:4,long:16}[ch]*mul,targ={tight:.8,balanced:2.5,long:8}[ch]*mul,minM=mode==='phrase'||ch==='long'?3:2,maxM=mode==='tight'?4:ch==='long'?24:12,cands=[],held=GS.groups.filter(g=>g.status!=='suggested');
  const busy=(s,e)=>held.some(g=>g.members.some(m=>m.start_sample<e&&m.end_sample>s));
  for(let i=0;i<F.length;i++)for(let j=i+minM-1;j<F.length&&j-i+1<=maxM;j++){const span=(F[j].e-F[i].s)/sr/b;if(span>maxB*1.05)break;const ms=F.slice(i,j+1);
   if(mean(ms.map(m=>m.en||0))<.004||busy(F[i].s,F[j].e))continue;const fp=ms.map(m=>rk(m.s,m.e)).join('|');if(GS.rej.has(fp))continue;cands.push({i,j,ms,r:rate(ms,mode),span})}
  for(const c of cands)c.rk=c.r.total/(1+.5*Math.abs(Math.log2(Math.max(.05,c.span)/targ)));
  setSt('D · Ranking '+cands.length+' candidates…');await tk();
  cands.sort((p,q)=>q.rk-p.rk);const q=.95-.0055*mi,thr=cands.length?cands[Math.min(cands.length-1,Math.floor(cands.length*(1-q)))].rk:1,maxG=Math.round(24+mi*.6),ovl=mi>85?.4:0,out=[],used=[];
  for(const c of cands){if(c.rk<thr||out.length>=maxG)continue;const s0=c.ms[0].s,e0=c.ms[c.ms.length-1].e;let bad=false;
   for(const u of used){const ov=Math.min(e0,u.e)-Math.max(s0,u.s);if(ov>0&&ov/Math.min(e0-s0,u.e-u.s)>ovl){bad=true;break}}if(bad)continue;used.push({s:s0,e:e0});out.push(c)}
  pushUndo();GS.groups=GS.groups.filter(g=>g.status!=='suggested').concat(out.map(c=>mkGroup(c.ms,mode,'suggested')));GS.stale=false;
  GS.motifs=GS.groups.filter(g=>g.repeats>=1).map(g=>({id:'mot_'+g.id,member_slice_ids:g.member_ids,rhythmic_signature:gms(g).map(m=>Math.round((m.bp-gms(g)[0].bp)*4)+m.kind[0]).join('-'),pitch_signature:gms(g).filter(m=>m.clar>.6&&m.midi!==undefined).map(m=>Math.round(m.midi)).join('-'),duration_beats:g.duration_beats,confidence:g.scores.structural}));
  GS.phrases=GS.groups.filter(g=>g.duration_beats>=4).map(g=>({id:'phr_'+g.id,member_slice_ids:g.member_ids,duration_bars:+(g.duration_beats/4).toFixed(2),tempo_reference:+$('bpm').value,key_reference:NN[PL.root]+' '+PL.scale,phrase_type:g.group_type,confidence:g.confidence}));
  setSt('E · '+out.length+' suggestions ready in '+((Date.now()-t0)/1000).toFixed(1)+' s. Audition, then accept or reject — suggestions never change your audio.')}
 catch(e){setSt('Grouping problem: '+(e.message||e))}GS.busy=false;gRender()}
/* intelligence-contract operations (local implementations) */
const IE={analyze_asset:()=>env2('analyze_asset',{asset:assetInfo(),slices:slices.length,bpm:+$('bpm').value,key:NN[PL.root]+' '+PL.scale},.8),
 extract_features:(ids)=>env2('extract_features',(ids||slices.map(s=>sidOf(s.s,s.e))).length,.9),
 find_similar:(i,k)=>{const a=featOf(slices[i].s,slices[i].e),r=slices.map((s,j)=>{const f=featOf(s.s,s.e);return{j,s:j===i?-1:cosv(a.tv,f.tv)*.7+(f.kind===a.kind?.2:0)+.1/(1+Math.abs(Math.log2(f.db/a.db)))}}).sort((p,q)=>q.s-p.s).slice(0,k||4);return env2('find_similar',r,r[0]?r[0].s:0)},
 explain_recommendation:g=>env2('explain_recommendation',{evidence:g.evidence,scores:g.scores,uncertainty:g.uncertainty},g.confidence)};
/* producer actions (all reversible) */
const snapS=()=>JSON.stringify({g:GS.groups,f:GS.fb,r:[...GS.rej],p:GS.pads});
function pushUndo(){GS.undo.push(snapS());if(GS.undo.length>60)GS.undo.shift();GS.redo=[]}
function restore(s){const o=JSON.parse(s);GS.groups=o.g;GS.fb=o.f;GS.rej=new Set(o.r);GS.pads=o.p;gRender()}
const gById=id=>GS.groups.find(g=>g.id===id),fvOf=g=>({type:'',f:fvec(g.members.length,g.scores)});
function gAct(a,id,x){const g=gById(id);if(!g&&a!=='make')return;pushUndo();
 if(a==='accept'){g.producer_confirmed=true;g.status='confirmed';g.modified_at=new Date().toISOString();GS.fb.push({type:'accept',group_id:id,f:fvec(g.members.length,g.scores),t:Date.now()})}
 else if(a==='reject'){GS.rej.add(g.members.map(m=>rk(m.start_sample,m.end_sample)).join('|'));GS.fb.push({type:'reject',group_id:id,f:fvec(g.members.length,g.scores),t:Date.now()});GS.groups=GS.groups.filter(z=>z!==g);GS.pads=GS.pads.map(p=>p===id?null:p)}
 else if(a==='del'){GS.groups=GS.groups.filter(z=>z!==g);GS.pads=GS.pads.map(p=>p===id?null:p)}
 else if(a==='merge'){const o=GS.groups.filter(z=>z!==g).filter(z=>z.members[0].start_sample>=g.members[g.members.length-1].end_sample).sort((p,q)=>p.members[0].start_sample-q.members[0].start_sample)[0];if(!o){GS.undo.pop();setSt('No later group to merge with.');return}
  const ms=[...gms(g),...gms(o)].sort((p,q)=>p.s-q.s),n=mkGroup(ms,g.group_type,'manual');GS.groups=GS.groups.filter(z=>z!==g&&z!==o).concat(n);GS.cur=n.id;GS.fb.push({type:'merge',group_id:n.id,t:Date.now()})}
 else if(a==='split'){if(g.members.length<2){GS.undo.pop();setSt('Need 2+ members to split.');return}const h=Math.ceil(g.members.length/2),ms=gms(g),A=mkGroup(ms.slice(0,h),g.group_type,'manual'),B=mkGroup(ms.slice(h),g.group_type,'manual');GS.groups=GS.groups.filter(z=>z!==g).concat(A,B);GS.fb.push({type:'split',group_id:id,t:Date.now()})}
 else if(a==='rm'||a==='up'||a==='dn'){const ms=gms(g);if(a==='rm'){if(ms.length<=2){GS.undo.pop();setSt('A group needs at least 2 members.');return}ms.splice(x,1)}else{const k=a==='up'?x-1:x+1;if(k<0||k>=ms.length){GS.undo.pop();return}[ms[x],ms[k]]=[ms[k],ms[x]]}
  const n=mkGroup(ms,g.group_type,'manual',a==='rm'?g.ordering:'manual');n.id=g.id;n.name=g.name;n.created_at=g.created_at;Object.assign(g,n);GS.bc.clear()}
 else if(a==='make'){if(GS.sel.size<2){GS.undo.pop();setSt('Tap 2+ slices on the waveform first.');return}const ms=[...GS.sel].sort((p,q)=>p-q).map(i=>featOf(slices[i].s,slices[i].e)),n=mkGroup(ms,GS.cfg.mode,'manual');GS.groups.push(n);GS.cur=n.id;GS.sel.clear();GS.fb.push({type:'manual',group_id:n.id,t:Date.now()})}
 gSync();gRender()}
/* playback + pads */
function gData(g){const out=[];g.members.forEach(m=>cutData(m.start_sample,m.end_sample).forEach((c,i)=>(out[i]=out[i]||[]).push(c)));return out.map(ps=>{const n=ps.reduce((a,c)=>a+c.length,0),o=new Float32Array(n);let p=0;for(const c of ps){o.set(c,p);p+=c.length}return o})}
function gBuf(g){const k=g.id+':'+g.members.map(m=>m.start_sample+'-'+m.end_sample).join(','),h=GS.bc.get(k);if(h)return h;const d=gData(g),ab=ac.createBuffer(d.length,d[0].length,sr);d.forEach((c,i)=>ab.copyToChannel(c,i));GS.bc.set(k,ab);return ab}
function gPlay(g){if(ac.state==='suspended')ac.resume();if(GS.voice)stopV(GS.voice,.02);GS.voice=mk({ab:gBuf(g)},1,.9,false)}
function gSync(){PL.gpads=GS.pads.map(id=>{const g=id&&gById(id);return g?{ab:gBuf(g),s:g.members[0].start_sample,e:g.members[g.members.length-1].end_sample,label:g.name,sub:g.members.length+' hits'}:null});if(PL.bank==='groups')padsRender()}
/* project, presets */
function migrate(p){if(!p||typeof p!=='object')throw new Error('Not a project file');let v=p.schema_version||0;if(v<1){p.schema_version=1;p.feedback=p.feedback||[];p.groups=p.groups||[];v=1}if(v>SCH)throw new Error('Project is from a newer version');return p}
function projectJSON(){return{schema_version:SCH,application:'Intelligent MPC (browser) 0.1',created_at:new Date().toISOString(),asset:assetInfo(),
 settings:{sensitivity:+$('sens').value,minimum_slice_beats:+$('minl').value,maximum_slice_beats:+$('maxl').value,bpm:+$('bpm').value,grouping_mode:GS.cfg.mode,musical_intelligence:GS.cfg.mi,chop_character:GS.cfg.ch,key:NN[PL.root]+' '+PL.scale},
 slices:slices.map(s=>({id:sidOf(s.s,s.e),start_sample:s.s,end_sample:s.e})),groups:GS.groups,motifs:GS.motifs,phrases:GS.phrases,patterns:[],arrangements:[],pad_assignments:GS.pads,feedback:GS.fb,rejected_fingerprints:[...GS.rej],
 analysis_versions:{provider:'local_dsp',algorithm:ALGV,machine_learning:false},presets:userPresets()}}
const userPresets=()=>{try{return JSON.parse(localStorage.getItem('imp_presets_v1')||'[]')}catch(e){return[]}};
function loadProject(txt){const p=migrate(JSON.parse(txt)),a=assetInfo();if(p.asset&&p.asset.content_hash!==a.content_hash){setSt('That project was made from different audio. Load the original recording first.');return}
 pushUndo();GS.groups=p.groups||[];GS.fb=p.feedback||[];GS.rej=new Set(p.rejected_fingerprints||[]);GS.pads=p.pad_assignments||new Array(16).fill(null);GS.motifs=p.motifs||[];GS.phrases=p.phrases||[];
 if(p.settings)GS.cfg={mode:p.settings.grouping_mode||'tight',mi:p.settings.musical_intelligence??65,ch:p.settings.chop_character||'tight'};GS.bc.clear();ctlSync();gSync();gRender();setSt('Project loaded: '+GS.groups.length+' groups.')}
function applyPreset(p){$('sens').value=p.sensitivity;$('sv').textContent=p.sensitivity;$('minl').value=String(p.minimum_slice_beats);$('maxl').value=String(p.maximum_slice_beats);if(p.preserve_manual_cuts===false)manual={add:[],del:[]};
 GS.cfg={mode:p.grouping_mode,mi:p.musical_intelligence,ch:p.chop_character};ctlSync();rebuild();GS.F=null;GS.fc.clear();GS.stale=true;gRender();setSt('Preset “'+p.name+'” applied: sensitivity '+p.sensitivity+'%. Press Analyze to regroup.')}
function presetList(){return BUILTIN.concat(userPresets())}
function ctlSync(){$('gm').value=GS.cfg.mode;$('gmi').value=GS.cfg.mi;$('gmiv').textContent=GS.cfg.mi;$('gch').value=GS.cfg.ch;$('gsn').value=$('sens').value;$('gsnv').textContent=$('sens').value;
 const s=$('gpre');s.textContent='';presetList().forEach(p=>{const o=document.createElement('option');o.value=p.preset_id;o.textContent=p.name;s.appendChild(o)})}
/* interface */
function gDraw(){const cv=$('gcv'),w=cv.clientWidth,h=cv.clientHeight;if(!w||!y)return;const r=devicePixelRatio||1;cv.width=Math.round(w*r);cv.height=Math.round(h*r);const g=cv.getContext('2d');g.setTransform(r,0,0,r,0,0);g.clearRect(0,0,w,h);
 const cs=getComputedStyle(document.documentElement),wf=cs.getPropertyValue('--wf'),N=y.length,st=N/w;g.fillStyle=wf;
 for(let x=0;x<w;x++){let m=0;const a=Math.floor(x*st),b=Math.min(N,Math.floor((x+1)*st));for(let i=a;i<b;i+=Math.max(1,(b-a)>>4))m=Math.max(m,Math.abs(y[i]));g.fillRect(x,23-m*21,1,Math.max(1,m*42))}
 g.fillStyle='rgba(128,128,128,.45)';slices.forEach(s=>g.fillRect(Math.floor(s.s/N*w),0,1,46));
 GS.sel.forEach(i=>{const s=slices[i];if(s){g.fillStyle='rgba(217,72,15,.45)';g.fillRect(s.s/N*w,0,Math.max(2,(s.e-s.s)/N*w),46)}});
 const gs=[...GS.groups].sort((p,q)=>p.members[0].start_sample-q.members[0].start_sample),lanes=[],H=GS.hit=[];
 for(const gr of gs){const s0=gr.members[0].start_sample,e0=gr.members[gr.members.length-1].end_sample;let L=lanes.findIndex(e=>e<=s0);if(L<0){L=lanes.length;lanes.push(0)}lanes[L]=e0;
  const lh=Math.min(15,(h-52)/Math.max(1,lanes.length+1)),x0=s0/N*w,x1=Math.max(x0+3,e0/N*w),yy=50+L*(lh+1);H.push({x0,x1,y0:yy,y1:yy+lh,id:gr.id});
  g.globalAlpha=gr.producer_confirmed?.9:.35;g.fillStyle=TYC[gr.group_type]||'#888';g.fillRect(x0,yy,x1-x0,lh);g.globalAlpha=1;g.strokeStyle=TYC[gr.group_type]||'#888';g.lineWidth=gr.id===GS.cur?3:1.2;g.setLineDash(gr.producer_confirmed?[]:[4,3]);g.strokeRect(x0+.5,yy+.5,x1-x0-1,lh-1);g.setLineDash([])}}
function gRender(){const L=$('glist');if(!L)return;gDraw();const gs=[...GS.groups].sort((p,q)=>p.members[0].start_sample-q.members[0].start_sample),dm=(v,l)=>v==null?'<span class="dm na"><i style="width:0"></i>'+l+' n/a</span>':'<span class="dm"><i style="width:'+Math.round(v*100)+'%"></i>'+l+' '+Math.round(v*100)+'</span>';
 const conf=GS.groups.filter(g=>g.producer_confirmed).length;$('gcount').textContent=GS.groups.length+' groups · '+conf+' confirmed'+(GS.stale?' · slices changed — re-analyze':'');
 L.innerHTML=gs.map(g=>{const ms=g.members,bd=g.status==='suggested'?'Suggested':g.status==='manual'?'Producer-made':'Confirmed ✓';
  return'<details class="gc2 '+g.status+'" data-id="'+g.id+'"'+(g.id===GS.cur?' open':'')+'><summary><b>'+g.name+'</b> <span class="bg2 '+g.status+'">'+bd+'</span> <span class="mt">'+g.group_type+' · '+ms.length+' hits · '+g.duration_beats+' beats · '+Math.round(g.confidence*100)+'% ±'+Math.round(g.uncertainty*50)+'</span></summary>'+
  '<div class="dms">'+dm(g.scores.temporal,'Timing')+dm(g.scores.acoustic,'Sound')+dm(g.scores.harmonic,'Pitch')+dm(g.scores.structural,'Structure')+dm(g.scores.producer,'You')+'</div>'+
  '<div class="acts"><button data-a="play">▶</button><button data-a="accept">✓ Accept</button><button data-a="reject">✕ Reject</button><button data-a="merge">⤵ Merge next</button><button data-a="split">✂ Split</button><button data-a="pad">🎹 To pad</button><button data-a="del">Delete</button></div>'+
  '<ul class="ev">'+g.evidence.map(e=>'<li>'+e+'</li>').join('')+'<li>Relationship: '+g.relationship_type+' · provider '+g.provider_id+' ('+g.algorithm_version+')</li></ul>'+
  '<div class="mem">'+ms.map((m,i)=>{const f=featOf(m.start_sample,m.end_sample);return'<span class="mc">'+(i+1)+' '+f.kind+(f.clar>.6&&f.midi!==undefined?' '+nn(Math.round(f.midi)):'')+' <button data-a="up" data-x="'+i+'">↑</button><button data-a="dn" data-x="'+i+'">↓</button><button data-a="rm" data-x="'+i+'">✕</button></span>'}).join('')+'</div></details>'}).join('')||'<div class="h"><span>No groups yet — press Analyze &amp; group.</span></div>';
 const P=$('gpads');P.textContent='';GS.pads.forEach((id,j)=>{const g=id&&gById(id),el=document.createElement('button');el.className='pad ch';el.innerHTML=g?g.name+'<small>'+g.members.length+' hits</small>':'<small>empty</small>';el.onpointerdown=e=>{e.preventDefault();if(GS.assign){if(GS.cur&&gById(GS.cur)){pushUndo();GS.pads[j]=GS.cur;gSync();gRender()}else setSt('Open a group first, then tap a pad to assign it.')}else if(g)gPlay(g)};P.appendChild(el)})}
async function gInit(){await prep();ctlSync();assetInfo();gRender()}
$('glist').onclick=e=>{const b=e.target.closest('button'),d=e.target.closest('.gc2');if(!d)return;const id=d.dataset.id;GS.cur=id;if(!b){gDraw();return}e.preventDefault();const a=b.dataset.a,g=gById(id);
 if(a==='play')gPlay(g);else if(a==='pad'){const k=GS.pads.indexOf(null);if(k<0){setSt('All 16 pads are used. Turn on Assign mode to replace one.');return}pushUndo();GS.pads[k]=id;gSync();gRender();setSt('“'+g.name+'” assigned to pad '+(k+1))}else gAct(a,id,+b.dataset.x)};
$('gcv').onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,yy=e.clientY-r.top;if(yy>48){const h=GS.hit.find(z=>x>=z.x0&&x<=z.x1&&yy>=z.y0&&yy<=z.y1);if(h){GS.cur=h.id;gRender();const el=document.querySelector('[data-id="'+h.id+'"]');if(el)el.scrollIntoView({block:'nearest'})}return}
 const sp=x/r.width*y.length;let bi=0;slices.forEach((s,i)=>{if(sp>=s.s&&sp<s.e)bi=i});GS.sel.has(bi)?GS.sel.delete(bi):GS.sel.add(bi);if(GS.sel.size===1&&ac){ac.state==='suspended'&&ac.resume();playSlice(bi)}gDraw()};
$('grun').onclick=gRun;$('gud').onclick=()=>{if(GS.undo.length){GS.redo.push(snapS());restore(GS.undo.pop());gSync()}};$('grd').onclick=()=>{if(GS.redo.length){GS.undo.push(snapS());restore(GS.redo.pop());gSync()}};
$('gmk').onclick=()=>gAct('make');$('gclr').onclick=()=>{GS.sel.clear();gDraw()};
$('gsim').onclick=()=>{if(GS.sel.size!==1){setSt('Select exactly one slice first.');return}const i=[...GS.sel][0],r=IE.find_similar(i,4).result;r.forEach(z=>GS.sel.add(z.j));gDraw();setSt('Selected the '+r.length+' most similar slices (timbre, sound family, length). Press Make group to keep them.')};
$('gm').onchange=()=>{GS.cfg.mode=$('gm').value};$('gch').onchange=()=>{GS.cfg.ch=$('gch').value};$('gmi').oninput=e=>{GS.cfg.mi=+e.target.value;$('gmiv').textContent=e.target.value};
let gst=0;$('gsn').oninput=e=>{$('gsnv').textContent=e.target.value;$('sens').value=e.target.value;$('sv').textContent=e.target.value;clearTimeout(gst);gst=setTimeout(()=>{rebuild();GS.F=null;GS.fc.clear();GS.stale=true;gRender()},300)};
$('gas').onchange=e=>{GS.assign=e.target.checked};
$('gpa').onclick=()=>{const p=presetList().find(x=>x.preset_id===$('gpre').value);if(p)applyPreset(p)};
$('gps').onclick=()=>{const nm=$('gpn').value.trim();if(!nm){setSt('Type a preset name first.');return}const p={preset_id:'user-'+slug(nm),name:nm,version:1,sensitivity:+$('sens').value,minimum_slice_beats:+$('minl').value,maximum_slice_beats:+$('maxl').value,grouping_mode:GS.cfg.mode,musical_intelligence:GS.cfg.mi,chop_character:GS.cfg.ch,preserve_manual_cuts:true,preserve_downbeat:true},L=userPresets().filter(x=>x.preset_id!==p.preset_id).concat(p);
 try{localStorage.setItem('imp_presets_v1',JSON.stringify(L))}catch(e){setSt('This browser would not store presets; use Save project instead.');return}ctlSync();$('gpre').value=p.preset_id;setSt('Preset “'+nm+'” saved separately from the app defaults.')};
$('gsave').onclick=e=>busy(e.currentTarget,()=>save(fname+'_groups.imp.json',new Blob([JSON.stringify(projectJSON(),null,1)],{type:'application/json'})));
$('gload').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{loadProject(await f.text())}catch(x){setSt('Could not open project: '+x.message)}};
$('gexp').onclick=e=>busy(e.currentTarget,()=>{const cg=GS.groups.filter(g=>g.producer_confirmed);if(!cg.length)throw new Error('Confirm at least one group first.');const F=cg.map((g,i)=>['groups/'+String(i+1).padStart(2,'0')+'_'+slug(g.name)+'.wav',wav(gData(g))]);F.push(['groups.json',new TextEncoder().encode(JSON.stringify(projectJSON(),null,1))]);return save(fname+'_confirmed_groups.zip',zip(F))});
$('tg').onclick=()=>tab('G');
$('go').onclick=()=>reconf();$('pre').onchange=()=>reconf();$('lock').onchange=()=>reconf();$('norm').onchange=()=>reconf(true);
$('sens').oninput=e=>{$('sv').textContent=e.target.value};$('int').oninput=e=>{$('iv').textContent=e.target.value;reconf()};
$('mode').onchange=rebuild;$('bpm').onchange=rebuild;['sens','minl','maxl'].forEach(i=>$(i).onchange=rebuild);
$('half').onclick=()=>{$('bpm').value=Math.max(40,+$('bpm').value/2).toFixed(1);rebuild()};
$('dbl').onclick=()=>{$('bpm').value=Math.min(240,+$('bpm').value*2).toFixed(1);rebuild()};

/* ---- PIANO + LAYER SYNC ---- */
const PNO={list:[],i:0,base:60,hold:false,oct:0,n:2,slice:false,snap:true,sl:null},PAV=new Map(),LYR=[],MST={bpm:0,t0:0,on:false},WHT=[0,2,4,5,7,9,11],zs=t=>$('zst').textContent=t;
const pcSet=()=>SCALES[PL.scale].map(x=>(x+PL.root)%12),natM=s=>s&&s.clar>.6&&s.midi!==undefined?s.midi:undefined;
const snapQ=m=>{if(!PNO.snap)return m;const P=pcSet();for(const d of[0,-1,1,-2,2])if(P.includes((((m+d)%12)+12)%12))return m+d;return m};
function pnList(){const f=s=>(s.clar||.5)*(s.en||0)*Math.min(dd(s),1.2),t=slices.filter(s=>s.clar>.6&&s.midi!==undefined&&dd(s)>=.08);PNO.list=(t.length?t:slices.filter(s=>dd(s)>.1)).sort((a,b)=>f(b)-f(a)).slice(0,24);PNO.i=Math.min(PNO.i,Math.max(0,PNO.list.length-1))}
function pnMap(){const M=new Map();slices.filter(s=>s.clar>.75&&s.midi!==undefined&&dd(s)>=.06).sort((a,b)=>b.clar*b.en-a.clar*a.en).forEach(s=>{const m=Math.round(s.midi);if(!M.has(m))M.set(m,s)});return M}
function pnBuild(){const c=$('zk'),lo=36+12*PNO.oct,nw=7*PNO.n,P=pcSet(),M=PNO.slice?pnMap():new Map();c.textContent='';c.style.setProperty('--nw',nw);
 for(let o=0;o<PNO.n;o++)for(let w=0;w<7;w++){const m=lo+12*o+WHT[w],k=document.createElement('div');k.className='wk'+(P.includes(m%12)?' in':'')+(m%12===PL.root?' rt':'')+(M.has(m)?' sm':'');k.dataset.m=m;k.textContent=nn(m);c.appendChild(k);
  if([0,1,3,4,5].includes(w)){const b=document.createElement('div');b.className='bk'+(P.includes((m+1)%12)?' in':'');b.dataset.m=m+1;b.style.left=((o*7+w+1)/nw*100-30/nw)+'%';c.appendChild(b)}}}
function pnUI(){const s=PNO.list[PNO.i],n=natM(s);$('zpl').textContent=s?(PNO.i+1)+'/'+PNO.list.length+' · '+(n!==undefined?nn(Math.round(n)):'untuned')+' · '+Math.round(dd(s)*1000)+'ms':'no sound';
 $('zmd').classList.toggle('on',PNO.slice);$('zmd').textContent=PNO.slice?'Slice notes':'Pitched sound';$('zhd').classList.toggle('on',PNO.hold);$('zsn').classList.toggle('on',PNO.snap);
 $('zi').textContent=NN[PL.root]+(PL.scale==='min'?' minor':PL.scale==='maj'?' major':' '+PL.scale)+' · tinted keys are in the key'+(PNO.slice?' · dots = notes found in your slices':'');pnBuild()}
function pnFit(){pnList();const P=pcSet();let b=PNO.list.findIndex(s=>natM(s)!==undefined&&P.includes(((Math.round(s.midi)%12)+12)%12));PNO.i=b<0?0:b;const s=PNO.list[PNO.i];
 if(s){PNO.hold=dd(s)>.5;const n=natM(s);if(n!==undefined)PNO.oct=Math.max(-2,Math.min(2,Math.round((n-12*PNO.n/2-36)/12)))}PNO.snap=true;PNO.slice=false;pnUI()}
async function pianoInit(){await prep();if(PNO.sl!==slices){PNO.sl=slices;pnFit()}else pnUI();lyUI();setSt('Ready — play!')}
const zk=$('zk'),zkAt=e=>{const k=document.elementFromPoint(e.clientX,e.clientY);return k&&zk.contains(k)&&k.dataset.m?k:null};
function pOn(id,k,e){if(ac.state==='suspended')ac.resume();k.classList.add('on');const m=snapQ(+k.dataset.m),vl=vOf(e,k);let v=null;if(PNO.slice){const s=pnMap().get(m);if(s)v=mk(s,1,vl,PNO.hold)}if(!v)v=playNote(PNO,m,vl);PAV.set(id,{k,v});buzz()}
function pOff(a){a.k.classList.remove('on');if(a.v&&PNO.hold)stopV(a.v,.15)}
zk.onpointerdown=e=>{e.preventDefault();try{zk.setPointerCapture(e.pointerId)}catch(x){}const k=zkAt(e);if(k)pOn(e.pointerId,k,e)};
zk.onpointermove=e=>{const a=PAV.get(e.pointerId);if(!a)return;const k=zkAt(e);if(k&&k!==a.k){pOff(a);pOn(e.pointerId,k,e)}};
zk.onpointerup=zk.onpointercancel=e=>{const a=PAV.get(e.pointerId);if(a){pOff(a);PAV.delete(e.pointerId)}};zk.oncontextmenu=e=>e.preventDefault();
const CK='awsedftgyhujkolp;';
addEventListener('keydown',e=>{if($('tD').hidden||e.repeat||e.metaKey||e.ctrlKey||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName))return;const i=CK.indexOf(e.key.toLowerCase());if(i<0)return;const k=zk.querySelector('[data-m="'+(36+12*PNO.oct+(PNO.n>1?12:0)+i)+'"]');if(k)pOn('k'+i,k,{clientY:1e9})});
addEventListener('keyup',e=>{const i=CK.indexOf(e.key.toLowerCase()),a=PAV.get('k'+i);if(a){pOff(a);PAV.delete('k'+i)}});
const prevP=()=>{if(ac.state==='suspended')ac.resume();const v=playNote(PNO,48+PL.root+12*PNO.oct+12,.8);if(v&&PNO.hold)setTimeout(()=>stopV(v,.1),500)};
$('zpp').onclick=()=>{const n=PNO.list.length;if(n){PNO.i=(PNO.i+n-1)%n;pnUI();prevP()}};$('zpn').onclick=()=>{const n=PNO.list.length;if(n){PNO.i=(PNO.i+1)%n;pnUI();prevP()}};
$('zo1').onclick=()=>{PNO.oct=Math.max(-2,PNO.oct-1);pnUI()};$('zo2').onclick=()=>{PNO.oct=Math.min(2,PNO.oct+1);pnUI()};
$('zmd').onclick=()=>{PNO.slice=!PNO.slice;pnUI()};$('zhd').onclick=()=>{PNO.hold=!PNO.hold;pnUI()};$('zsn').onclick=()=>{PNO.snap=!PNO.snap;pnUI()};$('zw').onchange=()=>{PNO.n=+$('zw').value;pnUI()};$('zaf').onclick=()=>{pnFit();zs('Piano fitted to the key, sound and octave.')};
/* layers */
const KP={maj:[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],min:[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17]};
function monoOf(ch){const n=ch[0].length,o=new Float32Array(n);for(const d of ch)for(let i=0;i<n;i++)o[i]+=d[i]/ch.length;return o}
function envOf(x){const H=512,n=Math.floor(x.length/H),f=new Float32Array(n);let p=0;for(let i=0;i<n;i++){let s=0;for(let k=0;k<H;k++){const v=x[i*H+k];s+=v*v}s=Math.sqrt(s/H);f[i]=Math.max(0,s-p);p=s}return f}
function bpmOf(f,S){const fr=S/512;let bb=120,bs=-1;for(let b=70;b<=170;b+=.5){const lag=60/b*fr,a=Math.floor(lag),w=lag-a;let t=0;for(let i=0;i+a+1<f.length;i++)t+=f[i]*(f[i+a]*(1-w)+f[i+a+1]*w);if(t>bs){bs=t;bb=b}}return bb}
function chromaOf(x,S){const N=4096,H=Math.max(N,Math.floor(x.length/60)),ch=new Float32Array(12),re=new Float32Array(N),im=new Float32Array(N),bw=S/N;
 for(let p=0;p+N<=x.length&&p<S*40;p+=H){for(let i=0;i<N;i++){re[i]=x[p+i]*(.5-.5*Math.cos(2*Math.PI*i/N));im[i]=0}fft(re,im);for(let k=Math.ceil(60/bw);k<Math.min(N/2,1200/bw);k++){const m=Math.hypot(re[k],im[k]);ch[((Math.round(69+12*Math.log2(k*bw/440))%12)+12)%12]+=m}}return ch}
function cor(a,b){let ma=0,mb=0;for(let i=0;i<12;i++){ma+=a[i];mb+=b[i]}ma/=12;mb/=12;let n=0,da=0,db=0;for(let i=0;i<12;i++){n+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)**2;db+=(b[i]-mb)**2}return n/Math.sqrt(da*db+1e-12)}
function keyOf(x,S){const ch=chromaOf(x,S);let b={root:0,scale:'min',r:-2};for(const sc of['maj','min'])for(let r=0;r<12;r++){const c=cor(ch,KP[sc].map((_,i)=>KP[sc][(i-r+12)%12]));if(c>b.r)b={root:r,scale:sc,r:c}}b.ch=ch;return b}
function fitBars(L){const av=Math.floor((L.len/L.S-L.phase)/(240/L.bpm)+.05);L.bars=[8,4,2,1].find(b=>b<=av)||1}
function addLy(name,ch,S,bpm,phase){const x=monoOf(ch).subarray(0,S*60),f=envOf(x),mx=Math.max(...f)||1,L={name,ch,S,len:ch[0].length,bpm:bpm||bpmOf(f,S),phase:phase||0,bars:4,mult:1,vol:.8,mute:false,ons:[],key:null,src:null,g:null,ab:null};
 for(let i=3;i<f.length-3;i++)if(f[i]>.25*mx&&f[i]>=f[i-1]&&f[i]>f[i+1])L.ons.push(i*512/S);
 if(phase===undefined){const j=f.findIndex(v=>v>.5*mx);L.phase=j>0?j*512/S:0}
 L.key=keyOf(x,S);fitBars(L);if(!MST.bpm){MST.bpm=L.bpm;$('zmb').value=L.bpm.toFixed(1)}
 let bm=1,bd=9;for(const m of[.5,1,2]){const d=Math.abs(Math.log2(MST.bpm/(L.bpm*m)));if(d<bd){bd=d;bm=m}}L.mult=bm;LYR.push(L);alignHits();lyChanged(L);lyUI();zs('Added '+name+' · '+L.bpm.toFixed(1)+' BPM · key '+NN[L.key.root]+(L.key.scale==='min'?'m':''))}
const kn=k=>NN[k.root]+(k.scale==='min'?'m':'');
function lyUI(){const c=$('zrows');c.textContent='';LYR.forEach((L,j)=>{const r=MST.bpm?MST.bpm/(L.bpm*L.mult):1,sf=12*Math.log2(r),rk={root:((L.key.root+Math.round(sf))%12+12)%12,scale:L.key.scale},d=document.createElement('div');d.className='card';d.style.margin='6px 0';
 d.innerHTML='<div class="lh"><b>'+L.name+'</b><span class="sp"></span><button data-a="m" class="tg'+(L.mute?'':' on')+'">'+(L.mute?'Muted':'On')+'</button><button data-a="x">✕</button></div><div class="lh" style="margin-top:4px"><label class="ck">BPM <input type="number" data-a="b" value="'+L.bpm.toFixed(1)+'" step="0.5" style="width:70px"></label><button data-a="h">½×</button><button data-a="d">2×</button><label class="ck">Bars <select data-a="n" style="width:auto">'+[1,2,4,8].map(n=>'<option'+(n===L.bars?' selected':'')+'>'+n+'</option>').join('')+'</select></label><input type="range" data-a="v" min="0" max="100" value="'+L.vol*100+'" style="flex:1;min-width:70px"></div><div class="h" style="margin:4px 0 0"><span>key '+kn(L.key)+(Math.round(sf)?' → '+kn(rk):'')+' · speed '+r.toFixed(2)+'×'+(L.mult!==1?' · '+(L.mult<1?'double':'half')+'-time feel':'')+'</span><span>'+(L.err===undefined?'':'grid ±'+L.err.toFixed(0)+'ms')+'</span></div>';
 d.onclick=e=>{const a=e.target.dataset.a;if(!a||/INPUT|SELECT/.test(e.target.tagName))return;if(a==='m'){L.mute=!L.mute;lyGain(L)}else if(a==='x'){lyStop(L);LYR.splice(j,1)}else if(a==='h'||a==='d'){L.bpm=Math.max(40,Math.min(240,L.bpm*(a==='h'?.5:2)));L.mult=1;fitBars(L);lyChanged(L)}lyUI()};
 d.onchange=e=>{const a=e.target.dataset.a;if(a==='b'){L.bpm=Math.max(40,Math.min(240,+e.target.value||L.bpm));L.mult=1;fitBars(L);lyChanged(L)}else if(a==='n'){L.bars=+e.target.value;lyChanged(L)}lyUI()};
 d.oninput=e=>{if(e.target.dataset.a==='v'){L.vol=e.target.value/100;lyGain(L)}};c.appendChild(d)})}
function lyBuf(L){if(!L.ab){L.ab=ac.createBuffer(L.ch.length,L.len,L.S);L.ch.forEach((d,i)=>L.ab.copyToChannel(d,i))}return L.ab}
function lyGain(L){if(L.g)L.g.gain.setTargetAtTime(L.mute?0:L.vol,ac.currentTime,.02)}
function lyStop(L){if(L.src){try{L.src.stop()}catch(e){}}L.src=null}
function lyStart(L,when,k){if(L.src){try{L.src.stop(when)}catch(e){}}const r=MST.bpm/(L.bpm*L.mult),outLen=L.bars*240*L.mult/MST.bpm,src=ac.createBufferSource(),g=ac.createGain(),ls=Math.max(0,Math.min(L.phase,L.len/L.S-.1)),le=Math.min(ls+L.bars*240/L.bpm,L.len/L.S);
 src.buffer=lyBuf(L);src.loop=true;src.loopStart=ls;src.loopEnd=le;src.playbackRate.value=r;g.gain.value=L.mute?0:L.vol;src.connect(g);g.connect(ac.destination);src.start(when,ls+((k*60/MST.bpm)%outLen)*r);L.src=src;L.g=g}
function lyPlayAll(){if(!LYR.length)return;if(ac.state==='suspended')ac.resume();LYR.forEach(lyStop);MST.t0=ac.currentTime+.1;MST.on=true;LYR.forEach(L=>lyStart(L,MST.t0,0));$('zplay').textContent='■ Stop'}
function lyStopAll(){LYR.forEach(lyStop);MST.on=false;$('zplay').textContent='▶ Play all'}
function lyChanged(L){if(!MST.on)return;const kb=Math.ceil((ac.currentTime-MST.t0)/(240/MST.bpm)+.02)*4;lyStart(L,MST.t0+kb*60/MST.bpm,kb)}
function alignHits(){const out=[],g=60/MST.bpm/4;LYR.forEach(L=>{if(L.ons.length<3)return;const r=MST.bpm/(L.bpm*L.mult),span=L.bars*240/L.bpm,dv=()=>L.ons.filter(o=>o>=L.phase&&o<L.phase+span).map(o=>{const t=(o-L.phase)/r/g;return(t-Math.round(t))*g});let d=dv();if(d.length<3)return;const m=d.slice().sort((a,b)=>a-b)[d.length>>1];L.phase=Math.max(0,L.phase+m*r);d=dv();L.err=d.reduce((a,b)=>a+Math.abs(b),0)/Math.max(1,d.length)*1000;out.push(L.name+' ±'+L.err.toFixed(0)+'ms')});if(MST.on)lyPlayAll();return out.join(', ')}
function fitPct(){const P=pcSet();return LYR.map(L=>{const sf=Math.round(12*Math.log2(MST.bpm/(L.bpm*L.mult))),t=L.key.ch.reduce((a,b)=>a+b,0)||1;let n=0;for(let p=0;p<12;p++)if(P.includes((p+sf+120)%12))n+=L.key.ch[p];return L.name+' '+Math.round(100*n/t)+'%'}).join(', ')}
function smartSync(){if(!LYR.length){zs('Add a beat layer first.');return}const C=new Set(),ref=LYR[0];LYR.forEach(L=>[.5,1,2].forEach(m=>{const c=L.bpm*m;if(c>=70&&c<=170)C.add(Math.round(c*2)/2)}));if(!C.size)C.add(MST.bpm||120);let best=null;
 for(const c of C){const sh=L=>{let bm=1,bd=9;for(const m of[.5,1,2]){const d=Math.abs(Math.log2(c/(L.bpm*m)));if(d<bd){bd=d;bm=m}}return[bm,12*Math.log2(c/(L.bpm*bm))]};
  const s0=sh(ref)[1],rr=(ref.key.root+Math.round(s0)+120)%12,P=SCALES[ref.key.scale].map(x=>(x+rr)%12),ms=[];let cost=0;
  for(const L of LYR){const[m,sf]=sh(L);ms.push(m);cost+=Math.abs(sf);const t=L.key.ch.reduce((a,b)=>a+b,0)||1;let n=0;for(let p=0;p<12;p++)if(P.includes((p+Math.round(sf)+120)%12))n+=L.key.ch[p];cost+=6*(1-n/t)+4*Math.abs(sf-Math.round(sf))}
  if(!best||cost<best.cost)best={c,cost,ms,rr,sc:ref.key.scale}}
 MST.bpm=best.c;LYR.forEach((L,i)=>L.mult=best.ms[i]);PL.root=best.rr;PL.scale=best.sc;$('zmb').value=MST.bpm.toFixed(1);$('kr').value=PL.root;$('ks').value=PL.scale;if(PL.built)LAYERS.forEach(keysFor);
 const a=alignHits();if(MST.on)lyPlayAll();lyUI();pnUI();zs('Synced at '+MST.bpm.toFixed(1)+' BPM · key '+NN[PL.root]+(PL.scale==='min'?' minor':' major')+' · hits '+a+' · notes in key: '+fitPct())}
$('zmb').onchange=()=>{MST.bpm=Math.max(40,Math.min(240,+$('zmb').value||MST.bpm));if(MST.on)lyPlayAll();lyUI()};
$('zplay').onclick=()=>MST.on?lyStopAll():lyPlayAll();$('zsync').onclick=smartSync;
$('zchk').onclick=()=>{if(!LYR.length){zs('Add a beat layer first.');return}const a=alignHits();lyUI();zs('Pad check · hits: '+a+' · notes in key: '+fitPct()+' (below ~80% → press Smart sync)')};
$('za0').onclick=()=>addLy('Original',chs,sr,+$('bpm').value,Math.max(0,barPhase));
$('za1').onclick=()=>result?addLy('New arrangement',result,sr,+$('bpm').value,0):zs('Make a New arrangement in the Chopper tab first.');
$('za2').onclick=()=>AR.mix?addLy('Produced beat',AR.mix,sr,AR.bpm,0):zs('Press Produce first (Produce tab).');
$('za3').onclick=()=>$('zf').click();
$('zf').onchange=async e=>{const f=e.target.files[0];if(!f)return;zs('Reading '+f.name+'…');try{const b=await ac.decodeAudioData(await f.arrayBuffer());addLy(f.name.replace(/\.[^.]+$/,''),[...Array(Math.min(2,b.numberOfChannels))].map((_,i)=>b.getChannelData(i)),b.sampleRate)}catch(x){zs('Could not read that file.')}e.target.value=''};
$('td').onclick=()=>tab('D');

/* ---- PARTS: stem separation, part detection, track builder ---- */
const SN=['kick','snare','hat','bass','vocal','melody','air'],SC={kick:'#e03131',snare:'#f76707',hat:'#fab005',bass:'#7048e8',vocal:'#e64980',melody:'#4c6ef5',air:'#12b886'},SNM={kick:'Kick',snare:'Snare / clap',hat:'Hats',bass:'Bass',vocal:'Lead / vocal (center)',melody:'Pads / wide layers',air:'Air / FX'},GRP2={kick:'drum',snare:'drum',hat:'drum',bass:'bass',vocal:'vocal',melody:'melody',air:'air'};
const STM={i0:0,i1:0,a:1,b:1,st:null,rows:[],lv:{},use:{},mix:null,src:null,sl:null,seed:1},eS=t=>$('estt').textContent=t;
function rangeOf(){const n=slices.length,a=Math.max(1,Math.min(n,+$('epa').value||1)),b=Math.max(a,Math.min(n,+$('epb').value||a));return[a,b,slices[a-1].s,slices[b-1].e]}
function rangeInfo(){if(!slices.length)return;const[a,b,s,e]=rangeOf(),bt=60/+$('bpm').value;$('eri').textContent=(s/sr).toFixed(1)+'–'+(e/sr).toFixed(1)+' s · '+((e-s)/sr/bt).toFixed(1)+' beats · '+((e-s)/sr/bt/4).toFixed(1)+' bars · '+(b-a+1)+' slices'}
const NF=2048,HP=1024,KB=NF/2+1;
function sepChunk(L,R){const n=L.length,F=Math.max(1,Math.ceil((n-NF)/HP)+1),tot=(F-1)*HP+NF,T=F*KB,win=sepChunk.w||(sepChunk.w=Float32Array.from({length:NF},(_,i)=>.5-.5*Math.cos(2*Math.PI*i/NF)));
 const sp=x=>{const re=new Float32Array(T),im=new Float32Array(T),a=new Float32Array(NF),b=new Float32Array(NF);for(let f=0;f<F;f++){const o=f*HP;for(let i=0;i<NF;i++){a[i]=(o+i<n?x[o+i]:0)*win[i];b[i]=0}fft(a,b);re.set(a.subarray(0,KB),f*KB);im.set(b.subarray(0,KB),f*KB)}return[re,im]};
 const[Lr,Li]=sp(L),[Rr,Ri]=sp(R),mm=new Float32Array(T),sm=new Float32Array(T),mt=new Float32Array(T),gP=new Float32Array(T),w=new Float32Array(15);
 for(let f=0;f<F;f++)for(let k=0;k<KB;k++){const i=f*KB+k;mm[i]=Math.hypot((Lr[i]+Rr[i])/2,(Li[i]+Ri[i])/2);sm[i]=Math.hypot((Lr[i]-Rr[i])/2,(Li[i]-Ri[i])/2);mt[k*F+f]=mm[i]}
 const med=m=>{for(let i=1;i<m;i++){const v=w[i];let j=i-1;while(j>=0&&w[j]>v){w[j+1]=w[j];j--}w[j+1]=v}return w[m>>1]};
 for(let k=0;k<KB;k++)for(let f=0;f<F;f++){let m=0;for(let d=-4;d<=4;d++){const g=f+d;if(g>=0&&g<F)w[m++]=mt[k*F+g]}const hm=med(m);m=0;for(let d=-6;d<=6;d++){const g=k+d;if(g>=0&&g<KB)w[m++]=mm[f*KB+g]}const pm=med(m),h=hm*hm,p=pm*pm;gP[f*KB+k]=p/(h+p+1e-12)}
 const B1=new Float32Array(KB),B3=new Float32Array(KB);for(let k=0;k<KB;k++){const q=k*sr/NF+1;B1[k]=1/(1+Math.pow(q/200,6));B3[k]=1-1/(1+Math.pow(q/5000,6))}
 const out={},a=new Float32Array(NF),b=new Float32Array(NF),c=new Float32Array(NF),d=new Float32Array(NF);
 for(const sn of SN){const l=new Float32Array(tot),r=new Float32Array(tot);
  for(let f=0;f<F;f++){for(let k=0;k<KB;k++){const i=f*KB+k,g0=gP[i],gh=1-g0,b1=B1[k],b3=B3[k];let g;
    if(sn==='kick')g=g0*b1;else if(sn==='snare')g=g0*(1-b1-b3);else if(sn==='hat')g=g0*b3;else if(sn==='bass')g=gh*b1;else{const rest=gh*(1-b1);if(sn==='air')g=rest*b3;else{const band=rest*(1-b3),cc=mm[i]*mm[i]/(mm[i]*mm[i]+sm[i]*sm[i]+1e-12),v=band*cc*cc;g=sn==='vocal'?v:band-v}}
    a[k]=Lr[i]*g;b[k]=-Li[i]*g;c[k]=Rr[i]*g;d[k]=-Ri[i]*g}
   for(let k=KB;k<NF;k++){a[k]=a[NF-k];b[k]=-b[NF-k];c[k]=c[NF-k];d[k]=-d[NF-k]}
   fft(a,b);fft(c,d);const o=f*HP;for(let i=0;i<NF;i++){l[o+i]+=a[i]/NF;r[o+i]+=c[i]/NF}}
  out[sn]=[l.subarray(0,n),r.subarray(0,n)]}
 return out}
async function separate(){const[a,b,i0,i1]=rangeOf();if((i1-i0)/sr>45){eS('Pick a shorter range (under 45 seconds), for example 300 to 320.');return}
 const pad=Math.round(.6*sr),CH=Math.round(12*sr),L=chs[0],R=chs[1]||chs[0],st={},n=i1-i0;SN.forEach(k=>st[k]=[new Float32Array(n),new Float32Array(n)]);
 for(let c0=i0;c0<i1;c0+=CH){const c1=Math.min(i1,c0+CH),x0=Math.max(0,c0-pad),x1=Math.min(y.length,c1+pad);eS('Separating parts… '+Math.round((c0-i0)/n*100)+'%');await new Promise(r=>setTimeout(r,15));
  const o=sepChunk(L.subarray(x0,x1),R.subarray(x0,x1));for(const k of SN)for(let c=0;c<2;c++)st[k][c].set(o[k][c].subarray(c0-x0,c1-x0),c0-i0)}
 Object.assign(STM,{st,i0,i1,a,b,sl:slices,mix:null});SN.forEach(k=>{STM.lv[k]=STM.lv[k]??1;STM.use[k]=STM.use[k]??true});partsTable();stemUI();eS('Done. Tap a slice below to hear it, then build a track.')}
function eStop(){if(STM.src){try{STM.src.onended=null;STM.src.stop()}catch(e){}STM.src=null}}
function ePlay(d,loop){eStop();if(ac.state==='suspended')ac.resume();const b=ac.createBuffer(2,d[0].length,sr);b.copyToChannel(d[0],0);b.copyToChannel(d[1]||d[0],1);const s=ac.createBufferSource();s.buffer=b;s.loop=!!loop;s.connect(ac.destination);s.onended=()=>{if(STM.src===s)STM.src=null};s.start();STM.src=s}
function segOf(keys,o,n){const r=[new Float32Array(n),new Float32Array(n)],f=Math.min(Math.floor(.003*sr),n>>1);for(const k of keys)for(let c=0;c<2;c++){const s=STM.st[k][c];for(let i=0;i<n;i++)r[c][i]+=s[o+i]}for(let c=0;c<2;c++)for(let j=0;j<f;j++){r[c][j]*=j/f;r[c][n-1-j]*=j/f}return r}
function stemUI(){const c=$('estems');c.textContent='';let tot=1e-12;const en={};for(const k of SN){let e=0;const s=STM.st[k][0];for(let i=0;i<s.length;i+=4)e+=s[i]*s[i];en[k]=e;tot+=e}
 SN.forEach(k=>{const d=document.createElement('div');d.className='lh';d.style.marginTop='4px';d.innerHTML='<button data-a="p">▶</button><b style="color:'+SC[k]+';min-width:104px">'+SNM[k]+' '+Math.round(100*en[k]/tot)+'%</b><label class="ck"><input type="checkbox" data-a="u"'+(STM.use[k]?' checked':'')+'>use</label><input type="range" data-a="v" min="0" max="100" value="'+STM.lv[k]*100+'" style="flex:1;min-width:60px">';
  d.onclick=e=>{if(e.target.dataset.a==='p')ePlay(STM.st[k],true)};d.onchange=e=>{if(e.target.dataset.a==='u')STM.use[k]=e.target.checked};d.oninput=e=>{if(e.target.dataset.a==='v')STM.lv[k]=e.target.value/100};c.appendChild(d)})}
function partsTable(){const c=$('eparts');c.textContent='';STM.rows=[];const bt=60/+$('bpm').value,hist=new Array(12).fill(0),cnt={drum:0,bass:0,vocal:0,melody:0,air:0},yb=y;
 for(let i=STM.a;i<=STM.b;i++){const q=slices[i-1],o=q.s-STM.i0,n=q.e-q.s,en={};let tot=1e-12;for(const k of SN){let e=0;for(let j=0;j<n;j+=2){const v=STM.st[k][0][o+j]+STM.st[k][1][o+j];e+=v*v}en[k]=e;tot+=e}
  const sh={};SN.forEach(k=>sh[k]=en[k]/tot);const g={drum:sh.kick+sh.snare+sh.hat,bass:sh.bass,vocal:sh.vocal,melody:sh.melody,air:sh.air},gk=Object.keys(g).sort((x,z)=>g[z]-g[x]);const LB={drum:'DRUMS',bass:'BASS',vocal:'LEAD/VOCAL',melody:'PADS/WIDE',air:'FX/AIR'};let top=gk[0],lab=top==='drum'?['kick','snare','hat'].sort((x,z)=>sh[z]-sh[x])[0].toUpperCase():LB[top];
  if(g[gk[1]]>.28)lab+=' + '+LB[gk[1]];cnt[top]++;
  let note='';if(top==='bass'||top==='melody'||top==='vocal'){if(n/sr>=.09){const m=segOf([top],o,n),t={s:0,e:n};y=m[0];pitch(t);y=yb;if(t.clar>.75){note=nn(Math.round(t.midi));if(top!=='vocal'||t.clar>.85)hist[((Math.round(t.midi)%12)+12)%12]+=t.clar*Math.min(1,n/sr*3)}}}
  const r={i,n,sh,top,lab,note},d=document.createElement('div');d.className='lh';d.style.cssText='margin:3px 0;padding:4px;border:1px solid var(--bd);border-radius:8px;cursor:pointer';
  d.innerHTML='<span style="min-width:34px">#'+i+'</span><span style="min-width:40px;color:var(--mut)">'+(n/sr).toFixed(2)+'s</span><span class="chip" style="background:'+SC[top==='drum'?['kick','snare','hat'].sort((x,z)=>sh[z]-sh[x])[0]:top]+'">'+lab+'</span><span style="color:var(--mut)">'+note+'</span><span style="display:flex;flex:1;min-width:50px;height:8px;border-radius:4px;overflow:hidden">'+SN.map(k=>'<i style="width:'+(sh[k]*100).toFixed(1)+'%;background:'+SC[k]+'"></i>').join('')+'</span><span style="color:var(--mut);font-size:11px">'+(n/sr/bt).toFixed(2)+'♩</span>';
  d.onclick=()=>{const a=$('eaud').value,ks=a==='mix'?null:a==='drum'?['kick','snare','hat']:[a];if(!ks){const f=Math.min(Math.floor(.003*sr),n>>1),m=chs.map(x=>x.slice(q.s,q.e));m.forEach(x=>{for(let j=0;j<f;j++){x[j]*=j/f;x[n-1-j]*=j/f}});ePlay(m)}else ePlay(segOf(ks,o,n))};
  c.appendChild(d);STM.rows.push(r)}
 let kb={root:0,scale:'min',r:-2};for(const sc of['maj','min'])for(let r=0;r<12;r++){const cc=cor(hist,KP[sc].map((_,i)=>KP[sc][(i-r+12)%12]));if(cc>kb.r)kb={root:r,scale:sc,r:cc}}
 STM.key=hist.some(v=>v>0)?kb:null;$('einfo').textContent='In this range: '+cnt.drum+' drum hits · '+cnt.bass+' bass · '+cnt.vocal+' vocal · '+cnt.melody+' melody · '+cnt.air+' FX/air'+(cnt.drum<2?' · no real drums here, so the builder will make drums from the bass and lead rhythm':'')+(STM.key?' · key '+NN[kb.root]+(kb.scale==='min'?' minor':' major'):'')+' · '+(+$('bpm').value).toFixed(1)+' BPM'}
const SECT={intro:{melody:.9,air:.8,bass:0,vocal:0,drum:0},verse:{melody:.65,air:.3,bass:1,vocal:0,drum:1},hook:{melody:1,air:.5,bass:1,vocal:1,drum:1},brk:{melody:1,air:1,bass:.4,vocal:.8,drum:0},outro:{melody:.8,air:.8,bass:0,vocal:0,drum:0}};
const STRU={loop:[['hook',4]],ab:[['verse',4],['hook',4]],full:[['intro',2],['verse',4],['hook',4],['verse',4],['hook',4],['brk',2],['hook',4],['outro',2]]};
function buildTrack(){if(!STM.st){eS('Separate parts first.');return}
 const bt=60/+$('bpm').value,beat=Math.round(bt*sr),len=STM.i1-STM.i0,sn=Math.round((Math.round((STM.i0/sr-phase)/bt)*bt+phase)*sr),o=Math.max(0,sn-STM.i0),nb=[16,8,4].find(n=>o+n*beat<=len);
 if(!nb){eS('That range is shorter than 4 beats. Widen it.');return}
 const bar=4*beat,Ln=nb*beat,lp={},f=Math.floor(.004*sr);for(const k of SN){lp[k]=[0,1].map(c=>{const x=STM.st[k][c].slice(o,o+Ln);for(let j=0;j<f;j++){x[j]*=j/f;x[Ln-1-j]*=j/f}return x})}
 const R=rng(++STM.seed*7919+13),en=+$('een').value/100,dm=$('edr').value,sty=$('esty').value,secs=[];STRU[$('estr').value].forEach(([t,b])=>{for(let i=0;i<b;i++)secs.push({t,i,last:i===b-1})});
 const nbar=secs.length,out=[new Float32Array(nbar*bar+beat),new Float32Array(nbar*bar+beat)],prev={};
 const add=(s,at,v,rev)=>{const n=s[0].length;for(let c=0;c<2;c++)for(let i=0;i<n&&at+i<out[c].length;i++)out[c][at+i]+=(rev?s[c][n-1-i]:s[c][i])*v};
 const hit=k=>{let bs=-1,bq=null;for(const r of STM.rows){const v=r.sh[k]*Math.sqrt(r.n);if(v>bs){bs=v;bq=r}}const q=slices[bq.i-1],n=Math.min(bq.n,Math.round(.45*sr));return segOf([k],q.s-STM.i0,n)};
 const best=k=>Math.max(0,...STM.rows.map(r=>r.sh[k])),syn=synth(STM.key?STM.key.root:PL.root),H={kick:best('kick')>.3?hit('kick'):syn.kick,snare:best('snare')>.2?hit('snare'):syn.snare,hat:best('hat')>.25?hit('hat'):syn.hat},P=sty==='trap'?{k:[0,7,10],s:[8],h:1}:{k:[0,6,10],s:[4,12],h:2},bo=onsetsIn(lp.bass[0],beat,nb),ld=onsetsIn(lp.vocal[0].map((v,i)=>v+lp.melody[0][i]),beat,nb);
 secs.forEach((s,bi)=>{const S=SECT[s.t],at=bi*bar,nx=secs[bi+1];
  for(const k of SN){const grp=GRP2[k];let g=(grp==='drum'?(dm==='new'?0:dm==='both'?.7:1):1)*S[grp]*STM.lv[k]*(STM.use[k]?1:0);if(s.t==='verse'&&k==='vocal'&&s.i>=2&&R()<en*.7)g=.7*STM.lv[k];if(s.t==='verse'&&k==='melody')g*=.8+.3*en;
   const gp=prev[k]??g,r=Math.round(.03*sr),L=lp[k];let p=(bi*bar)%Ln;if(g>0||gp>0)for(let i=0;i<bar;i++){const gg=i<r?gp+(g-gp)*i/r:g;out[0][at+i]+=L[0][p]*gg;out[1][at+i]+=L[1][p]*gg;if(++p>=Ln)p=0}prev[k]=g}
  if(dm!=='orig'&&S.drum>0){const st=beat/4,dv=dm==='both'?.7:1,pb=bi%Math.max(1,nb/4),inb=a=>a.filter(x=>x>=pb*16&&x<pb*16+16).map(x=>x-pb*16),bk=inb(bo),dens=inb(ld).length,ks=bk.length>=2?bk.slice(0,5):[...new Set([...P.k,...bk])],hs=dens>=9?1:P.h;for(const x of ks)if(STM.use.kick)add(H.kick,at+Math.round(x*st),.9*dv*STM.lv.kick);for(const x of P.s)if(STM.use.snare)add(H.snare,at+Math.round(x*st),.8*dv*STM.lv.snare);
   if(STM.use.hat)for(let x=0;x<16;x+=hs){if(sty==='trap'&&R()<.12)continue;add(H.hat,at+Math.round(x*st),(x%4===0?.4:.25)*dv*STM.lv.hat);if(sty==='trap'&&x%4===3&&s.last)add(H.hat,at+Math.round((x+.5)*st),.22*dv)}}
  if(s.last&&nx&&nx.t==='hook'&&STM.use.air)add(lp.air.map(c=>c.subarray(0,bar)),at,.8*STM.lv.air,true)});
 let pk=0;for(const c of out)for(let i=0;i<c.length;i++)pk=Math.max(pk,Math.abs(c[i]));const g=.92/(pk||1);out.forEach(c=>{for(let i=0;i<c.length;i++)c[i]*=g;for(let j=0;j<f;j++)c[c.length-1-j]*=j/f});
 STM.mix=out;eS('Built '+nbar+' bars · '+(out[0].length/sr).toFixed(0)+' s · loop = '+nb+' beats from '+((STM.i0+o)/sr).toFixed(1)+' s · '+sty+' drums ('+dm+')');ePlay(out)}
function onsetsIn(x,beat,nb){const hop=480,n=Math.floor(x.length/hop),e=new Float32Array(n);for(let i=0;i<n;i++){let s=0;for(let k=0;k<hop;k++)s+=x[i*hop+k]**2;e[i]=Math.sqrt(s/hop)}const fl=e.map((v,i)=>Math.max(0,v-(e[i-1]||0))),mx=Math.max(...fl)||1,st=new Set();for(let i=1;i<n-1;i++)if(fl[i]>.35*mx&&fl[i]>=fl[i-1]&&fl[i]>=fl[i+1]){const s=Math.round(i*hop/(beat/4));if(s<nb*4)st.add(s)}return[...st].sort((a,b)=>a-b)}
function synth(root){const r=rng(5),mk=(n,f)=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=f(i/sr);return[o,o]};let m=24+root;while(m<28)m+=12;const f0=440*Math.pow(2,(m-69)/12);let ph=0,pv=0;
 const kick=mk(Math.round(.45*sr),t=>{ph+=2*Math.PI*f0*(1+2.2*Math.exp(-t*30))/sr;return Math.sin(ph)*Math.exp(-t*6.5)*Math.min(1,t/.002)+(t<.01?(r()*2-1)*.2*(1-t/.01):0)}),
 snare=mk(Math.round(.28*sr),t=>((r()*2-1)*.8*Math.exp(-t*20)+Math.sin(2*Math.PI*190*t)*.5*Math.exp(-t*30))*.9),
 hat=mk(Math.round(.07*sr),t=>{const z=r()*2-1,h=z-pv;pv=z;return h*.6*Math.exp(-t*75)});return{kick,snare,hat}}
function partsInit(){if(!slices.length)return;if(STM.sl!==slices){STM.st=null;STM.mix=null;$('estems').textContent='';$('eparts').textContent='';$('einfo').textContent='';if(!STM.init){STM.init=1;const n=slices.length;$('epa').value=n>=320?300:1;$('epb').value=n>=320?320:Math.min(24,n)}}rangeInfo();setSt('Pick a slice range, then Separate parts.')}
$('epa').onchange=$('epb').onchange=rangeInfo;$('eall').onclick=()=>{$('epa').value=1;$('epb').value=slices.length;rangeInfo()};
$('esep').onclick=e=>{e.currentTarget.disabled=true;separate().catch(x=>eS('Separation failed: '+(x.message||x))).then(()=>{$('esep').disabled=false})};
$('ebuild').onclick=buildTrack;$('eplay').onclick=()=>{if(STM.src)eStop();else if(STM.mix)ePlay(STM.mix);else eS('Build a track first.')};$('eaud').onchange=()=>{};
$('ewav').onclick=e=>busy(e.currentTarget,()=>{if(!STM.mix)throw new Error('Build a track first.');return save(fname+'_parts_track.wav',new Blob([wav(STM.mix)],{type:'audio/wav'}))});
$('ezip').onclick=e=>busy(e.currentTarget,()=>{if(!STM.st)throw new Error('Separate parts first.');const F=SN.map(k=>[fname+'_stem_'+k+'.wav',wav(STM.st[k])]);if(STM.mix)F.push([fname+'_parts_track.wav',wav(STM.mix)]);return save(fname+'_stems.zip',zip(F))});
$('te').onclick=()=>tab('E');
