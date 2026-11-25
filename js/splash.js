/* BAU ENT LLC opening screen. Tap or press any key to skip. Runs before the app UI is shown. */
(function(){
 var el=document.createElement('div');el.id='bauSplash';el.className='play';el.setAttribute('role','img');el.setAttribute('aria-label','BAU ENT LLC, DJ/BEATZ MPC');
 el.innerHTML='<div class="glow"></div><div class="stage"><h1 class="mark" data-t="BAU"><span>BAU</span></h1><div class="row"><span class="rule l"></span><span class="name">ENT LLC</span><span class="rule r"></span></div><p class="prod">DJ/BEATZ MPC</p></div>';
 var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}
 if(reduce)el.classList.add('static');
 function mount(){document.body.appendChild(el);var m=el.querySelector('.mark');el.style.setProperty('--mark-w',m.getBoundingClientRect().width+'px');
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){el.style.setProperty('--mark-w',m.getBoundingClientRect().width+'px')})}
 var done=false;function end(){if(done)return;done=true;el.classList.add('out');setTimeout(function(){el.remove();window.removeEventListener('keydown',end,true)},950)}
 el.addEventListener('pointerdown',end);window.addEventListener('keydown',end,true);
 window.BC16_splash={end:end};
 if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
 setTimeout(end,reduce?1800:6200);
})();
