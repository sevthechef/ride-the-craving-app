const DURATION_MS = 180000;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf = 0;

function readRideStart(){
  try{
    const saved = JSON.parse(localStorage.getItem('ride-craving-v5'));
    return Number(saved?.rideStartedAt) || 0;
  }catch{
    return 0;
  }
}

function ensureDecor(seascape){
  if(!seascape.querySelector('.spray')){
    const spray=document.createElement('div');
    spray.className='spray';
    seascape.appendChild(spray);
  }
  if(!seascape.querySelector('.gulls')){
    const gulls=document.createElement('div');
    gulls.className='gulls';
    seascape.appendChild(gulls);
  }
}

function animate(){
  const surfer = document.querySelector('#surfer');
  const seascape = document.querySelector('#seascape');
  const wave = document.querySelector('.wave-svg');

  if(surfer && seascape){
    ensureDecor(seascape);
    const started = readRideStart();
    if(started){
      const now = performance.now();
      const p = Math.max(0, Math.min(1, (Date.now() - started) / DURATION_MS));
      const swell = Math.sin(Math.PI * p);
      const carve = prefersReduced ? 0 : Math.sin(now / 650) * (2.2 + 3.5 * swell);
      const x = 14 + 69 * p;
      const yBase = 58 - 29 * swell + 11 * p;
      const y = yBase + carve;
      const angle = -11 * Math.cos(Math.PI * p) + (prefersReduced ? 0 : Math.sin(now / 420) * 4.5);
      const lean = 1 + (prefersReduced ? 0 : Math.sin(now / 520) * .018);
      const scale = (1 - 0.11 * Math.max(0, (p - 0.84) / 0.16)) * lean;

      surfer.style.left = `${x}%`;
      surfer.style.top = `${y}%`;
      surfer.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`;
      surfer.style.transition = prefersReduced ? 'left .9s linear, top .9s linear, transform .9s linear' : 'none';

      const spray = seascape.querySelector('.spray');
      if(spray){
        spray.style.left = `calc(${x}% - 64px)`;
        spray.style.top = `calc(${y}% + 30px)`;
        spray.style.transform = `rotate(${angle - 18}deg) scale(${.76 + swell*.38})`;
        spray.style.opacity = `${prefersReduced ? 0 : .45 + swell*.42}`;
      }

      if(wave && !prefersReduced){
        const drift = Math.sin(now / 1050) * 4;
        const lift = Math.sin(now / 1450) * 1.3;
        const waveScale = 1 + Math.sin(now / 1250) * .012;
        wave.style.transform = `translate(${drift}px,${lift}px) scaleY(${waveScale})`;
        wave.style.transformOrigin = '48% 76%';
      }
    }
  }

  raf = requestAnimationFrame(animate);
}

function start(){
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(animate);
}

start();
window.addEventListener('pageshow', start);
document.addEventListener('visibilitychange', () => {
  if(!document.hidden) start();
});
