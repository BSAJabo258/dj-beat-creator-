/* BC-16 quick boot + creator-friendly live FX panel. No remote audio or model required. */
(function () {
  'use strict';
  var css = `
  :root{--alien:#72f5e8;--alien2:#a889ff;--alien-bg:#080b11;--alien-panel:#111722;--alien-line:#293544}
  html,body{background:#07090e!important}
  #device{background:radial-gradient(ellipse at 82% 8%,rgba(87,73,170,.15),transparent 36%),repeating-linear-gradient(0deg,rgba(255,255,255,.012) 0 1px,transparent 1px 3px),linear-gradient(145deg,#222832,#11151c 55%,#090c12)!important;border-color:#323b48!important;box-shadow:inset 0 1px 0 #ffffff17,0 30px 90px #000!important}
  #hwTop .logo b{letter-spacing:.08em;text-shadow:0 0 18px #72f5e844}
  #hwTop .logo span{color:var(--alien)!important}
  #bezel{background:linear-gradient(145deg,#151922,#05070a)!important;border-color:#39414d!important}
  #screen{background:radial-gradient(ellipse at 50% 0%,#111b27,#080b11 65%)!important}
  #scrMode{background:linear-gradient(110deg,var(--alien),#b0a1ff)!important;color:#071012!important}
  .card{background:linear-gradient(145deg,#151c27,#10151d)!important;border-color:#2b3848!important;box-shadow:inset 0 1px #ffffff08,0 8px 22px #0002!important}
  .hwb,.bkb{border-color:#05070a!important;box-shadow:inset 0 1px #ffffff12,0 3px 0 #030405,0 5px 12px #0008!important}
  .kcap{filter:drop-shadow(0 0 8px #72f5e81c)}
  #padsSlot .pp{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pc,#72f5e8) 52%,transparent),inset 0 1px #ffffff14,0 3px 0 #030405,0 0 12px color-mix(in srgb,var(--pc,#72f5e8) 16%,transparent)!important}
  #padsSlot .pp.on,#padsSlot .pp.hold{box-shadow:0 0 24px var(--pc,#72f5e8),0 0 54px color-mix(in srgb,var(--pc,#72f5e8) 42%,transparent)!important}
  #scrFoot .sk.on,#scrBody button.p,.loadbtn{background:linear-gradient(110deg,var(--alien),#a9a0ff)!important;border-color:var(--alien)!important;color:#081014!important}
  #creatorBoard{border:1px solid #344556;border-radius:12px;padding:16px;background:radial-gradient(ellipse at 100% 0%,#28224a80,transparent 45%),linear-gradient(145deg,#111a25,#0b1018);box-shadow:inset 0 1px #ffffff0b,0 10px 24px #0003}
  #creatorBoard h2{font-size:17px!important;letter-spacing:.02em!important}
  .cb-intro{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;color:#aab8c7;font-size:12px;margin:2px 0 12px}
  .cb-badge{font:600 9px var(--mono);letter-spacing:.09em;border:1px solid #42605f;border-radius:20px;padding:5px 8px;color:var(--alien);white-space:nowrap}
  .cb-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
  .cb-pad{min-height:74px!important;text-align:left!important;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start!important;background:linear-gradient(145deg,#202a37,#111720)!important;border-color:#354252!important;position:relative;overflow:hidden}
  .cb-pad::after{content:'';position:absolute;inset:auto -12px -28px auto;width:70px;height:70px;border-radius:50%;background:var(--fx,#72f5e8);opacity:.11;filter:blur(8px)}
  .cb-pad:hover{border-color:var(--fx,#72f5e8)!important;transform:translateY(-1px)}
  .cb-pad strong{font-size:12px}.cb-pad small{font:9px var(--mono);color:#92a0b0;letter-spacing:.08em}
  .cb-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
  .cb-actions button{min-height:36px}.cb-help{font-size:11px;color:#99a8b7;line-height:1.55;margin-top:10px}
  .cb-links{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.cb-links a{color:var(--alien);font-size:11px;text-underline-offset:3px}
  #cbStatus{min-height:18px;color:var(--alien);font:10px var(--mono)}
  #bauSplash{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 42%,#182534,#080b11 65%);color:#eaf8ff;font-family:system-ui,sans-serif;transition:opacity .32s ease;}
  #bauSplash.out{opacity:0;pointer-events:none}.boot-card{text-align:center;padding:30px;max-width:90vw}.boot-logo{font-size:clamp(22px,5vw,46px);font-weight:900;letter-spacing:.14em;text-shadow:0 0 22px #72f5e877}.boot-sub{font:10px ui-monospace,monospace;letter-spacing:.22em;color:#9bb2c6;margin-top:7px}.boot-line{width:min(260px,70vw);height:3px;background:#1a2934;margin:22px auto 12px;overflow:hidden;border-radius:9px}.boot-line i{display:block;height:100%;width:40%;background:linear-gradient(90deg,#72f5e8,#a889ff);animation:bootline .8s ease-in-out infinite alternate}.boot-skip{border:1px solid #344656;border-radius:5px;padding:6px 12px;background:#111a24;color:#c9d8e6;font-size:11px;cursor:pointer}@keyframes bootline{to{transform:translateX(150%)}}
  @media(max-width:600px){.cb-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.cb-pad{min-height:66px!important;padding:7px!important}}
  @media(prefers-reduced-motion:reduce){.boot-line i{animation:none}}
  `;
  var style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  // The old cinematic intro could cover a ready instrument for over six seconds.
  // Keep the branded boot cue, but make it brief, skippable and independent of audio unlock.
  var splash=document.createElement('div');splash.id='bauSplash';splash.setAttribute('role','status');splash.setAttribute('aria-live','polite');
  splash.innerHTML='<div class="boot-card"><div class="boot-logo">BAU · BC-16</div><div class="boot-sub">LIVE CREATOR STUDIO</div><div class="boot-line"><i></i></div><div class="boot-sub">PREPARING YOUR WORKSPACE</div><button class="boot-skip" type="button">ENTER STUDIO</button></div>';
  var done=false;function end(){if(done)return;done=true;splash.classList.add('out');setTimeout(function(){if(splash.parentNode)splash.remove()},360)}
  splash.querySelector('button').addEventListener('click',end);splash.addEventListener('pointerdown',function(e){if(e.target===splash)end()});
  if(document.body)document.body.appendChild(splash);else document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(splash)});
  window.BC16_splash={end:end};setTimeout(end,1050);

  var effects=[
    ['Air horn','STAB','horn'],['Laser','PITCH DROP','laser'],['Impact','LOW HIT','impact'],['Riser','BUILD','riser'],
    ['Glitch','DIGITAL','glitch'],['Sweep','NOISE FX','sweep'],['Vinyl stop','TAPE FX','tape'],['Crowd lift','VOCAL FX','crowd'],
    ['Sub drop','BASS FX','sub'],['Reverse swell','REVERSE FX','reverse'],['Alarm','PULSE','alarm'],['Clap burst','PERC FX','clap']
  ];
  function mountBoard(){
    var home=document.getElementById('pgStart');if(!home||document.getElementById('creatorBoard'))return;
    var board=document.createElement('section');board.id='creatorBoard';board.setAttribute('aria-labelledby','cbTitle');
    board.innerHTML='<div class="cb-intro"><div><h2 id="cbTitle">LIVE FX · creator soundboard</h2><div>Tap a pad to perform an original synthesized effect. No sample download, account, or network connection needed.</div></div><span class="cb-badge">LOCAL AUDIO · READY ON TAP</span></div><div class="cb-grid"></div><div class="cb-actions"><button type="button" class="p" id="cbDownload">⬇ Download last effect · WAV</button><button type="button" id="cbBrowse">Browse sound libraries</button><span id="cbStatus" role="status" aria-live="polite">Tap any effect to unlock audio.</span></div><div class="cb-help">Want real-world samples? Download a sound you are allowed to use, then import it in <b>Browse → Add sound file</b> or load it as your song. Licenses differ by sound: check commercial-use, attribution, and redistribution terms before publishing.</div><div class="cb-links"><a href="https://pixabay.com/sound-effects/" target="_blank" rel="noopener noreferrer">Pixabay sound effects ↗</a><a href="https://mixkit.co/free-sound-effects/" target="_blank" rel="noopener noreferrer">Mixkit sound effects ↗</a><a href="https://freesound.org/search/" target="_blank" rel="noopener noreferrer">Freesound (check each license) ↗</a></div>';
    var grid=board.querySelector('.cb-grid');effects.forEach(function(row,i){var b=document.createElement('button');b.type='button';b.className='cb-pad';b.style.setProperty('--fx',i%3===0?'#72f5e8':i%3===1?'#a889ff':'#ffb35c');b.innerHTML='<strong>'+row[0]+'</strong><small>'+String(i+1).padStart(2,'0')+' · '+row[1]+'</small>';b.setAttribute('aria-label','Play '+row[0]+' sound effect');b.addEventListener('click',function(){play(row[2],true);status.textContent='Playing '+row[0]+' · download it as WAV or import your own samples.';});grid.appendChild(b)});
    var status=board.querySelector('#cbStatus');board.querySelector('#cbDownload').addEventListener('click',downloadLast);
    board.querySelector('#cbBrowse').addEventListener('click',function(){if(window.goPage)window.goPage('sounds');else status.textContent='Use the Browse mode in the hardware controls to add your downloaded sounds.'});
    var next=home.querySelector('.next');if(next)home.insertBefore(board,next);else home.appendChild(board);
  }
  var lastKind='horn',audio=null;
  function audioCtx(){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio is not available in this browser.');if(!audio)audio=new AC();if(audio.state==='suspended')audio.resume();return audio}
  function makeNoise(ctx,dest,t,dur,filterType,freq,vol){var n=Math.max(1,Math.ceil(ctx.sampleRate*dur)),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;var src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=buf;f.type=filterType||'bandpass';f.frequency.setValueAtTime(freq||1200,t);f.Q.value=.7;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol||.22),t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(dest);src.start(t);src.stop(t+dur+.02)}
  function tone(ctx,dest,t,dur,f0,f1,wave,vol){var o=ctx.createOscillator(),g=ctx.createGain();o.type=wave||'sawtooth';o.frequency.setValueAtTime(Math.max(20,f0),t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol||.2),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.025)}
  function synth(ctx,dest,kind){var t=ctx.currentTime;
    if(kind==='horn'){tone(ctx,dest,t,1.05,440,415,'sawtooth',.16);tone(ctx,dest,t,1.05,554,523,'sawtooth',.14);tone(ctx,dest,t,1.05,659,622,'square',.045)}
    else if(kind==='laser'){tone(ctx,dest,t,.72,1500,95,'sawtooth',.24);tone(ctx,dest,t,.45,740,55,'square',.09)}
    else if(kind==='impact'||kind==='sub'){tone(ctx,dest,t,kind==='sub'?1.5:.7,kind==='sub'?120:180,kind==='sub'?32:42,'sine',.42);makeNoise(ctx,dest,t,kind==='sub'?.28:.65,'lowpass',kind==='sub'?300:1400,.18)}
    else if(kind==='riser'||kind==='reverse'){makeNoise(ctx,dest,t,1.8,'highpass',500,.2);tone(ctx,dest,t,1.8,90,kind==='reverse'?700:900,'sawtooth',.08)}
    else if(kind==='glitch'){for(var i=0;i<9;i++){var at=t+i*.075;tone(ctx,dest,at,.045,[180,420,1200,240][i%4],i%2?70:170,'square',.08);if(i%2===0)makeNoise(ctx,dest,at,.04,'highpass',1800,.07)}}
    else if(kind==='sweep'){makeNoise(ctx,dest,t,1.25,'bandpass',400,.22);var o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain();o.type='sawtooth';o.frequency.value=80;f.type='lowpass';f.frequency.setValueAtTime(220,t);f.frequency.exponentialRampToValueAtTime(9000,t+1.15);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+1.25);o.connect(f);f.connect(g);g.connect(dest);o.start(t);o.stop(t+1.27)}
    else if(kind==='tape'){tone(ctx,dest,t,.85,720,55,'sawtooth',.14);makeNoise(ctx,dest,t,.12,'highpass',2400,.11)}
    else if(kind==='crowd'){for(var j=0;j<5;j++)tone(ctx,dest,t+j*.04,1.1,330+Math.random()*500,500+Math.random()*600,'sine',.035);makeNoise(ctx,dest,t,.9,'bandpass',1100,.11)}
    else if(kind==='alarm'){for(var k=0;k<4;k++)tone(ctx,dest,t+k*.28,.2,k%2?660:880,k%2?660:880,'square',.13)}
    else if(kind==='clap'){for(var m=0;m<5;m++)makeNoise(ctx,dest,t+m*.075,.12,'bandpass',1100+Math.random()*1000,.13)}
  }
  function play(kind,remember){try{var c=audioCtx();if(remember)lastKind=kind;synth(c,c.destination,kind)}catch(e){var s=document.getElementById('cbStatus');if(s)s.textContent=e.message}}
  function wav(buffer){var ch=buffer.numberOfChannels,len=buffer.length*ch*2+44,out=new ArrayBuffer(len),v=new DataView(out),pos=0;function str(s){for(var i=0;i<s.length;i++)v.setUint8(pos++,s.charCodeAt(i))}function u16(x){v.setUint16(pos,x,true);pos+=2}function u32(x){v.setUint32(pos,x,true);pos+=4}str('RIFF');u32(len-8);str('WAVE');str('fmt ');u32(16);u16(1);u16(ch);u32(buffer.sampleRate);u32(buffer.sampleRate*ch*2);u16(ch*2);u16(16);str('data');u32(len-44);var channels=[];for(var c=0;c<ch;c++)channels.push(buffer.getChannelData(c));for(var i=0;i<buffer.length;i++)for(var c2=0;c2<ch;c2++){var x=Math.max(-1,Math.min(1,channels[c2][i]));v.setInt16(pos,x<0?x*32768:x*32767,true);pos+=2}return new Blob([out],{type:'audio/wav'})}
  function downloadLast(){var s=document.getElementById('cbStatus');try{var C=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!C)throw Error('Offline audio export is not supported in this browser.');s.textContent='Rendering your original effect…';var ctx=new C(1,Math.ceil(2.2*44100),44100);synth(ctx,ctx.destination,lastKind);ctx.startRendering().then(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(wav(b));a.download='bc16-'+lastKind+'-fx.wav';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1500);s.textContent='Downloaded bc16-'+lastKind+'-fx.wav'}).catch(function(e){s.textContent='WAV export failed: '+e.message})}catch(e){s.textContent=e.message}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountBoard);else mountBoard();
  // Start screen can be mounted before the app shell finishes exposing it.
  setTimeout(mountBoard,0);setTimeout(mountBoard,500);
})();
