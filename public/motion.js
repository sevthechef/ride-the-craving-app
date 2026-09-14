const DURATION_MS=180000;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf=0,lastBreath='';
function startTime(){try{return Number(JSON.parse(localStorage.getItem('ride-craving-v5'))?.rideStartedAt)||0}catch{return 0}}
function decor(sea){
 if(!sea.querySelector('.spray')){let e=document.createElement('div');e.className='spray';sea.append(e)}
 if(!sea.querySelector('.gulls')){let e=document.createElement('div');e.className='gulls';sea.append(e)}
 if(!sea.querySelector('.breath-guide')){let e=document.createElement('div');e.className='breath-guide';e.innerHTML='<span class="breath-orb"></span><strong class="breath-word">Breathe in</strong>';sea.append(e)}
 if(!sea.querySelector('.breath-light')){let e=document.createElement('div');e.className='breath-light';sea.append(e)}
}
function haptic(phase){if(phase===lastBreath)return;lastBreath=phase;if(navigator.vibrate){try{navigator.vibrate(phase==='in'?[45]:[35,70,35])}catch{}}}
function loop(){
 const s=document.querySelector('#surfer'),sea=document.querySelector('#seascape'),wave=document.querySelector('.wave-svg'),foam=document.querySelector('.foam-path');
 if(s&&sea){decor(sea);const started=startTime();if(started){
  const now=Date.now(),elapsed=now-started,t=performance.now(),p=Math.max(0,Math.min(1,elapsed/DURATION_MS)),crest=Math.sin(Math.PI*p);
  const cycleMs=10000,cycle=(elapsed%cycleMs)/1000,breath=cycle<4?'in':'out',breathP=cycle<4?cycle/4:(cycle-4)/6,q=breath==='in'?breathP:1-breathP,cycles=Math.floor(elapsed/cycleMs);
  haptic(breath);
  const word=sea.querySelector('.breath-word'),orb=sea.querySelector('.breath-orb'),guide=sea.querySelector('.breath-guide'),light=sea.querySelector('.breath-light');
  if(word)word.textContent=breath==='in'?'Breathe in':'Breathe out';
  if(guide)guide.classList.toggle('learned',cycles>=3);
  if(orb){orb.style.transform=`scale(${.72+q*.55})`;orb.style.opacity=String(.5+q*.45)}
  if(light){light.style.left=`${18+q*58}%`;light.style.top=`${67-q*34}%`;light.style.opacity=String(.25+q*.55);light.style.transform=`translate(-50%,-50%) scale(${.7+q*.55})`}

  // The sea starts calm. The wave builds first; the surfer arrives only after the user has settled into the rhythm.
  const intro=Math.min(1,elapsed/18000),surferIn=Math.max(0,Math.min(1,(elapsed-14000)/8000));
  const breathSwell=1+(q-.5)*.075;
  if(wave){wave.style.opacity=String(.28+.72*intro);if(!reduced){const drift=Math.sin(t/900)*4*intro,lift=(-7*q)+Math.sin(t/1500)*1.5;wave.style.transform=`translate(${drift}px,${lift}px) scaleY(${(.76+.24*intro)*breathSwell})`;wave.style.transformOrigin='45% 82%'}}
  if(foam&&!reduced){foam.style.strokeDasharray='18 8';foam.style.strokeDashoffset=String(-(t/45)%52);foam.style.opacity=String(.2+.8*intro)}

  const carve=reduced?0:Math.sin(t/520)*(3+7*crest),micro=reduced?0:Math.sin(t/170)*.7;
  const x=10+74*p,y=63-30*crest+11*p+carve+micro-(q*2.8),angle=-15*Math.cos(Math.PI*p)+(reduced?0:Math.sin(t/390)*6),scale=(.9+.1*crest)*(reduced?1:1+q*.025);
  s.style.left=x+'%';s.style.top=y+'%';s.style.opacity=String(surferIn);s.style.transform=`translate(-50%,-50%) translateY(${(1-surferIn)*34}px) rotate(${angle}deg) scale(${scale})`;
  s.style.setProperty('--crouch',String(breath==='out'?Math.max(crest,.35):crest*.65));
  const spray=sea.querySelector('.spray');if(spray){spray.style.left=`calc(${x}% - 72px)`;spray.style.top=`calc(${y}% + 31px)`;spray.style.transform=`rotate(${angle-22}deg) scale(${(.7+crest*.65)*surferIn})`;spray.style.opacity=reduced?'0':String((.35+crest*.5)*surferIn)}
  const gulls=sea.querySelector('.gulls');if(gulls&&!reduced)gulls.style.transform=`translate(${Math.sin(t/1800)*10}px,${Math.sin(t/1200)*3}px)`;
 }}
 raf=requestAnimationFrame(loop)
}
function start(){cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}start();addEventListener('pageshow',start);document.addEventListener('visibilitychange',()=>{if(!document.hidden)start()});

document.addEventListener('click',event=>{const screen=event.target.closest('.screen');const hero=screen?.querySelector('.hero-card');if(!hero)return;if(!event.target.closest('.hero-card,.hero-actions,.home-meta'))return;const r=hero.getBoundingClientRect();if(!r.width||!r.height)return;const x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;const startWave=x>=.075&&x<=.665&&y>=.252&&y<=.306;const waves=x>=.075&&x<=.555&&y>=.315&&y<=.365;if(startWave){event.preventDefault();event.stopImmediatePropagation();document.querySelector('[data-action="start"]')?.click()}else if(waves){event.preventDefault();event.stopImmediatePropagation();document.querySelector('[data-action="history"]')?.click()}},true);
