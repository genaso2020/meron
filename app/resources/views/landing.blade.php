<!doctype html>
<html lang="en" class="h-full">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Betting Panel Interface</title>
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <script src="https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="/_sdk/element_sdk.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&amp;family=Roboto+Mono:wght@400;700&amp;display=swap" rel="stylesheet">
  <style>
html, body { height: 100%; margin: 0; font-family: 'Oswald', sans-serif; }
* { box-sizing: border-box; }
.app-wrapper { height: 100%; width: 100%; overflow: auto; background: #0f1117; color: #e2e4e9; }
.panels-container { display: flex; flex-direction: column; min-height: 100%; }
@media (min-width: 768px) and (max-width: 1023px) {
  .panels-container { flex-wrap: wrap; flex-direction: row; }
  .panel-1 { width: 100%; order: 1; }
  .panel-2 { width: 60%; order: 2; }
  .panel-3 { width: 40%; order: 3; }
}
@media (min-width: 1024px) {
  .panels-container { flex-direction: row; flex-wrap: nowrap; }
  .panel-1 { width: 40%; }
  .panel-2 { width: 30%; }
  .panel-3 { width: 30%; }
}
.calc-display {
  height: 288px; width: 100%; background: #1a1d27; border: 2px solid #2d3143;
  border-radius: 12px; display: flex; align-items: flex-end; justify-content: flex-end;
  padding: 24px; font-family: 'Roboto Mono', monospace; font-size: 64px; font-weight: 700;
  color: #00ff88; text-shadow: 0 0 20px rgba(0,255,136,0.3); overflow: hidden;
  word-break: break-all; line-height: 1.1;
}
.info-box {
  background: #2a2d3a; border-radius: 12px; padding: 20px; margin-top: 12px;
  border: 1px solid #3d4158;
}
.bet-card {
  border-radius: 14px; padding: 0; cursor: pointer; transition: all 0.25s ease;
  border: 2px solid transparent; overflow: hidden; user-select: none;
}
.bet-card:hover { transform: translateY(-4px); }
.bet-card.selected { transform: translateY(-6px); border-color: #fff; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
.bet-card-header { padding: 10px 14px; background: rgba(0,0,0,0.25); display: flex; justify-content: space-between; align-items: center; }
.bet-card-body { padding: 16px; text-align: center; }
.card-meron { background: linear-gradient(135deg, #c0392b, #e74c3c); }
.card-draw { background: linear-gradient(135deg, #1e8449, #27ae60); }
.card-wala { background: linear-gradient(135deg, #1a5276, #2e86c1); }
.fight-carousel {
  display: flex; gap: 10px; overflow-x: auto; padding: 10px 4px;
  scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.fight-carousel::-webkit-scrollbar { display: none; }
.fight-card {
  flex-shrink: 0; width: 64px; height: 64px; border-radius: 10px;
  background: #2a2d3a; border: 2px solid #3d4158; display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 20px; cursor: pointer;
  scroll-snap-align: start; transition: all 0.2s; user-select: none;
}
.fight-card:hover { background: #3d4158; transform: scale(1.08); }
.fight-card.active { background: #f39c12; color: #000; border-color: #f1c40f; }
.fight-card.locked { opacity: 0.4; cursor: not-allowed; pointer-events: none; }
.keypad-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px;
}
.key-btn {
  height: 56px; border-radius: 10px; border: none; font-family: 'Oswald', sans-serif;
  font-size: 22px; font-weight: 700; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; user-select: none;
}
.key-btn:active { transform: scale(0.94); }
.key-num { background: #2a2d3a; color: #e2e4e9; }
.key-num:hover { background: #3d4158; }
.key-clear { background: #e74c3c; color: #fff; }
.key-clear:hover { background: #c0392b; }
.key-back { background: #f39c12; color: #000; }
.key-back:hover { background: #d4880f; }
.key-enter { color: #fff; font-size: 16px; }
.quick-bet-btn {
  background: linear-gradient(135deg, #3d4158, #2a2d3a); color: #00ff88; border: 2px solid #3d4158;
  border-radius: 10px; padding: 10px 8px; font-family: 'Oswald', sans-serif; font-size: 14px;
  font-weight: 700; cursor: pointer; transition: all 0.15s; user-select: none;
}
.quick-bet-btn:hover { background: linear-gradient(135deg, #4d5168, #3a3d4a); border-color: #00ff88; box-shadow: 0 0 12px rgba(0,255,136,0.2); }
.quick-bet-btn:active { transform: scale(0.95); }
.card-3d {
  height: 120px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer;
  transition: all 0.2s; user-select: none; position: relative; overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(0,0,0,0.2);
  transform: perspective(1000px) rotateX(5deg) rotateY(-5deg);
}
.card-3d::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
  pointer-events: none;
}
.card-3d:hover {
  transform: perspective(1000px) rotateX(8deg) rotateY(-8deg) translateZ(10px);
  box-shadow: 0 16px 32px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.2);
}
.card-3d span {
  position: relative; z-index: 1; text-align: center; color: #000; text-shadow: 0 1px 2px rgba(255,255,255,0.3);
}
</style>
  <style>body { box-sizing: border-box; }</style>
  <script src="/_sdk/data_sdk.js" type="text/javascript"></script>
 </head>
 <body>
  <div class="app-wrapper" id="appWrapper">
   <div class="panels-container"><!-- PANEL 1 -->
    <div class="panel-1 p-4" style="border-right: 1px solid #2d3143;"><!-- Calculator Display -->
     <div class="calc-display" id="calcDisplay">
      0
     </div><!-- Info Box -->
     <div class="info-box">
      <div class="flex justify-between items-start">
       <div>
        <div style="font-size:36px; font-weight:700; color:#00ff88;">
         100
        </div>
        <div style="font-size:14px; color:#8a8fa3;">
         Minimum
        </div>
       </div>
       <div class="text-center">
        <div id="dateTime" style="font-size:22px; font-weight:600; color:#f1c40f;"></div>
        <div id="mainTitle" style="font-size:36px; font-weight:700; color:#fff; margin-top:4px;">
         Place Your Bet Now!!!
        </div>
        <div id="fightNoDisplay" style="font-size:38px; font-weight:700; color:#f39c12; margin-top:4px;">
         Fighting No : --
        </div>
       </div>
       <div class="text-right">
        <div style="font-size:36px; font-weight:700; color:#e74c3c;">
         100,000
        </div>
        <div style="font-size:14px; color:#8a8fa3;">
         Maximum
        </div>
       </div>
      </div>
     </div><!-- 3 Bet Cards -->
     <div class="grid grid-cols-3 gap-3 mt-3">
      <div class="bet-card card-meron" data-choice="meron" onclick="selectCard('meron')">
       <div class="bet-card-header">
        <div class="flex items-center gap-2"><i data-lucide="users" style="width:16px;height:16px;"></i> <span class="font-bold" id="meronUsers">24</span>
        </div>
        <div class="flex items-center gap-2"><span class="font-bold" id="meronMoney">₱48,200</span> <i data-lucide="banknote" style="width:16px;height:16px;"></i>
        </div>
       </div>
       <div class="bet-card-body">
        <div style="font-size:36px; font-weight:700;">
         MERON
        </div>
        <div style="font-size:16px; color:rgba(255,255,255,0.8); margin-top:4px;">
         Win: <span id="meronPct">1.85x</span>
        </div>
       </div>
      </div>
      <div class="bet-card card-draw" data-choice="draw" onclick="selectCard('draw')">
       <div class="bet-card-header">
        <div class="flex items-center gap-2"><i data-lucide="users" style="width:16px;height:16px;"></i> <span class="font-bold" id="drawUsers">3</span>
        </div>
        <div class="flex items-center gap-2"><span class="font-bold" id="drawMoney">₱1,500</span> <i data-lucide="banknote" style="width:16px;height:16px;"></i>
        </div>
       </div>
       <div class="bet-card-body">
        <div style="font-size:36px; font-weight:700;">
         DRAW
        </div>
        <div style="font-size:16px; color:rgba(255,255,255,0.8); margin-top:4px;">
         Win: <span id="drawPct">8.00x</span>
        </div>
       </div>
      </div>
      <div class="bet-card card-wala" data-choice="wala" onclick="selectCard('wala')">
       <div class="bet-card-header">
        <div class="flex items-center gap-2"><i data-lucide="users" style="width:16px;height:16px;"></i> <span class="font-bold" id="walaUsers">31</span>
        </div>
        <div class="flex items-center gap-2"><span class="font-bold" id="walaMoney">₱62,800</span> <i data-lucide="banknote" style="width:16px;height:16px;"></i>
        </div>
       </div>
       <div class="bet-card-body">
        <div style="font-size:36px; font-weight:700;">
         WALA
        </div>
        <div style="font-size:16px; color:rgba(255,255,255,0.8); margin-top:4px;">
         Win: <span id="walaPct">1.42x</span>
        </div>
       </div>
      </div>
     </div><!-- Fight Number Carousel -->
     <div class="mt-3">
      <div class="fight-carousel" id="fightCarousel"></div>
     </div>Quick Bet Buttons

     <!-- Numeric Keypad -->
     <div class="grid grid-cols-5 gap-2 mt-3"><button class="quick-bet-btn" onclick="addQuickBet(1000)">₱1000</button> <button class="quick-bet-btn" onclick="addQuickBet(5000)">₱5,000</button> <button class="quick-bet-btn" onclick="addQuickBet(10000)">₱10,000</button> <button class="quick-bet-btn" onclick="addQuickBet(50000)">₱50,000</button> <button class="quick-bet-btn" onclick="addQuickBet(100000)">₱100K</button>
     </div><!-- Numeric Keypad -->
     <div class="keypad-grid" id="keypadGrid"></div><!-- 3D Action Cards -->
     <div class="grid grid-cols-5 gap-3 mt-4">
      <div class="card-3d" style="background: linear-gradient(135deg, #85FF9E, #6ae87a);">
       <span>WINNING COLL</span>
      </div>
      <div class="card-3d" style="background: linear-gradient(135deg, #7e92a0, #6b7d8f);">
       <span>REFUND TICKET</span>
      </div>
      <div class="card-3d" id="lockBtn" onclick="window.hardLogout && window.hardLogout()" style="background: linear-gradient(135deg, #dbfe87, #c8e575);">
       <span>LOCK</span>
      </div>
      <div class="card-3d" style="background: linear-gradient(135deg, #A6F4DC, #90e8ce);">
       <span>SOD</span>
      </div>
      <div class="card-3d" style="background: linear-gradient(135deg, #AE5C04, #9a4d03);">
       <span>EOD</span>
      </div>
     </div>
    <!-- Teller Info Row -->
     <div class="flex justify-between items-center mt-4 px-4 py-3 rounded-lg" style="background: #2a2d3a; border: 1px solid #3d4158;">
      <div>
       <div style="font-size: 12px; color: #8a8fa3; margin-bottom: 4px;">
        Teller No
       </div>
       <div style="font-size: 28px; font-weight: 700; color: #f1c40f;">
        01
       </div>
      </div>
      <div style="text-align: center;">
       <div style="font-size: 12px; color: #8a8fa3; margin-bottom: 4px;">
        Outlet/Branch
       </div>
       <div style="font-size: 24px; font-weight: 700; color: #bee9e8;">
        LAPU LAPU CITY
       </div>
      </div>
      <div style="text-align: right;">
       <div style="font-size: 12px; color: #8a8fa3; margin-bottom: 4px;">
        Teller Name
       </div>
       <div style="font-size: 24px; font-weight: 700; color: #00ff88;">
        TELLER_01
       </div>
      </div>
     </div>
    </div><!-- PANEL 2 -->
    <div class="panel-2 p-4" style="border-right: 1px solid #2d3143;">
     <div style="font-size:20px; font-weight:700; color:#f1c40f; margin-bottom:12px;">
      📋 Bet History
     </div>
     <div id="betHistory" style="font-size:14px; color:#8a8fa3;">
      No bets placed yet.
     </div>
    </div><!-- PANEL 3 -->
    <div class="panel-3 p-4">
     <div style="font-size:20px; font-weight:700; color:#f1c40f; margin-bottom:12px;">
      🏆 Leaderboard
     </div>
     <div id="leaderboard">
      <div class="flex justify-between items-center p-3 rounded-lg mb-2" style="background:#1a1d27;">
       <div class="flex items-center gap-2">
        <span>🥇</span><span class="font-bold">Player_01</span>
       </div><span class="font-bold" style="color:#00ff88;">₱125,400</span>
      </div>
      <div class="flex justify-between items-center p-3 rounded-lg mb-2" style="background:#1a1d27;">
       <div class="flex items-center gap-2">
        <span>🥈</span><span class="font-bold">Player_02</span>
       </div><span class="font-bold" style="color:#00ff88;">₱98,200</span>
      </div>
      <div class="flex justify-between items-center p-3 rounded-lg mb-2" style="background:#1a1d27;">
       <div class="flex items-center gap-2">
        <span>🥉</span><span class="font-bold">Player_03</span>
       </div><span class="font-bold" style="color:#00ff88;">₱76,500</span>
      </div>
     </div>
    </div>
   </div>
  </div>
  <script>
// State
let calcValue = '0';
let selectedCard = null;
let selectedFight = null;
let carouselLocked = false;
const betHistoryList = [];

const enterColors = { meron: '#c0392b', draw: '#1e8449', wala: '#1a5276' };
const enterLabels = { meron: 'BET MERON', draw: 'BET DRAW', wala: 'BET WALA' };

// Date/Time
function updateDateTime() {
  const now = new Date();
  const opts = { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true };
  document.getElementById('dateTime').textContent = now.toLocaleString('en-US', opts);
}
updateDateTime();
setInterval(updateDateTime, 1000);

// Fight Carousel
function buildCarousel() {
  const c = document.getElementById('fightCarousel');
  for (let i = 1; i <= 30; i++) {
    const d = document.createElement('div');
    d.className = 'fight-card';
    d.textContent = i;
    d.dataset.fight = i;
    d.addEventListener('click', () => {
      if (carouselLocked) return;
      document.querySelectorAll('.fight-card').forEach(f => f.classList.remove('active'));
      d.classList.add('active');
      selectedFight = i;
      document.getElementById('fightNoDisplay').textContent = `Fighting No : ${String(i).padStart(2,'0')}`;
    });
    c.appendChild(d);
  }
}

// Card selection
function selectCard(choice) {
  selectedCard = choice;
  document.querySelectorAll('.bet-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.bet-card[data-choice="${choice}"]`).classList.add('selected');
  updateEnterButton();
}

// Keypad
function buildKeypad() {
  const grid = document.getElementById('keypadGrid');
  const keys = [
    {l:'7',t:'num'},{l:'8',t:'num'},{l:'9',t:'num'},{l:'⌫',t:'back'},
    {l:'4',t:'num'},{l:'5',t:'num'},{l:'6',t:'num'},{l:'C',t:'clear'},
    {l:'1',t:'num'},{l:'2',t:'num'},{l:'3',t:'num'},{l:'ENTER',t:'enter',rows:2},
    {l:'0',t:'num',cols:2},{l:'00',t:'num'},
  ];

  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    if (k.t === 'num') btn.classList.add('key-num');
    else if (k.t === 'clear') btn.classList.add('key-clear');
    else if (k.t === 'back') btn.classList.add('key-back');
    else if (k.t === 'enter') { btn.classList.add('key-enter'); btn.id = 'enterBtn'; }

    if (k.cols) btn.style.gridColumn = `span ${k.cols}`;
    if (k.rows) btn.style.gridRow = `span ${k.rows}`;

    btn.textContent = k.l;
    btn.addEventListener('click', () => handleKey(k));
    grid.appendChild(btn);
  });
  updateEnterButton();
}

function handleKey(k) {
  if (k.t === 'num') {
    if (calcValue === '0' && k.l !== '00') calcValue = k.l;
    else if (calcValue === '0' && k.l === '00') return;
    else calcValue += k.l;
    // Remove decimals - whole numbers only
    calcValue = calcValue.replace(/\D/g, '');
    if (calcValue.length > 10) calcValue = calcValue.slice(0, 10);
  } else if (k.t === 'back') {
    calcValue = calcValue.slice(0, -1) || '0';
  } else if (k.t === 'clear') {
    calcValue = '0';
  } else if (k.t === 'enter') {
    placeBet();
    return;
  }
  document.getElementById('calcDisplay').textContent = Number(calcValue).toLocaleString();
}

function updateEnterButton() {
  const btn = document.getElementById('enterBtn');
  if (!btn) return;
  if (selectedCard) {
    btn.style.background = enterColors[selectedCard];
    btn.textContent = enterLabels[selectedCard];
  } else {
    btn.style.background = '#3d4158';
    btn.textContent = 'ENTER';
  }
}

function addQuickBet(amount) {
  const current = parseInt(calcValue) || 0;
  const newValue = current + amount;
  if (newValue > 100000) {
    showToast('Maximum bet is ₱100,000');
    return;
  }
  calcValue = String(newValue);
  document.getElementById('calcDisplay').textContent = Number(calcValue).toLocaleString();
}

function placeBet() {
  const amount = parseInt(calcValue);
  if (!selectedCard) { showToast('Select MERON, DRAW, or WALA first!'); return; }
  if (!selectedFight) { showToast('Select a fight number!'); return; }
  if (amount < 100) { showToast('Minimum bet is ₱100'); return; }
  if (amount > 100000) { showToast('Maximum bet is ₱100,000'); return; }

  // Lock carousel after bet
  carouselLocked = true;
  document.querySelectorAll('.fight-card').forEach(f => { if (!f.classList.contains('active')) f.classList.add('locked'); });

  betHistoryList.unshift({ fight: selectedFight, choice: selectedCard.toUpperCase(), amount });
  renderBetHistory();
  calcValue = '0';
  document.getElementById('calcDisplay').textContent = '0';
  showToast(`₱${amount.toLocaleString()} bet on ${selectedCard.toUpperCase()} — Fight #${selectedFight}!`);
}

function renderBetHistory() {
  const el = document.getElementById('betHistory');
  if (!betHistoryList.length) { el.innerHTML = 'No bets placed yet.'; return; }
  el.innerHTML = betHistoryList.map(b =>
    `<div class="flex justify-between p-2 rounded mb-1" style="background:#1a1d27;">
      <span>Fight #${b.fight} — <strong style="color:${enterColors[b.choice.toLowerCase()]}">${b.choice}</strong></span>
      <span class="font-bold" style="color:#00ff88;">₱${b.amount.toLocaleString()}</span>
    </div>`
  ).join('');
}

// Toast
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  Object.assign(t.style, { position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:'#f1c40f',color:'#000',padding:'12px 24px',borderRadius:'10px',fontWeight:'700',fontSize:'16px',zIndex:'9999',fontFamily:'Oswald',transition:'opacity 0.3s',opacity:'1' });
  t.textContent = msg;
  setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

buildKeypad();
lucide.createIcons();

// Element SDK
const defaultConfig = {
  panel_title: 'Place Your Bet Now!!!',
  background_color: '#0f1117',
  surface_color: '#2a2d3a',
  text_color: '#e2e4e9',
  accent_color: '#f1c40f',
  success_color: '#00ff88',
  font_family: 'Oswald',
  font_size: 16
};

window.elementSdk.init({
  defaultConfig,
  onConfigChange: async (config) => {
    const bg = config.background_color || defaultConfig.background_color;
    const surface = config.surface_color || defaultConfig.surface_color;
    const txt = config.text_color || defaultConfig.text_color;
    const accent = config.accent_color || defaultConfig.accent_color;
    const success = config.success_color || defaultConfig.success_color;
    const font = config.font_family || defaultConfig.font_family;
    const sz = config.font_size || defaultConfig.font_size;

    document.getElementById('appWrapper').style.background = bg;
    document.getElementById('appWrapper').style.color = txt;
    document.getElementById('appWrapper').style.fontFamily = `${font}, sans-serif`;

    document.querySelector('.info-box').style.background = surface;
    document.querySelector('.calc-display').style.background = surface;
    document.querySelector('.calc-display').style.color = success;
    document.getElementById('dateTime').style.color = accent;
    document.getElementById('fightNoDisplay').style.color = accent;

    const title = config.panel_title || defaultConfig.panel_title;
    document.getElementById('mainTitle').textContent = title;

    // Font size scaling
    document.getElementById('mainTitle').style.fontSize = `${sz * 2.25}px`;
    document.getElementById('fightNoDisplay').style.fontSize = `${sz * 2.375}px`;
    document.getElementById('dateTime').style.fontSize = `${sz * 1.375}px`;
  },
  mapToCapabilities: (config) => ({
    recolorables: [
      { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
      { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
      { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
      { get: () => config.accent_color || defaultConfig.accent_color, set: (v) => { config.accent_color = v; window.elementSdk.setConfig({ accent_color: v }); } },
      { get: () => config.success_color || defaultConfig.success_color, set: (v) => { config.success_color = v; window.elementSdk.setConfig({ success_color: v }); } },
    ],
    borderables: [],
    fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
    fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } },
  }),
  mapToEditPanelValues: (config) => new Map([
    ['panel_title', config.panel_title || defaultConfig.panel_title],
  ])
});

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

async function hardLogout() {
  try {
    localStorage.clear();
  } catch (e) {}
  try {
    sessionStorage.clear();
  } catch (e) {}

  const target = window.top || window;
  target.location.href = '/lock';
}

window.hardLogout = hardLogout;

const lockEl = document.getElementById('lockBtn');
if (lockEl) {
  lockEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hardLogout();
  });
}

const idleMs = 5 * 60 * 1000;
const warnMs = 60 * 1000;
let idleTimer = null;
let warnTimer = null;
let countdownTimer = null;
let lastActivityAt = Date.now();
let warningOpen = false;

function clearIdleTimers() {
  if (idleTimer) clearTimeout(idleTimer);
  if (warnTimer) clearTimeout(warnTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  idleTimer = null;
  warnTimer = null;
  countdownTimer = null;
}

function scheduleIdleTimers() {
  clearIdleTimers();
  lastActivityAt = Date.now();

  warnTimer = setTimeout(() => {
    openIdleWarning();
  }, Math.max(0, idleMs - warnMs));

  idleTimer = setTimeout(() => {
    hardLogout();
  }, idleMs);
}

function formatRemaining(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function openIdleWarning() {
  if (warningOpen) return;
  warningOpen = true;

  const start = Date.now();
  const endAt = lastActivityAt + idleMs;

  Swal.fire({
    title: 'Session Expiring',
    html: `<div style="font-family: Oswald, sans-serif;">Logging out in <strong id="idleCountdown"></strong></div>`,
    icon: 'warning',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: true,
    confirmButtonText: 'Continue',
    showCancelButton: true,
    cancelButtonText: 'Logout',
    didOpen: () => {
      const el = document.getElementById('idleCountdown');
      const tick = () => {
        const remaining = endAt - Date.now();
        if (el) el.textContent = formatRemaining(remaining);
      };
      tick();
      countdownTimer = setInterval(tick, 250);
    },
  }).then((result) => {
    warningOpen = false;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;

    if (result.isConfirmed) {
      scheduleIdleTimers();
      return;
    }

    hardLogout();
  });
}

function markActivity() {
  if (warningOpen) return;
  scheduleIdleTimers();
}

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach((evt) => {
  window.addEventListener(evt, markActivity, { passive: true });
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    scheduleIdleTimers();
  }
});

scheduleIdleTimers();
</script>
 <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9e767881321309f8',t:'MTc3NTM3MDI3Ni4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
 </html>
