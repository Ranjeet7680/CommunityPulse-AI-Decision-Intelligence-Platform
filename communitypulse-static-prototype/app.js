/* =========================================================
   CommunityPulse AI — Application Logic
   State Engine · Router · Charts · Maps · AI Assistant
   ========================================================= */

'use strict';

// ─────────────────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────────────────
const State = {
  theme: 'light',
  auth: {
    loggedIn: false,
    name: 'Ranjeet Kumar',
    email: 'ranjeet@communitypulse.ai',
    initials: 'RK',
    org: 'CommunityPulse AI',
    role: 'Super Admin'
  },
  currentView: 'dashboard',
  onboardingStep: 1,
  sidebarCollapsed: false,
  notifications: [
    { id: 1, type: 'critical', text: 'Flood risk level ORANGE in District 7', time: '3m ago', read: false },
    { id: 2, type: 'info',     text: 'Gemini AI has generated this week\'s community report', time: '18m ago', read: false },
    { id: 3, type: 'success',  text: 'BigQuery connection verified successfully', time: '1h ago', read: true },
    { id: 4, type: 'warn',     text: 'Air Quality Index exceeded safe threshold in Zone 4', time: '2h ago', read: true },
  ],
  connectedSources: ['bigquery', 'firebase'],
  referralCode: 'PULSE-RK2024',
  referralCount: 7,
  chatHistory: [],
  activeSettingsPanel: 'general',
  activeMapLayer: 'traffic',
  metrics: {
    communityScore: 84,
    trafficIndex: 67,
    airQuality: 42,
    satisfaction: 78,
    waterUsage: 55,
    energy: 61,
    waste: 89,
    emergency: 'Normal'
  }
};

// ─────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function el(tag, cls = '', html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function showToast(msg, type = 'info') {
  const container = $('#toast-container') || (() => {
    const d = document.createElement('div');
    d.id = 'toast-container';
    d.className = 'toast-container';
    document.body.appendChild(d);
    return d;
  })();

  const icons = { success: 'check_circle', error: 'error', info: 'info', warn: 'warning' };
  const colors = { success: '#34A853', error: '#EA4335', info: '#1A73E8', warn: '#FBBC04' };
  const t = el('div', `toast ${type}`);
  t.innerHTML = `
    <span class="material-symbols-rounded" style="color:${colors[type]||colors.info};font-size:20px">${icons[type]||icons.info}</span>
    <span style="flex:1">${msg}</span>
    <button onclick="this.parentElement.remove()" class="btn-ghost btn-icon" style="padding:2px">
      <span class="material-symbols-rounded" style="font-size:16px">close</span>
    </button>`;
  container.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 3500);
  setTimeout(() => t.remove(), 4000);
}

function animateCounter(el, target, suffix = '', duration = 1600) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const prog = Math.min((timestamp - start) / duration, 1);
    const val = Math.round(easeOutExpo(prog) * target);
    el.textContent = val.toLocaleString() + suffix;
    if (prog < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// ─────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────
function toggleTheme() {
  State.theme = State.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', State.theme);
  const icon = $('#theme-icon');
  if (icon) icon.textContent = State.theme === 'dark' ? 'light_mode' : 'dark_mode';
  showToast(`Switched to ${State.theme} mode`, 'info');
}

// ─────────────────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────────────────
async function initSplash() {
  const splash = $('#splash');
  if (!splash) return;
  await sleep(2800);
  splash.classList.add('hidden-splash');
  await sleep(800);
  splash.remove();
  showLanding();
}

// ─────────────────────────────────────────────────────────
// PAGE ROUTING
// ─────────────────────────────────────────────────────────
function showLanding() {
  $$('.page').forEach(p => p.classList.remove('active'));
  const land = $('#landing');
  if (land) { land.style.display = 'flex'; land.classList.add('active'); }
  initLandingAnimations();
}

function showAuth(mode = 'login') {
  hideLanding();
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const auth = $('#auth-page');
  if (auth) { auth.style.display = 'flex'; auth.classList.add('active'); }
  switchAuthMode(mode);
}

function hideLanding() {
  const land = $('#landing');
  if (land) { land.style.display = 'none'; land.classList.remove('active'); }
}

function showOnboarding(step = 1) {
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const ob = $('#onboarding-page');
  if (ob) { ob.style.display = 'flex'; ob.classList.add('active'); }
  goToOnboardingStep(step);
}

function showApp() {
  $$('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
  const app = $('#app-shell');
  if (app) { app.style.display = 'flex'; app.classList.add('active'); }
  State.auth.loggedIn = true;
  navigateTo('dashboard');
  updateUserUI();
}

function navigateTo(view) {
  State.currentView = view;
  $$('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
  $$('.app-view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  const target = $(`#view-${view}`);
  if (target) {
    target.style.display = 'block';
    target.classList.add('active');
    setTimeout(() => renderView(view), 50);
  }
}

function renderView(view) {
  switch(view) {
    case 'dashboard':      renderDashboard(); break;
    case 'maps':           renderMapView(); break;
    case 'analytics':      renderAnalytics(); break;
    case 'predictions':    renderPredictions(); break;
    case 'ai-assistant':   renderAIAssistant(); break;
    case 'data':           renderDataConnections(); break;
    case 'referral':       renderReferralCenter(); break;
    case 'admin':          renderAdmin(); break;
    case 'reports':        renderReports(); break;
  }
}

// ─────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────
function switchAuthMode(mode) {
  const loginForm  = $('#login-form');
  const signupForm = $('#signup-form');
  const authTitle  = $('#auth-title');
  const authSub    = $('#auth-subtitle');
  if (mode === 'login') {
    if (loginForm) loginForm.style.display = 'flex';
    if (signupForm) signupForm.style.display = 'none';
    if (authTitle) authTitle.textContent = 'Welcome back';
    if (authSub) authSub.textContent = 'Sign in to your CommunityPulse AI workspace';
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'flex';
    if (authTitle) authTitle.textContent = 'Create your account';
    if (authSub) authSub.textContent = 'Join 5,000+ community leaders';
  }
}

function handleLogin(e) {
  e && e.preventDefault();
  const btn = $('#login-btn');
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    btn.disabled = true;
  }
  setTimeout(() => showOnboarding(1), 1400);
}

function handleSignup(e) {
  e && e.preventDefault();
  const btn = $('#signup-btn');
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Creating account...';
    btn.disabled = true;
  }
  setTimeout(() => showOnboarding(1), 1400);
}

function handleOAuth(provider) {
  showToast(`Connecting with ${provider}...`, 'info');
  setTimeout(() => showOnboarding(1), 1200);
}

// ─────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────
function goToOnboardingStep(step) {
  State.onboardingStep = step;
  $$('.ob-step').forEach(s => s.classList.remove('active'));
  const target = $(`.ob-step[data-step="${step}"]`);
  if (target) target.classList.add('active');

  $$('.step-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 < step) dot.classList.add('done');
    else if (i + 1 === step) dot.classList.add('active');
  });
  $$('.step-line').forEach((line, i) => {
    line.classList.toggle('done', i + 1 < step);
  });
}

function nextOnboardingStep() {
  if (State.onboardingStep < 3) goToOnboardingStep(State.onboardingStep + 1);
  else finishOnboarding();
}

function finishOnboarding() {
  showToast('Workspace ready! Welcome to CommunityPulse AI 🎉', 'success');
  setTimeout(() => showApp(), 600);
}

function validateReferral() {
  const input = $('#referral-input');
  if (!input) return;
  const validCodes = ['GEMINI50', 'PULSEPARTNER', 'NVIDIA99', 'GOOGLE2024', 'COMMUNITY'];
  const code = input.value.trim().toUpperCase();
  const resultEl = $('#referral-result');
  if (validCodes.includes(code)) {
    if (resultEl) {
      resultEl.innerHTML = `
        <div class="badge badge-green" style="font-size:13px;padding:8px 16px">
          <span class="material-symbols-rounded" style="font-size:16px">check_circle</span>
          Code applied! +5,000 free processing credits unlocked
        </div>`;
    }
    showToast('Referral code applied! 5,000 credits added.', 'success');
    setTimeout(() => nextOnboardingStep(), 1200);
  } else if (code === '') {
    showToast('Please enter a referral code', 'warn');
  } else {
    if (resultEl) {
      resultEl.innerHTML = `
        <div class="badge badge-red" style="font-size:13px;padding:8px 16px">
          <span class="material-symbols-rounded" style="font-size:16px">error</span>
          Invalid code. Try: GEMINI50
        </div>`;
    }
    showToast('Invalid referral code', 'error');
  }
}

// ─────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────
function toggleSidebar() {
  State.sidebarCollapsed = !State.sidebarCollapsed;
  const sidebar = $('#sidebar');
  if (sidebar) sidebar.classList.toggle('collapsed', State.sidebarCollapsed);
}

function updateUserUI() {
  const avatars = $$('.user-initials');
  avatars.forEach(a => a.textContent = State.auth.initials);
  const names = $$('.user-name');
  names.forEach(n => n.textContent = State.auth.name);
  const emails = $$('.user-email');
  emails.forEach(e => e.textContent = State.auth.email);
}

// ─────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────
function toggleNotifications() {
  const panel = $('#notif-panel');
  if (!panel) return;
  const isOpen = !panel.classList.contains('hidden');
  closeAllDropdowns();
  if (!isOpen) {
    panel.classList.remove('hidden');
    renderNotifications();
  }
}

function renderNotifications() {
  const list = $('#notif-list');
  if (!list) return;
  const unread = State.notifications.filter(n => !n.read);
  list.innerHTML = State.notifications.map(n => `
    <div class="dropdown-item" style="flex-direction:column;align-items:flex-start;gap:4px;padding:12px;${n.read ? '' : 'background:var(--blue-50)'}">
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <span class="material-symbols-rounded" style="font-size:18px;color:${n.type==='critical'?'var(--red)':n.type==='success'?'var(--green)':n.type==='warn'?'var(--yellow)':'var(--blue)'}">
          ${n.type==='critical'?'emergency':'info'}
        </span>
        <span style="flex:1;font-size:13px">${n.text}</span>
        ${!n.read?'<span style="width:7px;height:7px;border-radius:50%;background:var(--blue);flex-shrink:0"></span>':''}
      </div>
      <span style="font-size:11px;color:var(--text-tertiary);margin-left:26px">${n.time}</span>
    </div>
    <div class="dropdown-divider" style="margin:0"></div>
  `).join('');
  // Update badge
  const badge = $('#notif-badge');
  if (badge) badge.textContent = unread.length || '';
}

function closeAllDropdowns() {
  $$('.dropdown:not(.persistent)').forEach(d => d.classList.add('hidden'));
  $('#user-menu')?.classList.add('hidden');
  $('#notif-panel')?.classList.add('hidden');
  $('#command-palette')?.classList.add('hidden');
}

function toggleUserMenu() {
  const menu = $('#user-menu');
  if (!menu) return;
  const isOpen = !menu.classList.contains('hidden');
  closeAllDropdowns();
  if (!isOpen) menu.classList.remove('hidden');
}

function openCommandPalette() {
  const cp = $('#command-palette');
  if (cp) {
    cp.classList.remove('hidden');
    $('#cmd-search')?.focus();
  }
}

// ─────────────────────────────────────────────────────────
// CANVAS CHART ENGINE
// ─────────────────────────────────────────────────────────
const CHART_BLUE   = '#1A73E8';
const CHART_GREEN  = '#34A853';
const CHART_YELLOW = '#FBBC04';
const CHART_RED    = '#EA4335';
const CHART_GRAY   = '#E0E3F0';

function drawLineChart(canvas, datasets, labels, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 200;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Find range
  const allVals = datasets.flatMap(d => d.data);
  const minV = opts.min ?? 0;
  const maxV = opts.max ?? Math.max(...allVals) * 1.1;

  // Grid
  ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#F1F3FF';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    // Y label
    const val = Math.round(maxV - (maxV - minV) / 4 * i);
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  // X labels
  ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
  ctx.textAlign = 'center';
  ctx.font = '11px Inter';
  labels.forEach((lbl, i) => {
    const x = pad.left + (chartW / (labels.length - 1)) * i;
    ctx.fillText(lbl, x, H - 8);
  });

  // Lines & fills
  datasets.forEach(dataset => {
    const pts = dataset.data.map((v, i) => ({
      x: pad.left + (chartW / (dataset.data.length - 1)) * i,
      y: pad.top + chartH - ((v - minV) / (maxV - minV)) * chartH
    }));

    // Fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
    ctx.lineTo(pts[0].x, pad.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, dataset.color + '30');
    grad.addColorStop(1, dataset.color + '00');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = dataset.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  });
}

function drawBarChart(canvas, data, labels, colors, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight || 200;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 16, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxV = Math.max(...data) * 1.15;

  // Grid
  ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#F1F3FF';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxV - (maxV / 4) * i);
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 6, y + 4);
  }

  const barW = (chartW / data.length) * 0.6;
  const gap = (chartW / data.length) * 0.4 / 2;

  data.forEach((v, i) => {
    const barH = (v / maxV) * chartH;
    const x = pad.left + (chartW / data.length) * i + gap;
    const y = pad.top + chartH - barH;
    const color = colors[i % colors.length];
    const r = 4;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + barW - r, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
    ctx.lineTo(x + barW, y + barH);
    ctx.lineTo(x, y + barH);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Label
    ctx.fillStyle = State.theme === 'dark' ? '#5B6785' : '#9AA0AC';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, H - 8);
  });
}

function drawDonutChart(canvas, data, colors) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.offsetWidth || 160;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const total = data.reduce((a, b) => a + b, 0);
  const cx = size / 2, cy = size / 2;
  const r = size * 0.38, innerR = size * 0.26;
  let start = -Math.PI / 2;
  const gap = 0.03;

  data.forEach((val, i) => {
    const angle = (val / total) * (Math.PI * 2 - gap * data.length);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start + gap / 2, start + angle + gap / 2);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    // Inner hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = State.theme === 'dark' ? '#161B27' : '#FFFFFF';
    ctx.fill();
    start += angle + gap;
  });
}

function drawRadarChart(canvas, labels, values, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.offsetWidth || 200;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;
  const r = size * 0.36;
  const n = labels.length;
  const step = (Math.PI * 2) / n;

  // Grid
  [0.2, 0.4, 0.6, 0.8, 1].forEach(factor => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + step * i;
      const x = cx + Math.cos(angle) * r * factor;
      const y = cy + Math.sin(angle) * r * factor;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#E0E3F0';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Spokes
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + step * i;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = State.theme === 'dark' ? '#2D3A50' : '#E0E3F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    const lx = cx + Math.cos(angle) * (r + 18);
    const ly = cy + Math.sin(angle) * (r + 18);
    ctx.fillStyle = State.theme === 'dark' ? '#9AA5C0' : '#5F6368';
    ctx.font = '11px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], lx, ly);
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + step * i;
    const val = values[i] / 100;
    const x = cx + Math.cos(angle) * r * val;
    const y = cy + Math.sin(angle) * r * val;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color + '30';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────
// MAP CANVAS ENGINE
// ─────────────────────────────────────────────────────────
function renderMapCanvas(canvas, layer) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 600;
  const H = canvas.offsetHeight || 400;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  // Dark map background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#12203A');
  bg.addColorStop(1, '#1a2e52');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid lines (streets)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Roads
  const roads = [
    { pts: [[0, H*0.35], [W*0.3, H*0.3], [W*0.7, H*0.4], [W, H*0.35]], width: 3, color: 'rgba(255,255,255,0.15)' },
    { pts: [[0, H*0.6], [W*0.4, H*0.55], [W*0.8, H*0.65], [W, H*0.6]], width: 2, color: 'rgba(255,255,255,0.1)' },
    { pts: [[W*0.3, 0], [W*0.32, H*0.5], [W*0.35, H]], width: 2, color: 'rgba(255,255,255,0.1)' },
    { pts: [[W*0.65, 0], [W*0.62, H*0.4], [W*0.68, H]], width: 2, color: 'rgba(255,255,255,0.1)' },
  ];
  roads.forEach(road => {
    ctx.beginPath();
    ctx.moveTo(...road.pts[0]);
    road.pts.slice(1).forEach(([x,y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = road.color;
    ctx.lineWidth = road.width;
    ctx.stroke();
  });

  // Layer-specific overlays
  if (layer === 'traffic') drawTrafficLayer(ctx, W, H);
  else if (layer === 'air') drawAirQualityLayer(ctx, W, H);
  else if (layer === 'flood') drawFloodLayer(ctx, W, H);
  else if (layer === 'density') drawDensityLayer(ctx, W, H);
  else drawTrafficLayer(ctx, W, H);

  // Districts
  const districts = [
    { x: W*0.15, y: H*0.2, name: 'District 1' },
    { x: W*0.45, y: H*0.15, name: 'District 2' },
    { x: W*0.75, y: H*0.2, name: 'District 3' },
    { x: W*0.1,  y: H*0.6, name: 'District 4' },
    { x: W*0.5,  y: H*0.65, name: 'District 5' },
    { x: W*0.82, y: H*0.7, name: 'District 6' },
  ];
  districts.forEach(d => {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(d.name, d.x, d.y);
  });

  // Pulse markers
  const markers = [
    { x: W*0.3, y: H*0.3, color: '#1A73E8', label: 'HQ' },
    { x: W*0.6, y: H*0.55, color: '#34A853', label: 'Zone A' },
    { x: W*0.15, y: H*0.55, color: '#FBBC04', label: 'Alert' },
    { x: W*0.75, y: H*0.45, color: '#EA4335', label: 'Critical' },
  ];
  markers.forEach(m => {
    // Pulse rings
    [20, 14, 8].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
      ctx.fillStyle = m.color + (i === 0 ? '15' : i === 1 ? '30' : '60');
      ctx.fill();
    });
    // Center
    ctx.beginPath();
    ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.fill();
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, m.x, m.y - 18);
  });
}

function drawTrafficLayer(ctx, W, H) {
  const segments = [
    { x: W*0.2, y: H*0.32, w: W*0.15, h: 6, color: '#34A853' },
    { x: W*0.4, y: H*0.29, w: W*0.1,  h: 6, color: '#FBBC04' },
    { x: W*0.55, y: H*0.37, w: W*0.12, h: 6, color: '#EA4335' },
    { x: W*0.15, y: H*0.57, w: W*0.18, h: 5, color: '#34A853' },
    { x: W*0.5, y: H*0.52, w: W*0.1,  h: 5, color: '#1A73E8' },
  ];
  segments.forEach(s => {
    ctx.fillStyle = s.color + 'CC';
    ctx.fillRect(s.x - s.w/2, s.y - s.h/2, s.w, s.h);
  });
}

function drawAirQualityLayer(ctx, W, H) {
  const zones = [
    { x: W*0.2, y: H*0.3, r: 70, color: '#34A853' },
    { x: W*0.5, y: H*0.45, r: 90, color: '#FBBC04' },
    { x: W*0.75, y: H*0.4, r: 60, color: '#EA4335' },
    { x: W*0.3, y: H*0.7, r: 50, color: '#34A853' },
  ];
  zones.forEach(z => {
    const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    grad.addColorStop(0, z.color + '55');
    grad.addColorStop(1, z.color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawFloodLayer(ctx, W, H) {
  // Water zones
  const floodZones = [
    { x: W*0.1, y: H*0.65, r: 80 },
    { x: W*0.4, y: H*0.75, r: 60 },
    { x: W*0.65, y: H*0.8, r: 50 },
  ];
  floodZones.forEach(z => {
    const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    grad.addColorStop(0, '#1A73E880');
    grad.addColorStop(0.7, '#1A73E840');
    grad.addColorStop(1, '#1A73E800');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDensityLayer(ctx, W, H) {
  const heatmap = [
    { x: W*0.3, y: H*0.35, r: 100, color: '#EA4335' },
    { x: W*0.6, y: H*0.5, r: 80,  color: '#FBBC04' },
    { x: W*0.15, y: H*0.6, r: 70, color: '#34A853' },
    { x: W*0.8, y: H*0.3, r: 60,  color: '#FBBC04' },
    { x: W*0.5, y: H*0.75, r: 55, color: '#34A853' },
  ];
  heatmap.forEach(z => {
    const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    grad.addColorStop(0, z.color + '55');
    grad.addColorStop(1, z.color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ─────────────────────────────────────────────────────────
// DASHBOARD RENDER
// ─────────────────────────────────────────────────────────
function renderDashboard() {
  // KPI counters
  const counters = [
    { id: 'kpi-score', val: State.metrics.communityScore, suffix: '' },
    { id: 'kpi-traffic', val: State.metrics.trafficIndex, suffix: '' },
    { id: 'kpi-air', val: State.metrics.airQuality, suffix: '' },
    { id: 'kpi-sat', val: State.metrics.satisfaction, suffix: '%' },
  ];
  counters.forEach(c => {
    const el = $(`#${c.id}`);
    if (el) animateCounter(el, c.val, c.suffix, 1200);
  });

  // Main trend chart
  setTimeout(() => {
    const canvas = $('#dash-trend-chart');
    if (canvas) {
      canvas.height = 220;
      drawLineChart(canvas, [
        { data: [62, 68, 71, 65, 78, 84, 80, 88, 91, 87, 84, 90], color: CHART_BLUE, label: 'Satisfaction' },
        { data: [45, 52, 60, 55, 63, 67, 64, 72, 75, 70, 73, 77], color: CHART_GREEN, label: 'Engagement' },
      ], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    }

    // Bar chart
    const barCanvas = $('#dash-bar-chart');
    if (barCanvas) {
      barCanvas.height = 200;
      drawBarChart(barCanvas,
        [450, 320, 580, 210, 390, 720, 640],
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [CHART_BLUE, CHART_GREEN, CHART_BLUE, CHART_YELLOW, CHART_GREEN, CHART_BLUE, CHART_BLUE]);
    }

    // Mini map
    const mapCanvas = $('#dash-mini-map');
    if (mapCanvas) {
      mapCanvas.height = 260;
      renderMapCanvas(mapCanvas, 'traffic');
    }

    // Donut
    const donutCanvas = $('#dash-donut');
    if (donutCanvas) {
      donutCanvas.width = 160;
      donutCanvas.height = 160;
      donutCanvas.style.width = '160px';
      donutCanvas.style.height = '160px';
      drawDonutChart(donutCanvas,
        [35, 25, 20, 12, 8],
        [CHART_BLUE, CHART_GREEN, CHART_YELLOW, CHART_RED, '#9AA0AC']);
    }
  }, 100);
}

// ─────────────────────────────────────────────────────────
// ANALYTICS RENDER
// ─────────────────────────────────────────────────────────
function renderAnalytics() {
  setTimeout(() => {
    const trendCanvas = $('#analytics-trend');
    if (trendCanvas) {
      trendCanvas.height = 240;
      drawLineChart(trendCanvas, [
        { data: [55, 60, 58, 72, 65, 80, 75, 85, 82, 90, 87, 94], color: CHART_BLUE },
        { data: [40, 45, 50, 48, 58, 62, 68, 65, 72, 70, 76, 80], color: CHART_GREEN },
      ], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    }

    const barCanvas = $('#analytics-bar');
    if (barCanvas) {
      barCanvas.height = 200;
      drawBarChart(barCanvas,
        [850, 720, 940, 660, 1100, 890, 760],
        ['Energy', 'Water', 'Waste', 'Traffic', 'Health', 'Safety', 'Environ'],
        [CHART_BLUE, CHART_GREEN, CHART_YELLOW, CHART_RED, CHART_BLUE, CHART_GREEN, CHART_YELLOW]);
    }

    const radarCanvas = $('#analytics-radar');
    if (radarCanvas) {
      radarCanvas.style.width = '220px';
      radarCanvas.style.height = '220px';
      drawRadarChart(radarCanvas,
        ['Safety', 'Health', 'Environ', 'Infra', 'Social', 'Economy'],
        [84, 72, 65, 90, 78, 82], CHART_BLUE);
    }

    const donutCanvas = $('#analytics-donut');
    if (donutCanvas) {
      donutCanvas.style.width = '180px';
      donutCanvas.style.height = '180px';
      drawDonutChart(donutCanvas,
        [42, 28, 18, 12],
        [CHART_BLUE, CHART_GREEN, CHART_YELLOW, CHART_RED]);
    }
  }, 100);
}

// ─────────────────────────────────────────────────────────
// MAP VIEW
// ─────────────────────────────────────────────────────────
function renderMapView() {
  setTimeout(() => {
    const canvas = $('#main-map-canvas');
    if (canvas) {
      canvas.height = canvas.parentElement?.offsetHeight || 500;
      renderMapCanvas(canvas, State.activeMapLayer);
    }
  }, 100);
}

function switchMapLayer(layer) {
  State.activeMapLayer = layer;
  $$('.map-layer-btn').forEach(b => b.classList.toggle('active', b.dataset.layer === layer));
  const canvas = $('#main-map-canvas');
  if (canvas) renderMapCanvas(canvas, layer);
  showToast(`Layer: ${layer.charAt(0).toUpperCase() + layer.slice(1)} activated`, 'info');
}

// ─────────────────────────────────────────────────────────
// PREDICTIONS RENDER
// ─────────────────────────────────────────────────────────
function renderPredictions() {
  $$('.confidence-ring').forEach(ring => {
    const svg = ring.querySelector('svg');
    const val = parseInt(ring.dataset.val || 85);
    if (svg) {
      const size = 90;
      const r = 34;
      const circ = 2 * Math.PI * r;
      const dash = (val / 100) * circ;
      const color = val > 80 ? '#34A853' : val > 60 ? '#FBBC04' : '#EA4335';
      svg.innerHTML = `
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="7"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="7"
          stroke-dasharray="${dash} ${circ}" stroke-linecap="round"/>`;
    }
  });
}

// ─────────────────────────────────────────────────────────
// DATA CONNECTIONS
// ─────────────────────────────────────────────────────────
function renderDataConnections() {
  $$('.connector-card').forEach(card => {
    const id = card.dataset.connector;
    card.classList.toggle('connected', State.connectedSources.includes(id));
  });
}

function toggleConnection(connectorId) {
  const card = $(`.connector-card[data-connector="${connectorId}"]`);
  if (State.connectedSources.includes(connectorId)) {
    State.connectedSources = State.connectedSources.filter(c => c !== connectorId);
    card?.classList.remove('connected');
    showToast(`Disconnected from ${connectorId}`, 'warn');
  } else {
    showToast(`Connecting to ${connectorId}...`, 'info');
    setTimeout(() => {
      State.connectedSources.push(connectorId);
      card?.classList.add('connected');
      showToast(`✓ Connected to ${connectorId}`, 'success');
    }, 1200);
  }
}

// ─────────────────────────────────────────────────────────
// AI ASSISTANT
// ─────────────────────────────────────────────────────────
const AI_RESPONSES = {
  'traffic': {
    text: "Based on real-time sensor data and historical patterns, I predict **peak congestion** in Districts 3 and 5 between 08:00–09:30 AM tomorrow. I recommend activating alternate route guidance on the Eastern Bypass. Confidence: 91%.",
    chart: true
  },
  'pollution': {
    text: "**Districts 7, 12, and 14** show the highest PM2.5 concentrations — averaging 148 µg/m³, which is 3× the WHO guideline. Primary sources: industrial emissions (62%), vehicular traffic (28%), construction dust (10%). I recommend issuing an orange AQI advisory for these areas.",
    chart: false
  },
  'flood': {
    text: "Flood risk analysis complete. **3 high-risk zones identified** in the low-lying areas of Sector 6 and 9 based on 72-hour rainfall forecast (85mm expected). Recommended action: Pre-position emergency response teams and alert 14,200 residents via SMS.",
    chart: true
  },
  'waste': {
    text: "Optimized waste collection schedule generated for the next 7 days. **Route efficiency improved by 23%** by clustering Zones B, D, and F on Tuesdays and Thursdays. This reduces fuel costs by ₹18,400/month and cuts CO₂ emissions by 1.2 tons.",
    chart: false
  },
  'energy': {
    text: "Energy consumption spike of **+34%** detected in the Northern Grid between 18:00–22:00. Root cause analysis suggests a combination of summer AC load (68%) and EV charging demand (22%). Forecast: demand will peak at 847 MW on Wednesday. Recommend activating demand-response protocols.",
    chart: true
  },
  'crime': {
    text: "Predictive crime analysis shows **elevated risk** in Grid Sectors G-7 and H-3 between Friday 10 PM – Saturday 3 AM (next 48h). Historical correlation: 87% accuracy. Recommended: increase mobile patrol frequency by 2× in these sectors.",
    chart: false
  },
  'default': {
    text: "I've analyzed the available datasets across all 6 connected data sources. Here's a summary: Community Health Score is **84/100** (↑4 points from last week), with notable improvements in waste management and citizen satisfaction. 3 predictive alerts require attention. Would you like me to drill deeper into any specific domain?",
    chart: true
  }
};

function getAIResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('traffic') || q.includes('congestion')) return AI_RESPONSES.traffic;
  if (q.includes('pollution') || q.includes('air') || q.includes('district')) return AI_RESPONSES.pollution;
  if (q.includes('flood') || q.includes('water') || q.includes('rain')) return AI_RESPONSES.flood;
  if (q.includes('waste') || q.includes('collection')) return AI_RESPONSES.waste;
  if (q.includes('energy') || q.includes('power') || q.includes('electricity')) return AI_RESPONSES.energy;
  if (q.includes('crime') || q.includes('safety') || q.includes('police')) return AI_RESPONSES.crime;
  return AI_RESPONSES.default;
}

function renderAIAssistant() {
  if (State.chatHistory.length === 0) {
    appendAIMessage("Hello! I'm **CommunityPulse AI** powered by **Gemini**. I can help you analyze community data, generate predictions, create reports, and answer complex questions about your datasets. Try asking me something!", false);
  }
}

function appendUserMessage(text) {
  const container = $('#chat-messages');
  if (!container) return;
  const msg = el('div', 'chat-msg user');
  msg.innerHTML = `
    <div class="chat-avatar user">
      <span class="material-symbols-rounded" style="font-size:16px">person</span>
    </div>
    <div class="chat-bubble user">${text}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  State.chatHistory.push({ role: 'user', text });
}

function appendAIMessage(text, showChart = false) {
  const container = $('#chat-messages');
  if (!container) return;

  // Thinking indicator
  const thinking = el('div', 'chat-msg');
  thinking.innerHTML = `
    <div class="chat-avatar ai">
      <span class="material-symbols-rounded" style="font-size:16px">auto_awesome</span>
    </div>
    <div class="chat-thinking">
      <div class="chat-dot ai-dot-1" style="width:7px;height:7px;border-radius:50%;background:var(--text-tertiary)"></div>
      <div class="chat-dot ai-dot-2" style="width:7px;height:7px;border-radius:50%;background:var(--text-tertiary)"></div>
      <div class="chat-dot ai-dot-3" style="width:7px;height:7px;border-radius:50%;background:var(--text-tertiary)"></div>
    </div>`;
  container.appendChild(thinking);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    thinking.remove();
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const msg = el('div', 'chat-msg');
    let chartHTML = '';
    if (showChart) {
      chartHTML = `
        <div style="margin-top:12px;padding:12px;background:var(--surface-2);border-radius:var(--r-md)">
          <canvas id="ai-chart-${Date.now()}" style="width:100%;height:160px;display:block"></canvas>
        </div>`;
    }
    msg.innerHTML = `
      <div class="chat-avatar ai">
        <span class="material-symbols-rounded" style="font-size:16px">auto_awesome</span>
      </div>
      <div class="chat-bubble ai">
        <p style="font-size:14px;line-height:1.7">${formattedText}</p>
        ${chartHTML}
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;color:var(--text-tertiary);display:flex;align-items:center;gap:4px">
            <span class="material-symbols-rounded" style="font-size:14px">database</span>
            Sources: BigQuery, IoT Sensors, Govt. API
          </span>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button onclick="exportChat()" class="btn btn-secondary btn-sm">
            <span class="material-symbols-rounded" style="font-size:14px">download</span>Export
          </button>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded" style="font-size:14px">thumb_up</span>
          </button>
          <button class="btn btn-ghost btn-sm">
            <span class="material-symbols-rounded" style="font-size:14px">thumb_down</span>
          </button>
        </div>
      </div>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;

    if (showChart) {
      setTimeout(() => {
        const canvas = msg.querySelector('canvas');
        if (canvas) {
          drawLineChart(canvas, [
            { data: [40, 55, 48, 65, 72, 68, 80, 76, 88, 84, 91, 95], color: CHART_BLUE },
          ], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
        }
      }, 100);
    }
    State.chatHistory.push({ role: 'ai', text });
  }, 1400 + Math.random() * 600);
}

function sendChatMessage() {
  const input = $('#chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  appendUserMessage(text);
  const response = getAIResponse(text);
  appendAIMessage(response.text, response.chart);
}

function sendQuickPrompt(text) {
  const input = $('#chat-input');
  if (input) input.value = text;
  sendChatMessage();
}

function exportChat() {
  showToast('Chat exported as PDF', 'success');
}

// ─────────────────────────────────────────────────────────
// REFERRAL CENTER
// ─────────────────────────────────────────────────────────
function renderReferralCenter() {
  const codeEl = $('#my-referral-code');
  if (codeEl) codeEl.textContent = State.referralCode;
  const countEl = $('#referral-count');
  if (countEl) animateCounter(countEl, State.referralCount, '', 1000);
  const progressEl = $('#referral-progress');
  if (progressEl) progressEl.style.width = `${(State.referralCount / 10) * 100}%`;
}

function copyReferralCode() {
  navigator.clipboard.writeText(State.referralCode).catch(() => {});
  showToast('Referral code copied to clipboard!', 'success');
}

function copyReferralLink() {
  const link = `https://app.communitypulse.ai/join?ref=${State.referralCode}`;
  navigator.clipboard.writeText(link).catch(() => {});
  showToast('Referral link copied!', 'success');
}

// ─────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────
function renderReports() {
  // Reports are static HTML, just animate in
}

function downloadReport(name) {
  showToast(`Downloading "${name}"...`, 'info');
  setTimeout(() => showToast(`"${name}" downloaded successfully`, 'success'), 1500);
}

// ─────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────
function renderAdmin() {
  setTimeout(() => {
    const gpuCanvas = $('#gpu-chart');
    if (gpuCanvas) {
      gpuCanvas.height = 140;
      drawLineChart(gpuCanvas, [
        { data: [45, 62, 78, 55, 82, 90, 75, 88, 94, 71, 85, 92], color: '#34A853' },
        { data: [30, 40, 55, 42, 60, 72, 58, 65, 80, 55, 68, 74], color: '#1A73E8' },
      ], ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']);
    }
    const bqCanvas = $('#bq-chart');
    if (bqCanvas) {
      bqCanvas.height = 140;
      drawBarChart(bqCanvas,
        [1200, 980, 1450, 820, 1680, 1340, 1120],
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [CHART_BLUE]);
    }
  }, 100);
}

// ─────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────
function switchSettingsPanel(panel) {
  State.activeSettingsPanel = panel;
  $$('.settings-nav-item').forEach(i => i.classList.toggle('active', i.dataset.panel === panel));
  $$('.settings-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === panel));
}

// ─────────────────────────────────────────────────────────
// LANDING PAGE ANIMATIONS
// ─────────────────────────────────────────────────────────
function initLandingAnimations() {
  // Stats counters
  const stats = [
    { id: 'stat-communities', val: 2400, suffix: '+' },
    { id: 'stat-datasets', val: 18700, suffix: '+' },
    { id: 'stat-decisions', val: 4200000, suffix: '' },
    { id: 'stat-predictions', val: 98, suffix: '%' },
  ];
  stats.forEach(s => {
    const el = $(`#${s.id}`);
    if (el) animateCounter(el, s.val, s.suffix, 2000);
  });

  // Scroll reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => revealObserver.observe(el));
}

// ─────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────
function toggleFAQ(item) {
  item.classList.toggle('open');
}

// ─────────────────────────────────────────────────────────
// GLOBAL EVENT LISTENERS
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-dropdown-trigger]') && !e.target.closest('.dropdown')) {
      closeAllDropdowns();
    }
    if (!e.target.closest('#command-palette') && !e.target.closest('[data-open-cmd]')) {
      $('#command-palette')?.classList.add('hidden');
    }
  });

  // Chat input auto-resize + Enter to send
  const chatInput = $('#chat-input');
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // Command palette search
  const cmdSearch = $('#cmd-search');
  if (cmdSearch) {
    cmdSearch.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      $$('.cmd-item').forEach(item => {
        const match = item.textContent.toLowerCase().includes(q);
        item.style.display = match ? 'flex' : 'none';
      });
    });
    cmdSearch.addEventListener('keydown', e => {
      if (e.key === 'Escape') $('#command-palette')?.classList.add('hidden');
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
  });

  // Window resize — re-render charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (State.auth.loggedIn) renderView(State.currentView);
    }, 300);
  });

  // Init splash
  initSplash();
});
