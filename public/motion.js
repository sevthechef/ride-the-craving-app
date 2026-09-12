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

function animate(){
  const surfer = document.querySelector('#surfer');
  const seascape = document.querySelector('#seascape');
  const wave = document.querySelector('.wave-svg');

  if(surfer && seascape){
    const started = readRideStart();
    if(started){
      const p = Math.max(0, Math.min(1, (Date.now() - started) / DURATION_MS));
      const x = 14 + 68 * p;
      const arch = Math.sin(Math.PI * p);
      const y = 57 - 27 * arch + 10 * p;
      const bob = prefersReduced ? 0 : Math.sin(performance.now() / 420) * (1.6 + 1.8 * arch);
      const angle = -10 * Math.cos(Math.PI * p) + 5 * Math.sin(Math.PI * p * 2);
      const scale = 1 - 0.12 * Math.max(0, (p - 0.82) / 0.18);

      surfer.style.left = `${x}%`;
      surfer.style.top = `${y + bob}%`;
      surfer.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`;
      surfer.style.transition = prefersReduced ? 'left .9s linear, top .9s linear, transform .9s linear' : 'none';

      if(wave && !prefersReduced){
        const drift = Math.sin(performance.now() / 900) * 3;
        const swell = 1 + Math.sin(performance.now() / 1200) * 0.006;
        wave.style.transform = `translateX(${drift}px) scaleY(${swell})`;
        wave.style.transformOrigin = '50% 75%';
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
