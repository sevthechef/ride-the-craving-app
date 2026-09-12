const app = document.querySelector('#app');
const STORAGE = 'ride-craving-v5';
const RIDE_SECONDS = 180;

const initial = {
  screen: 'home',
  cravingType: null,
  customLabel: '',
  startIntensity: 6,
  endIntensity: 6,
  rideStartedAt: null,
  rounds: 0,
  history: []
};

let state = load();
let timer = null;

function load(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    return { ...initial, ...(saved || {}), history: Array.isArray(saved?.history) ? saved.history : [] };
  }catch{return { ...initial };}
}
function save(){ localStorage.setItem(STORAGE, JSON.stringify(state)); }
function set(patch){ state = { ...state, ...patch }; save(); render(); }
function label(){ return state.customLabel?.trim() || state.cravingType || 'craving'; }
function esc(value=''){return String(value).replace(/[&<>'"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));}

function intensityLabel(n){
  if(n<=2) return 'Just a little';
  if(n<=4) return 'Noticeable';
  if(n<=6) return 'Strong';
  if(n<=8) return 'Really strong';
  if(n===9) return 'Very intense';
  return "I'm dying for it";
}

function header(showBack=true){
  return `<div class="topbar">${showBack?'<button class="icon-btn" data-action="back" aria-label="Back">←</button>':'<span></span>'}<span class="eyebrow">Ride the Craving</span><span style="width:42px"></span></div>`;
}

function home(){
  const count = state.history.length;
  return `<section class="screen">
    <div class="hero-card">
      <div class="eyebrow">A craving is a wave, not a command</div>
      <div class="brand">Ride the<br>Craving</div>
      <p class="hero-copy">Cravings come in waves. You only need to ride this one.</p>
      <div class="hero-art" aria-hidden="true">
        <div class="poster-wave"></div>
        <div class="poster-surfer"><span class="head"></span><span class="body"></span><span class="arm1"></span><span class="arm2"></span><span class="leg1"></span><span class="leg2"></span><span class="board"></span></div>
      </div>
      <div class="hero-actions"><button class="primary" data-action="start">🏄 Ride this craving</button></div>
    </div>
    <button class="text-btn home-meta" data-action="history">Your waves · ${count}</button>
    <div class="footer-note">Behavioural support, not medical treatment.</div>
  </section>`;
}

function chooseCraving(){
  const choices = ['Cigarette','Vape','Alcohol','Food','Scrolling','Something else'];
  return `<section class="screen">${header()}
    <div class="panel">
      <div class="eyebrow">Name the wave</div>
      <h1>What are you craving?</h1>
      <p class="lede">Naming it can create a little space between the urge and what you do next.</p>
      <div class="choice-grid">${choices.map(c=>`<button class="choice ${state.cravingType===c?'selected':''}" data-craving="${c}">${c}</button>`).join('')}</div>
      ${state.cravingType==='Something else'?`<input class="input" id="customLabel" value="${esc(state.customLabel)}" placeholder="What is it?" maxlength="40">`:''}
    </div>
    <div class="spacer"></div>
    <button class="primary" data-action="to-intensity" ${state.cravingType?'':'disabled'}>Continue</button>
  </section>`;
}

function intensity(){
  return `<section class="screen">${header()}
    <div class="panel">
      <div class="eyebrow">Before the wave</div>
      <h1>How strong is it right now?</h1>
      <p class="lede">No judgement. Just notice where the craving is at.</p>
      <div class="slider-card">
        <div class="intensity-number" id="intensityNumber">${state.startIntensity}</div>
        <div class="intensity-label" id="intensityLabel">${intensityLabel(state.startIntensity)}</div>
        <input id="intensity" type="range" min="1" max="10" step="1" value="${state.startIntensity}" aria-label="Craving intensity">
        <div class="range-ends"><span>A little</span><span>Overwhelming</span></div>
      </div>
    </div>
    <div class="spacer"></div>
    <button class="primary" data-action="begin-ride">Ride this wave</button>
  </section>`;
}

function phaseFor(progress){
  if(progress >= 1) return ['done','You rode this wave.'];
  if(progress >= .85) return ['shore','Nearly there.'];
  if(progress >= .60) return ['ease','Notice if anything is beginning to shift.'];
  if(progress >= .45) return ['crest','You’re riding it. Nothing to decide right now.'];
  if(progress >= .20) return ['rise','It may build. You don’t have to act on it.'];
  return ['build','Just stay with this wave.'];
}
function phaseName(phase){return ({build:'Building',rise:'Rising',crest:'Crest',ease:'Easing',shore:'Coming ashore',done:'Shore'})[phase];}

function ride(){
  const elapsed = state.rideStartedAt ? Math.max(0,(Date.now()-state.rideStartedAt)/1000) : 0;
  const progress = Math.min(1,elapsed/RIDE_SECONDS);
  const [phase,copy] = phaseFor(progress);
  if(progress >= 1){
    queueMicrotask(()=>finishRide());
  }
  return `<section class="screen ride-screen">
    <div class="ride-head">
      <div class="phase">● <span id="phaseName">${phaseName(phase)}</span></div>
      <h1>Ride the ${esc(label())} wave</h1>
    </div>
    <div class="seascape" id="seascape" data-phase="${phase}" aria-label="A surfer moving with a wave towards the shore">
      <div class="sun"></div>
      <svg class="wave-svg" viewBox="0 0 480 390" preserveAspectRatio="none" aria-hidden="true">
        <path class="wave-dark" d="M0 235 C80 194 130 214 184 175 C245 132 300 162 338 201 C377 240 413 245 480 220 L480 390 L0 390 Z"/>
        <path class="wave-fill" d="M0 252 C72 210 126 231 184 186 C240 143 290 145 327 172 C352 190 363 218 349 231 C331 247 313 222 322 204 C330 188 350 187 367 201 C394 224 423 253 480 244 L480 390 L0 390 Z"/>
        <path class="foam-path" d="M5 247 C72 208 127 227 182 184 C236 143 286 147 324 173 C350 191 361 214 351 229 C340 243 324 233 322 215"/>
      </svg>
      <div class="shore"></div><div class="shoreline"></div>
      <div class="surfer" id="surfer"><span class="head"></span><span class="body"></span><span class="arm1"></span><span class="arm2"></span><span class="leg1"></span><span class="leg2"></span><span class="board"></span></div>
    </div>
    <div class="ride-copy" id="rideCopy">${copy}</div>
    <div class="progress-track" aria-hidden="true"><div class="progress-fill" id="progressFill" style="width:${Math.round(progress*100)}%"></div></div>
    <div class="mini-note">The shore is the end of this ride. No countdown needed.</div>
  </section>`;
}

function reassess(){
  return `<section class="screen">${header(false)}
    <div class="panel">
      <span class="result-pill">Wave reached shore</span>
      <h1>You rode the wave.</h1>
      <p class="lede">How strong is the ${esc(label())} craving now?</p>
      <div class="slider-card">
        <div class="intensity-number" id="intensityNumber">${state.endIntensity}</div>
        <div class="intensity-label" id="intensityLabel">${intensityLabel(state.endIntensity)}</div>
        <input id="intensity" type="range" min="1" max="10" step="1" value="${state.endIntensity}" aria-label="Craving intensity now">
        <div class="range-ends"><span>A little</span><span>Overwhelming</span></div>
      </div>
    </div>
    <div class="spacer"></div>
    <button class="primary" data-action="save-wave">Notice what changed</button>
  </section>`;
}

function decision(){
  const delta = state.startIntensity - state.endIntensity;
  const main = delta > 0 ? `It shifted by ${delta} point${delta===1?'':'s'}.` : delta === 0 ? 'It stayed about the same.' : 'It feels stronger right now.';
  return `<section class="screen">${header(false)}
    <div class="panel">
      <div class="eyebrow">After the wave</div>
      <h1>${main}</h1>
      <p class="lede">You don’t need to make a forever decision. Just choose what helps for the next moment.</p>
      <div class="stack">
        <button class="primary" data-action="another">Still strong? Ride another wave</button>
        <button class="secondary" data-action="home">Gone or weaker — I’m okay for now</button>
        <button class="text-btn" data-action="act">I’m choosing to act on it</button>
      </div>
    </div>
    <div class="footer-note">Whatever you choose, the wave still gave you a moment to notice before acting.</div>
  </section>`;
}

function history(){
  const rows = state.history.slice().reverse().map(item=>{
    const d = item.start - item.end;
    return `<div class="history-row"><div><div class="history-title">${esc(item.label)}</div><div class="history-sub">${new Date(item.at).toLocaleDateString(undefined,{day:'numeric',month:'short'})} · ${item.rounds} wave${item.rounds===1?'':'s'}</div></div><div class="delta">${d>0?'−'+d:d===0?'0':'+'+Math.abs(d)}</div></div>`;
  }).join('');
  return `<section class="screen">${header()}
    <div class="eyebrow">Your waves</div><h1>What you’re learning</h1>
    <p class="lede">Not streaks. Just evidence that cravings change, and that you can create space before deciding what to do.</p>
    <div class="history-list">${rows || '<div class="empty">Your completed waves will show up here.</div>'}</div>
  </section>`;
}

function render(){
  clearInterval(timer); timer = null;
  app.innerHTML = ({home,craving:chooseCraving,intensity,ride,reassess,decision,history}[state.screen] || home)();
  bind();
  if(state.screen==='ride') startTicker();
}

function startTicker(){
  timer = setInterval(()=>{
    if(state.screen!=='ride') return;
    const elapsed = Math.max(0,(Date.now()-state.rideStartedAt)/1000);
    const progress = Math.min(1,elapsed/RIDE_SECONDS);
    const [phase,copy] = phaseFor(progress);
    const sea = document.querySelector('#seascape');
    if(sea) sea.dataset.phase = phase;
    const fill = document.querySelector('#progressFill');
    if(fill) fill.style.width = `${Math.round(progress*100)}%`;
    const phaseEl = document.querySelector('#phaseName');
    if(phaseEl) phaseEl.textContent = phaseName(phase);
    const copyEl = document.querySelector('#rideCopy');
    if(copyEl) copyEl.textContent = copy;
    if(progress>=1) finishRide();
  },1000);
}

function finishRide(){
  if(state.screen!=='ride') return;
  clearInterval(timer);
  state = { ...state, screen:'reassess', rideStartedAt:null, rounds:state.rounds+1, endIntensity:state.startIntensity };
  save();
  render();
}

function bind(){
  document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>action(btn.dataset.action)));
  document.querySelectorAll('[data-craving]').forEach(btn=>btn.addEventListener('click',()=>{
    state.cravingType = btn.dataset.craving;
    if(state.cravingType!=='Something else') state.customLabel='';
    save(); render();
  }));
  const custom = document.querySelector('#customLabel');
  custom?.addEventListener('input',e=>{state.customLabel=e.target.value;save();});
  const slider = document.querySelector('#intensity');
  slider?.addEventListener('input',e=>{
    const value = Number(e.target.value);
    if(state.screen==='intensity') state.startIntensity=value; else state.endIntensity=value;
    document.querySelector('#intensityNumber').textContent=value;
    document.querySelector('#intensityLabel').textContent=intensityLabel(value);
    save();
  });
}

function action(name){
  switch(name){
    case 'start': set({screen:'craving',cravingType:null,customLabel:'',rounds:0}); break;
    case 'to-intensity':
      if(!state.cravingType) return;
      if(state.cravingType==='Something else' && document.querySelector('#customLabel')) state.customLabel=document.querySelector('#customLabel').value.trim();
      set({screen:'intensity'}); break;
    case 'begin-ride': set({screen:'ride',rideStartedAt:Date.now(),rounds:0,endIntensity:state.startIntensity}); break;
    case 'save-wave': {
      const item={label:label(),start:state.startIntensity,end:state.endIntensity,rounds:Math.max(1,state.rounds),at:Date.now()};
      const history=[...state.history,item].slice(-100);
      set({screen:'decision',history}); break;
    }
    case 'another': set({screen:'ride',rideStartedAt:Date.now(),startIntensity:state.endIntensity}); break;
    case 'act': set({screen:'home',rideStartedAt:null,rounds:0}); break;
    case 'home': set({screen:'home',rideStartedAt:null,rounds:0}); break;
    case 'history': set({screen:'history'}); break;
    case 'back':
      if(state.screen==='history') set({screen:'home'});
      else if(state.screen==='craving') set({screen:'home'});
      else if(state.screen==='intensity') set({screen:'craving'});
      else set({screen:'home'});
      break;
  }
}

if(state.screen==='ride' && (!state.rideStartedAt || Date.now()-state.rideStartedAt > RIDE_SECONDS*1000)){
  state.screen='reassess'; state.rideStartedAt=null; state.rounds=Math.max(1,state.rounds); save();
}
render();
